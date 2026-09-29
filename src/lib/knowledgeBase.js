/**
 * MediLogic AI - Medical Knowledge Base & Symptoms Catalog
 * Expert System Rule Definitions & Metadata
 */

export const SYMPTOM_CATEGORIES = [
  { id: 'all', name: 'All Systems', icon: 'Activity' },
  { id: 'respiratory', name: 'Respiratory', icon: 'Wind', color: 'teal' },
  { id: 'cardiovascular', name: 'Cardiovascular', icon: 'Heart', color: 'rose' },
  { id: 'gastrointestinal', name: 'Gastrointestinal', icon: 'Utensils', color: 'amber' },
  { id: 'neurological', name: 'Neurological & Head', icon: 'Brain', color: 'indigo' },
  { id: 'musculoskeletal', name: 'Musculoskeletal', icon: 'Bone', color: 'emerald' },
  { id: 'dermatological', name: 'Dermatological', icon: 'Sparkles', color: 'pink' },
  { id: 'ent', name: 'Ear, Nose & Throat', icon: 'Eye', color: 'cyan' },
  { id: 'general', name: 'General & Systemic', icon: 'Thermometer', color: 'blue' }
];

export const SYMPTOMS_CATALOG = [
  // Respiratory
  { id: 'cough_dry', name: 'Dry Cough', category: 'respiratory', description: 'Persistent cough without phlegm or mucus', redFlag: false },
  { id: 'cough_productive', name: 'Productive Cough (Phlegm)', category: 'respiratory', description: 'Coughing up clear, yellow, or greenish mucus', redFlag: false },
  { id: 'shortness_of_breath', name: 'Shortness of Breath (Dyspnea)', category: 'respiratory', description: 'Difficulty breathing or feeling breathless upon minimal exertion', redFlag: true },
  { id: 'wheezing', name: 'Wheezing Sound', category: 'respiratory', description: 'High-pitched whistling sound during breathing', redFlag: false },
  { id: 'chest_tightness', name: 'Chest Tightness', category: 'respiratory', description: 'Constricting feeling in the thoracic region', redFlag: true },
  { id: 'stridor', name: 'Stridor (Harsh Breathing)', category: 'respiratory', description: 'Vibrating, harsh sound when inhaling', redFlag: true },

  // Cardiovascular
  { id: 'chest_pain_crushing', name: 'Crushing Chest Pain / Pressure', category: 'cardiovascular', description: 'Squeezing, heavy pressure radiating to left arm, neck, or jaw', redFlag: true },
  { id: 'palpitations', name: 'Rapid Heartbeat (Palpitations)', category: 'cardiovascular', description: 'Sensation of rapid, fluttering, or pounding heart', redFlag: false },
  { id: 'leg_swelling', name: 'Bilateral Leg/Ankle Swelling (Edema)', category: 'cardiovascular', description: 'Fluid accumulation in lower extremities', redFlag: false },
  { id: 'dizziness_standing', name: 'Orthostatic Lightheadedness', category: 'cardiovascular', description: 'Feeling faint when transitioning to a standing position', redFlag: false },
  { id: 'cyanosis', name: 'Bluish Lips or Fingertips (Cyanosis)', category: 'cardiovascular', description: 'Discoloration indicating inadequate blood oxygenation', redFlag: true },

  // Gastrointestinal
  { id: 'nausea', name: 'Nausea', category: 'gastrointestinal', description: 'Uneasiness in the stomach with urge to vomit', redFlag: false },
  { id: 'vomiting', name: 'Vomiting', category: 'gastrointestinal', description: 'Involuntary ejection of gastric contents', redFlag: false },
  { id: 'abdominal_pain_epigastric', name: 'Upper Abdominal / Epigastric Burning', category: 'gastrointestinal', description: 'Burning pain behind breastbone or upper abdomen', redFlag: false },
  { id: 'abdominal_pain_rlq', name: 'Sharp Right Lower Quadrant Pain', category: 'gastrointestinal', description: 'Localized sharp tenderness near McBurney point', redFlag: true },
  { id: 'diarrhea_watery', name: 'Frequent Watery Diarrhea', category: 'gastrointestinal', description: 'Loose, unformed bowel movements > 3 times daily', redFlag: false },
  { id: 'constipation', name: 'Severe Constipation', category: 'gastrointestinal', description: 'Infrequent, hard, or difficult bowel evacuations', redFlag: false },
  { id: 'bloating', name: 'Abdominal Bloating & Gas', category: 'gastrointestinal', description: 'Fullness and distention of the abdomen', redFlag: false },
  { id: 'jaundice', name: 'Yellowish Skin or Eyes (Jaundice)', category: 'gastrointestinal', description: 'Icteric sclera and skin pigment alteration', redFlag: true },

  // Neurological & Head
  { id: 'headache_throbbing', name: 'Throbbing Unilateral Headache', category: 'neurological', description: 'Pulsating pain on one side of head often with photophobia', redFlag: false },
  { id: 'headache_thunderclap', name: 'Sudden "Thunderclap" Severe Headache', category: 'neurological', description: 'Worst headache of life reaching maximum intensity within seconds', redFlag: true },
  { id: 'headache_tension', name: 'Bilateral Tight Band-Like Headache', category: 'neurological', description: 'Dull, aching pressure around the forehead and temples', redFlag: false },
  { id: 'vertigo', name: 'Spinning Sensation (Vertigo)', category: 'neurological', description: 'Illusion of environmental motion or spinning', redFlag: false },
  { id: 'numbness_weakness', name: 'One-Sided Facial / Arm Weakness', category: 'neurological', description: 'Loss of sensation or motor strength on one side of the body', redFlag: true },
  { id: 'confusion', name: 'Sudden Confusion or Slurred Speech', category: 'neurological', description: 'Disorientation in time, place, or language articulation', redFlag: true },
  { id: 'tremors', name: 'Involuntary Hand Tremor', category: 'neurological', description: 'Rhythmic oscillatory movement of fingers or hands', redFlag: false },

  // ENT
  { id: 'sore_throat', name: 'Sore Throat (Pharyngitis)', category: 'ent', description: 'Pain, scratchiness, or irritation worsened by swallowing', redFlag: false },
  { id: 'runny_nose', name: 'Nasal Congestion / Rhinorrhea', category: 'ent', description: 'Excess mucus discharge and blocked nasal passages', redFlag: false },
  { id: 'loss_of_smell', name: 'Loss of Taste or Smell (Anosmia)', category: 'ent', description: 'Impairment of olfactory perception', redFlag: false },
  { id: 'sinus_pressure', name: 'Facial Pressure & Sinus Tenderness', category: 'ent', description: 'Aching sensation over maxillary or frontal sinuses', redFlag: false },
  { id: 'ear_pain', name: 'Earache / Otalgia', category: 'ent', description: 'Sharp or throbbing pain inside the ear canal', redFlag: false },

  // Musculoskeletal
  { id: 'joint_pain_swelling', name: 'Joint Pain with Swelling', category: 'musculoskeletal', description: 'Inflammation, stiffness, and heat around articulated joints', redFlag: false },
  { id: 'muscle_aches', name: 'Generalized Muscle Aches (Myalgia)', category: 'musculoskeletal', description: 'Diffuse soreness across body musculature', redFlag: false },
  { id: 'lower_back_pain', name: 'Lower Lumbar Back Pain', category: 'musculoskeletal', description: 'Ache or stiffness in the lower spinal region', redFlag: false },
  { id: 'neck_stiffness', name: 'Severe Neck Stiffness with Fever', category: 'musculoskeletal', description: 'Inability to touch chin to chest with systemic fever', redFlag: true },

  // Dermatological
  { id: 'skin_rash_itchy', name: 'Pruritic (Itchy) Red Skin Rash', category: 'dermatological', description: 'Erythematous papules or macules with intense itching', redFlag: false },
  { id: 'hives', name: 'Urticaria / Raised Wheals (Hives)', category: 'dermatological', description: 'Transient, itchy elevated plaques on the skin', redFlag: false },
  { id: 'skin_target_lesion', name: 'Bullseye / Target-Shaped Rash', category: 'dermatological', description: 'Circular erythematous rings with central clearing', redFlag: false },

  // General & Systemic
  { id: 'fever_mild', name: 'Low-Grade Fever (37.5°C - 38.3°C)', category: 'general', description: 'Slightly elevated core body temperature', redFlag: false },
  { id: 'fever_high', name: 'High-Grade Fever (> 38.5°C / 101.3°F)', category: 'general', description: 'Significant body temperature spike with chills and rigors', redFlag: true },
  { id: 'fatigue_profound', name: 'Profound Exhaustion / Lethargy', category: 'general', description: 'Extreme weakness not relieved by sleep or rest', redFlag: false },
  { id: 'chills_sweats', name: 'Night Sweats and Chills', category: 'general', description: 'Episodes of shivering followed by profuse nocturnal perspiration', redFlag: false },
  { id: 'unexplained_weight_loss', name: 'Rapid Unexplained Weight Loss', category: 'general', description: 'Unintentional loss of >5% body weight within weeks', redFlag: true }
];

