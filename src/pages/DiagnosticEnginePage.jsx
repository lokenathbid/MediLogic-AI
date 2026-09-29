import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Database,
  Sparkles,
  Zap
} from 'lucide-react';
import { runDiagnosticInference } from '../lib/inferenceEngine';

export default function DiagnosticEnginePage({ 
  selectedSymptoms, 
  patientInfo, 
  setDiagnosticResult, 
  setActivePage 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);

  const steps = [
    { title: 'Normalizing Patient Clinical Symptoms', icon: Activity, desc: 'Categorizing anatomical systems and extracting severity weights' },
    { title: 'Scanning Emergency Red-Flag Indicators', icon: ShieldAlert, desc: 'Screening for acute myocardial, neurological, or peritoneal emergencies' },
    { title: 'Forward-Chaining Rule Activation', icon: Brain, desc: 'Matching required and characteristic criteria against 12 disease models' },
    { title: 'Differential Synthesis & Scoring', icon: Cpu, desc: 'Computing normalized probability scores and generating clinical guidance' }
  ];

  useEffect(() => {
    // Run inference calculation immediately
    const inferenceResult = runDiagnosticInference(selectedSymptoms);
    setResult(inferenceResult);
    if (setDiagnosticResult) {
      setDiagnosticResult(inferenceResult);
    }

    // Step-by-step animation sequence
    const logItems = [
      `[0.00s] INITIALIZING MediLogic Expert Inference Engine v2.4...`,
      `[0.05s] Loaded ${selectedSymptoms.length} patient symptoms into working memory.`,
      `[0.10s] Severity normalization matrix computed.`,
      `[0.20s] Emergency red-flag filter check: ${inferenceResult.hasEmergencyRedFlag ? 'RED FLAGS DETECTED' : 'CLEAR'}.`,
      `[0.35s] Firing forward-chaining rules against PostgreSQL Knowledge Base...`,
      ...inferenceResult.reasoningTrace,
      `[0.60s] Inferred primary condition: ${inferenceResult.primaryCondition?.name || 'Non-Specific'} (${inferenceResult.primaryCondition?.confidencePercentage || 0}%).`,
      `[0.75s] Differential candidate list generated with ${inferenceResult.differentialConditions.length} alternatives.`,
      `[0.85s] Diagnostic report synthesized successfully.`
    ];

    let stepTimer = 0;
    const interval = setInterval(() => {
      stepTimer++;
      if (stepTimer <= 4) {
        setCurrentStep(stepTimer);
        setLogs(prev => [...prev, ...logItems.slice((stepTimer - 1) * 3, stepTimer * 3)]);
      } else {
        clearInterval(interval);
        setCompleted(true);
        setLogs(logItems);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [selectedSymptoms]);

  const handleSkipOrProceed = () => {
    setActivePage('results');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Inference Engine Execution</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Rule-Based Diagnostic Processing
        </h1>
        <p className="text-xs text-slate-400">
          Evaluating symptom combinations and probabilistic weights across deterministic clinical decision trees.
        </p>
      </div>

      {/* Steps Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentStep > idx + 1 || completed;
          const isCurrent = currentStep === idx + 1 && !completed;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-teal-950/30 border-teal-500/50 shadow-lg shadow-teal-950/30'
                  : isCurrent
                  ? 'bg-slate-900 border-teal-400 ring-1 ring-teal-400/50 shadow-xl'
                  : 'glass-panel border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${
                  isDone ? 'bg-teal-500/20 text-teal-300' : isCurrent ? 'bg-teal-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {isDone ? 'DONE' : isCurrent ? 'ACTIVE' : `0${idx + 1}`}
                </span>
              </div>
              <h4 className="font-bold text-xs text-white mb-1">{step.title}</h4>
              <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Terminal Inference Log Output */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="font-mono font-medium">Inference Execution Console Trace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
        </div>

        <div className="p-5 font-mono text-xs text-slate-300 space-y-1.5 max-h-72 overflow-y-auto bg-slate-950/80">
          {logs.map((log, idx) => (
            <div 
              key={idx} 
              className={`leading-relaxed ${
                log.includes('[ALERT]') 
                  ? 'text-rose-400 font-bold' 
                  : log.includes('[DECISION]') 
                  ? 'text-teal-300 font-bold' 
                  : log.includes('[DIFFERENTIAL]')
                  ? 'text-indigo-300'
                  : 'text-slate-400'
              }`}
            >
              {log}
            </div>
          ))}
          {!completed && (
            <div className="flex items-center gap-2 text-teal-400 animate-pulse pt-2">
              <span className="inline-block w-2 h-4 bg-teal-400" />
              <span>Evaluating medical condition rules...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Ready to format and save report into InsForge PostgreSQL</span>
        </div>

        <button
          onClick={handleSkipOrProceed}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <span>{completed ? 'View Diagnostic Health Report' : 'Skip & View Report'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
