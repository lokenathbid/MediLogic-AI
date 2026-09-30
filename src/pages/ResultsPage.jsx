import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Printer, 
  Save, 
  ArrowLeft, 
  RotateCcw, 
  User, 
  Calendar, 
  Activity, 
  Check, 
  ChevronRight, 
  Database, 
  Stethoscope, 
  HeartHandshake, 
  Brain, 
  Cpu, 
  Download, 
  LayoutDashboard,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../lib/insforge';
import { runDiagnosticInference } from '../lib/inferenceEngine';

export default function ResultsPage({ 
  diagnosticResult, 
  selectedSymptoms = [], 
  patientInfo, 
  viewOnlyReport, 
  setActivePage,
  onOpenAskAi
}) {
  const { user, profile } = useAuth();
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  // If viewing a previous report from history or calculating fresh
  const isViewOnly = !!viewOnlyReport;

  const reportData = useMemo(() => {
    if (viewOnlyReport) {
      return {
        primaryCondition: viewOnlyReport.primary_condition,
        differentialConditions: viewOnlyReport.differential_conditions || [],
        matchedSymptoms: viewOnlyReport.matched_symptoms || [],
        unmatchedSymptoms: viewOnlyReport.unmatched_symptoms || [],
        riskLevel: viewOnlyReport.risk_level || 'low',
        triageLevel: viewOnlyReport.triage_level || 'Routine Educational Guidance',
        recommendations: viewOnlyReport.recommendations || [],
        hasEmergencyRedFlag: viewOnlyReport.risk_level === 'emergency',
        reasoningTrace: viewOnlyReport.primary_condition?.ruleExecutionLog || [
          `Assessment retrieved from InsForge PostgreSQL history for patient ${viewOnlyReport.patient_name || 'Anonymous'}.`
        ],
        symptoms: viewOnlyReport.symptoms || [],
        patientName: viewOnlyReport.patient_name || 'Anonymous',
        patientAge: viewOnlyReport.patient_age || 30,
        patientGender: viewOnlyReport.patient_gender || 'Unspecified',
        createdAt: viewOnlyReport.created_at || new Date().toISOString()
      };
    }

    // If diagnosticResult was already provided, use it
    if (diagnosticResult && (diagnosticResult.primaryCondition || diagnosticResult.matchedSymptoms)) {
      return {
        ...diagnosticResult,
        symptoms: selectedSymptoms,
        patientName: patientInfo?.name || profile?.name || 'Anonymous',
        patientAge: patientInfo?.age || profile?.age || 30,
        patientGender: patientInfo?.gender || profile?.gender || 'Unspecified',
        createdAt: new Date().toISOString()
      };
    }

    // Fallback on-the-fly inference to guarantee the report ALWAYS renders if symptoms exist
    if (selectedSymptoms && selectedSymptoms.length > 0) {
      const freshInference = runDiagnosticInference(selectedSymptoms);
      return {
        ...freshInference,
        symptoms: selectedSymptoms,
        patientName: patientInfo?.name || profile?.name || 'Anonymous',
        patientAge: patientInfo?.age || profile?.age || 30,
        patientGender: patientInfo?.gender || profile?.gender || 'Unspecified',
        createdAt: new Date().toISOString()
      };
    }

    // Minimal default if no symptoms selected
    return {
      primaryCondition: null,
      differentialConditions: [],
      matchedSymptoms: [],
      unmatchedSymptoms: [],
      riskLevel: 'low',
      triageLevel: 'No active symptoms recorded',
      recommendations: ['Please select symptoms to generate an expert diagnostic inference.'],
      hasEmergencyRedFlag: false,
      reasoningTrace: ['Inference engine ready.'],
      symptoms: [],
      patientName: patientInfo?.name || profile?.name || 'Anonymous',
      patientAge: patientInfo?.age || profile?.age || 30,
      patientGender: patientInfo?.gender || profile?.gender || 'Unspecified',
      createdAt: new Date().toISOString()
    };
  }, [viewOnlyReport, diagnosticResult, selectedSymptoms, patientInfo, profile]);

  const primary = reportData.primaryCondition;

  const handleSaveToDatabase = async () => {
    if (!user) {
      setActivePage('auth');
      return;
    }
    setSaveStatus('saving');
    setErrorMessage(null);

    const payload = {
      userId: user.id,
      patientName: reportData.patientName,
      patientAge: reportData.patientAge,
      patientGender: reportData.patientGender,
      symptoms: reportData.symptoms,
      primaryCondition: reportData.primaryCondition,
      differentialConditions: reportData.differentialConditions,
      matchedSymptoms: reportData.matchedSymptoms,
      unmatchedSymptoms: reportData.unmatchedSymptoms,
      riskLevel: reportData.riskLevel,
      recommendations: reportData.recommendations,
      triageLevel: reportData.triageLevel
    };

    const res = await dbService.saveReport(payload);
    if (res.data) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('error');
      setErrorMessage(res.error?.message || 'Failed to persist report to InsForge.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    const textContent = `
=====================================================
MEDILOGIC AI - CLINICAL ANALYSIS REPORT
=====================================================
Analysis Date: ${new Date(reportData.createdAt).toLocaleString()}
Patient: ${reportData.patientName} (${reportData.patientAge}y, ${reportData.patientGender})
Risk Level: ${reportData.riskLevel?.toUpperCase()}
Triage Recommendation: ${reportData.triageLevel}

PRIMARY POSSIBLE CONDITION:
${primary?.name || 'Inconclusive / Mild Non-Specific'}
Symptom Match Confidence: ${primary?.confidencePercentage || 0}%
Recommended Specialist: ${primary?.recommendedSpecialist || 'Primary Care Physician'}

SUMMARY DESCRIPTION:
${primary?.description || 'Evaluation completed without critical threshold match.'}

CORRELATED SYMPTOMS:
${reportData.matchedSymptoms?.map(s => `- ${typeof s === 'string' ? s : s.name}`).join('\n') || 'None'}

UNCORRELATED / OTHER SIGNS:
${reportData.unmatchedSymptoms?.map(s => `- ${typeof s === 'string' ? s : s.name}`).join('\n') || 'None'}

DIFFERENTIAL CONDITIONS:
${reportData.differentialConditions?.map((d, i) => `${i + 1}. ${d.name} (${d.confidencePercentage}% match)`).join('\n') || 'None'}

CLINICAL GUIDANCE & NEXT STEPS:
${reportData.recommendations?.map(r => `* ${r}`).join('\n')}

=====================================================
EDUCATIONAL MEDICAL DISCLAIMER:
This system provides educational, informational suggestions based on predefined symptom rules. It is not a medical diagnosis and should not replace professional medical advice.
=====================================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediLogic-Report-${reportData.patientName.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print border-b border-slate-800 pb-4">
        <button
          onClick={() => setActivePage(isViewOnly ? 'history' : 'symptoms')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isViewOnly ? 'Back to Patient History' : 'Adjust Symptoms'}
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Prominent Ask AI / Explain Report Action */}
          <button
            onClick={() => onOpenAskAi && onOpenAskAi()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
            title="Ask AI to break down this report in plain language"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Explain My Report
          </button>

          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
            Dashboard
          </button>

          <button
            onClick={handleDownloadSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Download Summary
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            Print / PDF
          </button>

          {!isViewOnly && (
            <button
              onClick={handleSaveToDatabase}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                saveStatus === 'saved'
                  ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-200'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20'
              }`}
            >
              {saveStatus === 'saving' ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved to InsForge
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {user ? 'Save Report' : 'Sign In & Save'}
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setActivePage('symptoms')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Save Error Notice if applicable */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage} (The report remains available for viewing and printing below)</span>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="print-area glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 bg-slate-950/90">
        
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">MEDILOGIC AI</h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono uppercase">
                  Health Analysis Report
                </span>
              </div>
              <p className="text-xs text-slate-400">Rule-Based Forward-Chaining Diagnostic Evaluation</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <div className="flex items-center sm:justify-end gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Analysis Date: {new Date(reportData.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="text-slate-400">
              Patient: <strong className="text-white">{reportData.patientName}</strong> ({reportData.patientAge}y, {reportData.patientGender})
            </div>
          </div>
        </div>

        {/* Emergency Alert Banner if detected */}
        {reportData.riskLevel === 'emergency' && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-100">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              EMERGENCY CLINICAL ALERT: Immediate Medical Assessment Advised
            </div>
            <p className="leading-relaxed text-rose-200/90">
              Critical red-flag symptom combinations were triggered in the rule engine. Please seek urgent medical evaluation or call emergency services (911 / 112) immediately.
            </p>
          </div>
        )}

        {/* Primary Possible Condition Box */}
        <div className="glass-panel rounded-2xl p-6 border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Primary Possible Condition
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                reportData.riskLevel === 'emergency'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : reportData.riskLevel === 'high'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                Risk Level: {reportData.riskLevel}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Symptom Match: {primary?.confidencePercentage || 0}%
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {primary?.name || 'Inconclusive / Mild Non-Specific Presentation'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {primary?.description || 'The provided symptoms did not strongly trigger a single high-confidence disease pattern in our rule base. General supportive care and close symptom tracking is advised.'}
            </p>
          </div>

          {/* Specialty & Triage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span className="text-slate-400">Recommended Specialist:</span>
              <strong className="text-white">{primary?.recommendedSpecialist || 'Primary Care Physician'}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Triage Recommendation:</span>
              <strong className="text-white">{reportData.triageLevel}</strong>
            </div>
          </div>

          {/* Explain with AI Prompt helper */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => onOpenAskAi && onOpenAskAi()}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Ask AI to Explain My Report in Simple Terms
            </button>
            <button
              onClick={() => onOpenAskAi && onOpenAskAi()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              What does {primary?.confidencePercentage || 0}% match mean?
            </button>
          </div>
        </div>

        {/* Symptoms Correlation: Matched vs Unmatched */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Symptoms */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Matched Symptoms ({reportData.matchedSymptoms?.length || 0})
              </span>
              <span className="text-emerald-400 text-[11px] font-mono">Rule Verified</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {reportData.matchedSymptoms?.map((s, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-center gap-1">
                  ✓ {typeof s === 'string' ? s : s.name}
                </span>
              ))}
              {(!reportData.matchedSymptoms || reportData.matchedSymptoms.length === 0) && (
                <span className="text-xs text-slate-500">None matched</span>
              )}
            </div>
          </div>

          {/* Unmatched / Secondary Symptoms */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                Unmatched / Missing Symptoms ({reportData.unmatchedSymptoms?.length || 0})
              </span>
              <span className="text-slate-400 text-[11px] font-mono">Independent</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {reportData.unmatchedSymptoms?.map((s, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1">
                  ○ {typeof s === 'string' ? s : s.name}
                </span>
              ))}
              {(!reportData.unmatchedSymptoms || reportData.unmatchedSymptoms.length === 0) && (
                <span className="text-xs text-slate-500">All input symptoms accounted for in rule model</span>
              )}
            </div>
          </div>
        </div>

        {/* Differential Possible Conditions */}
        {reportData.differentialConditions?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Differential Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reportData.differentialConditions.map((diff, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono font-semibold">{idx + 1}. Candidate</span>
                    <span className="text-indigo-400 font-mono font-bold">{diff.confidencePercentage}% match</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{diff.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{diff.description}</p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-teal-400 font-medium">
                    Specialist: {diff.recommendedSpecialist}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning Trace Section */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 bg-slate-950/60">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-400" />
              Reasoning Trace & Rule Matching Explanation
            </h3>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              Deterministic Inference
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs text-slate-300">
            {reportData.reasoningTrace?.map((trace, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded-lg ${
                  trace.includes('[ALERT]') 
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    : trace.includes('[DECISION]')
                    ? 'bg-teal-500/10 text-teal-200 border border-teal-500/20 font-bold'
                    : 'bg-slate-900/60 text-slate-400'
                }`}
              >
                {trace}
              </div>
            ))}
          </div>

          {primary?.clinicalNotes && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <strong className="text-teal-400 block font-sans">Pathophysiology / Clinical Summary:</strong>
              <p className="leading-relaxed font-sans">{primary.clinicalNotes}</p>
            </div>
          )}
        </div>

        {/* General Guidance & Next Steps */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-teal-400" />
            General Guidance & Next Steps
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {reportData.recommendations?.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1 text-center">
          <p className="font-bold text-slate-300">Medical Disclaimer</p>
          <p>
            This system provides educational, informational suggestions based on predefined symptom rules. It is not a medical diagnosis and should not replace professional medical advice.
          </p>
        </div>

      </div>
    </div>
  );
}
