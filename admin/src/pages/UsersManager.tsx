import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, Lock, UserCheck } from 'lucide-react';
import { adminApi } from '../services/api';

export const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await adminApi.toggleUserStatus(userId, newStatus);
      fetchUsers();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Management & Security</h1>
          <p className="text-xs text-slate-400 mt-1">Manage user accounts, roles, access statuses, and security blocks</p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 text-white text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80">
              <th className="py-3.5 px-4">User Details</th>
              <th className="py-3.5 px-4">Detected Region</th>
              <th className="py-3.5 px-4">Location Source</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="block font-bold text-white">{user.name}</span>
                    <span className="text-[10px] text-slate-400">{user.email}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-white font-bold block">
                    {user.region ? `${user.region.city}, ${user.region.state}` : 'Pune, Maharashtra'}
                  </span>
                  <span className="text-[10px] text-slate-400">{user.region?.country || 'India'}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                    user.locationSource === 'manual' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {user.locationSource === 'manual' ? 'Manual' : 'GPS Active'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-semibold uppercase text-[10px] text-slate-300">{user.role}</td>
                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                      user.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(user._id, user.status)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1 ml-auto ${
                      user.status === 'active'
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {user.status === 'active' ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Block Account</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Unblock User</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
