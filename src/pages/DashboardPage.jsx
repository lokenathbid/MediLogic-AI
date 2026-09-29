import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Stethoscope, 
  History, 
  User, 
  FileText, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Database,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../lib/insforge';
import { CONDITIONS_KNOWLEDGE_BASE } from '../lib/knowledgeBase';

export default function DashboardPage({ setActivePage, setSelectedSymptoms, setSelectedReportForView }) {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleQuickPreset = (presetSymptoms) => {
    if (setSelectedSymptoms) {
      setSelectedSymptoms(presetSymptoms.map(s => ({
        ...s,
        duration: '1-3 days',
        category: 'general'
      })));
    }
    setActivePage('symptoms');
  };

  const handleViewReport = (report) => {
    if (setSelectedReportForView) {
      setSelectedReportForView(report);
    }
    setActivePage('results');
  };

  const quickPresets = [
    {
      title: 'Flu & Fever Screening',
      desc: 'High fever, diffuse body aches, fatigue',
      symptoms: [
        { id: 'fever_high', name: 'High-Grade Fever', severity: 8 },
        { id: 'muscle_aches', name: 'Generalized Muscle Aches', severity: 7 },
        { id: 'fatigue_profound', name: 'Profound Exhaustion', severity: 8 }
      ],
      badge: 'Infectious'
    },
    {
      title: 'Acute Bronchial / Cough',
      desc: 'Productive phlegm cough, chest tightness',
      symptoms: [
        { id: 'cough_productive', name: 'Productive Cough (Phlegm)', severity: 6 },
        { id: 'chest_tightness', name: 'Chest Tightness', severity: 6 },
        { id: 'fever_mild', name: 'Low-Grade Fever', severity: 5 }
      ],
      badge: 'Respiratory'
    },
    {
      title: 'Gastrointestinal Distress',
      desc: 'Epigastric burning, nausea, bloating',
      symptoms: [
        { id: 'abdominal_pain_epigastric', name: 'Upper Abdominal / Epigastric Burning', severity: 7 },
        { id: 'nausea', name: 'Nausea', severity: 6 },
        { id: 'bloating', name: 'Abdominal Bloating & Gas', severity: 5 }
      ],
      badge: 'GI Tract'
    },
    {
      title: 'Asthma & Wheezing Exacerbation',
      desc: 'Shortness of breath, wheezing breathing sound',
      symptoms: [
        { id: 'wheezing', name: 'Wheezing Sound', severity: 8 },
        { id: 'shortness_of_breath', name: 'Shortness of Breath (Dyspnea)', severity: 8 },
        { id: 'chest_tightness', name: 'Chest Tightness', severity: 7 }
      ],
      badge: 'Pulmonary'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Clinical Workspace &bull; InsForge Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.name || user?.email?.split('@')[0] || 'Clinician'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Ready to evaluate patient symptom profiles against {CONDITIONS_KNOWLEDGE_BASE.length} rule-based clinical disease models.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (setSelectedSymptoms) setSelectedSymptoms([]);
                setActivePage('symptoms');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              New Symptom Assessment
            </button>
            <button
              onClick={() => setActivePage('profile')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-all"
            >
              <User className="w-4 h-4 text-teal-400" />
              Profile Settings
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Assessments</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{reports.length}</div>
          <p className="text-[11px] text-slate-400">Stored in InsForge PostgreSQL</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Latest Assessment Risk</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white capitalize">
            {reports[0]?.risk_level || 'None yet'}
          </div>
          <p className="text-[11px] text-slate-400">
            {reports[0] ? new Date(reports[0].created_at).toLocaleDateString() : 'Run your first check'}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Knowledge Base Rules</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-400">{CONDITIONS_KNOWLEDGE_BASE.length}</div>
          <p className="text-[11px] text-slate-400">Disease rule definitions active</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Allergies / Flags</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {profile?.allergies || 'No allergies recorded'}
          </div>
          <p className="text-[11px] text-slate-400">Blood: {profile?.blood_group || 'Not set'}</p>
        </div>
      </div>

      {/* Quick Launch Clinical Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            Quick Symptom Case Presets
          </h2>
          <span className="text-xs text-slate-400">One-click test bundles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickPresets.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleQuickPreset(preset.symptoms)}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {preset.badge}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                </div>
                <h3 className="font-bold text-sm text-white">{preset.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{preset.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-teal-400 font-semibold">
                <span>{preset.symptoms.length} Symptoms</span>
                <span>Load Case →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assessment Reports Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Recent Patient Assessments
          </h2>
          {reports.length > 0 && (
            <button
              onClick={() => setActivePage('history')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              View Full History <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading assessment records from InsForge...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Previous Assessments Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Run a diagnostic evaluation using the symptom selector to generate and store clinical reports.
              </p>
            </div>
            <button
              onClick={() => setActivePage('symptoms')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-500/20 transition-all"
            >
              Start First Assessment
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Inferred Condition</th>
                    <th className="py-3.5 px-4">Confidence</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reports.slice(0, 5).map((r) => {
                    const primary = r.primary_condition;
                    return (
                      <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {new Date(r.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          {r.patient_name || 'Anonymous'} ({r.patient_age ? `${r.patient_age}y` : 'N/A'}, {r.patient_gender || 'Unspecified'})
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-teal-300">
                          {primary?.name || 'Inconclusive'}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {primary?.confidencePercentage || 0}%
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.risk_level === 'emergency'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : r.risk_level === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {r.risk_level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleViewReport(r)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-medium transition-colors"
                          >
                            Open Report
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
