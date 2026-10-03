import React, { useState } from 'react';
import { 
  Activity, 
  Stethoscope, 
  History, 
  User, 
  Info, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  LayoutDashboard,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage, isAskAiOpen, onToggleAskAi }) {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Activity, publicOnly: false },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true },
    { id: 'symptoms', label: 'Diagnose', icon: Stethoscope, requiresAuth: false },
    { id: 'history', label: 'History', icon: History, requiresAuth: true },
    { id: 'about', label: 'About & Logic', icon: Info, requiresAuth: false },
    { id: 'admin', label: 'Admin', icon: ShieldAlert, adminOnly: true }
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly && profile?.role !== 'admin') return false;
    if (item.requiresAuth && !user) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNav('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 animate-pulse" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-teal-400 transition-colors">
                  MediLogic
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Expert Diagnostic System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Side: Global Ask AI + Auth / User Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Global Ask AI Button */}
            <button
              onClick={onToggleAskAi}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm ${
                isAskAiOpen
                  ? 'bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white shadow-teal-500/25 ring-2 ring-teal-400/50 scale-105'
                  : 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:border-teal-500/50 hover:scale-105'
              }`}
              title="Open Ask AI Assistant Panel"
              aria-label="Toggle Ask AI Assistant Panel"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              Ask AI
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('profile')}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    activePage === 'profile'
                      ? 'bg-slate-800 border-teal-500/50 text-white'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold text-xs uppercase">
                    {profile?.name ? profile.name.charAt(0) : user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-medium text-slate-200 truncate max-w-[110px]">
                      {profile?.name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-teal-400/80">
                      {profile?.role === 'admin' ? 'Administrator' : 'InsForge Auth'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleNav('auth')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold shadow-lg shadow-teal-600/20 hover:shadow-teal-500/30 transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Ask AI + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleAskAi}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isAskAiOpen
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              }`}
              title="Toggle Ask AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-5 space-y-2 backdrop-blur-xl animate-fade-in">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" />
                    {profile?.name || user.email}
                  </span>
                  <span className="text-xs text-teal-400">Profile</span>
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white font-medium text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

