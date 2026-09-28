import { CheckIn, RiskAssessment, RiskState, ScoreTrajectory, ThresholdConfig } from '../types';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  lowBandMax: 3.5,
  moderateBandMax: 6.5,
  highBandMax: 8.4,
  urgentBandMin: 8.5,
  escalationDeltaWarning: 1.8,
  missedCheckInsEscalationCount: 2,
  voiceJitterThresholdPercent: 3.2,
};

// Linguistic markers across Indian English and romanized/regional terms
const DISTRESS_KEYWORDS = [
  'scared', 'fear', 'threat', 'unsafe', 'cant sleep', "can't sleep", 'hopeless', 
  'isolated', 'attack', 'panic', 'shivering', 'crying', 'darr', 'chinta', 
  'madad', 'help', 'threatened', 'afraid', 'nightmare', 'trembling', 'alone',
  'suffocated', 'danger', 'shame', 'pain', 'nowhere to go', 'marpit', 'police'
];

const PROTECTIVE_KEYWORDS = [
  'safe', 'better', 'slept well', 'peaceful', 'hope', 'support', 'calm',
  'family', 'helped', 'relieved', 'okay', 'good', 'shanti', 'theek'
];

/**
 * Evaluates linguistic signals from victim input
 */
export function analyzeTextSignals(text: string): {
  distressKeywordHits: string[];
  protectiveHits: string[];
  distressSignalScore: number; // 0.0 - 3.0 added weight
} {
  const lower = text.toLowerCase();
  const distressKeywordHits = DISTRESS_KEYWORDS.filter(k => lower.includes(k));
  const protectiveHits = PROTECTIVE_KEYWORDS.filter(k => lower.includes(k));

  let distressSignalScore = distressKeywordHits.length * 0.7;
  distressSignalScore -= protectiveHits.length * 0.5;
  distressSignalScore = Math.max(0, Math.min(3.0, distressSignalScore));

  return { distressKeywordHits, protectiveHits, distressSignalScore };
}

/**
 * Calculates the Dynamic Distress Score (0.0 to 10.0) from multimodal inputs
 */
export function calculateDynamicDistressScore(
  answers: CheckIn['answers'],
  text: string,
  audioFeatures?: CheckIn['audioFeatures'],
  consecutiveMissedCheckIns: number = 0
): {
  score: number;
  contributingFactors: string[];
} {
  const factors: string[] = [];

  // 1. Structured baseline (up to 5.0 pts)
  // sleepQuality (1-5, where 1 is severe insomnia/nightmares, 5 is restful)
  const sleep = answers.sleepQuality ?? 3;
  const sleepDistress = (5 - sleep) * 0.35; // 0 to 1.4
  if (sleep <= 2) factors.push('Severe sleep disturbance or trauma-related nightmares reported');

  // safetyFeel (1-5, where 1 is imminent threat, 5 is completely secure)
  const safety = answers.safetyFeel ?? 3;
  const safetyDistress = (5 - safety) * 0.55; // 0 to 2.2
  if (safety <= 2) factors.push('Significant drop in perceived personal and environmental safety');

  // overwhelmLevel (1-5, where 1 is calm, 5 is overwhelming panic/distress)
  const overwhelm = answers.overwhelmLevel ?? 2;
  const overwhelmDistress = (overwhelm - 1) * 0.45; // 0 to 1.8
  if (overwhelm >= 4) factors.push('Acute cognitive overwhelm and distress load reported');

  // socialConnection (1-5, where 1 is total isolation, 5 is strong support)
  const social = answers.socialConnection ?? 3;
  const socialDistress = (5 - social) * 0.25; // 0 to 1.0
  if (social <= 2) factors.push('Social disconnection and lack of trusted immediate contact');

  // Physical symptoms
  if (answers.physicalSymptoms && answers.physicalSymptoms.length > 0) {
    factors.push(`Somatic distress markers identified: ${answers.physicalSymptoms.join(', ')}`);
  }

  // 2. Text Analysis (up to 2.5 pts)
  const textSignals = analyzeTextSignals(text);
  if (textSignals.distressKeywordHits.length > 0) {
    factors.push(`Distress linguistic cues detected: "${textSignals.distressKeywordHits.slice(0, 3).join(', ')}"`);
  }

  // 3. Audio Prosody & Acoustic Stress (up to 2.0 pts)
  let voiceDistressWeight = 0;
  if (audioFeatures) {
    if (audioFeatures.microTremorJitter > 2.8) {
      voiceDistressWeight += 0.8;
      factors.push(`Vocal frequency micro-tremor (${audioFeatures.microTremorJitter.toFixed(1)}%) indicates vocal cord muscle tension`);
    }
    if (audioFeatures.pauseDensity > 35) {
      voiceDistressWeight += 0.6;
      factors.push(`High hesitation and prolonged silent pause density (${audioFeatures.pauseDensity}%)`);
    }
    if (audioFeatures.speechRateWpm < 90 || audioFeatures.speechRateWpm > 180) {
      voiceDistressWeight += 0.4;
      factors.push(`Atypical speech cadence (${audioFeatures.speechRateWpm} WPM) detected`);
    }
  }

  // 4. Behavioural & Engagement: Missed check-ins
  let missedCheckInWeight = 0;
  if (consecutiveMissedCheckIns >= 2) {
    missedCheckInWeight = Math.min(2.0, consecutiveMissedCheckIns * 0.6);
    factors.push(`${consecutiveMissedCheckIns} consecutive scheduled check-ins missed without prior notice`);
  }

  // Aggregate raw total
  let rawScore = (sleepDistress + safetyDistress + overwhelmDistress + socialDistress) 
    + textSignals.distressSignalScore 
    + voiceDistressWeight 
    + missedCheckInWeight;

  // Normalize strictly between 0.0 and 10.0
  const normalizedScore = Math.min(10.0, Math.max(0.0, Number(rawScore.toFixed(1))));

  if (factors.length === 0) {
    factors.push('Distress indices remain within nominal baseline bounds');
  }

  return {
    score: normalizedScore,
    contributingFactors: factors,
  };
}

