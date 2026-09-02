import React, { useState } from 'react';
import { Sparkles, ChevronRight, Apple, Heart, Activity, CheckCircle2, SlidersHorizontal, ArrowLeft, Footprints, Moon, ShieldCheck } from 'lucide-react';
import { HealthService } from '../services/healthService';

import { profileApi } from '../services/api';

interface Props {
  onGetStarted: (data?: any) => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onGetStarted }) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [goal, setGoal] = useState<string>('Lose Weight');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState<string>('1998-05-15');

  // Height Unit Switcher
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState<number>(175);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);

  // Weight Unit Switcher
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [weightLbs, setWeightLbs] = useState<number>(165);

  // Health Conditions
  const [healthConditions, setHealthConditions] = useState<string[]>(['None']);

  // Apple Health Integration
  const [appleHealthConnected, setAppleHealthConnected] = useState<boolean>(false);
  const [syncingHealth, setSyncingHealth] = useState<boolean>(false);

  const goalOptions = [
    'Lose Weight',
    'Gain Weight',
    'Build Muscle',
    'Maintain Weight',
    'Improve Fitness',
    'Improve Health',
    'Other',
  ];

  const conditionOptions = [
    'None',
    'Diabetes',
    'PCOS / PCOD',
    'Thyroid Issues',
    'High Blood Pressure',
    'High Cholesterol',
    'Knee / Joint Issues',
    'Back Problems',
    'Liver Issues',
    'Kidney Issues',
    'Pregnancy / Post Pregnancy',
    'Other',
  ];

  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 25;
  };

  const toggleCondition = (cond: string) => {
    if (cond === 'None') {
      setHealthConditions(['None']);
    } else {
      const filtered = healthConditions.filter((c) => c !== 'None');
      if (filtered.includes(cond)) {
        const next = filtered.filter((c) => c !== cond);
        setHealthConditions(next.length === 0 ? ['None'] : next);
      } else {
        setHealthConditions([...filtered, cond]);
      }
    }
  };

  const handleConnectAppleHealth = async () => {
    try {
      setSyncingHealth(true);
      await HealthService.requestPermissions();
      await HealthService.syncTodayMetrics(undefined, 'apple_health');
      setAppleHealthConnected(true);
    } catch (err) {
      console.error('Apple health connect error:', err);
    } finally {
      setSyncingHealth(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handleFinish = async () => {
    try {
      const finalCm = heightUnit === 'cm' ? heightCm : Math.round((heightFt * 12 + heightIn) * 2.54);
      const finalKg = weightUnit === 'kg' ? weightKg : Math.round((weightLbs / 2.20462) * 10) / 10;
      let goalVal: any = 'weight_loss';
      if (goal === 'Gain Weight') goalVal = 'weight_gain';
      if (goal === 'Build Muscle') goalVal = 'muscle_building';
      if (goal === 'Maintain Weight') goalVal = 'maintenance';

      const updateData = {
        gender,
        dateOfBirth: dob ? new Date(dob) : undefined,
        heightCm: finalCm,
        weightKg: finalKg,
        fitnessGoal: goalVal,
        customGoal: goal === 'Other' ? customGoal : undefined,
        healthConditions,
      };

      await profileApi.updateProfile(updateData);
      onGetStarted(updateData);
    } catch (err) {
      console.error('Failed saving onboarding profile to database:', err);
      onGetStarted();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Top Header */}
      <div className="pt-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Apple className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">NutriRegion</h1>
            <p className="text-[10px] text-emerald-400 font-medium">Health & Fitness Onboarding</p>
          </div>
        </div>
        {step > 1 && (
          <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-semibold">
            Step {step} of 6
          </span>
        )}
      </div>

      {/* STEP 1: WELCOME SCREEN */}
      {step === 1 && (
        <div className="my-auto py-6 z-10 flex flex-col items-center text-center space-y-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse blur-xl" />
            <div className="w-40 h-40 rounded-full bg-slate-800/80 border-2 border-emerald-500/40 p-3 shadow-2xl flex flex-col items-center justify-center backdrop-blur-md">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
                alt="NutriRegion Health"
                className="w-32 h-32 rounded-full object-cover shadow-lg border-2 border-emerald-400/50"
              />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
              Ready to unlock your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                health journey?
              </span>
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Let's understand your body, goals, health metrics, and regional lifestyle to personalize your NutriRegion experience.
            </p>
          </div>

          <button
            onClick={nextStep}
            className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 text-sm transition-all"
          >
            <span>Get Started</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      )}

      {/* STEP 2: PRIMARY GOAL */}
      {step === 2 && (
        <div className="my-auto py-4 z-10 space-y-4 max-w-sm mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-white">What's your main goal?</h2>
            <p className="text-xs text-slate-400">Select your primary fitness objective</p>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {goalOptions.map((g) => {
              const isSelected = goal === g;
              return (
                <div
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold">{g}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
              );
            })}
          </div>

          {goal === 'Other' && (
            <input
              type="text"
              placeholder="Tell us your specific goal..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={prevStep}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-1"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GENDER & DOB */}
      {step === 3 && (
        <div className="my-auto py-4 z-10 space-y-5 max-w-sm mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-white">Gender & Birth Date</h2>
            <p className="text-xs text-slate-400">Used for accurate BMR & TDEE macro calculation</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                    gender === g
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              When were you born? (Age: {calculateAge(dob)} years)
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={prevStep}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-1"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: HEIGHT & WEIGHT */}
      {step === 4 && (
        <div className="my-auto py-4 z-10 space-y-5 max-w-sm mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-white">Body Metrics</h2>
            <p className="text-xs text-slate-400">Specify height and weight with unit switchers</p>
          </div>

          {/* Height Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Height</label>
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setHeightUnit('cm')}
                  className={`px-2 py-0.5 rounded-md ${heightUnit === 'cm' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setHeightUnit('ft')}
                  className={`px-2 py-0.5 rounded-md ${heightUnit === 'ft' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  ft / in
                </button>
              </div>
            </div>

            {heightUnit === 'cm' ? (
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 outline-none"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Feet"
                  value={heightFt}
                  onChange={(e) => setHeightFt(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Inches"
                  value={heightIn}
                  onChange={(e) => setHeightIn(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Weight Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Weight</label>
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`px-2 py-0.5 rounded-md ${weightUnit === 'kg' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lbs')}
                  className={`px-2 py-0.5 rounded-md ${weightUnit === 'lbs' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  lbs
                </button>
              </div>
            </div>

            {weightUnit === 'kg' ? (
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 outline-none"
              />
            ) : (
              <input
                type="number"
                step="0.1"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 outline-none"
              />
            )}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={prevStep}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-1"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: HEALTH CONDITIONS */}
      {step === 5 && (
        <div className="my-auto py-4 z-10 space-y-4 max-w-sm mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-white">Health Conditions</h2>
            <p className="text-xs text-slate-400">Select any existing conditions for tailored diet safety</p>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto pr-1">
            {conditionOptions.map((cond) => {
              const isSelected = healthConditions.includes(cond);
              return (
                <div
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-500 text-white'
                      : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="truncate">{cond}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-300 leading-relaxed">
            🛡️ <b>Health Disclosure</b>: NutriRegion recommendations tailor calorie/sodium limits to reported conditions but never diagnose or replace professional medical advice.
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={prevStep}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-1"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: APPLE HEALTH / HEALTH CONNECT */}
      {step === 6 && (
        <div className="my-auto py-4 z-10 space-y-5 max-w-sm mx-auto w-full text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <Activity className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Connect Apple Health</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Sync steps, sleep, resting heart rate, and active energy to make NutriRegion recommendations 100% accurate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left text-xs font-bold text-slate-300">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Footprints className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>👣 Steps Counter</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>😴 Sleep Tracking</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              <span>❤️ Heart Rate</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>🔥 Active Energy</span>
            </div>
          </div>

          {appleHealthConnected && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ Apple Health Connected & Synced!</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={handleConnectAppleHealth}
              disabled={syncingHealth}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              <Apple className="w-4 h-4 fill-slate-950" />
              <span>{syncingHealth ? 'Connecting Apple Health...' : 'Connect Apple Health →'}</span>
            </button>

            <button
              onClick={handleFinish}
              className="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-xl text-xs"
            >
              {appleHealthConnected ? 'Finish & Save to Database →' : 'Not Now (Save to Database)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
