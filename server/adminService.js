import { createClient, createAdminClient } from '@insforge/sdk';

/**
 * Server-Side Admin Service for MediLogic AI
 * Handles secure admin authentication, authorization, and monitoring queries.
 * Server-side API key is NEVER exposed to the frontend browser.
 */

/**
 * Verify that the caller has a valid authenticated session AND the 'admin' role in user_profiles.
 * Returns { user, profile } if valid; throws an Error with appropriate statusCode otherwise.
 */
export async function verifyAdminAuth(authHeader, config) {
  if (!authHeader) {
    const err = new Error('Authentication required: Missing Authorization header.');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    const err = new Error('Authentication required: Invalid Bearer token format.');
    err.statusCode = 401;
    throw err;
  }

  const baseUrl = config.baseUrl || 'https://3g2ha7rp.ap-southeast.insforge.app';
  const apiKey = config.apiKey;

  if (!apiKey) {
    const err = new Error('Server configuration error: INSFORGE_API_KEY is not set on the server.');
    err.statusCode = 500;
    throw err;
  }

  // 1. Verify caller session with InsForge Auth using their access token
  const authClient = createClient({ baseUrl, accessToken: token });
  const { data: authData, error: authError } = await authClient.auth.getCurrentUser();

  if (authError || !authData?.user?.id) {
    const err = new Error(authError?.message || 'Invalid or expired session. Please sign in again.');
    err.statusCode = 401;
    throw err;
  }

  const authenticatedUser = authData.user;

  // 2. Query user profile using server admin client to check role
  const adminClient = createAdminClient({ baseUrl, apiKey });
  const { data: profileData, error: profileError } = await adminClient.database
    .from('user_profiles')
    .select('id, email, name, role')
    .eq('id', authenticatedUser.id)
    .single();

  if (profileError || !profileData) {
    const err = new Error('User profile record not found.');
    err.statusCode = 403;
    throw err;
  }

  // 3. Strict server-side role check
  if (profileData.role !== 'admin') {
    const err = new Error('Access denied: Administrator privileges required.');
    err.statusCode = 403;
    throw err;
  }

  return {
    user: authenticatedUser,
    profile: profileData,
    adminClient
  };
}

/**
 * Handle incoming Admin API action requests
 */
export async function handleAdminRequest(action, payload = {}, authHeader, config) {
  // Always verify admin authentication & authorization first
  const { user, profile, adminClient } = await verifyAdminAuth(authHeader, config);

  switch (action) {
    case 'check_role': {
      return {
        success: true,
        role: profile.role,
        user: {
          id: user.id,
          email: user.email,
          name: profile.name
        }
      };
    }

    case 'overview': {
      // 1. Total users
      const { data: users, error: usersErr } = await adminClient.database
        .from('admin_user_directory')
        .select('*');

      // 2. All reports
      const { data: reports, error: reportsErr } = await adminClient.database
        .from('diagnostic_reports')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Knowledge base conditions
      const { data: conditions, error: condErr } = await adminClient.database
        .from('knowledge_base_conditions')
        .select('id, name, category, severity, risk_level');

      const allUsers = users || [];
      const allReports = reports || [];
      const allConditions = conditions || [];

      // Time calculations
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const reportsToday = allReports.filter(r => r.created_at && new Date(r.created_at) >= startOfToday).length;
      const reportsThisWeek = allReports.filter(r => r.created_at && new Date(r.created_at) >= oneWeekAgo).length;

      // Risk level distribution
      const riskDistribution = {
        emergency: 0,
        high: 0,
        moderate: 0,
        low: 0
      };

      allReports.forEach(r => {
        const lvl = (r.risk_level || 'low').toLowerCase();
        if (lvl === 'emergency') riskDistribution.emergency++;
        else if (lvl === 'high') riskDistribution.high++;
        else if (lvl === 'moderate' || lvl === 'medium') riskDistribution.moderate++;
        else riskDistribution.low++;
      });

      const verifiedUsersCount = allUsers.filter(u => u.email_verified).length;

      return {
        success: true,
        stats: {
          totalUsers: allUsers.length,
          totalReports: allReports.length,
          totalConditions: allConditions.length,
          reportsToday,
          reportsThisWeek,
          verifiedUsers: verifiedUsersCount,
          riskDistribution,
          recentReports: allReports.slice(0, 5),
          recentUsers: allUsers.slice(0, 5)
        }
      };
    }

    case 'users': {
      const { search } = payload;
      let { data, error } = await adminClient.database
        .from('admin_user_directory')
        .select('*')
        .order('account_created_at', { ascending: false });

      if (error) throw error;
      let userList = data || [];

      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        userList = userList.filter(u => 
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.name && u.name.toLowerCase().includes(query)) ||
          (u.id && u.id.toLowerCase().includes(query))
        );
      }

      return {
        success: true,
        users: userList
      };
    }

    case 'user_detail': {
      const { userId } = payload;
      if (!userId) {
        const err = new Error('Missing userId parameter.');
        err.statusCode = 400;
        throw err;
      }

      const { data: userProfile, error: profileErr } = await adminClient.database
        .from('admin_user_directory')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) throw profileErr;

      const { data: userReports, error: reportsErr } = await adminClient.database
        .from('diagnostic_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (reportsErr) throw reportsErr;

      return {
        success: true,
        user: userProfile,
        reports: userReports || []
      };
    }

    case 'reports': {
      const { search, riskLevel, userId } = payload;
      let query = adminClient.database
        .from('diagnostic_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (riskLevel && riskLevel !== 'all') {
        query = query.eq('risk_level', riskLevel);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      let reportList = data || [];

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        reportList = reportList.filter(r => 
          (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
          (r.id && r.id.toLowerCase().includes(q)) ||
          (r.user_id && r.user_id.toLowerCase().includes(q)) ||
          (r.primary_condition?.name && r.primary_condition.name.toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        reports: reportList
      };
    }

    case 'knowledge_base': {
      const { search, category } = payload;
      let query = adminClient.database
        .from('knowledge_base_conditions')
        .select('*')
        .order('name', { ascending: true });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      let conditions = data || [];

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        conditions = conditions.filter(c => 
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.id && c.id.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.recommended_specialist && c.recommended_specialist.toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        conditions
      };
    }

    default: {
      const err = new Error(`Unknown admin action: ${action}`);
      err.statusCode = 400;
      throw err;
    }
  }
}