/**
 * Longitudinal trajectory and escalation evaluation
 */
export function evaluateRiskAssessment(
  caseId: string,
  currentScore: number,
  previousScore: number,
  contributingFactors: string[],
  consecutiveMissedCheckIns: number = 0,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): RiskAssessment {
  const scoreChange = Number((currentScore - previousScore).toFixed(1));
  
  let trajectory: ScoreTrajectory = 'stable';
  if (scoreChange >= thresholds.escalationDeltaWarning) {
    trajectory = 'acute_spike';
  } else if (scoreChange > 0.4) {
    trajectory = 'gradual_increase';
  } else if (scoreChange < -0.4) {
    trajectory = 'improving';
  }

  let riskState: RiskState = 'low';
  if (currentScore >= thresholds.urgentBandMin || trajectory === 'acute_spike') {
    riskState = 'urgent';
  } else if (currentScore >= thresholds.highBandMax) {
    riskState = 'high';
  } else if (currentScore > thresholds.lowBandMax) {
    riskState = 'moderate';
  }

  // Predictive escalation flag triggers before catastrophic event
  const escalationFlag = 
    riskState === 'urgent' || 
    riskState === 'high' || 
    trajectory === 'acute_spike' || 
    consecutiveMissedCheckIns >= thresholds.missedCheckInsEscalationCount;

  // Add trajectory factor explanation
  const augmentedFactors = [...contributingFactors];
  if (scoreChange > 0.8) {
    augmentedFactors.unshift(`Dynamic score escalated by +${scoreChange} since prior check-in`);
  } else if (scoreChange < -0.8) {
    augmentedFactors.unshift(`Distress score decreased by ${scoreChange} points (positive recovery trend)`);
  }

  return {
    id: `RISK-${Date.now().toString().slice(-6)}`,
    caseId,
    score: currentScore,
    previousScore,
    scoreChange,
    riskState,
    escalationFlag,
    confidence: Math.round(82 + Math.min(15, contributingFactors.length * 3)),
    trajectory,
    contributingFactors: augmentedFactors,
    modelVersion: 'Mannik-AcousticNLP-v2.6',
    humanReviewRequired: riskState === 'high' || riskState === 'urgent' || escalationFlag,
    createdAt: new Date().toISOString(),
  };
}
