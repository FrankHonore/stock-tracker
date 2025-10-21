import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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

  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [hasWebullCredentials, setHasWebullCredentials] = useState(false);

  // Check for saved auth on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      checkWebullCredentials(savedToken);
    }
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

  const fetchStockData = async (symbol) => {
    try {
      setError('');

      // Use Alpha Vantage API
      const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

      if (!apiKey) {
        setError('API key not configured. Please add VITE_ALPHA_VANTAGE_API_KEY to .env file.');
        return;
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${apiKey}&outputsize=compact`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();

      // Check for API errors
      if (data['Error Message']) {
        setError('Invalid stock symbol. Please try another symbol.');
        return;
      }

      if (data['Note']) {
        setError('API rate limit reached. Free tier allows 25 requests per day.');
        return;
      }

      const timeSeries = data['Time Series (1min)'];

      if (timeSeries && Object.keys(timeSeries).length > 0) {
        // Transform Alpha Vantage format to our format
        const formattedData = Object.entries(timeSeries)
          .slice(0, 60) // Get last 60 data points
          .map(([timestamp, values]) => ({
            time: new Date(timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume']),
            timestamp: new Date(timestamp).getTime()
          }))
          .reverse() // Alpha Vantage returns newest first, we want oldest first
          .sort((a, b) => a.timestamp - b.timestamp);

        setCandleData(formattedData);

        if (formattedData.length > 0) {
          const latest = formattedData[formattedData.length - 1];
          const previous = formattedData[0];
          setLastPrice(latest.close);
          setPriceChange(((latest.close - previous.close) / previous.close) * 100);
        }
      } else {
        setError('No data available. Market may be closed or symbol is invalid.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data');
    }
  };

  const handleTrackClick = async () => {
    if (!ticker.trim()) return;

    setLoading(true);
    setCurrentTicker(ticker.toUpperCase());
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    await fetchStockData(ticker.toUpperCase());
    setLoading(false);

    intervalRef.current = setInterval(() => {
      fetchStockData(ticker.toUpperCase());
    }, 60000);
  };

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

        <div className="mb-8">
          <div className="flex gap-2 max-w-md mx-auto">
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
            <h3 className="text-xl font-semibold mb-4 text-gray-300">1-Minute Candle Chart</h3>
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
              <h3 className="text-xl font-semibold text-gray-300">Recent Candle Data</h3>
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
