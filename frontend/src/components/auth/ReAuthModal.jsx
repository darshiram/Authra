import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReAuthModal = ({ isOpen, onClose, onConfirm, actionName }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }
    // In a real implementation, this would verify the password and generate a short-lived token
    // For demonstration, we just return the password (or a mock token)
    onConfirm(password);
    setPassword('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-2">Confirm Action</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Please enter your password to confirm you want to: <br/>
              <span className="font-semibold text-red-400">{actionName}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-red-900/20"
                >
                  Confirm & Execute
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReAuthModal;
