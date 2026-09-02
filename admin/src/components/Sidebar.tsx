import React from 'react';
import { LayoutDashboard, Users, Calendar, Utensils, MapPin, BarChart3, Settings, ShieldAlert, LogOut, Apple, CreditCard, UserCheck, Dumbbell } from 'lucide-react';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onSelectTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'memberships', label: 'Memberships', icon: CreditCard },
    { id: 'trainers', label: 'Personal Trainers', icon: UserCheck },
    { id: 'exercises', label: 'Exercise Library', icon: Dumbbell },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'foods', label: 'Food Database', icon: Utensils },
    { id: 'regions', label: 'Regional Hubs', icon: MapPin },
    { id: 'meal-plans', label: 'Meal Plans', icon: Calendar },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Apple className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-none">NutriRegion</h1>
            <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-wider">Admin Management</p>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isSelected = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin User Profile Footer */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Admin Account</p>
              <p className="text-[10px] text-slate-400 truncate">admin@fitnessapp.com</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
