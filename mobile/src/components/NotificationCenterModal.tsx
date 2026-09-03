import React, { useState, useEffect } from 'react';
import { X, Bell, Dumbbell, Utensils, Droplets, Pill, Sparkles, Award, CheckCheck, Trash2, Settings, ShieldAlert } from 'lucide-react';
import { notificationApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateDeepLink?: (link: string) => void;
  onOpenSettings?: () => void;
}

export const NotificationCenterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateDeepLink,
  onOpenSettings,
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, activeCategory]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications({ category: activeCategory });
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed loading notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Mark read error:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Mark all read error:', e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c === 'workout') return <Dumbbell className="w-4 h-4 text-[#00D084]" />;
    if (c === 'meal') return <Utensils className="w-4 h-4 text-amber-400" />;
    if (c === 'hydration') return <Droplets className="w-4 h-4 text-cyan-400" />;
    if (c === 'medicine') return <Pill className="w-4 h-4 text-rose-400" />;
    if (c === 'ai' || c === 'snap_check') return <Sparkles className="w-4 h-4 text-purple-400" />;
    if (c === 'streak' || c === 'progress') return <Award className="w-4 h-4 text-amber-300" />;
    return <Bell className="w-4 h-4 text-[#00D084]" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#030B16]/90 backdrop-blur-md flex justify-end animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-[#0D1728] border-l border-[#1F2F4A] w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#152238] border-b border-[#1F2F4A] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#00D084]/20 border border-[#00D084]/30 text-[#00D084]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-[#00D084] text-[#030B16] font-extrabold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#9AA8BA]">Real-time alerts, reminders & progress</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-xl bg-[#0D1728] text-[#00D084] hover:bg-[#1C2C46] border border-[#203350]"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-[#0D1728] text-[#9AA8BA] hover:text-white border border-[#203350]"
                title="Notification preferences"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            <button onClick={onClose} className="p-2 rounded-xl bg-[#0D1728] text-[#9AA8BA] hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs Filter */}
        <div className="bg-[#0D1728] px-3 py-2 border-b border-[#152238] flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'workout', label: 'Workout' },
            { id: 'meal', label: 'Meals' },
            { id: 'hydration', label: 'Water' },
            { id: 'medicine', label: 'Medicine' },
            { id: 'ai', label: 'AI' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-[#00D084] text-[#030B16] font-extrabold'
                  : 'text-[#9AA8BA] bg-[#152238] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-white">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#9AA8BA] animate-pulse">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-8 h-8 text-[#9AA8BA]/30 mx-auto" />
              <p className="text-xs font-bold text-[#9AA8BA]">No notifications in this category</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  if (!item.isRead) handleMarkAsRead(item._id);
                  if (item.link && onNavigateDeepLink) {
                    onNavigateDeepLink(item.link);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer relative group flex items-start space-x-3 ${
                  !item.isRead
                    ? 'bg-[#152238] border-[#00D084]/50 shadow-md'
                    : 'bg-[#0D1728] border-[#1C2C46] opacity-80'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#030B16] border border-[#203350] flex-shrink-0 mt-0.5">
                  {getCategoryIcon(item.category || item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-extrabold truncate ${!item.isRead ? 'text-white' : 'text-slate-300'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[9px] text-[#9AA8BA] ml-2">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-[#9AA8BA] line-clamp-2 mt-1 leading-relaxed">{item.message}</p>
                </div>

                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#9AA8BA] hover:text-rose-400 transition"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
