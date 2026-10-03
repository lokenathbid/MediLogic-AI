import { insforge } from './insforge';

/**
 * Client-side Admin API service
 * Sends requests to the server-side /api/admin endpoint with the authenticated user's session token.
 * All authorization checks and database queries are securely enforced on the server.
 */

export function getAccessToken() {
  try {
    // 1. Check tokenManager getAccessToken
    if (typeof insforge.auth?.tokenManager?.getAccessToken === 'function') {
      const token = insforge.auth.tokenManager.getAccessToken();
      if (token) return token;
    }
    // 2. Check tokenManager getSession
    if (typeof insforge.auth?.tokenManager?.getSession === 'function') {
      const session = insforge.auth.tokenManager.getSession();
      if (session?.accessToken) return session.accessToken;
    }
    // 3. Check http client userToken
    if (insforge.auth?.http?.userToken) {
      return insforge.auth.http.userToken;
    }
    // 4. Check direct method if available
    if (typeof insforge.auth?.getAccessToken === 'function') {
      const token = insforge.auth.getAccessToken();
      if (token) return token;
    }
    // 5. Fallback to stored session token in browser
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('insforge_access_token');
      if (stored) return stored;
    }
  } catch (err) {
    console.warn('Error retrieving InsForge access token:', err);
  }
  return null;
}

async function callAdminEndpoint(action, payload = {}) {
  try {
    const token = getAccessToken();
    if (!token) {
      return { success: false, error: 'User is not authenticated. Please sign in.' };
    }

    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action, payload })
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data.error || `Admin API request failed with status ${response.status}`
      };
    }

    return data;
  } catch (err) {
    console.error(`Admin API error [${action}]:`, err);
    return {
      success: false,
      error: err.message || 'Network error communicating with Admin API.'
    };
  }
}

export const adminApi = {
  /**
   * Verify whether the current authenticated user has an active admin session & role
   */
  async checkAdminStatus() {
    return callAdminEndpoint('check_role');
  },

  /**
   * Fetch aggregate statistics and overview metrics
   */
  async getOverview() {
    return callAdminEndpoint('overview');
  },

  /**
   * Fetch user profiles list with optional search query
   */
  async getUsers(search = '') {
    return callAdminEndpoint('users', { search });
  },

  /**
   * Fetch detailed user profile and all their diagnostic reports
   */
  async getUserDetail(userId) {
    return callAdminEndpoint('user_detail', { userId });
  },

  /**
   * Fetch diagnostic reports with optional filters
   */
  async getReports(filters = {}) {
    return callAdminEndpoint('reports', filters);
  },

  /**
   * Fetch knowledge base conditions (read-only)
   */
  async getKnowledgeBase(filters = {}) {
    return callAdminEndpoint('knowledge_base', filters);
  }
};
