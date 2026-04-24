import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/admin/DataTable';
import { useAdminStore } from '../../store/adminStore';
import { ShieldCheck, ShieldOff, Eye, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API = 'http://localhost:5001/api/v1/admin/certs';

export default function CertsPage() {
  const { accessToken } = useAdminStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail drawer
  const [detailOpen, setDetailOpen] = useState(false);
  const [certDetail, setCertDetail] = useState(null);
  const [timeline, setTimeline] = useState([]);

  // Revoke modal
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const url = new URL(API);
      url.searchParams.append('page', page + 1);
      url.searchParams.append('limit', 10);
      if (search) url.searchParams.append('search', search);
      if (statusFilter) url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString(), { headers });
      const json = await res.json();
      if (res.ok) {
        setData(json.data.certs);
        setPageCount(json.data.pages);
      }
    } catch { toast.error('Network error'); }
    setLoading(false);
  };

  useEffect(() => { fetchCerts(); }, [page, search, statusFilter]);

  const openDetail = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { headers });
      const json = await res.json();
      if (res.ok) {
        setCertDetail(json.data.cert);
        setTimeline(json.data.timeline);
        setDetailOpen(true);
      }
    } catch { toast.error('Failed to load details'); }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) { toast.error('Reason is required'); return; }
    try {
      const res = await fetch(`${API}/${revokeTarget._id}/revoke`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ action: 'revoke', reason: revokeReason })
      });
      if (res.ok) { toast.success('Certificate revoked'); setRevokeTarget(null); setRevokeReason(''); fetchCerts(); }
      else { const j = await res.json(); toast.error(j.message); }
    } catch { toast.error('Failed'); }
  };

  const handleUnrevoke = async (id) => {
    if (!window.confirm('Restore this certificate to issued status?')) return;
    try {
      const res = await fetch(`${API}/${id}/revoke`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ action: 'unrevoke', reason: 'Restored by admin' })
      });
      if (res.ok) { toast.success('Certificate restored'); fetchCerts(); if (detailOpen) openDetail(id); }
      else { const j = await res.json(); toast.error(j.message); }
    } catch { toast.error('Failed'); }
  };

  const statusBadge = (status) => {
    const map = {
      issued: 'bg-green-100 text-green-800',
      revoked: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-600',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${map[status] || 'bg-gray-100'}`}>{status.toUpperCase()}</span>;
  };

  const columns = useMemo(() => [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    },
    {
      header: 'Recipient',
      accessorKey: 'recipientId',
      cell: info => {
        const r = info.getValue();
        return r ? `${r.firstName} ${r.lastName}` : '—';
      },
    },
    {
      header: 'Organization',
      accessorKey: 'organizationId',
      cell: info => info.getValue()?.name || '—',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => statusBadge(info.getValue()),
    },
    {
      header: 'Issued',
      accessorKey: 'issueDate',
      cell: info => format(new Date(info.getValue()), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const cert = row.original;
        return (
          <div className="flex space-x-2">
            <button onClick={() => openDetail(cert._id)} className="text-gray-500 hover:text-blue-600" title="View Details">
              <Eye className="w-5 h-5" />
            </button>
            {cert.status === 'issued' && (
              <button onClick={() => setRevokeTarget(cert)} className="text-gray-500 hover:text-red-600" title="Revoke">
                <ShieldOff className="w-5 h-5" />
              </button>
            )}
            {cert.status === 'revoked' && (
              <button onClick={() => handleUnrevoke(cert._id)} className="text-gray-500 hover:text-green-600" title="Unrevoke">
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      },
    },
  ], [accessToken]);

  const Filters = (
    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="border border-gray-300 rounded-md text-sm py-2 px-3">
      <option value="">All Statuses</option>
      <option value="issued">Issued</option>
      <option value="revoked">Revoked</option>
      <option value="expired">Expired</option>
    </select>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Certificate Controls</h1>
        <p className="text-gray-500 text-sm mt-1">Search, revoke, and audit certificates across all organizations.</p>
      </div>

      <DataTable columns={columns} data={data} pageCount={pageCount} pageIndex={page} pageSize={10}
        onPageChange={setPage} onSearch={(v) => { setSearch(v); setPage(0); }} loading={loading} filters={Filters}
      />

      {/* ── Revoke Confirmation Modal ── */}
      {revokeTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold">Revoke Certificate</h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">You are about to revoke <strong>{revokeTarget.title}</strong>. This will mark the certificate as invalid in public verification.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <textarea rows={3} value={revokeReason} onChange={e => setRevokeReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-red-500 focus:border-red-500"
              placeholder="e.g. Fraudulent submission, data mismatch..." />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setRevokeTarget(null); setRevokeReason(''); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm">Cancel</button>
              <button onClick={handleRevoke} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Revoke Certificate</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {detailOpen && certDetail && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold">Certificate Details</h2>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Certificate info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{certDetail.title}</h3>
                  {statusBadge(certDetail.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Recipient</p>
                    <p className="font-medium">{certDetail.recipientId ? `${certDetail.recipientId.firstName} ${certDetail.recipientId.lastName}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Organization</p>
                    <p className="font-medium">{certDetail.organizationId?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Issue Date</p>
                    <p className="font-medium">{format(new Date(certDetail.issueDate), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Certificate ID</p>
                    <p className="font-mono text-xs break-all">{certDetail._id}</p>
                  </div>
                </div>

                {certDetail.status === 'revoked' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800">Revoked</p>
                    <p className="text-sm text-red-600 mt-1">{certDetail.revocationReason}</p>
                    {certDetail.revokedBy && <p className="text-xs text-red-400 mt-1">By: {certDetail.revokedBy.name} ({certDetail.revokedBy.email})</p>}
                    {certDetail.revokedAt && <p className="text-xs text-red-400">At: {format(new Date(certDetail.revokedAt), 'PPpp')}</p>}
                  </div>
                )}
              </div>

              {/* Moderation Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Moderation History
                </h3>
                {timeline.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No moderation history</p>
                ) : (
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-4">
                    {timeline.map((entry) => (
                      <div key={entry._id} className="ml-4 relative">
                        <div className={`absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 ${entry.action === 'REVOKE' ? 'bg-red-500 border-red-300' : 'bg-green-500 border-green-300'}`}></div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-bold ${entry.action === 'REVOKE' ? 'text-red-600' : 'text-green-600'}`}>{entry.action}</span>
                            <span className="text-xs text-gray-400">{format(new Date(entry.createdAt), 'MMM d, HH:mm')}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{entry.reason}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {entry.adminActor?.name} • {entry.beforeState} → {entry.afterState}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {certDetail.status === 'issued' && (
                  <button onClick={() => { setDetailOpen(false); setRevokeTarget(certDetail); }} className="flex-1 bg-red-50 text-red-700 py-2 rounded-md border border-red-200 text-sm hover:bg-red-100 flex items-center justify-center gap-2">
                    <ShieldOff className="w-4 h-4" /> Revoke
                  </button>
                )}
                {certDetail.status === 'revoked' && (
                  <button onClick={() => handleUnrevoke(certDetail._id)} className="flex-1 bg-green-50 text-green-700 py-2 rounded-md border border-green-200 text-sm hover:bg-green-100 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
