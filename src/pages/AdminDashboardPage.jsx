import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  Clock, 
  Calendar, 
  UserCheck, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  ShieldAlert, 
  HeartPulse, 
  Stethoscope, 
  X,
  Droplet,
  Phone,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../lib/adminApi';

export default function AdminDashboardPage({ setActivePage, setSelectedReportForView }) {
  const { user, profile, loading: authLoading } = useAuth();

  // Active sub-tab: 'overview' | 'users' | 'reports' | 'knowledge'
  const [activeTab, setActiveTab] = useState('overview');

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Data States
  const [overviewData, setOverviewData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [conditionsList, setConditionsList] = useState([]);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportRiskFilter, setReportRiskFilter] = useState('all');
  const [conditionSearch, setConditionSearch] = useState('');
  const [conditionCategoryFilter, setConditionCategoryFilter] = useState('all');

  // Modal / Detail Inspector States
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [selectedConditionDetail, setSelectedConditionDetail] = useState(null);

  // Security Check: Enforce server-side authorization check on mount
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setActivePage('auth');
      return;
    }

    if (profile && profile.role !== 'admin') {
      setActivePage('dashboard');
      return;
    }

    loadInitialAdminData();
  }, [user, profile, authLoading]);

  const loadInitialAdminData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Verify server-side authorization
      const authCheck = await adminApi.checkAdminStatus();
      if (!authCheck.success) {
        setErrorMessage(authCheck.error || 'Unauthorized: Admin privileges required.');
        setActivePage('dashboard');
        return;
      }

      // 2. Fetch Overview data by default
      const [overviewRes, usersRes, reportsRes, condRes] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getUsers(),
        adminApi.getReports(),
        adminApi.getKnowledgeBase()
      ]);

      if (overviewRes.success) setOverviewData(overviewRes.stats);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (reportsRes.success) setReportsList(reportsRes.reports || []);
      if (condRes.success) setConditionsList(condRes.conditions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setErrorMessage(err.message || 'Failed to initialize Admin Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'overview') {
        const res = await adminApi.getOverview();
        if (res.success) setOverviewData(res.stats);
      } else if (activeTab === 'users') {
        const res = await adminApi.getUsers(userSearch);
        if (res.success) setUsersList(res.users || []);
      } else if (activeTab === 'reports') {
        const res = await adminApi.getReports({ search: reportSearch, riskLevel: reportRiskFilter });
        if (res.success) setReportsList(res.reports || []);
      } else if (activeTab === 'knowledge') {
        const res = await adminApi.getKnowledgeBase({ search: conditionSearch, category: conditionCategoryFilter });
        if (res.success) setConditionsList(res.conditions || []);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenUserDetail = async (userId) => {
    setLoadingUserDetail(true);
    try {
      const res = await adminApi.getUserDetail(userId);
      if (res.success) {
        setSelectedUserDetail(res);
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  const filteredReports = reportsList.filter(r => {
    if (reportRiskFilter !== 'all' && (r.risk_level || '').toLowerCase() !== reportRiskFilter.toLowerCase()) {
      return false;
    }
    if (!reportSearch.trim()) return true;
    const q = reportSearch.toLowerCase();
    return (
      (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.user_id && r.user_id.toLowerCase().includes(q)) ||
      (r.primary_condition?.name && r.primary_condition.name.toLowerCase().includes(q))
    );
  });

  const filteredConditions = conditionsList.filter(c => {
    if (conditionCategoryFilter !== 'all' && (c.category || '').toLowerCase() !== conditionCategoryFilter.toLowerCase()) {
      return false;
    }
    if (!conditionSearch.trim()) return true;
    const q = conditionSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.recommended_specialist && c.recommended_specialist.toLowerCase().includes(q))
    );
  });

  const getRiskBadgeColor = (riskLevel) => {
    const lvl = (riskLevel || 'low').toLowerCase();
    if (lvl === 'emergency') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    } else if (lvl === 'high') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    } else if (lvl === 'moderate' || lvl === 'medium') {
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-7 h-7 text-teal-400" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-teal-400 border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold text-slate-200">Authenticating Administrator Session</h3>
          <p className="text-xs text-slate-400">Verifying server-side permissions and retrieving system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-teal-950/40 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center justify-center shadow-lg shadow-teal-500/10">
            <ShieldAlert className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">System Admin Dashboard</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure clinical monitoring, patient assessments registry, and medical knowledge base inspector.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'overview'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'users'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          User Profiles ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'reports'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Diagnostic Reports ({reportsList.length})
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'knowledge'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Base ({conditionsList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & AGGREGATE METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Users</p>
                <p className="text-2xl font-bold text-white mt-1">{overviewData?.totalUsers ?? usersList.length}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{overviewData?.verifiedUsers ?? 0} Email Verified</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Diagnostic Reports</p>
                <p className="text-2xl font-bold text-white mt-1">{overviewData?.totalReports ?? reportsList.length}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-cyan-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{overviewData?.reportsThisWeek ?? 0} this week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reports Today</p>
                <p className="text-2xl font-bold text-white mt-1">{overviewData?.reportsToday ?? 0}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Past 24 Hours</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Knowledge Base</p>
                <p className="text-2xl font-bold text-white mt-1">{overviewData?.totalConditions ?? conditionsList.length}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-teal-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deterministic Rules</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Risk Distribution Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Risk-Level Distribution in Patient Reports</h3>
                <p className="text-xs text-slate-400">Stratification of all assessments stored in PostgreSQL</p>
              </div>
              <HeartPulse className="w-5 h-5 text-teal-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/20">
                <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-1">
                  <span>Emergency</span>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-bold text-white">{overviewData?.riskDistribution?.emergency ?? 0}</p>
                <p className="text-[10px] text-slate-400 mt-1">Immediate care required</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20">
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                  <span>High Risk</span>
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-bold text-white">{overviewData?.riskDistribution?.high ?? 0}</p>
                <p className="text-[10px] text-slate-400 mt-1">Prompt clinic attention</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-yellow-500/20">
                <div className="flex items-center justify-between text-xs text-yellow-400 font-semibold mb-1">
                  <span>Moderate Risk</span>
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-bold text-white">{overviewData?.riskDistribution?.moderate ?? 0}</p>
                <p className="text-[10px] text-slate-400 mt-1">Outpatient evaluation</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
                  <span>Low Risk</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-bold text-white">{overviewData?.riskDistribution?.low ?? 0}</p>
                <p className="text-[10px] text-slate-400 mt-1">Routine primary care</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Diagnostic Reports */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Recent Clinical Assessments</h3>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                >
                  View All ({reportsList.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {reportsList.slice(0, 5).map(report => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReportDetail(report)}
                    className="p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{report.patient_name || 'Anonymous'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRiskBadgeColor(report.risk_level)}`}>
                          {report.risk_level || 'Routine'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {report.primary_condition?.name || 'Multiple Candidates'} • {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400 hover:text-teal-400" />
                  </div>
                ))}

                {reportsList.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No diagnostic reports stored yet.</p>
                )}
              </div>
            </div>

            {/* Recent Registered Users */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Recent Registered Profiles</h3>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                >
                  View All ({usersList.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {usersList.slice(0, 5).map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleOpenUserDetail(u.id)}
                    className="p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-xs uppercase">
                        {u.name ? u.name.charAt(0) : u.email?.charAt(0) || 'U'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{u.name || 'Unnamed User'}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}

                {usersList.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No user profiles found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER PROFILES */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by email, name, or User ID..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing <span className="text-slate-200 font-semibold">{filteredUsers.length}</span> of {usersList.length} users
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {u.name ? u.name.charAt(0) : u.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{u.name || 'Unnamed'}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {u.age ? `${u.age} yrs` : '—'} • {u.gender || 'Unspecified'}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.blood_group ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold text-[11px]">
                          {u.blood_group}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.email_verified ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {u.account_created_at ? new Date(u.account_created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenUserDetail(u.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No users match the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTIC REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Search by patient name, condition name, or Report ID..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Risk:</span>
                <select
                  value={reportRiskFilter}
                  onChange={(e) => setReportRiskFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All Risks</option>
                  <option value="emergency">Emergency</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="text-xs text-slate-400">
                <span className="text-slate-200 font-semibold">{filteredReports.length}</span> reports
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Report Details</th>
                  <th className="py-3 px-4">Primary Condition</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Symptoms Evaluated</th>
                  <th className="py-3 px-4">Date Recorded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-200">{report.patient_name || 'Anonymous'}</p>
                        <p className="text-[11px] text-slate-400">
                          {report.patient_age ? `${report.patient_age} yrs` : 'Age N/A'} • {report.patient_gender || 'Unspecified'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">{report.id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-medium text-slate-200">{report.primary_condition?.name || 'Inconclusive Pattern'}</p>
                        {report.primary_condition?.matchConfidence && (
                          <p className="text-[10px] text-teal-400 mt-0.5">
                            {report.primary_condition.matchConfidence}% Match Confidence
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getRiskBadgeColor(report.risk_level)}`}>
                        {report.risk_level || 'Routine'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(report.symptoms || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            {typeof s === 'string' ? s : s.name || s.id}
                          </span>
                        ))}
                        {(report.symptoms || []).length > 3 && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            +{(report.symptoms || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {report.created_at ? new Date(report.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReportDetail(report)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                      No diagnostic reports match the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE CONDITIONS */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6 animate-fade-in">
          {/* Notice banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-teal-400" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Read-Only Clinical Rule Base</h4>
                <p className="text-[11px] text-slate-400">
                  InsForge PostgreSQL conditions registry. Modifications to deterministic rules are restricted.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Read-Only
            </span>
          </div>

          {/* Search Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={conditionSearch}
                onChange={(e) => setConditionSearch(e.target.value)}
                placeholder="Search conditions by title, category, or description..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="text-slate-200 font-semibold">{filteredConditions.length}</span> of {conditionsList.length} conditions
            </div>
          </div>

          {/* Conditions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConditions.map(condition => (
              <div
                key={condition.id}
                onClick={() => setSelectedConditionDetail(condition)}
                className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/40 border border-slate-800 cursor-pointer transition-all duration-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{condition.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                        {condition.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{condition.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${getRiskBadgeColor(condition.risk_level)}`}>
                    {condition.severity || 'Moderate'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px]">
                    Specialist: <strong className="text-slate-200">{condition.recommended_specialist || 'Primary Care'}</strong>
                  </span>
                  <span className="text-teal-400 font-medium flex items-center gap-1">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}

            {filteredConditions.length === 0 && (
              <div className="col-span-2 py-10 text-center text-slate-400 text-xs">
                No knowledge base conditions found matching search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: USER DETAIL INSPECTOR */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-sm uppercase">
                  {selectedUserDetail.user?.name ? selectedUserDetail.user.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUserDetail.user?.name || 'User Profile'}</h3>
                  <p className="text-xs text-slate-400">{selectedUserDetail.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Profile Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-slate-500 font-medium">Role</span>
                  <p className="font-semibold text-white capitalize mt-0.5">{selectedUserDetail.user?.role || 'user'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Age & Gender</span>
                  <p className="font-semibold text-white mt-0.5">
                    {selectedUserDetail.user?.age ? `${selectedUserDetail.user.age} yrs` : 'N/A'}, {selectedUserDetail.user?.gender || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Blood Group</span>
                  <p className="font-semibold text-rose-400 mt-0.5">{selectedUserDetail.user?.blood_group || 'Not recorded'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Emergency Contact</span>
                  <p className="font-semibold text-white mt-0.5">{selectedUserDetail.user?.emergency_contact || 'None'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Email Verified</span>
                  <p className="font-semibold text-emerald-400 mt-0.5">
                    {selectedUserDetail.user?.email_verified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Registered Date</span>
                  <p className="font-semibold text-white mt-0.5">
                    {selectedUserDetail.user?.account_created_at ? new Date(selectedUserDetail.user.account_created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Clinical History & Allergies */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">Known Allergies</h4>
                  <p className="text-slate-400">{selectedUserDetail.user?.allergies || 'No allergies recorded.'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">Chronic Medical History</h4>
                  <p className="text-slate-400">{selectedUserDetail.user?.medical_history || 'No preexisting medical history noted.'}</p>
                </div>
              </div>

              {/* Associated Diagnostic Assessments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Associated Assessments ({selectedUserDetail.reports?.length || 0})
                  </h4>
                </div>

                <div className="space-y-2">
                  {(selectedUserDetail.reports || []).map(report => (
                    <div
                      key={report.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{report.primary_condition?.name || 'Report'}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getRiskBadgeColor(report.risk_level)}`}>
                            {report.risk_level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(report.created_at).toLocaleString()} • {report.patient_name}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedUserDetail(null);
                          setSelectedReportDetail(report);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-medium"
                      >
                        View Report
                      </button>
                    </div>
                  ))}

                  {(!selectedUserDetail.reports || selectedUserDetail.reports.length === 0) && (
                    <p className="text-slate-500 text-center py-4">No diagnostic reports stored for this user.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT DETAIL INSPECTOR */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-sm">
                  <FileText className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Diagnostic Report Inspector</h3>
                  <p className="text-xs text-slate-400">ID: {selectedReportDetail.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Summary Header */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500">Patient</span>
                  <p className="font-semibold text-white mt-0.5">{selectedReportDetail.patient_name || 'Anonymous'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Age & Gender</span>
                  <p className="font-semibold text-white mt-0.5">
                    {selectedReportDetail.patient_age ? `${selectedReportDetail.patient_age} yrs` : 'N/A'}, {selectedReportDetail.patient_gender}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Risk Level</span>
                  <p className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadgeColor(selectedReportDetail.risk_level)}`}>
                      {selectedReportDetail.risk_level}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Assessment Date</span>
                  <p className="font-semibold text-white mt-0.5">
                    {new Date(selectedReportDetail.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Primary Diagnosis & Confidence */}
              <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 space-y-2">
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Primary Inference Result</span>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{selectedReportDetail.primary_condition?.name || 'Inconclusive Pattern'}</h4>
                  {selectedReportDetail.primary_condition?.matchConfidence && (
                    <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
                      {selectedReportDetail.primary_condition.matchConfidence}% Match
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-xs mt-1">{selectedReportDetail.primary_condition?.description}</p>
              </div>

              {/* Triage Level */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-500 font-medium">Triage Recommendation</span>
                <p className="text-sm font-semibold text-white mt-1">{selectedReportDetail.triage_level}</p>
              </div>

              {/* Evaluated Symptoms */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-200">Patient Selected Symptoms</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedReportDetail.symptoms || []).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs">
                      {typeof s === 'string' ? s : s.name || s.id}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Recommendations */}
              {selectedReportDetail.recommendations && selectedReportDetail.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200">System Recommendations</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    {selectedReportDetail.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action: Open in Results Page */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedReportDetail(null);
                    if (setSelectedReportForView) {
                      setSelectedReportForView(selectedReportDetail);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg shadow-teal-600/20 transition-all text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Results Engine View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KNOWLEDGE BASE CONDITION DETAIL */}
      {selectedConditionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-sm">
                  <BookOpen className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedConditionDetail.name}</h3>
                  <p className="text-xs text-slate-400">{selectedConditionDetail.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConditionDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-200 mb-1">Clinical Description</h4>
                <p className="text-slate-300 leading-relaxed">{selectedConditionDetail.description}</p>
              </div>

              {/* Symptoms Gate & Requirements */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1.5">Required Symptoms (Rule Gate)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedConditionDetail.required_symptoms || []).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                    {(!selectedConditionDetail.required_symptoms || selectedConditionDetail.required_symptoms.length === 0) && (
                      <span className="text-slate-500">None required</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1.5">Characteristic Symptoms (+25 pts each)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedConditionDetail.characteristic_symptoms || []).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1.5">Optional Symptoms (+10 pts each)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedConditionDetail.optional_symptoms || []).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specialist & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-500 font-medium">Recommended Specialist</span>
                  <p className="text-slate-200 font-semibold mt-1">{selectedConditionDetail.recommended_specialist || 'General Practitioner'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-500 font-medium">Clinical Severity</span>
                  <p className="text-slate-200 font-semibold capitalize mt-1">{selectedConditionDetail.severity || 'Moderate'}</p>
                </div>
              </div>

              {selectedConditionDetail.clinical_notes && (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">Clinical Practice Notes</h4>
                  <p className="text-slate-400 leading-relaxed">{selectedConditionDetail.clinical_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
