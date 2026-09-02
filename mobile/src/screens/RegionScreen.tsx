import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Check, ChevronRight, AlertTriangle, ShieldCheck, RefreshCw, Compass } from 'lucide-react';
import { regionApi, profileApi } from '../services/api';
import { Region } from '../types';

interface Props {
  selectedRegion: Region | null;
  onSelectRegion: (region: Region) => void;
  onNext: () => void;
}

type LocationStatus = 'initial' | 'detecting' | 'success' | 'permission_denied' | 'gps_disabled' | 'error';

export const RegionScreen: React.FC<Props> = ({ selectedRegion, onSelectRegion, onNext }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LocationStatus>('initial');
  const [manualMode, setManualMode] = useState(false);
  const [detectedData, setDetectedData] = useState<{
    city: string;
    state: string;
    country: string;
    accuracy: number;
    region: Region | null;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const res = await regionApi.getRegions();
      if (res.success && res.data.length > 0) {
        setRegions(res.data);
        if (!selectedRegion) {
          onSelectRegion(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestGPSLocation = () => {
    if (!navigator.geolocation) {
      setStatus('gps_disabled');
      setErrorMessage('Geolocation APIs are not supported by your browser or device.');
      return;
    }

    setStatus('detecting');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          const res = await profileApi.updateLocation({
            latitude,
            longitude,
            accuracy: Math.round(accuracy || 25),
            permissionStatus: 'granted',
            source: 'gps',
          });

          if (res.success && res.data?.matchedRegion) {
            const matched: Region = res.data.matchedRegion;
            setDetectedData({
              city: res.data.detectedCity || matched.city,
              state: res.data.detectedState || matched.state,
              country: res.data.detectedCountry || matched.country || 'India',
              accuracy: Math.round(accuracy || 25),
              region: matched,
            });
            onSelectRegion(matched);
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMessage("We couldn't determine your exact region automatically.");
          }
        } catch (err: any) {
          console.error('Location sync error:', err);
          setStatus('error');
          setErrorMessage(err?.response?.data?.message || "We couldn't determine your region. Please try again or select manually.");
        }
      },
      (error) => {
        console.warn('Geolocation permission or provider error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('permission_denied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus('gps_disabled');
          setErrorMessage('Location services appear to be disabled on your device.');
        } else {
          setStatus('error');
          setErrorMessage("Unable to retrieve GPS coordinates from your device.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleManualSelectRegion = async (region: Region) => {
    onSelectRegion(region);
    try {
      await profileApi.updateLocation({
        source: 'manual',
        manualRegionId: region._id,
      });
    } catch (e) {
      console.warn('Failed to sync manual region with backend:', e);
    }
  };

  const filteredRegions = regions.filter(
    (r) =>
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      r.state.toLowerCase().includes(search.toLowerCase()) ||
      r.regionName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-900 text-white justify-between overflow-y-auto">
      <div>
        {/* Step Indicator */}
        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
          <span>Step 1 of 3</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">Select Your Region</h2>
        <p className="text-xs text-slate-400 mb-5">
          NutriRegion customizes your meal plan & local food recommendations based on your real physical location.
        </p>

        {/* GPS CARD STATE CONTROLLER */}
        {!manualMode && (
          <div className="mb-6">
            {/* INITIAL PERMISSION REQUEST CARD */}
            {status === 'initial' && (
              <div className="bg-slate-800/90 border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Use My Current Location</h3>
                    <p className="text-[11px] text-slate-400">NutriRegion uses your location to:</p>
                  </div>
                </div>

                <ul className="text-xs text-slate-300 space-y-1.5 pl-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Find your region automatically</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Show locally available regional foods</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Personalize your regional AI meal plan</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Improve regional recommendations</span>
                  </li>
                </ul>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleRequestGPSLocation}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Navigation className="w-4 h-4 fill-slate-950 stroke-none" />
                    <span>Allow Location</span>
                  </button>
                  <button
                    onClick={() => setManualMode(true)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-3 rounded-xl text-xs transition-all"
                  >
                    Choose Manually
                  </button>
                </div>
              </div>
            )}

            {/* DETECTING STATE */}
            {status === 'detecting' && (
              <div className="bg-slate-800 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                  <Navigation className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-sm font-bold text-white">Detecting your location...</h3>
                <p className="text-xs text-slate-400">Communicating with device GPS & reverse geocoding server...</p>
              </div>
            )}

            {/* SUCCESS STATE CARD */}
            {status === 'success' && detectedData && (
              <div className="bg-emerald-950/40 border border-emerald-500/50 p-5 rounded-2xl space-y-3 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Current Location Detected</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                    GPS Accuracy: ±{detectedData.accuracy} m
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{detectedData.city}, {detectedData.state}</span>
                  </h3>
                  <p className="text-xs text-slate-300 pl-7">{detectedData.country}</p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-300 font-medium">
                  <span>✓ Region matched successfully</span>
                  <button
                    onClick={handleRequestGPSLocation}
                    className="text-emerald-400 hover:underline flex items-center space-x-1 text-[11px] font-bold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-detect</span>
                  </button>
                </div>

                <button
                  onClick={() => setManualMode(true)}
                  className="w-full text-slate-400 hover:text-white text-xs font-semibold text-center pt-1 block"
                >
                  Need a different region? Switch to Manual Selection
                </button>
              </div>
            )}

            {/* PERMISSION DENIED CARD */}
            {status === 'permission_denied' && (
              <div className="bg-rose-950/30 border border-rose-500/40 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center space-x-2.5 text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold text-white">Location permission denied</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Allow location access to automatically detect your region and show local market food prices.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleRequestGPSLocation}
                    className="bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-200 font-bold py-2.5 px-3 rounded-xl text-xs"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setManualMode(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs"
                  >
                    Choose Manually
                  </button>
                </div>
              </div>
            )}

            {/* GPS DISABLED / ERROR CARD */}
            {(status === 'gps_disabled' || status === 'error') && (
              <div className="bg-amber-950/30 border border-amber-500/40 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center space-x-2.5 text-amber-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold text-white">Location Detection Unavailable</h3>
                </div>
                <p className="text-xs text-slate-300">
                  {errorMessage || 'Location services are disabled or unavailable. Please select your region manually.'}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleRequestGPSLocation}
                    className="bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-200 font-bold py-2.5 px-3 rounded-xl text-xs"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setManualMode(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs"
                  >
                    Choose Manually
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MANUAL LOCATION SELECTION LIST & SEARCH */}
        {(manualMode || status === 'success') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {manualMode ? 'Manual Region Selection' : 'Available Regional Hubs'}
              </h3>
              {manualMode && (
                <button
                  onClick={() => setManualMode(false)}
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  Use GPS Instead
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search state, city, or region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Popular Regions List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-800 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredRegions.map((region) => {
                  const isSelected = selectedRegion?._id === region._id;
                  return (
                    <div
                      key={region._id}
                      onClick={() => handleManualSelectRegion(region)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">{region.city}, {region.state}</h4>
                          <p className="text-xs text-slate-400">{region.country} • {region.regionName}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next CTA */}
      <button
        onClick={onNext}
        disabled={!selectedRegion}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-base transition-all active:scale-[0.98] mt-4"
      >
        <span>Confirm Region & Continue</span>
        <ChevronRight className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  );
};
