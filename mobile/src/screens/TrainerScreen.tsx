import { useState, useEffect } from 'react';
import { UserCheck, Star, Award, MapPin, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { trainerApi } from '../services/api';
import { Trainer } from '../types';

interface Props {
  onBack?: () => void;
}

export const TrainerScreen: React.FC<Props> = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [myAssignment, setMyAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async () => {
    try {
      setLoading(true);
      const [trainersRes, assignmentRes] = await Promise.all([
        trainerApi.getTrainers(),
        trainerApi.getMyTrainer(),
      ]);

      if (trainersRes.success) setTrainers(trainersRes.data || []);
      if (assignmentRes.success) setMyAssignment(assignmentRes.data);
    } catch (err) {
      console.error('Failed to load trainer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTrainer = async (trainerId: string) => {
    try {
      setAssigningId(trainerId);
      const res = await trainerApi.assignTrainer(trainerId);
      if (res.success) {
        alert('🎉 Personal Trainer assigned to your account successfully!');
        loadTrainerData();
      }
    } catch (err: any) {
      alert(`Assignment failed: ${err.message || 'Error occurred'}`);
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs font-bold">Loading certified personal trainers...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif] p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Personal Trainers</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Connect with certified Indian fitness coaches for personalized regional workout & meal programming.
        </p>
      </div>

      {/* Active Trainer Assignment Card */}
      {myAssignment && myAssignment.trainerId && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Your Assigned Coach</span>
          </div>

          <div className="flex items-center space-x-4">
            <img
              src={
                myAssignment.trainerId.profileImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              }
              alt={myAssignment.trainerId.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50"
            />
            <div>
              <h3 className="text-base font-extrabold text-white">{myAssignment.trainerId.name}</h3>
              <p className="text-xs text-slate-300 line-clamp-1">{myAssignment.trainerId.bio}</p>
              <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
                <span className="flex items-center text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                  {myAssignment.trainerId.rating}
                </span>
                <span>• {myAssignment.trainerId.experienceYears} Years Exp</span>
              </div>
            </div>
          </div>

          {myAssignment.notes && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-emerald-400">Coach Note: </span>
              {myAssignment.notes}
            </div>
          )}
        </div>
      )}

      {/* Trainer Catalog */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Available Certified Coaches</h2>

        {trainers.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No active trainers listed in your region at the moment.
          </div>
        ) : (
          trainers.map((trainer) => {
            const isAssigned = myAssignment?.trainerId?._id === trainer._id;

            return (
              <div
                key={trainer._id}
                className="rounded-2xl p-5 bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        trainer.profileImage ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={trainer.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white">{trainer.name}</h3>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                          {trainer.rating}
                        </span>
                        <span>• {trainer.experienceYears} Years Experience</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-400">₹{trainer.monthlyRate}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">/ Month</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{trainer.bio}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {trainer.specialization.map((spec, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                      {trainer.location}
                    </span>
                    <span className="flex items-center">
                      <Award className="w-3 h-3 mr-1 text-slate-500" />
                      {trainer.certifications[0] || 'Certified'}
                    </span>
                  </div>

                  <button
                    disabled={isAssigned || assigningId === trainer._id}
                    onClick={() => handleAssignTrainer(trainer._id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                      isAssigned
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {assigningId === trainer._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAssigned ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Assigned</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign Coach</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
