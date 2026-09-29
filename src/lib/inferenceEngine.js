import { CONDITIONS_KNOWLEDGE_BASE, SYMPTOMS_CATALOG } from './knowledgeBase';

/**
 * MediLogic AI - Rule-Based Expert Inference Engine
 * Forward-Chaining Clinical Diagnostic Evaluation
 */

export function runDiagnosticInference(selectedSymptoms) {
  if (!selectedSymptoms || selectedSymptoms.length === 0) {
    return {
      primaryCondition: null,
      differentialConditions: [],
      matchedSymptoms: [],
      unmatchedSymptoms: [],
      riskLevel: 'low',
      triageLevel: 'No active symptoms selected',
      recommendations: ['Please select at least one symptom to run the diagnostic evaluation.'],
      hasEmergencyRedFlag: false,
      redFlagsDetected: [],
      reasoningTrace: ['Inference halted: No symptoms provided for rule evaluation.']
    };
  }

  const selectedIds = new Set(selectedSymptoms.map(s => s.id));
  const symptomMap = new Map(selectedSymptoms.map(s => [s.id, s]));
  const reasoningTrace = [];

  reasoningTrace.push(`[INIT] Loaded ${CONDITIONS_KNOWLEDGE_BASE.length} knowledge base disease rules.`);
  reasoningTrace.push(`[INPUT] Evaluating patient profile with ${selectedSymptoms.length} symptom input(s): ${selectedSymptoms.map(s => s.name).join(', ')}.`);

  // 1. Check for Emergency Red Flags
  const redFlagsDetected = [];
  selectedSymptoms.forEach(s => {
    const catalogItem = SYMPTOMS_CATALOG.find(item => item.id === s.id);
    if (catalogItem?.redFlag || s.severity >= 8) {
      redFlagsDetected.push({
        id: s.id,
        name: s.name,
        severity: s.severity || 5,
        description: catalogItem?.description || ''
      });
    }
  });

  if (redFlagsDetected.length > 0) {
    reasoningTrace.push(`[ALERT] Detected ${redFlagsDetected.length} potential emergency symptom indicator(s): ${redFlagsDetected.map(r => r.name).join(', ')}.`);
  }

  // 2. Evaluate each condition in the Knowledge Base
  const scoredConditions = CONDITIONS_KNOWLEDGE_BASE.map(condition => {
    let score = 0;
    let maxPossibleScore = 0;
    const conditionMatchedSymptoms = [];
    const conditionMissingSymptoms = [];
    const ruleExecutionLog = [];

    // Check required symptoms
    const hasRequired = condition.requiredSymptoms.some(reqId => selectedIds.has(reqId));
    if (!hasRequired) {
      ruleExecutionLog.push(`- Required symptom check failed: None of [${condition.requiredSymptoms.join(', ')}] are present.`);
      return {
        ...condition,
        calculatedScore: 0,
        confidencePercentage: 0,
        matchedSymptoms: [],
        missingSymptoms: condition.characteristicSymptoms,
        ruleExecutionLog,
        hasRequiredSymptom: false
      };
    }

    ruleExecutionLog.push(`+ Required symptom check satisfied.`);

    // Characteristic symptoms scoring (Weight: 25 points each)
    condition.characteristicSymptoms.forEach(symId => {
      maxPossibleScore += 25;
      if (selectedIds.has(symId)) {
        const userSym = symptomMap.get(symId);
        const severityWeight = (userSym?.severity || 5) / 5; // 0.2 - 2.0
        const points = 25 * severityWeight;
        score += points;
        conditionMatchedSymptoms.push(userSym ? userSym.name : symId);
        ruleExecutionLog.push(`+ Characteristic symptom matched: "${symId}" (+${points.toFixed(1)} pts, severity factor ${severityWeight.toFixed(2)})`);
      } else {
        const catItem = SYMPTOMS_CATALOG.find(i => i.id === symId);
        conditionMissingSymptoms.push(catItem ? catItem.name : symId);
      }
    });

    // Optional symptoms scoring (Weight: 10 points each)
    condition.optionalSymptoms.forEach(symId => {
      maxPossibleScore += 10;
      if (selectedIds.has(symId)) {
        const userSym = symptomMap.get(symId);
        const severityWeight = (userSym?.severity || 5) / 5;
        const points = 10 * severityWeight;
        score += points;
        conditionMatchedSymptoms.push(userSym ? userSym.name : symId);
        ruleExecutionLog.push(`+ Optional symptom matched: "${symId}" (+${points.toFixed(1)} pts)`);
      }
    });

    // Apply disease specific weight multiplier
    const weightedScore = score * (condition.weightMultiplier || 1.0);

    // Calculate raw percentage
    let confidencePercentage = maxPossibleScore > 0 ? (weightedScore / maxPossibleScore) * 100 : 0;
    
    // Normalize and cap confidence
    confidencePercentage = Math.min(Math.round(confidencePercentage), 96); // Realistic medical expert cap

    ruleExecutionLog.push(`= Final normalized confidence score: ${confidencePercentage}%`);

    return {
      ...condition,
      calculatedScore: weightedScore,
      confidencePercentage,
      matchedSymptoms: conditionMatchedSymptoms,
      missingSymptoms: conditionMissingSymptoms,
      ruleExecutionLog,
      hasRequiredSymptom: true
    };
  });

  // Filter out 0% conditions and sort descending by confidence percentage
  const validRankings = scoredConditions
    .filter(c => c.confidencePercentage > 15)
    .sort((a, b) => b.confidencePercentage - a.confidencePercentage);

  const primaryCondition = validRankings[0] || null;
  const differentialConditions = validRankings.slice(1, 4);

  if (primaryCondition) {
    reasoningTrace.push(`[DECISION] Primary inferred condition: "${primaryCondition.name}" (${primaryCondition.confidencePercentage}% confidence).`);
    if (differentialConditions.length > 0) {
      reasoningTrace.push(`[DIFFERENTIAL] Secondary differential candidates: ${differentialConditions.map(d => `${d.name} (${d.confidencePercentage}%)`).join(', ')}.`);
    }
  } else {
    reasoningTrace.push(`[DECISION] No specific single condition met the confidence threshold. Symptoms may represent a generalized non-specific physiological state.`);
  }

  // Determine overall risk level and triage advice
  let overallRiskLevel = 'low';
  let overallTriageLevel = 'Routine Educational Guidance';

  if (redFlagsDetected.length > 0 || (primaryCondition && primaryCondition.riskLevel === 'emergency')) {
    overallRiskLevel = 'emergency';
    overallTriageLevel = 'EMERGENCY: Immediate Medical / Emergency Care Recommended';
  } else if (primaryCondition && (primaryCondition.riskLevel === 'high' || primaryCondition.severity === 'severe')) {
    overallRiskLevel = 'high';
    overallTriageLevel = 'Urgent Clinical Consultation Recommended';
  } else if (primaryCondition && primaryCondition.riskLevel === 'medium') {
    overallRiskLevel = 'medium';
    overallTriageLevel = 'Outpatient Healthcare Consultation Recommended';
  }

  // Gather recommendations
  const recommendations = [];
  if (overallRiskLevel === 'emergency') {
    recommendations.push('🚨 Warning: Critical red-flag symptoms detected. Seek emergency medical attention or call 911/emergency services immediately.');
    recommendations.push('Do not attempt to self-medicate or drive unassisted.');
  }

  if (primaryCondition) {
    recommendations.push(`Consult a specialist in ${primaryCondition.recommendedSpecialist}.`);
    if (primaryCondition.lifestyleGuidance) {
      primaryCondition.lifestyleGuidance.forEach(guide => recommendations.push(guide));
    }
  } else {
    recommendations.push('Monitor symptoms closely over the next 24-48 hours.');
    recommendations.push('Maintain hydration, adequate rest, and seek healthcare provider evaluation if symptoms worsen.');
  }

  // Calculate matched vs unmatched overall
  const allMatchedSet = new Set();
  if (primaryCondition) {
    primaryCondition.matchedSymptoms.forEach(m => allMatchedSet.add(m));
  }
  differentialConditions.forEach(d => {
    d.matchedSymptoms.forEach(m => allMatchedSet.add(m));
  });

  const matchedSymptoms = Array.from(allMatchedSet);
  const unmatchedSymptoms = selectedSymptoms
    .map(s => s.name)
    .filter(name => !allMatchedSet.has(name));

  return {
    primaryCondition,
    differentialConditions,
    matchedSymptoms,
    unmatchedSymptoms,
    riskLevel: overallRiskLevel,
    triageLevel: overallTriageLevel,
    recommendations,
    hasEmergencyRedFlag: redFlagsDetected.length > 0,
    redFlagsDetected,
    reasoningTrace
  };
}
