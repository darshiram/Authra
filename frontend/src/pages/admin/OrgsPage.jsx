import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import { useAdminStore } from '../../store/adminStore';
import { Building, ShieldBan, Users, LogIn, Edit, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function OrgsPage() {
  const { accessToken } = useAdminStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [orgDetails, setOrgDetails] = useState(null);
  const [orgMembers, setOrgMembers] = useState([]);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:5001/api/v1/admin/orgs');
      url.searchParams.append('page', page + 1);
      url.searchParams.append('limit', 10);
      if (search) url.searchParams.append('search', search);
      if (statusFilter) url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const json = await res.json();
      if (res.ok) {
        setData(json.data.orgs);
        setPageCount(json.data.pages);
      } else {
        toast.error(json.message || 'Failed to fetch orgs');
      }
    } catch (err) {
      toast.error('Network error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrgs();
  }, [page, search, statusFilter]);

  const fetchOrgDetails = async (id) => {
    try {
      const [detailsRes, membersRes] = await Promise.all([
        fetch(`http://localhost:5001/api/v1/admin/orgs/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`http://localhost:5001/api/v1/admin/orgs/${id}/members?limit=5`, { headers: { Authorization: `Bearer ${accessToken}` } })
      ]);
      const detailsJson = await detailsRes.json();
      const membersJson = await membersRes.json();
      
      if (detailsRes.ok) setOrgDetails(detailsJson.data);
      if (membersRes.ok) setOrgMembers(membersJson.data.members);
    } catch (err) {
      toast.error('Failed to fetch org details');
    }
  };

  const toggleBan = async (id, currentStatus) => {
    const action = currentStatus === 'banned' ? 'unban' : 'ban';
    const reason = action === 'ban' ? window.prompt('Enter ban reason:') : undefined;
    if (action === 'ban' && !reason) return;
    
    try {
      const res = await fetch(`http://localhost:5001/api/v1/admin/orgs/${id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ action, reason })
      });
      if (res.ok) {
        toast.success(`Organization ${action}ned`);
        fetchOrgs();
      }
    } catch (err) {
      toast.error('Ban toggle failed');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5001/api/v1/admin/orgs/${selectedOrg._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        toast.success('Org updated');
        setIsEditModalOpen(false);
        fetchOrgs();
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const impersonateOrg = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/v1/admin/orgs/${id}/impersonate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const json = await res.json();
      if (res.ok) {
        // Here you would typically store this impersonation token and redirect
        // to the client portal context. For now, we display it.
        toast.success('Impersonation token generated');
        console.log('Impersonation Token:', json.data.impersonationToken);
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Impersonation failed');
    }
  };

  const columns = React.useMemo(() => [
    {
      header: 'Organization',
      accessorKey: 'name',
      cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>
    },
    {
      header: 'Domain',
      accessorKey: 'domain',
    },
    {
      header: 'Owner',
      accessorKey: 'ownerId',
      cell: info => info.getValue() ? `${info.getValue().firstName} ${info.getValue().lastName}` : 'N/A'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => {
        const status = info.getValue();
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status === 'active' ? 'bg-green-100 text-green-800' : status === 'banned' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {status.toUpperCase()}
          </span>
        )
      }
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: info => format(new Date(info.getValue()), 'MMM d, yyyy')
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const org = row.original;
        return (
          <div className="flex space-x-2">
            <button onClick={() => { setSelectedOrg(org); fetchOrgDetails(org._id); setIsViewModalOpen(true); }} className="text-gray-500 hover:text-blue-600" title="View Profile">
              <Building className="w-5 h-5" />
            </button>
            <button onClick={() => { setSelectedOrg(org); setEditFormData({ name: org.name, domain: org.domain }); setIsEditModalOpen(true); }} className="text-gray-500 hover:text-indigo-600" title="Edit">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={() => impersonateOrg(org._id)} className="text-gray-500 hover:text-green-600" title="Support Impersonation">
              <LogIn className="w-5 h-5" />
            </button>
            <button onClick={() => toggleBan(org._id, org.status)} className={`text-gray-500 hover:text-red-600`} title={org.status === 'banned' ? 'Unban' : 'Ban'}>
              <ShieldBan className={`w-5 h-5 ${org.status === 'banned' ? 'text-red-500' : ''}`} />
            </button>
          </div>
        );
      }
    }
  ], [accessToken]);

  const Filters = (
    <select value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setPage(0);}} className="border border-gray-300 rounded-md text-sm py-2 px-3">
      <option value="">All Statuses</option>
      <option value="active">Active</option>
      <option value="banned">Banned</option>
      <option value="pending_verification">Pending</option>
    </select>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizations Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage tenant organizations, subscriptions, and security.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount}
        pageIndex={page}
        pageSize={10}
        onPageChange={setPage}
        onSearch={(v) => { setSearch(v); setPage(0); }}
        loading={loading}
        filters={Filters}
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Organization</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" value={editFormData.name || ''} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <input required type="text" value={editFormData.domain || ''} onChange={e => setEditFormData({...editFormData, domain: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && orgDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{orgDetails.org.name}</h2>
                <p className="text-gray-500">{orgDetails.org.domain}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-2xl font-bold">{orgDetails.stats.membersCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Certificates</p>
                <p className="text-2xl font-bold">{orgDetails.stats.certificatesCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-xl font-bold capitalize">{orgDetails.org.status}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Recent Members</h3>
              <ul className="text-sm space-y-2 border border-gray-200 rounded-md p-3">
                {orgMembers.map(m => (
                  <li key={m._id} className="flex justify-between border-b pb-1 last:border-0 last:pb-0">
                    <span>{m.firstName} {m.lastName}</span>
                    <span className="text-gray-500">{m.email}</span>
                  </li>
                ))}
              </ul>
            </div>

            {orgDetails.org.subscriptionId ? (
               <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                 <p className="text-sm font-bold text-blue-800">Subscription: {orgDetails.org.subscriptionId.planId}</p>
                 <p className="text-xs text-blue-600">Status: {orgDetails.org.subscriptionId.status}</p>
               </div>
            ) : (
               <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500">
                 No active subscription
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
