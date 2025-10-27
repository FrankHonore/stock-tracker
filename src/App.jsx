import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, LogIn, LogOut, Settings } from 'lucide-react';
import AuthModal from './components/AuthModal';
import WebullCredentialsModal from './components/WebullCredentialsModal';

export default function StockTracker() {
  const [ticker, setTicker] = useState('');
  const [currentTicker, setCurrentTicker] = useState('');
  const [candleData, setCandleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastPrice, setLastPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const intervalRef = useRef(null);

  // Public.com API state
  const [publicAccessToken, setPublicAccessToken] = useState(null);
  const [publicAccountId, setPublicAccountId] = useState(null);
  const [currentMinuteCandle, setCurrentMinuteCandle] = useState(null);
  const quoteIntervalRef = useRef(null);

  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [hasWebullCredentials, setHasWebullCredentials] = useState(false);

  // Initialize Public.com API via backend proxy
  const initializePublicAPI = async () => {
    console.log('Initializing Public.com API via backend...');

    try {
      const response = await fetch('http://localhost:5001/api/public/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Initialize response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Initialize error:', errorData);
        throw new Error(errorData.error || 'Failed to initialize API');
      }

      const data = await response.json();
      console.log('✅ Public.com API initialized successfully!');

      setPublicAccessToken(data.accessToken);
      setPublicAccountId(data.accountId);

      return true;
    } catch (err) {
      console.error('❌ Public API initialization error:', err);
      setError(`Failed to initialize Public.com API: ${err.message}`);
      return false;
    }
  };

  // Check for saved auth on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      checkWebullCredentials(savedToken);
    }

    // Initialize Public.com API
    initializePublicAPI();
  }, []);

  const checkWebullCredentials = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5001/api/webull/credentials', {
        headers: {
          'Authorization': `Bearer ${authToken || token}`,
        },
      });
      setHasWebullCredentials(response.ok);
    } catch (err) {
      setHasWebullCredentials(false);
    }
  };

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    checkWebullCredentials(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setHasWebullCredentials(false);
    setCandleData([]);
    setCurrentTicker('');
  };

  const handleCredentialsSaved = () => {
    setHasWebullCredentials(true);
  };

  // Fetch real-time quote from Public.com via backend proxy
  const fetchQuote = async (symbol) => {
    if (!publicAccountId) {
      console.warn('Public API not initialized');
      return null;
    }

    try {
      const response = await fetch('http://localhost:5001/api/public/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol,
          accountId: publicAccountId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();

      if (data.quotes && data.quotes.length > 0) {
        const quote = data.quotes[0];

        if (quote.outcome !== 'SUCCESS') {
          throw new Error('Invalid symbol or quote unavailable');
        }

        return {
          price: parseFloat(quote.last),
          timestamp: quote.lastTimestamp,
          volume: parseInt(quote.volume || 0),
          bid: parseFloat(quote.bid),
          ask: parseFloat(quote.ask),
        };
      }

      return null;
    } catch (err) {
      console.error('Error fetching quote:', err);
      throw err;
    }
  };

  // Build 1-minute candle from collected quotes
  const updateCandleFromQuote = (quote) => {
    const now = new Date();
    const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0).getTime();

    setCurrentMinuteCandle((prevCandle) => {
      // If this is a new minute or first quote
      if (!prevCandle || prevCandle.timestamp !== currentMinute) {
        // Save previous candle to history if it exists
        if (prevCandle) {
          setCandleData((prevData) => {
            const newData = [...prevData, prevCandle];
            // Keep last 60 candles
            return newData.slice(-60);
          });
        }

        // Start new candle
        return {
          timestamp: currentMinute,
          time: now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/New_York',
          }),
          fullDate: now.toISOString(),
          open: quote.price,
          high: quote.price,
          low: quote.price,
          close: quote.price,
          volume: quote.volume,
        };
      } else {
        // Update existing candle
        return {
          ...prevCandle,
          high: Math.max(prevCandle.high, quote.price),
          low: Math.min(prevCandle.low, quote.price),
          close: quote.price,
          volume: quote.volume, // Public API returns total volume
        };
      }
    });
  };

  // Fetch stock data using Public.com real-time quotes via backend
  const fetchStockData = async (symbol) => {
    console.log('fetchStockData called with:', { symbol });

    if (!publicAccountId) {
      setError('Public.com API not initialized. Please start the backend server.');
      return;
    }

    try {
      setError('');

      // Fetch initial quote
      const quote = await fetchQuote(symbol);

      if (quote) {
        // Update current price
        setLastPrice(quote.price);

        // Initialize candle building
        updateCandleFromQuote(quote);
      } else {
        setError('No data available. Please check the symbol and try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data');
    }
  };

  const handleTrackClick = async () => {
    console.log('handleTrackClick called', { ticker });
    if (!ticker.trim()) return;

    setLoading(true);
    setCurrentTicker(ticker.toUpperCase());

    // Clear any existing intervals
    if (quoteIntervalRef.current) {
      clearInterval(quoteIntervalRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset candle data
    setCandleData([]);
    setCurrentMinuteCandle(null);

    // Fetch initial quote
    await fetchStockData(ticker.toUpperCase());

    // Set up quote polling every 5 seconds
    quoteIntervalRef.current = setInterval(async () => {
      try {
        const quote = await fetchQuote(ticker.toUpperCase());
        if (quote) {
          setLastPrice(quote.price);
          updateCandleFromQuote(quote);

          // Calculate price change from first candle
          setCandleData((prevData) => {
            if (prevData.length > 0) {
              const firstCandle = prevData[0];
              const currentPrice = quote.price;
              setPriceChange(((currentPrice - firstCandle.open) / firstCandle.open) * 100);
            }
            return prevData;
          });
        }
      } catch (err) {
        console.error('Error polling quote:', err);
      }
    }, 5000); // Poll every 5 seconds

    setLoading(false);
  };

  // Note: Historical mode removed - Public.com API only supports real-time quotes

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackClick();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (quoteIntervalRef.current) {
        clearInterval(quoteIntervalRef.current);
      }
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">Open: <span className="text-white">${data.open?.toFixed(2)}</span></p>
            <p className="text-blue-400">High: <span className="text-white">${data.high?.toFixed(2)}</span></p>
            <p className="text-red-400">Low: <span className="text-white">${data.low?.toFixed(2)}</span></p>
            <p className="text-green-400">Close: <span className="text-white">${data.close?.toFixed(2)}</span></p>
            <p className="text-gray-300">Volume: <span className="text-white">{(data.volume / 1000000)?.toFixed(2)}M</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Auth Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Real-Time Stock Tracker
          </h1>

          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-400">Welcome, {user.username}!</span>
                {!hasWebullCredentials && (
                  <button
                    onClick={() => setShowCredentialsModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Settings size={16} />
                    Add Webull Credentials
                  </button>
                )}
                {hasWebullCredentials && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Settings size={14} />
                    Webull Connected
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
              >
                <LogIn size={16} />
                Login / Sign Up
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          {/* Ticker Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter ticker symbol (e.g., AAPL)"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
            <button
              onClick={handleTrackClick}
              disabled={loading || !ticker.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Loading...' : 'Track'}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-400 text-center">
            Real-time quotes updated every 5 seconds • Powered by Public.com API
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {currentTicker && lastPrice && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{currentTicker}</h2>
                <p className="text-gray-400 text-sm">Last updated: {candleData[candleData.length - 1]?.time}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white mb-1">${lastPrice.toFixed(2)}</p>
                <div className={`flex items-center gap-2 justify-end ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  <span className="text-lg font-semibold">
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {candleData.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">
              1-Minute Candle Chart (Real-Time)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={candleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#34D399"
                  strokeWidth={2}
                  dot={false}
                  name="Close"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {candleData.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-300">
                Recent Candle Data
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Open</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">High</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Low</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Close</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {candleData.slice(-10).reverse().map((candle, index) => (
                    <tr key={index} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{candle.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">${candle.open.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-400">${candle.high.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-400">${candle.low.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-white">${candle.close.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-400">{(candle.volume / 1000000).toFixed(2)}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-900 text-center text-xs text-gray-400">
              Showing last 10 candles (total: {candleData.length})
            </div>
          </div>
        )}

        {!currentTicker && (
          <div className="text-center py-20">
            <Activity className="mx-auto text-gray-600 mb-4" size={64} />
            <p className="text-gray-400 text-lg">Enter a ticker symbol to start tracking real-time stock data</p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Webull Credentials Modal */}
      <WebullCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSuccess={handleCredentialsSaved}
      />
    </div>
  );
}
