import React, { useState } from 'react';
import { 
  Activity, 
  Stethoscope, 
  Brain, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Database, 
  Lock, 
  Sparkles,
  Search,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { runDiagnosticInference } from '../lib/inferenceEngine';
import { SYMPTOMS_CATALOG } from '../lib/knowledgeBase';

export default function LandingPage({ setActivePage, setSelectedSymptoms }) {
  const { user } = useAuth();
  const [demoSymptoms, setDemoSymptoms] = useState([
    { id: 'fever_high', name: 'High-Grade Fever', severity: 8 },
    { id: 'muscle_aches', name: 'Generalized Muscle Aches', severity: 7 }
  ]);

  const previewInference = runDiagnosticInference(demoSymptoms);

  const toggleDemoSymptom = (sym) => {
    if (demoSymptoms.some(s => s.id === sym.id)) {
      if (demoSymptoms.length > 1) {
        setDemoSymptoms(demoSymptoms.filter(s => s.id !== sym.id));
      }
    } else {
      setDemoSymptoms([...demoSymptoms, { id: sym.id, name: sym.name, severity: 7 }]);
    }
  };

  const handleStartDiagnose = () => {
    if (setSelectedSymptoms && demoSymptoms.length > 0) {
      setSelectedSymptoms(demoSymptoms.map(s => ({
        ...s,
        duration: '1-3 days',
        category: 'general'
      })));
    }
    setActivePage('symptoms');
  };

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Next-Gen Medical Expert System &bull; InsForge Backend</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Intelligent Clinical <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400">
                  Diagnostic Inference
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                MediLogic AI is an educational medical diagnosis expert system. Select symptoms, observe forward-chaining rule-based logic in real-time, and receive structured clinical differential assessments.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setActivePage('symptoms')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold text-base shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Stethoscope className="w-5 h-5" />
                  Start Symptom Assessment
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!user && (
                  <button
                    onClick={() => setActivePage('auth')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-base border border-slate-700/80 transition-all duration-200"
                  >
                    <Lock className="w-4 h-4 text-teal-400" />
                    Sign In / Register
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => setActivePage('dashboard')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-base border border-slate-700/80 transition-all duration-200"
                  >
                    <Activity className="w-4 h-4 text-teal-400" />
                    Open Dashboard
                  </button>
                )}
              </div>

              {/* Key Value Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-400 font-medium">Explainable Rules</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-teal-400">&lt; 0.2s</div>
                  <div className="text-xs text-slate-400 font-medium">Inference Speed</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-indigo-400">Postgres</div>
                  <div className="text-xs text-slate-400 font-medium">InsForge Persistence</div>
                </div>
              </div>
            </div>

            {/* Right Col: Live Interactive Inference Widget */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-teal-400" />
                    <span className="font-semibold text-sm text-white">Live Inference Preview</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    Rule Engine v2.4
                  </span>
                </div>

                {/* Symptom chips selector */}
                <div className="mt-4 space-y-3">
                  <label className="text-xs font-medium text-slate-300 block">
                    Toggle active symptoms to see live differential recalculation:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SYMPTOMS_CATALOG.slice(0, 7).map(sym => {
                      const isSelected = demoSymptoms.some(s => s.id === sym.id);
                      return (
                        <button
                          key={sym.id}
                          onClick={() => toggleDemoSymptom(sym)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-teal-500/20 border-teal-500/60 text-teal-200 font-medium shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {sym.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Result Box */}
                <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 uppercase tracking-wider font-semibold">Inferred Primary Condition</span>
                    <span className="text-teal-400 font-bold font-mono">
                      {previewInference.primaryCondition?.confidencePercentage || 0}% Confidence
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">
                      {previewInference.primaryCondition?.name || 'Inconclusive / Mild Non-Specific'}
                    </h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded uppercase font-bold ${
                      previewInference.riskLevel === 'emergency'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : previewInference.riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {previewInference.riskLevel} Risk
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${previewInference.primaryCondition?.confidencePercentage || 10}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Matched: {previewInference.matchedSymptoms.length} signs</span>
                    <span>Triage: {previewInference.primaryCondition?.severity || 'Normal'}</span>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleStartDiagnose}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  Transfer Symptoms to Full Clinical Engine
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Diagnostic Workflow</h2>
          <h3 className="text-3xl font-bold text-white tracking-tight">How MediLogic AI Operates</h3>
          <p className="text-slate-400 text-sm">
            A transparent 4-stage pipeline combining medical rule catalogs with probabilistic severity weighting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Symptom Selection',
              desc: 'Select signs across 8 anatomical systems, setting severity sliders (1-10) and onset duration.',
              icon: Sliders,
              color: 'text-teal-400',
              border: 'border-teal-500/20'
            },
            {
              step: '02',
              title: 'Red-Flag Screening',
              desc: 'Immediate check for acute triage flags (e.g. crushing chest pain, dyspnea, thunderclap head trauma).',
              icon: ShieldAlert,
              color: 'text-rose-400',
              border: 'border-rose-500/20'
            },
            {
              step: '03',
              title: 'Forward Inference',
              desc: 'Evaluates required and characteristic criteria against our disease knowledge base rules.',
              icon: Brain,
              color: 'text-indigo-400',
              border: 'border-indigo-500/20'
            },
            {
              step: '04',
              title: 'Clinical Report',
              desc: 'Produces ranked differential diagnoses, specialist referral suggestions, and saves to InsForge DB.',
              icon: FileText,
              color: 'text-emerald-400',
              border: 'border-emerald-500/20'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={`glass-panel glass-panel-hover rounded-2xl p-6 border ${item.border} flex flex-col justify-between relative`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-extrabold text-slate-700 font-mono">{item.step}</span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Expert Architecture</span>
              <h3 className="text-2xl font-bold text-white">Clinical Logic Meets InsForge Cloud</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                MediLogic AI is built without opaque black-box hallucination. Every diagnostic score is completely traceable to explicit medical rule definitions and saved securely in Postgres.
              </p>
              <button
                onClick={() => setActivePage('about')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                Learn about the Rule Engine <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Real InsForge Auth & JWT
                </div>
                <p className="text-xs text-slate-400">
                  Password authentication, secure session handling, and user profile management.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  PostgreSQL Report History
                </div>
                <p className="text-xs text-slate-400">
                  Save, filter, review, and print previous assessments anytime from your dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Red-Flag Triage Detection
                </div>
                <p className="text-xs text-slate-400">
                  Prioritizes critical emergency conditions like myocardial infarction and meningitis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Differential Diagnostics
                </div>
                <p className="text-xs text-slate-400">
                  Provides secondary diagnostic matches with confidence ranking and specialist referrals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h3 className="text-3xl font-extrabold text-white">
          Ready to Explore Clinical Rule-Based Inference?
        </h3>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Start your diagnostic evaluation or create a free account to track your health assessment history.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setActivePage('symptoms')}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 transition-all"
          >
            Launch Symptom Selector
          </button>
          {!user && (
            <button
              onClick={() => setActivePage('auth')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 transition-all"
            >
              Sign Up with InsForge
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
