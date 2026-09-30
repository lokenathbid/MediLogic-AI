/**
 * Frontend AI Service Client
 * Communicates with the secure server-side endpoint (/api/ask-ai).
 * Does NOT require or expose any API keys client-side.
 */

export const askAiService = {
  /**
   * Request simple patient-friendly explanation of a medical term
   */
  async explainTerm(termName, description = '', category = '') {
    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_term',
          payload: { termName, description, category }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI explanation is temporarily unavailable. Please try again.');
      }

      return { text: data.text, error: null };
    } catch (err) {
      return { text: null, error: err.message || 'AI explanation is temporarily unavailable. Please try again.' };
    }
  },

  /**
   * Request guidance explaining symptom severity ranges (1-10)
   */
  async explainSeverity(symptomName = '', currentSeverity = 5) {
    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_severity',
          payload: { symptomName, currentSeverity }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI explanation is temporarily unavailable. Please try again.');
      }

      return { text: data.text, error: null };
    } catch (err) {
      return { text: null, error: err.message || 'AI explanation is temporarily unavailable. Please try again.' };
    }
  },

  /**
   * Request comprehensive patient-friendly explanation of the rule-based report
   */
  async explainReport(reportData) {
    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_report',
          payload: {
            patientName: reportData.patientName,
            patientAge: reportData.patientAge,
            patientGender: reportData.patientGender,
            primaryCondition: reportData.primaryCondition,
            differentialConditions: reportData.differentialConditions,
            matchedSymptoms: reportData.matchedSymptoms,
            unmatchedSymptoms: reportData.unmatchedSymptoms,
            riskLevel: reportData.riskLevel,
            triageLevel: reportData.triageLevel,
            recommendations: reportData.recommendations,
            hasEmergencyRedFlag: reportData.hasEmergencyRedFlag || reportData.riskLevel === 'emergency'
          }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI explanation is temporarily unavailable. Please try again.');
      }

      return { text: data.text, error: null };
    } catch (err) {
      return { text: null, error: err.message || 'AI explanation is temporarily unavailable. Please try again.' };
    }
  },

  /**
   * Ask an interactive contextual question regarding the report / symptoms
   */
  async askQuestion(question, context = null) {
    try {
      if (!question || !question.trim()) {
        throw new Error('Please enter a question.');
      }

      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_question',
          payload: { question: question.trim(), context }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI response is temporarily unavailable. Please try again.');
      }

      return { text: data.text, error: null };
    } catch (err) {
      return { text: null, error: err.message || 'AI response is temporarily unavailable. Please try again.' };
    }
  }
};
