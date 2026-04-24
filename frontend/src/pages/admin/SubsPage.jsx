import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/admin/DataTable';
import { useAdminStore } from '../../store/adminStore';
import { CreditCard, Eye, ArrowUpDown, Pause, Play, XCircle, Clock, DollarSign, Users as UsersIcon, Layers } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API = 'http://localhost:5001/api/v1/admin/subs';
const PLANS = ['free', 'starter', 'growth', 'enterprise', 'custom'];

export default function SubsPage() {
  const { accessToken } = useAdminStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Detail drawer
  const [detailOpen, setDetailOpen] = useState(false);
  const [subDetail, setSubDetail] = useState(null);
  const [history, setHistory] = useState([]);

  // Action modals
  const [actionModal, setActionModal] = useState(null); // { type, sub }
  const [actionForm, setActionForm] = useState({});

  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const url = new URL(API);
      url.searchParams.append('page', page + 1);
      url.searchParams.append('limit', 10);
      if (statusFilter) url.searchParams.append('status', statusFilter);
      if (planFilter) url.searchParams.append('planId', planFilter);

      const res = await fetch(url.toString(), { headers });
      const json = await res.json();
      if (res.ok) { setData(json.data.subs); setPageCount(json.data.pages); }
    } catch { toast.error('Network error'); }
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, [page, statusFilter, planFilter]);

  const openDetail = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { headers });
      const json = await res.json();
      if (res.ok) { setSubDetail(json.data.sub); setHistory(json.data.history); setDetailOpen(true); }
    } catch { toast.error('Failed to load details'); }
  };

  const submitAction = async () => {
    const { type, sub } = actionModal;
    const endpointMap = {
      plan: `/${sub._id}/plan`,
      trial: `/${sub._id}/trial`,
      pause: `/${sub._id}/pause`,
      resume: `/${sub._id}/resume`,
      cancel: `/${sub._id}/cancel`,
      limits: `/${sub._id}/limits`,
      pricing: `/${sub._id}/pricing`,
    };
    const methodMap = { trial: 'POST' };

    if (!actionForm.reason?.trim()) { toast.error('Reason is required'); return; }

    try {
      const res = await fetch(`${API}${endpointMap[type]}`, {
        method: methodMap[type] || 'PATCH',
        headers,
        body: JSON.stringify(actionForm),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message);
        setActionModal(null);
        setActionForm({});
        fetchSubs();
        if (detailOpen) openDetail(sub._id);
      } else {
        toast.error(json.message);
      }
    } catch { toast.error('Action failed'); }
  };

  const planBadge = (plan) => {
    const colors = {
      free: 'bg-gray-100 text-gray-600',
      starter: 'bg-blue-100 text-blue-700',
      growth: 'bg-purple-100 text-purple-700',
      enterprise: 'bg-amber-100 text-amber-800',
      custom: 'bg-pink-100 text-pink-700',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors[plan] || 'bg-gray-100'}`}>{plan.toUpperCase()}</span>;
  };

  const statusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      trialing: 'bg-indigo-100 text-indigo-700',
      canceled: 'bg-red-100 text-red-800',
      past_due: 'bg-orange-100 text-orange-700',
      unpaid: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
  };

  const columns = useMemo(() => [
    {
      header: 'Organization',
      accessorKey: 'organizationId',
      cell: info => <span className="font-medium">{info.getValue()?.name || '—'}</span>,
    },
    { header: 'Plan', accessorKey: 'planId', cell: info => planBadge(info.getValue()) },
    { header: 'Status', accessorKey: 'status', cell: info => statusBadge(info.getValue()) },
    {
      header: 'Seats',
      accessorKey: 'seatLimit',
      cell: info => <span className="text-gray-700">{info.getValue()}</span>,
    },
    {
      header: 'Period End',
      accessorKey: 'currentPeriodEnd',
      cell: info => format(new Date(info.getValue()), 'MMM d, yyyy'),
    },
    {
      header: 'Invoice',
      accessorKey: 'lastInvoiceStatus',
      cell: info => {
        const s = info.getValue();
        const c = { paid: 'text-green-600', pending: 'text-yellow-600', failed: 'text-red-600', none: 'text-gray-400' };
        return <span className={`text-xs font-medium ${c[s]}`}>{s.toUpperCase()}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="flex space-x-1.5">
            <button onClick={() => openDetail(sub._id)} className="p-1 text-gray-500 hover:text-blue-600" title="Details"><Eye className="w-4 h-4" /></button>
            <button onClick={() => { setActionModal({ type: 'plan', sub }); setActionForm({ planId: sub.planId, reason: '' }); }} className="p-1 text-gray-500 hover:text-purple-600" title="Change Plan"><ArrowUpDown className="w-4 h-4" /></button>
            {sub.status === 'active' && (
              <button onClick={() => { setActionModal({ type: 'pause', sub }); setActionForm({ reason: '' }); }} className="p-1 text-gray-500 hover:text-yellow-600" title="Pause"><Pause className="w-4 h-4" /></button>
            )}
            {sub.status === 'paused' && (
              <button onClick={() => { setActionModal({ type: 'resume', sub }); setActionForm({ reason: '' }); }} className="p-1 text-gray-500 hover:text-green-600" title="Resume"><Play className="w-4 h-4" /></button>
            )}
          </div>
        );
      },
    },
  ], [accessToken]);

  const Filters = (
    <>
      <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="border border-gray-300 rounded-md text-sm py-2 px-3">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="trialing">Trialing</option>
        <option value="canceled">Canceled</option>
        <option value="past_due">Past Due</option>
      </select>
      <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(0); }} className="border border-gray-300 rounded-md text-sm py-2 px-3">
        <option value="">All Plans</option>
        {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
      </select>
    </>
  );

  // Render action form based on type
  const renderActionForm = () => {
    if (!actionModal) return null;
    const { type, sub } = actionModal;

    const formConfigs = {
      plan: {
        title: 'Change Plan',
        icon: <ArrowUpDown className="w-5 h-5 text-purple-600" />,
        color: 'purple',
        fields: (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Plan</label>
            <select value={actionForm.planId || ''} onChange={e => setActionForm({...actionForm, planId: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm">
              {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        ),
      },
      trial: {
        title: 'Grant Trial',
        icon: <Clock className="w-5 h-5 text-indigo-600" />,
        color: 'indigo',
        fields: (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
            <input type="number" min={1} value={actionForm.trialDays || ''} onChange={e => setActionForm({...actionForm, trialDays: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="14" />
          </div>
        ),
      },
      pause: { title: 'Pause Subscription', icon: <Pause className="w-5 h-5 text-yellow-600" />, color: 'yellow', fields: null },
      resume: { title: 'Resume Subscription', icon: <Play className="w-5 h-5 text-green-600" />, color: 'green', fields: null },
      cancel: { title: 'Cancel at Period End', icon: <XCircle className="w-5 h-5 text-red-600" />, color: 'red', fields: null },
      limits: {
        title: 'Update Limits',
        icon: <UsersIcon className="w-5 h-5 text-blue-600" />,
        color: 'blue',
        fields: (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Limit</label>
              <input type="number" min={1} value={actionForm.seatLimit || ''} onChange={e => setActionForm({...actionForm, seatLimit: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (certs/mo)</label>
              <input type="number" min={1} value={actionForm.usageLimit || ''} onChange={e => setActionForm({...actionForm, usageLimit: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
            </div>
          </div>
        ),
      },
      pricing: {
        title: 'Custom Pricing',
        icon: <DollarSign className="w-5 h-5 text-pink-600" />,
        color: 'pink',
        fields: (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Override (cents)</label>
              <input type="number" min={0} value={actionForm.customPriceOverride || ''} onChange={e => setActionForm({...actionForm, customPriceOverride: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Notes</label>
              <textarea rows={2} value={actionForm.customPricingNotes || ''} onChange={e => setActionForm({...actionForm, customPricingNotes: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="e.g. Annual contract, 20% discount..." />
            </div>
          </div>
        ),
      },
    };

    const config = formConfigs[type];
    if (!config) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            {config.icon}
            <h2 className="text-lg font-bold">{config.title}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Organization: <strong>{sub.organizationId?.name}</strong></p>
          <div className="space-y-4">
            {config.fields}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
              <textarea rows={2} value={actionForm.reason || ''} onChange={e => setActionForm({...actionForm, reason: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="Required justification for audit trail..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => { setActionModal(null); setActionForm({}); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm">Cancel</button>
            <button onClick={submitAction} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Confirm</button>
          </div>
        </div>
      </div>
    );
  };

  const actionBadge = (action) => {
    const map = {
      UPGRADE: 'bg-green-100 text-green-700',
      DOWNGRADE: 'bg-orange-100 text-orange-700',
      GRANT_TRIAL: 'bg-indigo-100 text-indigo-700',
      PAUSE: 'bg-yellow-100 text-yellow-700',
      RESUME: 'bg-green-100 text-green-700',
      CANCEL: 'bg-red-100 text-red-700',
      CHANGE_SEATS: 'bg-blue-100 text-blue-700',
      CHANGE_USAGE_LIMIT: 'bg-blue-100 text-blue-700',
      CUSTOM_PRICE: 'bg-pink-100 text-pink-700',
      REACTIVATE: 'bg-green-100 text-green-700',
    };
    return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${map[action] || 'bg-gray-100'}`}>{action.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage organization plans, trials, limits, and billing overrides.</p>
      </div>

      <DataTable columns={columns} data={data} pageCount={pageCount} pageIndex={page} pageSize={10}
        onPageChange={setPage} onSearch={() => {}} loading={loading} filters={Filters}
      />

      {/* Action Modal */}
      {renderActionForm()}

      {/* ── Detail Drawer ── */}
      {detailOpen && subDetail && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold">Subscription Details</h2>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Plan</p>
                  <div className="mt-1">{planBadge(subDetail.planId)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{statusBadge(subDetail.status)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="text-lg font-bold">{subDetail.seatLimit}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Usage Limit</p>
                  <p className="text-lg font-bold">{subDetail.usageLimit}/mo</p>
                </div>
              </div>

              {/* Period & Trial */}
              <div className="text-sm space-y-2 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between"><span className="text-gray-500">Period End</span><span className="font-medium">{format(new Date(subDetail.currentPeriodEnd), 'PPP')}</span></div>
                {subDetail.cancelAtPeriodEnd && <div className="flex justify-between"><span className="text-red-500 font-medium">⚠ Cancels at period end</span></div>}
                {subDetail.trialEndsAt && <div className="flex justify-between"><span className="text-gray-500">Trial Ends</span><span className="font-medium">{format(new Date(subDetail.trialEndsAt), 'PPP')}</span></div>}
                {subDetail.customPriceOverride && <div className="flex justify-between"><span className="text-gray-500">Custom Price</span><span className="font-medium">${(subDetail.customPriceOverride / 100).toFixed(2)}/mo</span></div>}
                {subDetail.customPricingNotes && <div className="bg-pink-50 p-2 rounded text-xs text-pink-700">{subDetail.customPricingNotes}</div>}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setDetailOpen(false); setActionModal({ type: 'plan', sub: subDetail }); setActionForm({ planId: subDetail.planId, reason: '' }); }}
                  className="flex items-center justify-center gap-2 py-2 border rounded-md text-sm text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100">
                  <ArrowUpDown className="w-4 h-4" /> Change Plan
                </button>
                <button onClick={() => { setDetailOpen(false); setActionModal({ type: 'trial', sub: subDetail }); setActionForm({ trialDays: 14, reason: '' }); }}
                  className="flex items-center justify-center gap-2 py-2 border rounded-md text-sm text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                  <Clock className="w-4 h-4" /> Grant Trial
                </button>
                <button onClick={() => { setDetailOpen(false); setActionModal({ type: 'limits', sub: subDetail }); setActionForm({ seatLimit: subDetail.seatLimit, usageLimit: subDetail.usageLimit, reason: '' }); }}
                  className="flex items-center justify-center gap-2 py-2 border rounded-md text-sm text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100">
                  <Layers className="w-4 h-4" /> Limits
                </button>
                <button onClick={() => { setDetailOpen(false); setActionModal({ type: 'pricing', sub: subDetail }); setActionForm({ customPriceOverride: subDetail.customPriceOverride || 0, customPricingNotes: subDetail.customPricingNotes || '', reason: '' }); }}
                  className="flex items-center justify-center gap-2 py-2 border rounded-md text-sm text-pink-700 border-pink-200 bg-pink-50 hover:bg-pink-100">
                  <DollarSign className="w-4 h-4" /> Pricing
                </button>
                {subDetail.status === 'active' && (
                  <button onClick={() => { setDetailOpen(false); setActionModal({ type: 'pause', sub: subDetail }); setActionForm({ reason: '' }); }}
                    className="flex items-center justify-center gap-2 py-2 border rounded-md text-sm text-yellow-700 border-yellow-200 bg-yellow-50 hover:bg-yellow-100">
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                )}
                {subDetail.status === 'paused' && (
                  <button onClick={() => { setDetailOpen(false); setActionModal({ type: 'resume', sub: subDetail }); setActionForm({ reason: '' }); }}
                    className="flex items-center justify-center gap-2 py-2 border rounded-md text-sm text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                    <Play className="w-4 h-4" /> Resume
                  </button>
                )}
                {!subDetail.cancelAtPeriodEnd && subDetail.status !== 'canceled' && (
                  <button onClick={() => { setDetailOpen(false); setActionModal({ type: 'cancel', sub: subDetail }); setActionForm({ reason: '' }); }}
                    className="flex items-center justify-center gap-2 py-2 border rounded-md text-sm text-red-700 border-red-200 bg-red-50 hover:bg-red-100">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>

              {/* Billing Override History */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Billing Override History
                </h3>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No billing overrides</p>
                ) : (
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-4">
                    {history.map(entry => (
                      <div key={entry._id} className="ml-4 relative">
                        <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 bg-blue-500 border-blue-300"></div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start flex-wrap gap-1">
                            {actionBadge(entry.action)}
                            <span className="text-xs text-gray-400">{format(new Date(entry.createdAt), 'MMM d, HH:mm')}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{entry.reason}</p>
                          <p className="text-xs text-gray-400 mt-1">{entry.adminActor?.name} ({entry.adminActor?.email})</p>
                          {entry.beforeState?.planId !== entry.afterState?.planId && (
                            <p className="text-xs text-gray-500 mt-0.5">Plan: {entry.beforeState?.planId} → {entry.afterState?.planId}</p>
                          )}
                          {entry.beforeState?.status !== entry.afterState?.status && (
                            <p className="text-xs text-gray-500 mt-0.5">Status: {entry.beforeState?.status} → {entry.afterState?.status}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
