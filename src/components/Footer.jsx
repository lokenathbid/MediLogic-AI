import React from 'react';
import { Activity, ShieldCheck, Heart, ExternalLink, Database, Cpu } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="mt-20 border-t border-slate-900 bg-slate-950/90 text-slate-400 text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600 text-white shadow-md shadow-teal-600/20">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">MediLogic AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Educational forward-chaining clinical inference engine powered by InsForge Serverless PostgreSQL Backend.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <Database className="w-3.5 h-3.5" />
              <span>InsForge Postgres Connected</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">System Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActivePage('landing')} className="hover:text-teal-400 transition-colors">Home & Overview</button>
              </li>
              <li>
                <button onClick={() => setActivePage('symptoms')} className="hover:text-teal-400 transition-colors">Symptom Selector</button>
              </li>
              <li>
                <button onClick={() => setActivePage('dashboard')} className="hover:text-teal-400 transition-colors">Clinical Dashboard</button>
              </li>
              <li>
                <button onClick={() => setActivePage('history')} className="hover:text-teal-400 transition-colors">Patient Records</button>
              </li>
              <li>
                <button onClick={() => setActivePage('about')} className="hover:text-teal-400 transition-colors">Rule-Based Architecture</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Engine Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Inference Features</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-teal-400" /> Forward-Chaining Logic
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-rose-400" /> Red-Flag Triage Detection
              </li>
              <li className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-amber-400" /> Differential Ranking
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-cyan-400" /> Persistent InsForge Storage
              </li>
            </ul>
          </div>

          {/* Col 4: Medical Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Clinical Disclaimer</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              MediLogic AI is an educational demonstration expert system. It does not replace professional medical evaluation, diagnosis, or clinical prescription. In medical emergencies, immediately contact emergency services.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediLogic AI. Built with React, Tailwind, and InsForge.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setActivePage('about')} className="hover:text-slate-300">Privacy & Terms</button>
            <button onClick={() => setActivePage('about')} className="hover:text-slate-300">Clinical Disclaimer</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
