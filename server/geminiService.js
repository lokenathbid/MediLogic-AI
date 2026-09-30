import { GoogleGenAI } from '@google/genai';

/**
 * Server-Side Gemini AI Service for MediLogic AI
 * Handles secure communication with Google Gemini API.
 * The GEMINI_API_KEY is read strictly on the server from environment variables.
 */

// Candidate flash models in preferred order
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest'
];

/**
 * Base Medical Safety System Instruction
 */
const MEDICAL_SAFETY_SYSTEM_INSTRUCTION = `
You are the MediLogic AI Educational Medical Explanation Assistant.
You are an EXPLANATION LAYER ONLY for a deterministic, rule-based clinical inference engine.

STRICT MEDICAL SAFETY RULES:
1. NEVER provide an independent diagnosis or invent disease diagnoses not present in the rule-based report.
2. NEVER override the rule-based inference engine.
3. NEVER tell the user they "definitely have" or "have" a disease. Use cautious phrasing:
   - "the system identified a pattern matching..."
   - "the rule-based system suggests a possible condition..."
   - "the symptoms you selected match..."
4. NEVER prescribe medications or recommend specific prescription dosages.
5. Clarify that symptom-match percentage (e.g., 75%) means that 75% of the predefined rule's characteristic symptoms matched the patient's inputs—it is NOT the mathematical probability that the patient has the disease.
6. If the report or symptoms contain RED-FLAG / EMERGENCY warnings, you MUST preserve and highlight the emergency warning. Tell the user clearly to seek immediate emergency medical attention or call emergency services. NEVER minimize or downplay severe symptoms.
7. Keep explanations clear, empathetic, and understandable for non-medical everyday users.
8. ALWAYS end with or include the educational disclaimer:
   "This explanation is for educational purposes and does not replace professional medical advice. Always consult a qualified healthcare provider for clinical diagnosis and treatment."
`.trim();

/**
 * Execute a prompt with Google Gemini using the server's GEMINI_API_KEY
 */
export async function callGeminiApi({ apiKey, prompt, systemInstruction = MEDICAL_SAFETY_SYSTEM_INSTRUCTION }) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your server environment.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err) {
      lastError = err;
      // If model not found or unavailable, proceed to next candidate model
      const msg = err?.message || '';
      if (msg.includes('NOT_FOUND') || msg.includes('404') || msg.includes('503') || msg.includes('UNAVAILABLE')) {
        continue;
      }
      // For auth or critical errors, throw immediately
      if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('403')) {
        throw new Error('Invalid Gemini API Key configured.');
      }
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API.');
}

/**
 * Handle incoming API action requests
 */
