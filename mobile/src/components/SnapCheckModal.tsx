import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  History,
  Shield,
  ArrowRight,
  Clock,
  Flame,
  ChefHat,
} from 'lucide-react';
import { SnapCheckResult, DetectedFoodItem } from '../types';
import { snapCheckApi, recipeApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onViewRecipe?: (recipe: any) => void;
}

export const SnapCheckModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, onViewRecipe }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review' | 'history'>('upload');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [snapResult, setSnapResult] = useState<SnapCheckResult | null>(null);
  const [items, setItems] = useState<DetectedFoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  // Real User Data States
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      setLoadingHistory(true);
      const res = await snapCheckApi.getHistory();
      if (res.success && res.data) {
        setRecentScans(res.data.slice(0, 4));
        setHistoryList(res.data);
      }
      const recRes = await recipeApi.searchRecipes({ limit: 3 });
      if (recRes.success && recRes.data) {
        setSmartSuggestions(recRes.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed loading user scan history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartAnalysis = async (imgUrl: string) => {
    try {
      setSelectedImage(imgUrl);
      setStep('analyzing');
      setLoading(true);
      setErrorMsg(null);

      const res = await snapCheckApi.analyzeImage(imgUrl);

      if (res.success && res.data) {
        setSnapResult(res.data);
        setItems(res.data.detectedItems || []);
        setStep('review');
        loadUserData(); // Refresh recent scans
      } else {
        setErrorMsg('Unable to analyze this image. Please try again.');
        setStep('upload');
      }
    } catch (err: any) {
      console.error('Snap Check error:', err);
      setErrorMsg(err.message || 'Network error analyzing meal image.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('File size should be less than 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemPortionChange = (index: number, newQtyG: number) => {
    const updated = [...items];
    const item = updated[index];
    const qtyG = Math.max(10, newQtyG);
    const oldQty = item.estimatedQuantityG || 100;
    const ratio = qtyG / oldQty;

    item.estimatedQuantityG = qtyG;
    item.calories = Math.round(item.calories * ratio);
    item.proteinG = Math.round(item.proteinG * ratio * 10) / 10;
    item.carbsG = Math.round(item.carbsG * ratio * 10) / 10;
    item.fatG = Math.round(item.fatG * ratio * 10) / 10;

    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFoodItem = () => {
    const newItem: DetectedFoodItem = {
      foodName: 'Green Salad',
      confidence: 1.0,
      estimatedQuantityG: 100,
      unit: 'g',
      calories: 45,
      proteinG: 1.5,
      carbsG: 8,
      fatG: 0.5,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Live Nutrition Totals Calculation
  const totalCalories = items.reduce((acc, i) => acc + (i.calories || 0), 0);
  const totalProtein = Math.round(items.reduce((acc, i) => acc + (i.proteinG || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((acc, i) => acc + (i.carbsG || 0), 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((acc, i) => acc + (i.fatG || 0), 0) * 10) / 10;

  const handleConfirmAndLog = async () => {
    if (!snapResult || items.length === 0) return;
    try {
      setSubmitting(true);
      await snapCheckApi.correctAnalysis(snapResult._id, items);
      await snapCheckApi.confirmAndLog(snapResult._id, selectedMealType);

      onSuccess();
      onClose();
      resetState();
    } catch (err: any) {
      console.error('Failed to log Snap Check:', err);
      setErrorMsg(err.message || 'Failed to log meal.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setStep('upload');
    setSelectedImage('');
    setSnapResult(null);
    setItems([]);
    setErrorMsg(null);
  };

  const handleOpenPreviousScan = (scan: any) => {
    setSelectedImage(scan.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
    setSnapResult(scan);
    setItems(scan.correctedItems?.length ? scan.correctedItems : scan.detectedItems || []);
    setStep('review');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
        {/* Modal Clean Header with History Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-white">AI Snap Check</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Vision</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Snap or upload your meal and get instant nutrition insights</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStep(step === 'history' ? 'upload' : 'history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition border ${
                step === 'history'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              onClick={() => {
                onClose();
                resetState();
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Upload / Image Selection */}
        {step === 'upload' && (
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Primary Upload CTA Card */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 text-center space-y-4 shadow-xl">
              {selectedImage ? (
                /* Selected Image Preview State */
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700">
                    <img src={selectedImage} alt="Selected Meal" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedImage('')}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition"
                    >
                      ↺ Change Photo
                    </button>
                    <button
                      onClick={() => handleStartAnalysis(selectedImage)}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Meal</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Default Upload Card State */
                <>
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Camera className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">Upload Your Meal</h4>
                    <p className="text-xs text-slate-400 mt-1">Attach a photo from gallery or take a fresh picture</p>
                  </div>

                  {/* Clean Responsive Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Primary Button: Take Photo */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button
                        type="button"
                        className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition pointer-events-none"
                      >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>Take Photo</span>
                      </button>
                    </div>

                    {/* Secondary Button: Choose from Gallery */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button
                        type="button"
                        className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 border border-slate-600 transition pointer-events-none"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Choose from Gallery</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SECTION: Analyze Recent Meals (User Specific Scans) */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Analyze Recent Meals</span>
                </h4>
                <p className="text-[11px] text-slate-400">Quickly re-analyze your recently scanned meals</p>
              </div>

              {recentScans.length > 0 ? (
                <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-none">
                  {recentScans.map((scan) => {
                    const mainDish = scan.detectedItems?.[0]?.foodName || 'Scanned Meal';
                    const cals = scan.estimatedNutrition?.calories || 450;
                    const protein = scan.estimatedNutrition?.proteinG || 20;

                    return (
                      <div
                        key={scan._id}
                        onClick={() => handleOpenPreviousScan(scan)}
                        className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 p-2.5 rounded-2xl cursor-pointer transition shrink-0 w-44 space-y-2 group shadow-md"
                      >
                        <img
                          src={scan.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                          alt={mainDish}
                          className="w-full h-24 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-white truncate group-hover:text-emerald-400">{mainDish}</h5>
                          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            {cals} kcal • {protein}g protein
                          </p>
                          <span className="text-[9px] text-slate-500 block">
                            {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty State when no past scans exist */
                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
                  <Camera className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">No meals scanned yet</p>
                  <p className="text-[11px] text-slate-500">Take a photo of your meal to start tracking your nutrition.</p>
                </div>
              )}
            </div>

            {/* SECTION: Smart Meal Suggestions (Optional Recommendations) */}
            {smartSuggestions.length > 0 && (
              <div className="space-y-3 pt-1 border-t border-slate-800">
                <div>
                  <h4 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
                    <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Smart Meal Suggestions</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Get personalized meal ideas based on your goal</p>
                </div>

                <div className="space-y-2">
                  {smartSuggestions.map((rec) => (
                    <div
                      key={rec._id}
                      className="bg-slate-800/80 border border-slate-700/70 p-3 rounded-2xl flex items-center justify-between shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={rec.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                          alt={rec.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-white">{rec.name}</h5>
                          <p className="text-[10px] text-slate-400">
                            <span className="text-emerald-400 font-bold">{rec.nutritionPerServing?.protein || 24}g Protein</span> •{' '}
                            {rec.nutritionPerServing?.carbohydrates || 45}g Carbs • {rec.nutritionPerServing?.fat || 12}g Fat
                          </p>
                        </div>
                      </div>

                      {onViewRecipe && (
                        <button
                          onClick={() => {
                            onClose();
                            onViewRecipe(rec);
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20"
                        >
                          <span>View →</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy & Security Trust Badge */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Your data is private & secure — meal photos are handled securely.</span>
            </div>
          </div>
        )}

        {/* STEP 2: Analyzing Loading State */}
        {step === 'analyzing' && (
          <div className="py-12 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-2xl border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <img src={selectedImage} alt="Meal" className="w-20 h-20 rounded-2xl object-cover p-1" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Analyzing your meal...</span>
              </h4>
              <p className="text-xs text-slate-400">Identifying foods and estimating nutrition</p>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Edit AI Detections */}
        {step === 'review' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Meal Image & Confidence Summary */}
            <div className="flex items-center space-x-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3">
              <img src={selectedImage} alt="Meal" className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">AI Analysis Result</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    88% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-medium mt-0.5">⚠️ Estimated Nutrition — Please review & edit below</p>
              </div>
            </div>

            {/* Meal Type Switcher */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Meal Slot</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mt) => (
                  <button
                    key={mt}
                    onClick={() => setSelectedMealType(mt)}
                    className={`py-1.5 text-xs font-bold capitalize rounded-xl transition-all ${
                      selectedMealType === mt
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {mt}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Nutrition Summary Bar */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 grid grid-cols-4 gap-2 text-center">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Calories</span>
                <span className="text-sm font-extrabold text-white">{totalCalories} kcal</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Protein</span>
                <span className="text-sm font-extrabold text-emerald-400">{totalProtein}g</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Carbs</span>
                <span className="text-sm font-extrabold text-amber-300">{totalCarbs}g</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Fat</span>
                <span className="text-sm font-extrabold text-teal-300">{totalFat}g</span>
              </div>
            </div>

            {/* Detected Food Items & Editable Portions */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Detected Dishes ({items.length})</span>
                <button
                  onClick={handleAddFoodItem}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Food</span>
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.foodName}</span>
                    </h5>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span>Portion:</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleItemPortionChange(idx, item.estimatedQuantityG - 20)}
                          className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-white w-12 text-center">{item.estimatedQuantityG}g</span>
                        <button
                          onClick={() => handleItemPortionChange(idx, item.estimatedQuantityG + 20)}
                          className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-400">{item.calories} kcal</span>
                      <span className="text-[10px] text-slate-400 block">{item.proteinG}g P | {item.carbsG}g C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Full User Scan History List */}
        {step === 'history' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>Your Scan History</span>
              </h4>
              <span className="text-[10px] text-slate-400">{historyList.length} scans</span>
            </div>

            {historyList.length > 0 ? (
              <div className="space-y-2.5">
                {historyList.map((scan) => {
                  const mainDish = scan.detectedItems?.[0]?.foodName || 'Scanned Meal';
                  const cals = scan.estimatedNutrition?.calories || 450;
                  const dateStr = new Date(scan.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={scan._id}
                      onClick={() => handleOpenPreviousScan(scan)}
                      className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-md group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={scan.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                          alt={mainDish}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="truncate">
                          <h5 className="text-xs font-bold text-white truncate group-hover:text-emerald-400">{mainDish}</h5>
                          <span className="text-[10px] text-emerald-400 font-semibold">{cals} kcal</span>
                          <span className="text-[9px] text-slate-500 block">{dateStr}</span>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2 bg-slate-800/40 rounded-2xl border border-slate-800 p-4">
                <History className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-300">No scan history found</p>
                <p className="text-[11px] text-slate-500">Your past meal photo scans will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Footer for Review Step */}
        {step === 'review' && (
          <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
            <button
              onClick={() => setStep('upload')}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all"
            >
              Re-scan
            </button>
            <button
              onClick={handleConfirmAndLog}
              disabled={submitting || items.length === 0}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Logging Meal...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Log to Tracker</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
