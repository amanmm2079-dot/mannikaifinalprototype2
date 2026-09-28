/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized, Transparent & Deterministic Operational Distress Scoring Engine
 * 
 * IMPORTANT NOTICE:
 * This calculation is an Operational Distress Index / AI-Assisted Decision Support Indicator.
 * It is NOT a clinical, medical, or psychiatric diagnosis.
 * It provides auditable, deterministic signal aggregation to assist authorized human reviewers.
 */

export interface ScoringFactorConfig {
  weight: number;
  maxScore: number;
  description: string;
}

export interface ScoringConfiguration {
  version: string;
  maxPossibleWeightedScore: number;
  factors: {
    sleepDistress: ScoringFactorConfig;
    safetyFeelDistress: ScoringFactorConfig;
    overwhelmDistress: ScoringFactorConfig;
    socialIsolationDistress: ScoringFactorConfig;
    somaticSymptoms: ScoringFactorConfig;
    recentThreats: ScoringFactorConfig;
    engagementDrop: ScoringFactorConfig;
    acousticTension: ScoringFactorConfig;
  };
  thresholds: {
    low: number;       // < 3.50
    moderate: number;  // 3.50 - 6.49
    high: number;      // 6.50 - 8.49
    urgent: number;    // >= 8.50
  };
  trajectoryThresholds: {
    rapidChangeDelta: number; // >= 1.5 within 72 hours
    increasingDelta: number;  // > 0.4
    decreasingDelta: number;  // < -0.4
  };
}

export const SCORING_CONFIG: ScoringConfiguration = {
  version: '1.0.0',
  maxPossibleWeightedScore: 10.0,
  factors: {
    sleepDistress: {
      weight: 1.0,
      maxScore: 1.5,
      description: 'Sleep quality disruption and trauma-induced nightmares (1-5 rating)',
    },
    safetyFeelDistress: {
      weight: 1.0,
      maxScore: 2.2,
      description: 'Perceived immediate personal safety & physical environment security (1-5 rating)',
    },
    overwhelmDistress: {
      weight: 1.0,
      maxScore: 1.8,
      description: 'Acute emotional overload, panic symptoms, and cognitive overwhelm (1-5 rating)',
    },
    socialIsolationDistress: {
      weight: 1.0,
      maxScore: 1.0,
      description: 'Absence of trusted family, community, or legal advocacy contacts (1-5 rating)',
    },
    somaticSymptoms: {
      weight: 1.0,
      maxScore: 1.0,
      description: 'Reported physical stress manifestations (tremors, palpitations, headaches, breathlessness)',
    },
    recentThreats: {
      weight: 1.0,
      maxScore: 1.5,
      description: 'Documented external intimidation, physical threats, or court-witness coercion',
    },
    engagementDrop: {
      weight: 1.0,
      maxScore: 1.0,
      description: 'Consecutive scheduled check-in absences indicating isolation or incapacitation',
    },
    acousticTension: {
      weight: 1.0,
      maxScore: 1.0,
      description: 'Vocal acoustic markers (vocal frequency jitter > 2.8% or high pause density)',
    },
  },
  thresholds: {
    low: 3.50,
    moderate: 6.50,
    high: 8.50,
    urgent: 8.50,
  },
  trajectoryThresholds: {
    rapidChangeDelta: 1.50,
    increasingDelta: 0.40,
    decreasingDelta: -0.40,
  },
};

export interface ScoreHistoryEntry {
  id: string;
  caseId: string;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'URGENT';
  scoringVersion: string;
  source: string;
  calculatedAt: string;
  timeWindowHours?: number;
}

export interface CaseScoringInput {
  caseId: string;
  sleepScore?: number;          // 1-5 (1=severe insomnia/nightmares, 5=restful)
  safetyScore?: number;         // 1-5 (1=severe imminent danger, 5=completely safe)
  overwhelmScore?: number;      // 1-5 (1=calm, 5=severe acute panic)
  socialConnectionScore?: number; // 1-5 (1=isolated, 5=strongly supported)
  physicalSymptoms?: string[];
  recentThreatReported?: boolean;
  threatDetails?: string;
  consecutiveMissedCheckIns?: number;
  voiceStressJitter?: number;   // Jitter percentage (e.g. 1.2% - 4.8%)
  textDistressKeywords?: string[];
  historyMeasurements?: ScoreHistoryEntry[];
  observationTimestamp?: string;
}

