import React from 'react';
import { AlertTriangle, PhoneCall, ShieldCheck } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-b border-rose-900/40 px-4 py-2.5 text-xs text-rose-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong className="font-semibold text-white">Educational Medical Expert System:</strong> MediLogic AI provides clinical inference for learning purposes only.
          </span>
        </div>
        
        <div className="flex items-center gap-4 ml-auto font-medium">
          <span className="hidden sm:inline text-slate-300">Experiencing acute chest pain or severe trauma?</span>
          <a 
            href="tel:911" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-100 border border-rose-500/40 transition-colors font-bold"
          >
            <PhoneCall className="w-3 h-3" />
            Call Emergency (911 / 112)
          </a>
        </div>
      </div>
    </div>
  );
}
