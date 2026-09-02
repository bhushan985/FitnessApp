import React, { useState, useEffect } from 'react';
import { UserCheck, Star, Plus, MapPin, Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';

export const TrainersManager: React.FC = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTrainers();
      if (res.success && res.data) setTrainers(res.data);
    } catch (err) {
      console.error('Failed loading trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Personal Trainers Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Manage certified regional fitness coaches and client allocations</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-xs">Loading certified trainer directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainers.map((trainer) => (
            <div key={trainer._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center space-x-4">
                <img
                  src={trainer.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={trainer.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white">{trainer.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {trainer.rating}
                    </span>
                    <span>• {trainer.experienceYears} Years Exp</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">{trainer.bio}</p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {trainer.location}
                </span>
                <span className="font-extrabold text-emerald-400">₹{trainer.monthlyRate}/mo</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