export interface FactorBreakdown {
  id: string;
  name: string;
  rawInputValue: string | number;
  observedScore: number;
  maxScore: number;
  weight: number;
  contribution: number;
  reason: string;
}

export interface CalculationResult {
  score: number;             // Formatted to 2 decimal places e.g. 7.35
  normalizedScore: number;   // Stored numeric precision
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'URGENT';
  trajectory: 'STABLE' | 'INCREASING' | 'DECREASING' | 'RAPID_CHANGE' | 'INSUFFICIENT_DATA';
  trajectoryDetails: {
    previousScore?: number;
    delta?: number;
    hoursObserved?: number;
    interpretation: string;
  };
  priority: 'normal' | 'high' | 'urgent';
  contributingFactors: string[];
  factorBreakdown: FactorBreakdown[];
  explanation: string;
  requiresHumanReview: boolean;
  scoringVersion: string;
  calculatedAt: string;
  suggestedAction: string;
}

/**
 * Consistently format the operational score for display across all components
 */
export function formatDistressScore(score: number): string {
  if (isNaN(score) || score === null || score === undefined) return '0.00 / 10';
  return `${score.toFixed(2)} / 10`;
}

/**
 * Format score number alone to two decimal points
 */
export function formatScoreNumber(score: number): string {
  if (isNaN(score) || score === null || score === undefined) return '0.00';
  return score.toFixed(2);
}

/**
 * Deterministic Calculation of the Operational Distress Index
 */
