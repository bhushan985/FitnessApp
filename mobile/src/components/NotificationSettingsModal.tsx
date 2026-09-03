import React, { useState, useEffect } from 'react';
import { X, Bell, Moon, Volume2, ShieldCheck, Dumbbell, Utensils, Droplets, Pill, Sparkles, Send, Check } from 'lucide-react';
import { notificationApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);

  const [prefs, setPrefs] = useState<any>({
    masterEnabled: true,
    workoutReminders: true,
    restTimerSound: true,
    workoutCompletion: true,
    breakfastReminder: true,
    lunchReminder: true,
    dinnerReminder: true,
    proteinGoalAlerts: true,
    waterReminders: true,
    medicineReminders: true,
    snapCheckNotifications: true,
    subscriptionAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getPreferences();
      if (res.success && res.data) {
        setPrefs(res.data);
      }
    } catch (e) {
      console.error('Failed loading preferences:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      setSaving(true);
      await notificationApi.updatePreferences({ [key]: updated[key] });
    } catch (e) {
      console.error('Failed saving preference update:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setTestSent(true);
      await notificationApi.sendTestNotification({
        title: 'NutriRegion Real-Time Engine Active ⚡',
        message: 'Notification preferences, Socket.IO gateway, and policy engine verified.',
      });
      setTimeout(() => setTestSent(false), 3000);
    } catch (e) {
      console.error('Test notification error:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#030B16]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-[#0D1728] border border-[#1F2F4A] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#152238] border-b border-[#1F2F4A] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#00D084]/20 border border-[#00D084]/30 text-[#00D084]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Notification Settings</h2>
              <p className="text-[10px] text-[#9AA8BA]">Manage real-time alerts & quiet hours</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#0D1728] text-[#9AA8BA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 no-scrollbar text-white">
          {/* Master Enable Toggle */}
          <div className="bg-[#152238] border border-[#203350] p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#00D084]" />
              <div>
                <h3 className="text-xs font-bold text-white">Master Notifications</h3>
                <p className="text-[10px] text-[#9AA8BA]">Enable or disable all app alerts</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('masterEnabled')}
              className={`w-12 h-6 rounded-full transition-all relative ${prefs.masterEnabled ? 'bg-[#00D084]' : 'bg-[#203350]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${prefs.masterEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Quiet Hours Settings */}
          <div className="bg-[#152238] border border-[#203350] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-xs font-bold text-white">Quiet Hours</h3>
                  <p className="text-[10px] text-[#9AA8BA]">Suppress non-critical alerts overnight</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('quietHoursEnabled')}
                className={`w-12 h-6 rounded-full transition-all relative ${prefs.quietHoursEnabled ? 'bg-[#00D084]' : 'bg-[#203350]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${prefs.quietHoursEnabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            {prefs.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#203350]">
                <div>
                  <label className="text-[10px] font-bold text-[#9AA8BA] block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={prefs.quietHoursStart}
                    onChange={(e) => {
                      setPrefs({ ...prefs, quietHoursStart: e.target.value });
                      notificationApi.updatePreferences({ quietHoursStart: e.target.value });
                    }}
                    className="w-full bg-[#0D1728] border border-[#243754] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D084]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#9AA8BA] block mb-1">End Time</label>
                  <input
                    type="time"
                    value={prefs.quietHoursEnd}
                    onChange={(e) => {
                      setPrefs({ ...prefs, quietHoursEnd: e.target.value });
                      notificationApi.updatePreferences({ quietHoursEnd: e.target.value });
                    }}
                    className="w-full bg-[#0D1728] border border-[#243754] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D084]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sound & Audio Toggle */}
          <div className="bg-[#152238] border border-[#203350] p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-xs font-bold text-white">Audio Sounds</h3>
                <p className="text-[10px] text-[#9AA8BA]">Play Web Audio tone chimes for alerts</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('soundEnabled')}
              className={`w-12 h-6 rounded-full transition-all relative ${prefs.soundEnabled ? 'bg-[#00D084]' : 'bg-[#203350]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${prefs.soundEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Category Reminders Toggles */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-[#00D084] uppercase tracking-wider">Category Preferences</h4>

            {[
              { key: 'workoutReminders', label: 'Workout Reminders & Timers', icon: Dumbbell, color: 'text-[#00D084]' },
              { key: 'breakfastReminder', label: 'Meal Reminders (Breakfast, Lunch, Dinner)', icon: Utensils, color: 'text-amber-400' },
              { key: 'waterReminders', label: 'Hydration Reminders', icon: Droplets, color: 'text-cyan-400' },
              { key: 'medicineReminders', label: 'Medicine Dose Alerts', icon: Pill, color: 'text-rose-400' },
              { key: 'snapCheckNotifications', label: 'Snap Check AI Vision Results', icon: Sparkles, color: 'text-purple-400' },
            ].map((cat) => {
              const IconComp = cat.icon;
              const isChecked = !!prefs[cat.key];
              return (
                <div key={cat.key} className="bg-[#152238] border border-[#203350] p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComp className={`w-4 h-4 ${cat.color}`} />
                    <span className="text-xs font-bold text-slate-200">{cat.label}</span>
                  </div>
                  <button
                    onClick={() => handleToggle(cat.key)}
                    className={`w-10 h-5 rounded-full transition-all relative ${isChecked ? 'bg-[#00D084]' : 'bg-[#203350]'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${isChecked ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Test Notification Trigger CTA */}
          <button
            onClick={handleSendTest}
            className="w-full py-3 bg-[#152238] hover:bg-[#1C2C46] border border-[#00D084]/40 text-[#00D084] font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 transition"
          >
            {testSent ? <Check className="w-4 h-4 text-[#00D084]" /> : <Send className="w-4 h-4" />}
            <span>{testSent ? 'Test Notification Dispatched!' : 'Send Test Real-Time Alert'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
