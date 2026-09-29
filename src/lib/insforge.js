import { createClient } from '@insforge/sdk';

// InsForge backend connection configuration
export const INSFORGE_CONFIG = {
  baseUrl: 'https://3g2ha7rp.ap-southeast.insforge.app',
  anonKey: 'anon_ed8a67cb2f0bebd29e25e6e504b7ba14e2324443ea3fff90523b673fb68e2dde'
};

// Initialize InsForge SDK client
export const insforge = createClient({
  baseUrl: INSFORGE_CONFIG.baseUrl,
  anonKey: INSFORGE_CONFIG.anonKey
});

// Database helpers for MediLogic AI
export const dbService = {
  /**
   * Save a completed diagnostic report to InsForge Postgres
   */
  async saveReport(reportData) {
    try {
      const { data, error } = await insforge.database
        .from('diagnostic_reports')
        .insert([{
          user_id: reportData.userId || null,
          patient_name: reportData.patientName || 'Anonymous',
          patient_age: reportData.patientAge ? parseInt(reportData.patientAge) : null,
          patient_gender: reportData.patientGender || 'Unspecified',
          symptoms: reportData.symptoms || [],
          primary_condition: reportData.primaryCondition || null,
          differential_conditions: reportData.differentialConditions || [],
          matched_symptoms: reportData.matchedSymptoms || [],
          unmatched_symptoms: reportData.unmatchedSymptoms || [],
          risk_level: reportData.riskLevel || 'low',
          recommendations: reportData.recommendations || [],
          triage_level: reportData.triageLevel || 'routine',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (err) {
      console.error('Error saving diagnostic report to InsForge:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Fetch saved reports for a given user
   */
  async getUserReports(userId) {
    try {
      if (!userId) return { data: [], error: null };
      const { data, error } = await insforge.database
        .from('diagnostic_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Error fetching user reports from InsForge:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId) {
    try {
      const { data, error } = await insforge.database
        .from('diagnostic_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      console.error('Error deleting report:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Get user profile from database
   */
  async getUserProfile(userId) {
    try {
      if (!userId) return { data: null, error: null };
      const { data, error } = await insforge.database
        .from('user_profiles')
        .select('*')
        .eq('id', userId);

      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (err) {
      console.error('Error fetching profile from InsForge:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Upsert user profile in database
   */
  async saveUserProfile(profileData) {
    try {
      const { id, email, name, age, gender, bloodGroup, allergies, medicalHistory, emergencyContact } = profileData;
      if (!id) throw new Error('User ID is required');

      // Check if profile exists
      const existing = await this.getUserProfile(id);

      let result;
      if (existing.data) {
        result = await insforge.database
          .from('user_profiles')
          .update({
            name: name || '',
            age: age ? parseInt(age) : null,
            gender: gender || '',
            blood_group: bloodGroup || '',
            allergies: allergies || '',
            medical_history: medicalHistory || '',
            emergency_contact: emergencyContact || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();
      } else {
        result = await insforge.database
          .from('user_profiles')
          .insert([{
            id,
            email: email || '',
            name: name || '',
            age: age ? parseInt(age) : null,
            gender: gender || '',
            blood_group: bloodGroup || '',
            allergies: allergies || '',
            medical_history: medicalHistory || '',
            emergency_contact: emergencyContact || '',
            updated_at: new Date().toISOString()
          }])
          .select();
      }

      if (result.error) throw result.error;
      return { data: result.data?.[0] || null, error: null };
    } catch (err) {
      console.error('Error saving user profile to InsForge:', err);
      return { data: null, error: err };
    }
  }
};