export function calculateOperationalDistress(
  input: CaseScoringInput,
  config: ScoringConfiguration = SCORING_CONFIG
): CalculationResult {
  const breakdown: FactorBreakdown[] = [];
  const contributingFactors: string[] = [];
  const timestamp = input.observationTimestamp || new Date().toISOString();

  // 1. Sleep Quality Factor (1-5 where 1 is worst, 5 is best)
  const sleepRaw = Math.max(1, Math.min(5, input.sleepScore ?? 3));
  const sleepDistress = (5 - sleepRaw) / 4.0; // 0.0 to 1.0
  const sleepContribution = Number((sleepDistress * config.factors.sleepDistress.maxScore).toFixed(3));
  breakdown.push({
    id: 'sleepDistress',
    name: 'Sleep Disruption & Insomnia',
    rawInputValue: `${sleepRaw} / 5`,
    observedScore: sleepContribution,
    maxScore: config.factors.sleepDistress.maxScore,
    weight: config.factors.sleepDistress.weight,
    contribution: sleepContribution,
    reason: sleepRaw <= 2 
      ? 'Severe sleep disruption or trauma nightmares reported' 
      : sleepRaw <= 3 
      ? 'Moderate sleep fragmentation' 
      : 'Restful sleep reported',
  });
  if (sleepRaw <= 2) {
    contributingFactors.push('Severe sleep disruption or recurring nightmares');
  }

  // 2. Safety Perception Factor (1-5 where 1 is severe threat, 5 is completely safe)
  const safetyRaw = Math.max(1, Math.min(5, input.safetyScore ?? 3));
  const safetyDistress = (5 - safetyRaw) / 4.0;
  const safetyContribution = Number((safetyDistress * config.factors.safetyFeelDistress.maxScore).toFixed(3));
  breakdown.push({
    id: 'safetyFeelDistress',
    name: 'Perceived Personal & Environmental Safety',
    rawInputValue: `${safetyRaw} / 5`,
    observedScore: safetyContribution,
    maxScore: config.factors.safetyFeelDistress.maxScore,
    weight: config.factors.safetyFeelDistress.weight,
    contribution: safetyContribution,
    reason: safetyRaw <= 2 
      ? 'Significant drop in perceived personal and residential safety' 
      : safetyRaw <= 3 
      ? 'Elevated caution regarding personal safety' 
      : 'Secure baseline environment reported',
  });
  if (safetyRaw <= 2) {
    contributingFactors.push('Acute drop in personal safety perception');
  }

  // 3. Emotional Overwhelm (1-5 where 1 is calm, 5 is severe panic/crisis)
  const overwhelmRaw = Math.max(1, Math.min(5, input.overwhelmScore ?? 2));
  const overwhelmDistress = (overwhelmRaw - 1) / 4.0;
  const overwhelmContribution = Number((overwhelmDistress * config.factors.overwhelmDistress.maxScore).toFixed(3));
  breakdown.push({
    id: 'overwhelmDistress',
    name: 'Cognitive & Emotional Overwhelm',
    rawInputValue: `${overwhelmRaw} / 5`,
    observedScore: overwhelmContribution,
    maxScore: config.factors.overwhelmDistress.maxScore,
    weight: config.factors.overwhelmDistress.weight,
    contribution: overwhelmContribution,
    reason: overwhelmRaw >= 4 
      ? 'Acute cognitive overload and acute anxiety load reported' 
      : overwhelmRaw >= 3 
      ? 'Moderate stress load identified' 
      : 'Coping mechanism within manageable capacity',
  });
  if (overwhelmRaw >= 4) {
    contributingFactors.push('High emotional overwhelm and panic symptoms');
  }

  // 4. Social Connection (1-5 where 1 is completely isolated, 5 is well supported)
  const socialRaw = Math.max(1, Math.min(5, input.socialConnectionScore ?? 3));
  const socialDistress = (5 - socialRaw) / 4.0;
  const socialContribution = Number((socialDistress * config.factors.socialIsolationDistress.maxScore).toFixed(3));
  breakdown.push({
    id: 'socialIsolationDistress',
    name: 'Support System & Social Connection',
    rawInputValue: `${socialRaw} / 5`,
    observedScore: socialContribution,
    maxScore: config.factors.socialIsolationDistress.maxScore,
    weight: config.factors.socialIsolationDistress.weight,
    contribution: socialContribution,
    reason: socialRaw <= 2 
      ? 'Acute social alienation, boycott, or absence of trusted advocates' 
      : socialRaw <= 3 
      ? 'Limited supportive contacts available' 
      : 'Active family/advocate support present',
  });
  if (socialRaw <= 2) {
    contributingFactors.push('Social isolation or lack of local trusted support network');
  }

  // 5. Somatic & Physical Symptoms
  const symptomsCount = input.physicalSymptoms?.length || 0;
  const somaticScore = Math.min(config.factors.somaticSymptoms.maxScore, symptomsCount * 0.35);
  const somaticContribution = Number(somaticScore.toFixed(3));
  breakdown.push({
    id: 'somaticSymptoms',
    name: 'Somatic & Autonomic Manifestations',
    rawInputValue: `${symptomsCount} symptoms`,
    observedScore: somaticContribution,
    maxScore: config.factors.somaticSymptoms.maxScore,
    weight: config.factors.somaticSymptoms.weight,
    contribution: somaticContribution,
    reason: symptomsCount > 0 
      ? `Reported: ${input.physicalSymptoms?.slice(0, 3).join(', ')}` 
      : 'No somatic distress symptoms flagged',
  });
  if (symptomsCount >= 2) {
    contributingFactors.push(`Multiple somatic distress symptoms: ${input.physicalSymptoms?.slice(0, 3).join(', ')}`);
  }

  // 6. Recent Intimidation / Threats
  let threatContribution = 0;
  if (input.recentThreatReported) {
    threatContribution = config.factors.recentThreats.maxScore;
    contributingFactors.push(input.threatDetails || 'External intimidation or witness coercion reported');
  }
  breakdown.push({
    id: 'recentThreats',
    name: 'External Threats & Intimidation',
    rawInputValue: input.recentThreatReported ? 'Yes' : 'None',
    observedScore: threatContribution,
    maxScore: config.factors.recentThreats.maxScore,
    weight: config.factors.recentThreats.weight,
    contribution: threatContribution,
    reason: input.recentThreatReported 
      ? (input.threatDetails || 'Active threat/intimidation event recorded') 
      : 'No current threats reported in observation window',
  });

  // 7. Consecutive Missed Check-ins (Engagement Blackout)
  const missedCount = Math.max(0, input.consecutiveMissedCheckIns ?? 0);
  let missedContribution = 0;
  if (missedCount >= 2) {
    missedContribution = Math.min(config.factors.engagementDrop.maxScore, (missedCount - 1) * 0.5);
    contributingFactors.push(`${missedCount} consecutive scheduled check-ins missed without prior notice`);
  }
  breakdown.push({
    id: 'engagementDrop',
    name: 'Engagement Blackout & Missed Check-Ins',
    rawInputValue: `${missedCount} missed`,
    observedScore: missedContribution,
    maxScore: config.factors.engagementDrop.maxScore,
    weight: config.factors.engagementDrop.weight,
    contribution: missedContribution,
    reason: missedCount >= 2 
      ? `${missedCount} consecutive check-ins missed` 
      : 'Regular engagement pattern maintained',
  });

  // 8. Acoustic Tension / Vocal Micro-Tremor
  let acousticContribution = 0;
  const jitter = input.voiceStressJitter ?? 1.2;
  if (jitter > 2.8) {
    const jitterExcess = Math.min(1.0, (jitter - 2.8) / 2.0);
    acousticContribution = Number((jitterExcess * config.factors.acousticTension.maxScore).toFixed(3));
    contributingFactors.push(`Acoustic vocal micro-tremor (${jitter.toFixed(1)}%) indicates somatic vocal tension`);
  }
  breakdown.push({
    id: 'acousticTension',
    name: 'Acoustic & Voice Stress Analysis',
    rawInputValue: `${jitter.toFixed(1)}% jitter`,
    observedScore: acousticContribution,
    maxScore: config.factors.acousticTension.maxScore,
    weight: config.factors.acousticTension.weight,
    contribution: acousticContribution,
    reason: jitter > 2.8 
      ? `Acoustic tremor ${jitter.toFixed(1)}% exceeds baseline threshold (2.8%)` 
      : 'Vocal stability within relaxed conversational range',
  });

  // Sum all factor contributions
  const rawSum = breakdown.reduce((acc, f) => acc + f.contribution, 0);

  // Maximum possible score across all factors
  const maxPossible = Object.values(config.factors).reduce((acc, f) => acc + f.maxScore * f.weight, 0);

  // Deterministic Normalization to 0.0 - 10.0 scale
  const rawNormalized = (rawSum / maxPossible) * 10.0;
  const clampedNormalized = Math.max(0.0, Math.min(10.0, rawNormalized));
  const finalDisplayScore = Number(clampedNormalized.toFixed(2));

  // Determine Level strictly based on configured operational thresholds
  let level: 'LOW' | 'MODERATE' | 'HIGH' | 'URGENT' = 'LOW';
  if (finalDisplayScore >= config.thresholds.urgent) {
    level = 'URGENT';
  } else if (finalDisplayScore >= config.thresholds.moderate) {
    level = 'HIGH';
  } else if (finalDisplayScore >= config.thresholds.low) {
    level = 'MODERATE';
  } else {
    level = 'LOW';
  }

  // Trajectory Calculation from historical measurements
  let trajectory: 'STABLE' | 'INCREASING' | 'DECREASING' | 'RAPID_CHANGE' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';
  let delta: number | undefined;
  let previousScore: number | undefined;
  let hoursObserved: number | undefined;
  let interpretation = 'Baseline measurement (first observation recorded).';

  if (input.historyMeasurements && input.historyMeasurements.length > 0) {
    // Sort descending by calculatedAt
    const sorted = [...input.historyMeasurements].sort((a, b) => 
      new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    );
    const prev = sorted[0];
    previousScore = prev.score;
    delta = Number((finalDisplayScore - prev.score).toFixed(2));

    const currentTime = new Date(timestamp).getTime();
    const prevTime = new Date(prev.calculatedAt).getTime();
    hoursObserved = Math.max(1, Math.round((currentTime - prevTime) / (1000 * 60 * 60)));

    if (delta >= config.trajectoryThresholds.rapidChangeDelta && hoursObserved <= 72) {
      trajectory = 'RAPID_CHANGE';
      interpretation = `Rapid escalation of +${delta.toFixed(2)} observed within ${hoursObserved} hours.`;
      contributingFactors.unshift(`Rapid score escalation (+${delta.toFixed(2)}) within ${hoursObserved}h observation window`);
    } else if (delta > config.trajectoryThresholds.increasingDelta) {
      trajectory = 'INCREASING';
      interpretation = `Gradual distress increase of +${delta.toFixed(2)} over ${hoursObserved} hours.`;
    } else if (delta < config.trajectoryThresholds.decreasingDelta) {
      trajectory = 'DECREASING';
      interpretation = `Distress indicator decreased by ${Math.abs(delta).toFixed(2)} points (positive stabilization trend).`;
    } else {
      trajectory = 'STABLE';
      interpretation = `Score variation within baseline limits (delta: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}).`;
    }
  }

  // Operational Priority MUST NOT EQUAL SCORE ONLY.
  // Priority considers threat reporting, rapid trajectory, and high score.
  let priority: 'normal' | 'high' | 'urgent' = 'normal';
  if (input.recentThreatReported || trajectory === 'RAPID_CHANGE' || finalDisplayScore >= config.thresholds.urgent) {
    priority = 'urgent';
  } else if (finalDisplayScore >= config.thresholds.moderate || trajectory === 'INCREASING' || missedCount >= 2) {
    priority = 'high';
  } else {
    priority = 'normal';
  }

  // Human Review is required if score is high/urgent, or if rapid change / threat detected
  const requiresHumanReview = priority === 'urgent' || priority === 'high' || input.recentThreatReported === true;

  if (contributingFactors.length === 0) {
    contributingFactors.push('All recorded indicators remain within nominal baseline limits.');
  }

  const explanation = `Calculated Operational Distress Index of ${formatDistressScore(finalDisplayScore)} (${level}) based on ${breakdown.length} structured input factors. Scoring engine v${config.version}. Trajectory: ${trajectory}. Human validation is ${requiresHumanReview ? 'REQUIRED' : 'optional'}.`;

  let suggestedAction = 'Continue routine weekly check-in monitoring.';
  if (priority === 'urgent') {
    suggestedAction = 'Immediate human counsellor outreach & District Witness Protection evaluation required.';
  } else if (priority === 'high') {
    suggestedAction = 'Schedule clinical review within 24 hours; verify safe shelter and legal aid needs.';
  }

  return {
    score: finalDisplayScore,
    normalizedScore: clampedNormalized,
    level,
    trajectory,
    trajectoryDetails: {
      previousScore,
      delta,
      hoursObserved,
      interpretation,
    },
    priority,
    contributingFactors,
    factorBreakdown: breakdown,
    explanation,
    requiresHumanReview,
    scoringVersion: config.version,
    calculatedAt: timestamp,
    suggestedAction,
  };
}

