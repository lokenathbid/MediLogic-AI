import React, { useState } from 'react';
import { 
  Search, 
  Stethoscope, 
  AlertTriangle, 
  Sliders, 
  Clock, 
  Check, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert,
  User,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SYMPTOMS_CATALOG, SYMPTOM_CATEGORIES } from '../lib/knowledgeBase';
import { useAuth } from '../context/AuthContext';

export default function SymptomSelectionPage({ 
  selectedSymptoms, 
  setSelectedSymptoms, 
  patientInfo, 
  setPatientInfo, 
  setActivePage 
}) {
  const { user, profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Default patient info if empty
  const currentPatient = patientInfo || {
    name: profile?.name || 'Patient',
    age: profile?.age || 30,
    gender: profile?.gender || 'Unspecified'
  };

  const handleToggleSymptom = (sym) => {
    const exists = selectedSymptoms.some(s => s.id === sym.id);
    if (exists) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== sym.id));
    } else {
      setSelectedSymptoms([
        ...selectedSymptoms,
        {
          id: sym.id,
          name: sym.name,
          category: sym.category,
          severity: sym.redFlag ? 8 : 5,
          duration: '1-3 days',
          redFlag: sym.redFlag
        }
      ]);
    }
  };

  const handleUpdateSeverity = (id, newSeverity) => {
    setSelectedSymptoms(selectedSymptoms.map(s => 
      s.id === id ? { ...s, severity: parseInt(newSeverity) } : s
    ));
  };

  const handleUpdateDuration = (id, newDuration) => {
    setSelectedSymptoms(selectedSymptoms.map(s => 
      s.id === id ? { ...s, duration: newDuration } : s
    ));
  };

  const handleRemoveSymptom = (id) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== id));
  };

  const handleClearAll = () => {
    setSelectedSymptoms([]);
  };

  const handleProceedToAnalysis = () => {
    if (selectedSymptoms.length === 0) return;
    setActivePage('analysis');
  };

  // Filter symptoms by category and search
  const filteredSymptoms = SYMPTOMS_CATALOG.filter(sym => {
    const matchesCategory = activeCategory === 'all' || sym.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Clinical Data Entry &bull; Step 1 of 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Symptom Selection & Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Select the clinical signs and symptoms presented by the patient. Adjust individual severity scores (1-10) and onset duration.
          </p>
        </div>

        {/* Patient Demographics Input */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <User className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-slate-200">Patient:</span>
          </div>
          <input
            type="text"
            placeholder="Name"
            value={currentPatient.name}
            onChange={(e) => setPatientInfo({ ...currentPatient, name: e.target.value })}
            className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <input
            type="number"
            placeholder="Age"
            min="1"
            max="120"
            value={currentPatient.age}
            onChange={(e) => setPatientInfo({ ...currentPatient, age: e.target.value })}
            className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <select
            value={currentPatient.gender}
            onChange={(e) => setPatientInfo({ ...currentPatient, gender: e.target.value })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Unspecified">Unspecified</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left (Catalog) | Right (Selected Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col (8 cols): Search, Categories, Symptoms Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search across 40+ clinical symptoms (e.g. chest pain, cough, fever, vertigo, rash)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SYMPTOM_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Symptoms List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSymptoms.map(sym => {
              const isSelected = selectedSymptoms.some(s => s.id === sym.id);
              return (
                <div
                  key={sym.id}
                  onClick={() => handleToggleSymptom(sym)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-950/50 transform -translate-y-0.5'
                      : 'glass-panel border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-bold tracking-tight ${isSelected ? 'text-teal-200' : 'text-white'}`}>
                        {sym.name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        {sym.redFlag && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                            Red Flag
                          </span>
                        )}
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-teal-500 text-white'
                            : 'border border-slate-700 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sym.description}
                    </p>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="capitalize font-mono">{sym.category}</span>
                    <span className={isSelected ? 'text-teal-400 font-semibold' : 'text-slate-400'}>
                      {isSelected ? 'Selected (Tap to remove)' : '+ Tap to select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSymptoms.length === 0 && (
            <div className="glass-panel rounded-2xl p-10 text-center space-y-2 border border-slate-800 text-slate-400 text-xs">
              <p className="font-semibold text-slate-300 text-sm">No symptoms found matching "{searchQuery}"</p>
              <p>Try searching for broader medical terms or switch to "All Systems".</p>
            </div>
          )}
        </div>

        {/* Right Col (4 cols): Selected Symptoms Configuration Drawer */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Active Case Profile</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                {selectedSymptoms.length} Selected
              </span>
            </div>

            {selectedSymptoms.length === 0 ? (
              <div className="text-center py-8 space-y-3 text-slate-400 text-xs">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <p className="font-medium text-slate-300">No symptoms selected yet</p>
                <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                  Click on symptom cards from the catalog to add them to your diagnostic inference set.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {selectedSymptoms.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{s.name}</span>
                        {s.redFlag && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Red Flag" />
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveSymptom(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Severity Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Severity:</span>
                        <span className={`font-mono font-bold ${
                          s.severity >= 8 ? 'text-rose-400' : s.severity >= 5 ? 'text-amber-400' : 'text-teal-400'
                        }`}>
                          {s.severity} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={s.severity}
                        onChange={(e) => handleUpdateSeverity(s.id, e.target.value)}
                        className="w-full accent-teal-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Duration Select */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Duration:
                      </span>
                      <select
                        value={s.duration}
                        onChange={(e) => handleUpdateDuration(s.id, e.target.value)}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 text-[11px] focus:outline-none focus:border-teal-500"
                      >
                        <option value="< 24 hrs">&lt; 24 hrs</option>
                        <option value="1-3 days">1-3 days</option>
                        <option value="4-7 days">4-7 days</option>
                        <option value="> 1 week">&gt; 1 week</option>
                        <option value="> 1 month">&gt; 1 month</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {selectedSymptoms.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleProceedToAnalysis}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Execute Diagnostic Engine
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClearAll}
                  className="w-full py-2 px-3 rounded-lg text-slate-500 hover:text-rose-400 text-xs font-medium transition-colors"
                >
                  Clear All Selected Symptoms
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
