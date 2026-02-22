import React, { useState, useEffect } from 'react';
import { X, Users, Eye, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AnalyticsModal({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/analytics/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const maxVisits = stats ? Math.max(...stats.daily_stats.map(d => d.visits), 1) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="sticky top-0 bg-black text-white p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6" />
            <h2 className="text-xl font-bold">ANALYTICS - TRAFIC SITE</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
              <p>Se încarcă statisticile...</p>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Active Now */}
                <div className="bg-green-50 border-2 border-green-500 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-green-700">ACTIVI ACUM</span>
                  </div>
                  <p className="text-4xl font-bold text-green-600">{stats.active_now}</p>
                  <p className="text-xs text-green-600 mt-1">ultimele 30 min</p>
                </div>

                {/* Today */}
                <div className="bg-blue-50 border-2 border-blue-500 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">VIZITE AZI</span>
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{stats.today_visits}</p>
                  <p className="text-xs text-blue-600 mt-1">de la miezul nopții</p>
                </div>

                {/* Total */}
                <div className="bg-purple-50 border-2 border-purple-500 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold text-purple-700">TOTAL VIZITE</span>
                  </div>
                  <p className="text-4xl font-bold text-purple-600">{stats.total_visits}</p>
                  <p className="text-xs text-purple-600 mt-1">din totdeauna</p>
                </div>

                {/* Average */}
                <div className="bg-orange-50 border-2 border-orange-500 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-bold text-orange-700">MEDIE/ZI</span>
                  </div>
                  <p className="text-4xl font-bold text-orange-600">
                    {Math.round(stats.daily_stats.reduce((a, b) => a + b.visits, 0) / 7)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">ultimele 7 zile</p>
                </div>
              </div>

              {/* Chart - Last 7 Days */}
              <div className="bg-neutral-50 border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-lg mb-6">VIZITE - ULTIMELE 7 ZILE</h3>
                <div className="flex items-end space-x-2 h-48">
                  {stats.daily_stats.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-40">
                        <span className="text-sm font-bold mb-1">{day.visits}</span>
                        <div 
                          className="w-full bg-[#CCFF00] border-2 border-black transition-all hover:bg-black hover:text-white"
                          style={{ 
                            height: `${Math.max((day.visits / maxVisits) * 100, 5)}%`,
                            minHeight: '20px'
                          }}
                        />
                      </div>
                      <span className="text-xs text-neutral-600 mt-2 text-center">
                        {new Date(day.date).toLocaleDateString('ro-RO', { weekday: 'short' })}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(day.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-neutral-50 border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-lg mb-4">TOP PAGINI VIZITATE</h3>
                <div className="space-y-2">
                  {stats.top_pages.length > 0 ? (
                    stats.top_pages.map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-neutral-200">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-sm">{page.page}</span>
                        </div>
                        <span className="font-bold">{page.visits} vizite</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-500 text-center py-4">Nu sunt date disponibile încă</p>
                  )}
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadStats}
                className="w-full bg-black text-white py-3 font-bold hover:bg-neutral-800 transition-colors"
              >
                🔄 ACTUALIZEAZĂ DATELE
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">Nu s-au putut încărca statisticile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
