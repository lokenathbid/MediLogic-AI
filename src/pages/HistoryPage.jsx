import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  FileText, 
  Plus, 
  AlertCircle, 
  Activity, 
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../lib/insforge';

export default function HistoryPage({ setActivePage, setSelectedReportForView }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await dbService.getUserReports(user.id);
    if (data) {
      setReports(data);
    }
    setLoading(false);
  };

  const handleDelete = async (reportId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this clinical assessment report from InsForge?')) return;
    setDeletingId(reportId);
    const res = await dbService.deleteReport(reportId);
    if (res.success) {
      setReports(reports.filter(r => r.id !== reportId));
    }
    setDeletingId(null);
  };

  const handleOpenReport = (report) => {
    if (setSelectedReportForView) {
      setSelectedReportForView(report);
    }
    setActivePage('results');
  };

  const filteredReports = reports.filter(r => {
    const name = r.patient_name || '';
    const condName = r.primary_condition?.name || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || condName.toLowerCase().includes(query);
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-teal-400 flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Sign In to View Assessment History</h2>
          <p className="text-xs text-slate-400">
            Sign in or register an InsForge account to persistently save and review previous patient diagnostic reports.
          </p>
        </div>
        <button
          onClick={() => setActivePage('auth')}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Persistent Patient Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Diagnostic Assessment History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stored securely in InsForge PostgreSQL. Review, re-evaluate, or print past assessments.
          </p>
        </div>

        <button
          onClick={() => setActivePage('symptoms')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Diagnostic Evaluation
        </button>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Filter by patient name or condition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500 transition-all"
        />
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span>Retrieving records from InsForge database...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-4 border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Clinical Reports Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? `No reports matching "${searchQuery}"` : 'You haven\'t saved any clinical diagnostic reports yet.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setActivePage('symptoms')}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
            >
              Start Your First Assessment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => {
            const primary = report.primary_condition;
            return (
              <div
                key={report.id}
                onClick={() => handleOpenReport(report)}
                className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800/80 cursor-pointer space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      report.risk_level === 'emergency'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : report.risk_level === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {report.risk_level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                      {primary?.name || 'Inconclusive Assessment'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {primary?.description || 'Evaluation completed without critical threshold match.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Patient:</span>
                      <strong className="text-white">{report.patient_name || 'Anonymous'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Confidence:</span>
                      <span className="text-teal-400 font-mono font-bold">
                        {primary?.confidencePercentage || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Symptoms:</span>
                      <span>{report.symptoms?.length || 0} evaluated</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-teal-400 font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </span>
                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    disabled={deletingId === report.id}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