export async function handleAskAiRequest(action, payload, apiKey) {
  switch (action) {
    case 'explain_term': {
      const { termName, description, category } = payload || {};
      if (!termName) throw new Error('Missing medical term name.');

      const prompt = `
Please explain the following medical term in simple, patient-friendly language:

Medical Term: "${termName}"
${description ? `Clinical Description: "${description}"` : ''}
${category ? `Category: "${category}"` : ''}

Please format your response clearly:
1. In simple language: A 1-2 sentence plain-English explanation.
2. What it may feel like: 3-4 simple bullet points describing everyday sensations or signs.
3. When to mention it to a doctor: 1 short sentence.
`.trim();

      const text = await callGeminiApi({ apiKey, prompt });
      return { success: true, text };
    }

    case 'explain_severity': {
      const { symptomName, currentSeverity } = payload || {};
      const prompt = `
Explain how a patient can understand symptom severity levels (1 to 10 scale) for ${symptomName ? `"${symptomName}"` : 'their symptoms'}.

Please clearly explain the three general ranges in simple words:
- Mild (1 - 3): Noticeable, but does not interfere with daily activities or sleep.
- Moderate (4 - 7): Noticeable and begins to interfere with some daily tasks or comfort.
- Severe (8 - 10): Strong, distressing, and significantly interferes with normal functioning.

Remind the patient that they should choose the severity rating that best reflects how they feel right now. Do not select a severity for them.
`.trim();

      const text = await callGeminiApi({ apiKey, prompt });
      return { success: true, text };
    }

    case 'explain_report': {
      const {
        patientName,
        patientAge,
        patientGender,
        primaryCondition,
        differentialConditions,
        matchedSymptoms,
        unmatchedSymptoms,
        riskLevel,
        triageLevel,
        recommendations,
        hasEmergencyRedFlag
      } = payload || {};

      const prompt = `
Explain this rule-based diagnostic health analysis report in simple, clear, and reassuring language for the patient.

PATIENT INFORMATION:
- Name: ${patientName || 'Patient'}
- Age: ${patientAge || 'Not specified'}
- Gender: ${patientGender || 'Not specified'}

RULE-BASED INFERENCE REPORT RESULTS:
- Primary Possible Condition Identified: ${primaryCondition?.name || 'Inconclusive / Non-Specific'}
- Symptom Match Score: ${primaryCondition?.confidencePercentage || 0}%
- Condition Description: ${primaryCondition?.description || 'N/A'}
- Recommended Specialist: ${primaryCondition?.recommendedSpecialist || 'Primary Care Physician'}
- Overall Risk Level: ${riskLevel || 'low'}
- Triage Guidance: ${triageLevel || 'Routine'}
- Emergency Red Flag Detected: ${hasEmergencyRedFlag ? 'YES (CRITICAL)' : 'NO'}
- Matched Symptoms: ${Array.isArray(matchedSymptoms) ? matchedSymptoms.map(s => typeof s === 'string' ? s : s.name).join(', ') : 'None'}
- Unmatched Symptoms: ${Array.isArray(unmatchedSymptoms) ? unmatchedSymptoms.map(s => typeof s === 'string' ? s : s.name).join(', ') : 'None'}
- Secondary Differential Candidates: ${Array.isArray(differentialConditions) ? differentialConditions.map(d => `${d.name} (${d.confidencePercentage}% match)`).join(', ') : 'None'}
- Clinical Recommendations: ${Array.isArray(recommendations) ? recommendations.join('; ') : 'None'}

Please structure your explanation as follows:
1. "Your Report in Simple Language": A plain-English summary of what the rule-based system found.
2. "What Your Match Score Means": Explain clearly that the ${primaryCondition?.confidencePercentage || 0}% score represents how many predefined rule symptoms matched the input symptoms, NOT a mathematical diagnosis probability.
3. "Symptoms Breakdown": Explain why the matched symptoms fit this pattern and what the unmatched symptoms indicate.
4. "Next Steps & Specialist Advice": Explain the specialist recommendation and key next steps.
${hasEmergencyRedFlag || riskLevel === 'emergency' ? '5. "🚨 IMPORTANT EMERGENCY ALERT": Emphasize that urgent red-flag symptoms were flagged and advise immediate professional emergency care.' : ''}
`.trim();

      const text = await callGeminiApi({ apiKey, prompt });
      return { success: true, text };
    }

    case 'ask_question': {
      const { question, context } = payload || {};
      if (!question || typeof question !== 'string' || question.trim() === '') {
        throw new Error('Please provide a question to ask.');
      }

      const prompt = `
CONTEXT FROM CURRENT PATIENT SESSION:
${context ? JSON.stringify(context, null, 2) : 'No specific report context provided.'}

USER QUESTION:
"${question.trim()}"

Answer the user's question clearly, concisely, and helpfully based on the context of their symptoms or report.
Adhere strictly to medical safety: do not diagnose, do not prescribe, and advise consulting a healthcare professional for clinical decisions.
`.trim();

      const text = await callGeminiApi({ apiKey, prompt });
      return { success: true, text };
    }

    default:
      throw new Error(`Unknown action: "${action}"`);
  }
}