/**
 * Deduplicated Operational Alert Generator
 */
export interface OperationalAlert {
  alertId: string;
  caseId: string;
  type: 'ACUTE_SPIKE' | 'THREAT_REPORTED' | 'ENGAGEMENT_BLACKOUT' | 'HIGH_DISTRESS' | 'SOMATIC_CRISIS';
  severity: 'urgent' | 'high' | 'moderate';
  reason: string;
  contributingFactors: string[];
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export function generateOperationalAlerts(
  result: CalculationResult,
  caseId: string,
  existingAlerts: OperationalAlert[] = []
): OperationalAlert[] {
  const newAlerts: OperationalAlert[] = [];
  const todayDate = result.calculatedAt.slice(0, 10);

  // 1. Rapid Change Alert
  if (result.trajectory === 'RAPID_CHANGE') {
    const alertId = `ALT-RAPID-${caseId}-${todayDate}`;
    const alreadyExists = existingAlerts.some(a => a.alertId === alertId || (a.type === 'ACUTE_SPIKE' && a.status === 'OPEN'));
    if (!alreadyExists) {
      newAlerts.push({
        alertId,
        caseId,
        type: 'ACUTE_SPIKE',
        severity: 'urgent',
        reason: `Operational Distress Index experienced rapid escalation (+${result.trajectoryDetails.delta?.toFixed(2)}) within observation period.`,
        contributingFactors: result.contributingFactors,
        createdAt: result.calculatedAt,
        status: 'OPEN',
      });
    }
  }

  // 2. High or Urgent Distress Threshold Alert
  if (result.level === 'URGENT' || result.level === 'HIGH') {
    const alertId = `ALT-LEVEL-${caseId}-${todayDate}`;
    const alreadyExists = existingAlerts.some(a => a.alertId === alertId || (a.type === 'HIGH_DISTRESS' && a.status === 'OPEN'));
    if (!alreadyExists) {
      newAlerts.push({
        alertId,
        caseId,
        type: 'HIGH_DISTRESS',
        severity: result.level === 'URGENT' ? 'urgent' : 'high',
        reason: `Operational Distress Index crossed threshold at ${result.score.toFixed(2)} / 10 (${result.level}).`,
        contributingFactors: result.contributingFactors,
        createdAt: result.calculatedAt,
        status: 'OPEN',
      });
    }
  }

  return newAlerts;
}
