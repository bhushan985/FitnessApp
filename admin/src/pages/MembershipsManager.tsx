import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';

export const MembershipsManager: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 499,
    currency: 'INR',
    billingPeriod: 'monthly',
    trialDays: 30,
    features: ['5-Slot Meal Plans', 'Pro Workout Library'],
    trainerIncluded: false,
    AIAccess: true,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPlans();
      if (res.success && res.data) setPlans(res.data);
    } catch (err) {
      console.error('Failed loading membership plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.createPlan(formData);
      if (res.success) {
        alert('Membership plan created successfully!');
        setShowAddModal(false);
        loadPlans();
      }
    } catch (err: any) {
      alert(`Error creating plan: ${err.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Membership Plans Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Configure subscription pricing tiers, feature caps & trainer inclusions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tier</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-xs">Loading membership catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                </div>
                <CreditCard className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>

              <div className="pt-2">
                <span className="text-3xl font-black text-emerald-400">₹{plan.price}</span>
                <span className="text-xs text-slate-400 uppercase font-bold ml-1">/ {plan.billingPeriod}</span>
              </div>

              <ul className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                {plan.features?.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-extrabold text-white">Add New Membership Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  placeholder="e.g. VIP Elite Trainer Access"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Billing Period</label>
                  <select
                    value={formData.billingPeriod}
                    onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="trainerInc"
                  checked={formData.trainerIncluded}
                  onChange={(e) => setFormData({ ...formData, trainerIncluded: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="trainerInc" className="text-xs text-slate-300 font-bold">Include Personal Trainer Assignment</label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
                >
                  Save Membership Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
