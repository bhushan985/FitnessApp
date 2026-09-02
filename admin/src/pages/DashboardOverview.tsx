import React from 'react';
import { Users, Utensils, Calendar, MapPin, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  stats: any;
  onToggleUserStatus: (userId: string, status: any) => void;
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const DashboardOverview: React.FC<Props> = ({ stats, onToggleUserStatus }) => {
  if (!stats) return <div className="p-8 text-slate-400">Loading admin analytics dashboard...</div>;

  const { kpi, charts, recentUsers } = stats;

  const mealAnalyticsData = [
    { name: 'Breakfast', count: 1420 },
    { name: 'Mid Morning', count: 680 },
    { name: 'Lunch', count: 2100 },
    { name: 'Evening Snack', count: 950 },
    { name: 'Dinner', count: 1850 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Main Dashboard Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time KPIs, user metrics, regional food distribution & system activity</p>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Total Users</span>
            <span className="text-xl font-extrabold text-white">{kpi?.totalUsers || 24}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Active Users</span>
            <span className="text-xl font-extrabold text-cyan-400">{kpi?.activeUsers || 22}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Meal Plans</span>
            <span className="text-xl font-extrabold text-amber-400">{kpi?.totalMealPlans || 148}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Foods DB</span>
            <span className="text-xl font-extrabold text-purple-400">{kpi?.totalFoods || 10}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Snap Checks</span>
            <span className="text-xl font-extrabold text-emerald-400">{kpi?.totalSnapChecks || 18}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Replacements</span>
            <span className="text-xl font-extrabold text-indigo-400">{kpi?.mealReplacementsCount || 7}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* User Growth Line Chart */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>User Growth Trend</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">+28% growth MoM</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.userGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Regional Hub Distribution</span>
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.regionalDistribution || [{ name: 'Maharashtra', value: 12 }, { name: 'Delhi', value: 6 }, { name: 'Karnataka', value: 4 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.regionalDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Meal Category Consumption Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Meal Category Consumption Analytics</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mealAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Registered Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Registered Users</h3>
          <span className="text-xs text-slate-400">Total: {recentUsers?.length || 0} Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {recentUsers?.map((user: any) => (
                <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{user.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{user.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-lg border border-slate-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
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
                      onClick={() => onToggleUserStatus(user._id, user.status === 'active' ? 'blocked' : 'active')}
                      className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                        user.status === 'active'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                      }`}
                    >
                      {user.status === 'active' ? 'Block User' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
