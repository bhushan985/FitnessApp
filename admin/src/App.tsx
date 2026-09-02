import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './pages/DashboardOverview';
import { FoodsManager } from './pages/FoodsManager';
import { UsersManager } from './pages/UsersManager';
import { RegionsManager } from './pages/RegionsManager';
import { AuditLogsView } from './pages/AuditLogsView';
import { MembershipsManager } from './pages/MembershipsManager';
import { TrainersManager } from './pages/TrainersManager';
import { ExercisesManager } from './pages/ExercisesManager';
import { adminApi } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAdminSession();
  }, []);

  const initAdminSession = async () => {
    try {
      setLoading(true);
      await adminApi.login('admin@fitnessapp.com', 'password123');
      loadStats();
    } catch (err) {
      console.error('Admin auth failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success) setDashboardStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, status: 'active' | 'blocked') => {
    try {
      await adminApi.toggleUserStatus(userId, status);
      loadStats();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Admin Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={() => window.location.reload()}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardOverview stats={dashboardStats} onToggleUserStatus={handleToggleUserStatus} />
        )}
        {activeTab === 'memberships' && <MembershipsManager />}
        {activeTab === 'trainers' && <TrainersManager />}
        {activeTab === 'exercises' && <ExercisesManager />}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'foods' && <FoodsManager />}
        {activeTab === 'regions' && <RegionsManager />}
        {activeTab === 'meal-plans' && (
          <DashboardOverview stats={dashboardStats} onToggleUserStatus={handleToggleUserStatus} />
        )}
        {activeTab === 'reports' && (
          <DashboardOverview stats={dashboardStats} onToggleUserStatus={handleToggleUserStatus} />
        )}
        {activeTab === 'audit-logs' && <AuditLogsView />}
        {activeTab === 'settings' && (
          <div className="p-8 text-slate-300">
            <h1 className="text-xl font-bold text-white mb-2">System Settings</h1>
            <p className="text-xs text-slate-400">Configure global recommendation algorithm parameters & API keys</p>
          </div>
        )}
      </main>
    </div>
  );
};
