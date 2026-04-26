import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Search, MapPin, Monitor, AlertCircle, Download } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { exportToCSV } from '../../utils/export';
import { useToast } from '../../components/ui/Toast';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  // Mock fetch with debouncedSearch
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData = [
        { id: '1', action: 'Banned User', actor: 'admin@authra.com', actorRole: 'super_admin', resource: 'User', resourceId: 'user123', ip: '192.168.1.1', device: 'Windows / Chrome', date: new Date().toISOString(), notes: 'Spam violation' },
        { id: '2', action: 'Revoked Certificate', actor: 'admin@authra.com', actorRole: 'super_admin', resource: 'Certificate', resourceId: 'cert987', ip: '192.168.1.1', device: 'Windows / Chrome', date: new Date(Date.now() - 3600000).toISOString(), notes: 'Compromised key' },
        { id: '3', action: 'Edited Organization', actor: 'owner@org.com', actorRole: 'organization_owner', resource: 'Organization', resourceId: 'org456', ip: '10.0.0.5', device: 'macOS / Safari', date: new Date(Date.now() - 86400000).toISOString(), notes: 'Updated billing details' },
        { id: '4', action: 'Changed Subscription', actor: 'admin@authra.com', actorRole: 'super_admin', resource: 'Subscription', resourceId: 'sub321', ip: '192.168.1.1', device: 'Windows / Chrome', date: new Date(Date.now() - 172800000).toISOString(), notes: 'Upgraded to Enterprise' },
      ];
      setLogs(mockData.filter(l => l.action.toLowerCase().includes(debouncedSearch.toLowerCase()) || l.actor.toLowerCase().includes(debouncedSearch.toLowerCase())));
      setLoading(false);
    }, 400);
  }, [debouncedSearch]);

  const handleExport = () => {
    addToast('Preparing Export', 'Gathering your audit logs for download...', 'info');
    setTimeout(() => {
      exportToCSV(logs, `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      addToast('Export Successful', 'Your CSV has been downloaded.', 'success');
    }, 800);
  };

  const columns = [
    { 
      key: 'action', 
      label: 'Action',
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 font-medium">{item.resource} ({item.resourceId})</div>
          </div>
        </div>
      )
    },
    { 
      key: 'actor', 
      label: 'Actor',
      render: (value, item) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-1.5 py-0.5 rounded-md uppercase tracking-wider mt-0.5">{item.actorRole.replace('_', ' ')}</div>
        </div>
      )
    },
    { 
      key: 'context', 
      label: 'Context',
      render: (_, item) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {item.ip}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Monitor className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {item.device}
          </div>
        </div>
      )
    },
    { 
      key: 'notes', 
      label: 'Notes / Reason',
      render: (value) => (
        <div className="flex items-start max-w-xs text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
          <AlertCircle className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className="truncate">{value || '-'}</span>
        </div>
      )
    },
    { 
      key: 'date', 
      label: 'Timestamp',
      render: (value) => (
        <div className="flex items-center text-sm font-medium text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          {new Date(value).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security & Audit Logs</h1>
          <p className="text-gray-500 mt-1 text-sm">Immutable trail of all administrative actions and security events.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 text-gray-500" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <DataTable 
          data={logs} 
          columns={columns} 
          isLoading={loading}
        />
      </div>
    </motion.div>
  );
};

export default AuditLogsPage;
