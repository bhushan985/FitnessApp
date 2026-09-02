import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Search } from 'lucide-react';
import { adminApi } from '../services/api';

export const RegionsManager: React.FC = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRegions();
      if (res.success) setRegions(res.data);
    } catch (err) {
      console.error('Failed to load regions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Regional Hub Management</h1>
          <p className="text-xs text-slate-400 mt-1">Configure geographic country, state, city, and food availability hubs</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {regions.map((region) => (
          <div key={region._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{region.city}, {region.state}</h3>
                <p className="text-xs text-slate-400">{region.country} • {region.regionName}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-300">
              <span>Timezone: {region.timezone}</span>
              <span className="text-emerald-400 font-bold">Active Hub</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
