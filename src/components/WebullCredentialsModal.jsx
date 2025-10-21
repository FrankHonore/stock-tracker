import React, { useState } from 'react';
import { X, Mail, Lock, Shield } from 'lucide-react';

export default function WebullCredentialsModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    webullEmailOrPhone: '',
    webullPassword: '',
    mfaEnabled: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first');
      }

      const response = await fetch('http://localhost:5001/api/webull/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.[0] || 'Failed to store credentials');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">
          Add Webull Credentials
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Your credentials will be encrypted and stored securely
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-300 text-sm">
          <Shield className="inline mr-2" size={16} />
          Note: This uses unofficial Webull APIs which may change or break at any time.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="inline mr-2" size={16} />
              Webull Email or Phone
            </label>
            <input
              type="text"
              name="webullEmailOrPhone"
              value={formData.webullEmailOrPhone}
              onChange={handleChange}
              placeholder="email@example.com or +1-5555555555"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Phone format: +[country code]-[number] (e.g., +1-5555555555)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="inline mr-2" size={16} />
              Webull Password
            </label>
            <input
              type="password"
              name="webullPassword"
              value={formData.webullPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="mfaEnabled"
              id="mfaEnabled"
              checked={formData.mfaEnabled}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="mfaEnabled" className="text-sm text-gray-300">
              Multi-Factor Authentication (MFA) enabled
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors text-white"
          >
            {loading ? 'Saving...' : 'Save Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
}
