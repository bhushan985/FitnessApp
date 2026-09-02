import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import { adminApi } from '../services/api';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs();
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Security Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable security events, admin actions, and authentication trail</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80">
              <th className="py-3.5 px-4">Action Type</th>
              <th className="py-3.5 px-4">Entity</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">IP Address</th>
              <th className="py-3.5 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-emerald-400">{log.action}</td>
                <td className="py-3.5 px-4 text-slate-300 font-semibold">{log.entity}</td>
                <td className="py-3.5 px-4 text-white">{log.description}</td>
                <td className="py-3.5 px-4 text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                <td className="py-3.5 px-4 text-right text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
