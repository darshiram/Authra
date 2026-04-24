import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import { useAdminStore } from '../../store/adminStore';
import { MoreVertical, Edit, ShieldBan, Key, CheckCircle, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { accessToken } = useAdminStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [userDetails, setUserDetails] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:5001/api/v1/admin/users');
      url.searchParams.append('page', page + 1);
      url.searchParams.append('limit', 10);
      if (search) url.searchParams.append('search', search);
      if (statusFilter) url.searchParams.append('status', statusFilter);
      if (roleFilter) url.searchParams.append('role', roleFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const json = await res.json();
      if (res.ok) {
        setData(json.data.users);
        setPageCount(json.data.pages);
      } else {
        toast.error(json.message || 'Failed to fetch users');
      }
    } catch (err) {
      toast.error('Network error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter, roleFilter]);

  const fetchUserDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/v1/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const json = await res.json();
      if (res.ok) {
        setUserDetails(json.data);
      }
    } catch (err) {
      toast.error('Failed to fetch user details');
    }
  };

  const handleAction = async (id, endpoint, method, body = null, successMsg) => {
    try {
      const res = await fetch(`http://localhost:5001/api/v1/admin/users/${id}${endpoint}`, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: body ? JSON.stringify(body) : null
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(successMsg || json.message);
        fetchUsers();
        if (isViewModalOpen) fetchUserDetails(id);
      } else {
        toast.error(json.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const toggleBan = (id, currentStatus) => {
    const action = currentStatus === 'banned' ? 'unban' : 'ban';
    const reason = action === 'ban' ? window.prompt('Enter ban reason:') : undefined;
    if (action === 'ban' && !reason) return;
    handleAction(id, '/ban', 'PATCH', { action, reason }, `User ${action}ned`);
  };

  const resetPassword = (id) => {
    if (window.confirm('Are you sure you want to trigger a password reset?')) {
      handleAction(id, '/reset-password', 'POST', null, 'Password reset triggered');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5001/api/v1/admin/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        toast.success('User updated');
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        const json = await res.json();
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const columns = React.useMemo(() => [
    {
      header: 'Name',
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: info => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {info.getValue().replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => {
        const status = info.getValue();
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status.toUpperCase()}
          </span>
        )
      }
    },
    {
      header: 'Verified',
      accessorKey: 'isVerified',
      cell: info => info.getValue() ? <CheckCircle className="text-green-500 w-5 h-5" /> : <span className="text-gray-400 border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: info => format(new Date(info.getValue()), 'MMM d, yyyy')
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex space-x-2">
            <button onClick={() => { setSelectedUser(user); fetchUserDetails(user._id); setIsViewModalOpen(true); }} className="text-gray-500 hover:text-blue-600" title="View Profile">
              <FileText className="w-5 h-5" />
            </button>
            <button onClick={() => { setSelectedUser(user); setEditFormData({ firstName: user.firstName, lastName: user.lastName, role: user.role }); setIsEditModalOpen(true); }} className="text-gray-500 hover:text-indigo-600" title="Edit">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={() => toggleBan(user._id, user.status)} className={`text-gray-500 hover:text-red-600`} title={user.status === 'banned' ? 'Unban' : 'Ban'}>
              <ShieldBan className={`w-5 h-5 ${user.status === 'banned' ? 'text-red-500' : ''}`} />
            </button>
            <button onClick={() => resetPassword(user._id)} className="text-gray-500 hover:text-yellow-600" title="Reset Password">
              <Key className="w-5 h-5" />
            </button>
          </div>
        );
      }
    }
  ], [accessToken]);

  const Filters = (
    <>
      <select value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setPage(0);}} className="border border-gray-300 rounded-md text-sm py-2 px-3">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="banned">Banned</option>
      </select>
      <select value={roleFilter} onChange={e => {setRoleFilter(e.target.value); setPage(0);}} className="border border-gray-300 rounded-md text-sm py-2 px-3">
        <option value="">All Roles</option>
        <option value="user">User</option>
        <option value="organization_owner">Org Owner</option>
        <option value="organization_staff">Org Staff</option>
      </select>
    </>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage platform users, roles, and security.</p>
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
            <h2 className="text-lg font-bold mb-4">Edit User</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input required type="text" value={editFormData.firstName || ''} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input required type="text" value={editFormData.lastName || ''} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select value={editFormData.role || 'user'} onChange={e => setEditFormData({...editFormData, role: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  <option value="user">User</option>
                  <option value="organization_owner">Org Owner</option>
                  <option value="organization_staff">Org Staff</option>
                </select>
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
      {isViewModalOpen && userDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{userDetails.user.firstName} {userDetails.user.lastName}</h2>
                <p className="text-gray-500">{userDetails.user.email}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Issued Certificates</p>
                <p className="text-2xl font-bold">{userDetails.stats.certificatesCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-xl font-bold capitalize">{userDetails.user.status}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Recent Logins</h3>
              <ul className="text-sm space-y-2">
                {userDetails.history.loginEvents.map(ev => (
                  <li key={ev._id} className="flex justify-between border-b pb-1">
                    <span>{format(new Date(ev.timestamp), 'MMM d, HH:mm')}</span>
                    <span className="text-gray-500">{ev.location?.city}, {ev.location?.country}</span>
                    <span className={ev.status === 'success' ? 'text-green-600' : 'text-red-600'}>{ev.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!userDetails.user.isVerified && (
              <button onClick={() => handleAction(userDetails.user._id, '/verify', 'PATCH', null, 'Email manually verified')} className="w-full bg-indigo-50 text-indigo-700 py-2 rounded-md border border-indigo-200 hover:bg-indigo-100">
                Manually Verify Email
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
