import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Heart, 
  AlertTriangle, 
  Phone, 
  Save, 
  Check, 
  ShieldCheck, 
  LogOut, 
  Calendar, 
  Clock, 
  Database,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage({ setActivePage }) {
  const { user, profile, updateProfile, signOut } = useAuth();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Unspecified');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(profile.age ? String(profile.age) : '');
      setGender(profile.gender || 'Unspecified');
      setBloodGroup(profile.blood_group || '');
      setAllergies(profile.allergies || '');
      setMedicalHistory(profile.medical_history || '');
      setEmergencyContact(profile.emergency_contact || '');
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await updateProfile({
      name,
      age: age ? parseInt(age) : null,
      gender,
      bloodGroup,
      allergies,
      medicalHistory,
      emergencyContact
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Medical profile updated and synced to InsForge!' });
    } else {
      setStatusMessage({ type: 'error', text: res.error?.message || 'Failed to update profile.' });
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-teal-400 flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Sign In to Manage Clinical Profile</h2>
          <p className="text-xs text-slate-400">
            Sign in to configure your medical baseline, allergy warnings, and emergency contacts.
          </p>
        </div>
        <button
          onClick={() => setActivePage('auth')}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 transition-all"
        >
          Sign In with InsForge
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <User className="w-4 h-4" />
            <span>Patient & Clinician Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Medical Profile & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stored in InsForge PostgreSQL. Used to autofill diagnostic assessments and highlight drug/allergy contraindications.
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Account Info Summary */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-extrabold text-lg uppercase">
              {name ? name.charAt(0) : user.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{name || 'Unnamed Profile'}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>ID: {user.id.substring(0, 16)}...</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Age (years)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Biological Sex / Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Unspecified">Unspecified</option>
              </select>
            </div>
          </div>

          {/* Blood Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 transition-all"
            >
              <option value="">Select blood type</option>
              <option value="O+">O Positive (O+)</option>
              <option value="O-">O Negative (O-)</option>
              <option value="A+">A Positive (A+)</option>
              <option value="A-">A Negative (A-)</option>
              <option value="B+">B Positive (B+)</option>
              <option value="B-">B Negative (B-)</option>
              <option value="AB+">AB Positive (AB+)</option>
              <option value="AB-">AB Negative (AB-)</option>
            </select>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Emergency Contact (Name & Phone)</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. Dr. Roberts (+1 555-0192)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Known Allergies */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Known Allergies (Medications, Foods, Environmental)
          </label>
          <input
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. Penicillin, Peanuts, Sulfa drugs, Latex"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>

        {/* Medical History */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Chronic Medical Conditions / History
          </label>
          <textarea
            rows="3"
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="e.g. Asthma since childhood, Mild hypertension managed with diet, No prior surgeries."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Persisted directly to InsForge PostgreSQL user_profiles</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
