import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Monitor, Globe, Clock, AlertTriangle, LogOut, CheckCircle, MapPin, Search } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api/v1/sessions';

export default function SecuritySettings() {
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch from the API.
    // For demonstration, we'll use mock data if the API is not authenticated/reachable.
    const fetchSecurityData = async () => {
      try {
        setLoading(true);
        // Simulate API calls with mock data for UI demonstration purposes
        setTimeout(() => {
          setSessions([
            { id: '1', browser: 'Chrome 120', os: 'Windows 11', deviceType: 'Desktop', ipAddress: '192.168.*.*', country: 'US', city: 'New York', lastActive: new Date().toISOString(), isCurrent: true },
            { id: '2', browser: 'Safari 17', os: 'iOS 17', deviceType: 'Mobile', ipAddress: '10.0.*.*', country: 'US', city: 'Boston', lastActive: new Date(Date.now() - 86400000).toISOString(), isCurrent: false }
          ]);
          setHistory([
            { id: 'h1', timestamp: new Date().toISOString(), role: 'user', location: { city: 'New York', country: 'US' }, device: { browser: 'Chrome', os: 'Windows', deviceType: 'Desktop' }, suspiciousFlag: false, status: 'success' },
            { id: 'h2', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), role: 'user', location: { city: 'London', country: 'UK' }, device: { browser: 'Firefox', os: 'Linux', deviceType: 'Desktop' }, suspiciousFlag: true, status: 'failed' }
          ]);
          setAlerts([
            { id: 'a1', type: 'impossible_travel', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), details: { previousCountry: 'US', currentCountry: 'UK' }, resolved: false }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to load security data", error);
        setLoading(false);
      }
    };
    fetchSecurityData();
  }, []);

  const handleLogout = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleLogoutAll = () => {
    setSessions(sessions.filter(s => s.isCurrent));
  };

  const getDeviceIcon = (type) => {
    if (type?.toLowerCase() === 'mobile') return <Smartphone className="text-blue-500" />;
    return <Monitor className="text-indigo-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-500" />
              Security & Session Management
            </h1>
            <p className="text-gray-400 mt-2">Monitor and secure your account activity across all devices.</p>
          </div>
          <button onClick={handleLogoutAll} className="mt-4 md:mt-0 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all flex items-center gap-2 text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Sign out all other devices
          </button>
        </motion.div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
              Security Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/20 p-4 rounded-xl border border-red-900/30">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-red-500/20 p-2 rounded-full"><Globe className="w-4 h-4 text-red-400" /></div>
                    <div>
                      <p className="text-sm font-medium text-white">{alert.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-1">Detected activity between {alert.details.previousCountry} and {alert.details.currentCountry}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-3">
                    <span className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleDateString()}</span>
                    <button className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">Review</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Sessions */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            Active Sessions
          </h2>
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div key={session.id} className={`p-5 rounded-2xl border backdrop-blur-sm transition-all hover:bg-gray-900/50 ${session.isCurrent ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-gray-900/30 border-gray-800'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                        {session.os} • {session.browser}
                        {session.isCurrent && <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/20">Current Device</span>}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {session.city}, {session.country}</span>
                        <span className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5" /> {session.ipAddress}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last active: {new Date(session.lastActive).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button onClick={() => handleLogout(session.id)} className="text-sm px-4 py-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-red-500/20 hover:border-red-500/50 border border-gray-700/50 rounded-lg transition-all">
                      Log out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Login History */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Recent Login History
          </h2>
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date & Time</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Device Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {history.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.status === 'success' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {event.location.city}, {event.location.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {event.device.os} • {event.device.browser}
                        {event.suspiciousFlag && <span className="ml-2 text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Suspicious</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
