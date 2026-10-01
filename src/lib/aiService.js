/**
 * Frontend AI Service Client
 * Communicates with the secure server-side endpoint (/api/ask-ai).
 * Does NOT require or expose any API keys client-side.
 */

/**
 * Robust helper to send requests to /api/ask-ai with content-type inspection
 * and graceful fallback for non-JSON/HTML/network errors.
 */
async function postAskAi(action, payload) {
  try {
    const response = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ action, payload })
    });

    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('Failed to parse JSON response from /api/ask-ai:', jsonErr);
      }
    } else {
      // Server returned HTML (e.g. 404 / 500 error page from Vercel) or plain text
      const rawText = await response.text().catch(() => '');
      console.error('Non-JSON response received from /api/ask-ai:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        sample: rawText.slice(0, 150)
      });
    }

    if (!response.ok || !data?.success) {
      const errorMessage = data?.error || (
        response.status === 404
          ? 'AI backend endpoint is unavailable. Please ensure the serverless function is deployed.'
          : response.status === 500
          ? (data?.error || 'AI service encountered an internal error. Please try again later.')
          : 'AI service is temporarily unavailable. Please try again.'
      );
      return { text: null, error: errorMessage };
    }

    return { text: data.text, error: null };
  } catch (err) {
    console.error('Network or fetch error in askAiService:', err);
    return {
      text: null,
      error: 'Unable to connect to AI service. Please check your network connection and try again.'
    };
  }
}

export const askAiService = {
  /**
   * Request simple patient-friendly explanation of a medical term
   */
  async explainTerm(termName, description = '', category = '') {
    if (!termName || !termName.trim()) {
      return { text: null, error: 'Please provide a valid medical term.' };
    }
    return postAskAi('explain_term', { termName, description, category });
  },

  /**
   * Request guidance explaining symptom severity ranges (1-10)
   */
  async explainSeverity(symptomName = '', currentSeverity = 5) {
    return postAskAi('explain_severity', { symptomName, currentSeverity });
  },

  /**
   * Request comprehensive patient-friendly explanation of the rule-based report
   */
  async explainReport(reportData) {
    if (!reportData) {
      return { text: null, error: 'No report data available to explain.' };
    }
    return postAskAi('explain_report', {
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
    });
  },

  /**
   * Ask an interactive contextual question regarding the report / symptoms
   */
  async askQuestion(question, context = null) {
    if (!question || !question.trim()) {
      return { text: null, error: 'Please enter a question.' };
    }
    return postAskAi('ask_question', { question: question.trim(), context });
  }
};