export const CONDITIONS_KNOWLEDGE_BASE = [
  {
    id: 'acute_bronchitis',
    name: 'Acute Bronchitis',
    category: 'Respiratory',
    severity: 'moderate',
    riskLevel: 'medium',
    triageLevel: 'Routine Clinical Evaluation',
    description: 'Inflammation of the bronchial tubes leading to persistent cough, mucus production, and airway irritation, predominantly viral in etiology.',
    requiredSymptoms: ['cough_productive', 'cough_dry'],
    characteristicSymptoms: ['cough_productive', 'chest_tightness', 'fatigue_profound', 'fever_mild'],
    optionalSymptoms: ['sore_throat', 'runny_nose', 'muscle_aches', 'wheezing'],
    weightMultiplier: 1.15,
    recommendedSpecialist: 'Pulmonologist / Primary Care Physician',
    clinicalNotes: 'Most cases resolve spontaneously within 10-21 days without antibiotics unless secondary bacterial superinfection occurs.',
    lifestyleGuidance: [
      'Maintain copious oral hydration to thin mucous secretions.',
      'Utilize steam inhalation or humidifiers to ease bronchial passage constriction.',
      'Avoid irritants such as tobacco smoke, dust, and cold dry air.'
    ],
    warningSigns: ['Coughing up frank blood (hemoptysis)', 'Temperature exceeding 39°C for > 3 days', 'Severe dyspnea at rest']
  },
  {
    id: 'influenza_a_b',
    name: 'Influenza (Flu Syndrome)',
    category: 'General / Viral',
    severity: 'moderate',
    riskLevel: 'medium',
    triageLevel: 'Prompt Outpatient Assessment',
    description: 'Contagious viral infection of the respiratory tract caused by influenza viruses, characterized by sudden onset of systemic and respiratory symptoms.',
    requiredSymptoms: ['fever_high', 'muscle_aches'],
    characteristicSymptoms: ['fever_high', 'muscle_aches', 'fatigue_profound', 'chills_sweats', 'headache_tension'],
    optionalSymptoms: ['cough_dry', 'sore_throat', 'runny_nose', 'loss_of_smell'],
    weightMultiplier: 1.2,
    recommendedSpecialist: 'Infectious Disease Specialist / Family Medicine',
    clinicalNotes: 'Antiviral neuraminidase inhibitors (e.g. oseltamivir) provide maximum therapeutic benefit when initiated within 48 hours of symptom onset.',
    lifestyleGuidance: [
      'Strict bed rest and isolation to prevent transmission to vulnerable contacts.',
      'Fluid replenishment with electrolyte solutions and warm broths.',
      'Antipyretics like acetaminophen for symptom relief under medical supervision.'
    ],
    warningSigns: ['Cyanosis or blue-tinted lips', 'Difficulty breathing or painful inspiration', 'Confusion or sudden dizziness']
  },
  {
    id: 'acute_coronary_syndrome',
    name: 'Acute Coronary Syndrome (Suspected Myocardial Infarction)',
    category: 'Cardiovascular',
    severity: 'critical',
    riskLevel: 'emergency',
    triageLevel: 'EMERGENCY: Immediate 911 / ER Transfer',
    description: 'A critical cardiovascular emergency caused by acute obstruction of coronary arterial blood flow to the myocardium.',
    requiredSymptoms: ['chest_pain_crushing'],
    characteristicSymptoms: ['chest_pain_crushing', 'shortness_of_breath', 'nausea', 'chills_sweats', 'dizziness_standing'],
    optionalSymptoms: ['palpitations', 'vomiting', 'fatigue_profound', 'cyanosis'],
    weightMultiplier: 1.5,
    recommendedSpecialist: 'Interventional Cardiologist / Emergency Physician',
    clinicalNotes: 'Time is muscle: emergent 12-lead ECG, cardiac troponin assays, and coronary reperfusion therapy (PCI or thrombolysis) are time-critical.',
    lifestyleGuidance: [
      'DO NOT drive yourself to the hospital; call emergency emergency services immediately.',
      'Sit comfortably and rest quietly while awaiting emergency response.'
    ],
    warningSigns: ['Crushing retrosternal chest pain lasting > 5 minutes', 'Radiation of pain to jaw, neck, back, or left arm', 'Syncope, extreme dyspnea, or clammy diaphoresis']
  },
  {
    id: 'gastroesophageal_reflux_disease',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    category: 'Gastrointestinal',
    severity: 'mild',
    riskLevel: 'low',
    triageLevel: 'Routine Outpatient Consultation',
    description: 'A chronic digestive condition where stomach acid backflows into the esophagus, irritating the mucosal lining and causing pyrosis (heartburn).',
    requiredSymptoms: ['abdominal_pain_epigastric'],
    characteristicSymptoms: ['abdominal_pain_epigastric', 'nausea', 'bloating'],
    optionalSymptoms: ['cough_dry', 'sore_throat', 'vomiting'],
    weightMultiplier: 1.0,
    recommendedSpecialist: 'Gastroenterologist',
    clinicalNotes: 'Initial management involves dietary modifications and H2-receptor antagonists or proton pump inhibitors (PPIs).',
    lifestyleGuidance: [
      'Avoid trigger foods: citrus, spicy dishes, chocolate, caffeine, and fatty meals.',
      'Elevate the head of your bed by 6-8 inches during sleep.',
      'Avoid lying down for at least 3 hours postprandially.'
    ],
    warningSigns: ['Dysphagia (difficulty swallowing)', 'Persistent vomiting with blood or coffee-ground material', 'Unexplained rapid weight loss']
  },
  {
    id: 'acute_appendicitis',
    name: 'Acute Appendicitis',
    category: 'Gastrointestinal',
    severity: 'severe',
    riskLevel: 'emergency',
    triageLevel: 'Urgent Surgical Emergency Assessment',
    description: 'Acute inflammation of the vermiform appendix, typically secondary to luminal obstruction, carrying a high risk of perforation and peritonitis.',
    requiredSymptoms: ['abdominal_pain_rlq'],
    characteristicSymptoms: ['abdominal_pain_rlq', 'nausea', 'vomiting', 'fever_mild'],
    optionalSymptoms: ['diarrhea_watery', 'constipation', 'fatigue_profound', 'fever_high'],
    weightMultiplier: 1.45,
    recommendedSpecialist: 'General / Abdominal Surgeon',
    clinicalNotes: 'Classical progression begins with periumbilical visceral pain migrating to the right iliac fossa (McBurney point) with rebound tenderness.',
    lifestyleGuidance: [
      'DO NOT take laxatives, pain killers, or apply heating pads to the abdomen as this may induce perforation.',
      'Maintain strict NPO (nothing by mouth) until examined by a surgeon.'
    ],
    warningSigns: ['Sudden relief of pain followed by diffuse agonizing abdominal rigidity (indicates rupture)', 'High fever with chills and vomiting']
  },
  {
    id: 'migraine_with_aura',
    name: 'Migraine Cephalea',
    category: 'Neurological',
    severity: 'moderate',
    riskLevel: 'medium',
    triageLevel: 'Neurological Consultation',
    description: 'A primary neurovascular disorder characterized by recurrent attacks of pulsating, moderate-to-severe unilateral headache, often accompanied by autonomic symptoms.',
    requiredSymptoms: ['headache_throbbing'],
    characteristicSymptoms: ['headache_throbbing', 'nausea', 'vertigo', 'fatigue_profound'],
    optionalSymptoms: ['vomiting', 'neck_stiffness', 'numbness_weakness'],
    weightMultiplier: 1.15,
    recommendedSpecialist: 'Neurologist / Headache Specialist',
    clinicalNotes: 'Triptans, CGRP antagonists, and avoidance of idiosyncratic triggers form the backbone of acute and prophylactic migraine therapy.',
    lifestyleGuidance: [
      'Rest in a dark, sound-dampened, quiet environment during attacks.',
      'Apply cold compresses to the forehead or temples.',
      'Track dietary triggers, stress cycles, and maintain consistent sleep routines.'
    ],
    warningSigns: ['New neurological deficits (diplopia, ataxia, aphasia)', 'Sudden onset thunderclap intensity headache', 'Headache accompanied by systemic fever and stiff neck']
  },
  {
    id: 'bronchial_asthma_exacerbation',
    name: 'Bronchial Asthma (Exacerbation)',
    category: 'Respiratory',
    severity: 'severe',
    riskLevel: 'high',
    triageLevel: 'Urgent / Emergency Respiratory Care',
    description: 'Chronic inflammatory airway disorder with reversible bronchospasm, hyperresponsiveness, and excessive mucous secretion.',
    requiredSymptoms: ['wheezing', 'shortness_of_breath'],
    characteristicSymptoms: ['wheezing', 'shortness_of_breath', 'chest_tightness', 'cough_dry'],
    optionalSymptoms: ['cough_productive', 'fatigue_profound', 'cyanosis'],
    weightMultiplier: 1.35,
    recommendedSpecialist: 'Pulmonologist / Allergist',
    clinicalNotes: 'Inhaled short-acting beta-agonists (SABA) like albuterol with systemic corticosteroids if peak expiratory flow is compromised.',
    lifestyleGuidance: [
      'Use prescribed rescue bronchodilator inhalers with spacer as directed.',
      'Identify and eliminate environmental allergens, pet dander, and cold air exposure.'
    ],
    warningSigns: ['Silent chest (inability to hear breath sounds)', 'Inability to speak in full sentences', 'Cyanotic fingernails or lips']
  },
  {
    id: 'acute_sinusitis',
    name: 'Acute Rhinosinusitis',
    category: 'Ear, Nose & Throat',
    severity: 'mild',
    riskLevel: 'low',
    triageLevel: 'Routine Primary Care Clinic',
    description: 'Inflammation of the paranasal sinus cavities secondary to viral or bacterial contagion causing facial congestion and purulent discharge.',
    requiredSymptoms: ['sinus_pressure', 'runny_nose'],
    characteristicSymptoms: ['sinus_pressure', 'runny_nose', 'headache_tension', 'sore_throat'],
    optionalSymptoms: ['cough_productive', 'fever_mild', 'ear_pain', 'loss_of_smell'],
    weightMultiplier: 1.05,
    recommendedSpecialist: 'Otolaryngologist (ENT) / Primary Care',
    clinicalNotes: 'Symptomatic therapy with nasal saline irrigation and intranasal corticosteroids; antibiotics reserved for symptoms lasting > 10 days.',
    lifestyleGuidance: [
      'Perform hypertonic or isotonic nasal saline irrigation twice daily.',
      'Apply warm facial compresses over maxillary and frontal sinuses.'
    ],
    warningSigns: ['Periorbital swelling or visual changes', 'Severe forehead headache with high fever', 'Neck stiffness or altered mental state']
  },
  {
    id: 'meningitis_suspected',
    name: 'Meningeal Infection (Suspected Acute Meningitis)',
    category: 'Neurological / Infectious',
    severity: 'critical',
    riskLevel: 'emergency',
    triageLevel: 'CRITICAL EMERGENCY: Immediate Hospital Admission',
    description: 'Life-threatening inflammation of the protective membranes (meninges) covering the brain and spinal cord.',
    requiredSymptoms: ['neck_stiffness', 'fever_high'],
    characteristicSymptoms: ['neck_stiffness', 'fever_high', 'confusion', 'headache_thunderclap', 'vomiting'],
    optionalSymptoms: ['nausea', 'skin_rash_itchy', 'fatigue_profound'],
    weightMultiplier: 1.6,
    recommendedSpecialist: 'Infectious Disease / Critical Care Specialist',
    clinicalNotes: 'Requires emergent diagnostic lumbar puncture and immediate empiric broad-spectrum intravenous antibiotic/antiviral administration.',
    lifestyleGuidance: [
      'IMMEDIATE emergency transfer via ambulance is mandatory.'
    ],
    warningSigns: ['Inability to flex neck forward', 'Non-blanching petechial purpuric skin rash', 'Altered level of consciousness or seizures']
  },
  {
    id: 'acute_gastroenteritis',
    name: 'Acute Gastroenteritis ("Stomach Flu")',
    category: 'Gastrointestinal',
    severity: 'moderate',
    riskLevel: 'medium',
    triageLevel: 'Primary Care / Urgent Care',
    description: 'Infectious inflammation of the stomach and small intestine leading to acute diarrhea, emesis, and risk of electrolyte depletion.',
    requiredSymptoms: ['diarrhea_watery', 'nausea'],
    characteristicSymptoms: ['diarrhea_watery', 'vomiting', 'nausea', 'abdominal_pain_epigastric', 'fever_mild'],
    optionalSymptoms: ['muscle_aches', 'fatigue_profound', 'chills_sweats', 'bloating'],
    weightMultiplier: 1.15,
    recommendedSpecialist: 'Gastroenterologist / General Physician',
    clinicalNotes: 'Fluid and electrolyte replacement with oral rehydration salts (ORS) is the cornerstone of therapy.',
    lifestyleGuidance: [
      'Sip Oral Rehydration Salt (ORS) solutions steadily throughout the day.',
      'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) once vomiting subsides.',
      'Avoid dairy, fatty meals, and high-sugar juices during recovery.'
    ],
    warningSigns: ['Inability to retain liquids for > 24 hours', 'Signs of severe dehydration (sunken eyes, anuria)', 'Blood in stool (melena or hematochezia)']
  },
  {
    id: 'rheumatoid_arthritis_flare',
    name: 'Inflammatory Arthritis (Rheumatoid / Autoimmune Flare)',
    category: 'Musculoskeletal',
    severity: 'moderate',
    riskLevel: 'medium',
    triageLevel: 'Rheumatology Specialty Consultation',
    description: 'Systemic autoimmune disorder causing chronic inflammatory synovitis and symmetric joint destruction.',
    requiredSymptoms: ['joint_pain_swelling'],
    characteristicSymptoms: ['joint_pain_swelling', 'muscle_aches', 'fatigue_profound', 'fever_mild'],
    optionalSymptoms: ['skin_rash_itchy', 'unexplained_weight_loss'],
    weightMultiplier: 1.1,
    recommendedSpecialist: 'Rheumatologist',
    clinicalNotes: 'Early intervention with Disease-Modifying Anti-Rheumatic Drugs (DMARDs) and biologics preserves joint integrity and functional mobility.',
    lifestyleGuidance: [
      'Incorporate low-impact physical therapy and warm hydrotherapy.',
      'Adopt an anti-inflammatory diet rich in omega-3 fatty acids.',
      'Balance gentle range-of-motion exercises with adequate joint rest.'
    ],
    warningSigns: ['Rapid joint deformity or hot, exquisitely tender monoarticular joint (rule out septic arthritis)', 'Ocular pain or vision changes']
  },
  {
    id: 'allergic_urticaria',
    name: 'Acute Allergic Reaction / Urticaria',
    category: 'Dermatological / Immunology',
    severity: 'moderate',
    riskLevel: 'medium',
    triageLevel: 'Urgent Care / Allergy Specialist',
    description: 'Mast-cell mediated cutaneous reaction presenting with erythematous pruritic wheals, triggered by allergens, medications, or infections.',
    requiredSymptoms: ['hives', 'skin_rash_itchy'],
    characteristicSymptoms: ['hives', 'skin_rash_itchy', 'runny_nose'],
    optionalSymptoms: ['shortness_of_breath', 'wheezing', 'abdominal_pain_epigastric', 'nausea'],
    weightMultiplier: 1.2,
    recommendedSpecialist: 'Allergist / Immunologist',
    clinicalNotes: 'Second-generation non-sedating H1-antihistamines (cetirizine, fexofenadine). If accompanied by respiratory or laryngeal edema, epinephrine is mandatory for anaphylaxis.',
    lifestyleGuidance: [
      'Avoid scratching to prevent secondary excoriation and bacterial cellulitis.',
      'Take cool showers and apply soothing calamine lotion.',
      'Identify and discontinue newly introduced foods, medications, or cosmetics.'
    ],
    warningSigns: ['Swelling of tongue, lips, or throat (Angioedema)', 'Audible wheezing or feeling faint (Anaphylaxis risk - Administer EpiPen & call 911)']
  }
];
