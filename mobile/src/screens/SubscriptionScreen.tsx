import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Sparkles, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { subscriptionApi } from '../services/api';
import { MembershipPlan } from '../types';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export const SubscriptionScreen: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [testSimulateDay, setTestSimulateDay] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.getMembershipPlans();
      if (res.success && res.data) {
        setPlans(res.data);
        if (res.data.length > 1) setSelectedPlanId(res.data[1]._id);
        else if (res.data.length > 0) setSelectedPlanId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load membership plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId) return;
    try {
      setProcessingPayment(true);
      // 1. Create order
      const orderRes = await subscriptionApi.createOrder(selectedPlanId);
      if (!orderRes.success) throw new Error(orderRes.message);

      const orderData = orderRes.data;

      // 2. Simulate Razorpay Sandbox Payment Verification
      const mockPaymentId = `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const mockSignature = `test_sig_${Date.now()}`;

      const verifyRes = await subscriptionApi.verifyPayment(orderData.orderId, mockPaymentId, mockSignature);

      if (verifyRes.success) {
        alert('🎉 Subscription activated successfully! Thank you for choosing NutriRegion.');
        onSuccess();
      } else {
        alert(`Payment error: ${verifyRes.message}`);
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      alert(`Subscription activation failed: ${err.message || 'Error occurred'}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSimulateTrial = async (day: number) => {
    try {
      setTestSimulateDay(day);
      await subscriptionApi.simulateTrialDay(day);
      alert(`Simulated Trial Day ${day} set successfully! Refreshing status...`);
      onSuccess();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setTestSimulateDay(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-extrabold text-white">Membership Plans</h1>
        <div className="w-9" />
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Banner */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-900 border border-emerald-500/30 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Unlock Full NutriRegion AI</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Unlimited regional diet plans, AI Snap Check food scanning, certified personal trainers & complete workout media.
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
            <p className="text-xs">Loading membership plans...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan._id;
              return (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlanId(plan._id)}
                  className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-emerald-500 bg-slate-900/90 shadow-xl shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  {plan.name.includes('Pro') && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 shadow-md">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-400">₹{plan.price}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">/ {plan.billingPeriod}</p>
                    </div>
                  </div>

                  <ul className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Subscribe CTA */}
        <button
          disabled={!selectedPlanId || processingPayment}
          onClick={handleSubscribe}
          className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 transition-all disabled:opacity-50"
        >
          {processingPayment ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Razorpay Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Activate Membership Now</span>
            </>
          )}
        </button>

        {/* Dev 30-Day Trial Simulator Box */}
        <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dev Trial Testing Simulator</h4>
          </div>
          <p className="text-[11px] text-slate-400">Test backend subscription expiration policies without waiting 30 days:</p>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[1, 29, 30, 31].map((day) => (
              <button
                key={day}
                onClick={() => handleSimulateTrial(day)}
                disabled={testSimulateDay !== null}
                className="px-2 py-1.5 rounded-xl bg-slate-800 text-[11px] font-bold text-slate-200 hover:bg-emerald-500 hover:text-slate-950 transition-all border border-slate-700"
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
