import { LanguageCode } from './index';

export interface QuestionnaireResponses {
  // Section A: Emotional Well-being
  emotionalState: 'peaceful' | 'managing' | 'anxious' | 'distressed' | 'overwhelmed';
  stressLevel: number; // 1-10 slider
  feelingOverwhelmed: 'not_at_all' | 'several_days' | 'more_than_half' | 'nearly_every_day';
  feelingSafe: 'completely_safe' | 'mostly_safe' | 'somewhat_unsafe' | 'in_danger';
  abilityToConcentrate: 'normal' | 'slight_difficulty' | 'severe_difficulty';
  sleepQuality: 'restful' | 'interrupted' | 'nightmares_insomnia' | 'severe_sleep_loss';
  energyLevel: 'energetic' | 'moderate' | 'low' | 'exhausted';

  // Section B: Daily Functioning
  performNormalActivities: 'easily' | 'with_effort' | 'unable_to_do_most';
  appetiteRoutine: 'regular' | 'skipped_meals' | 'loss_of_appetite';
  socialInteraction: 'connected' | 'limited' | 'avoiding_everyone' | 'isolated';
  studyOrWork: 'attending' | 'struggling' | 'stopped';
  routineChanges: string[]; // e.g. ["staying_indoors", "fear_of_leaving_home", "frequent_crying"]

  // Section C: Case-Related Stress
  caseProceedingsStress: 'none' | 'moderate' | 'high' | 'severe';
  stressDueToDelays: 'yes' | 'somewhat' | 'no';
  difficultyAttendingProceedings: 'no_difficulty' | 'financial_difficulty' | 'intimidation_fear' | 'travel_distance';
  feelingSupportedInProcess: 'fully_supported' | 'somewhat_supported' | 'unsupported';
  caseProcessConcerns: string[]; // e.g. ["perpetrator_bail", "witness_intimidation", "lawyer_communication"]

  // Section D: Safety & Support
  currentlyFeelSafe: 'yes' | 'no' | 'unsure';
  needCounsellorSupport: boolean;
  needLegalAssistance: boolean;
  needFinancialRelief: boolean;
  needRehabilitationSupport: boolean;
  wantSupportTeamContact: boolean;
  preferredContactMethod?: 'phone_call' | 'in_person' | 'sms' | 'app_message';

  // Section E: Additional Context
  optionalTextNotes?: string;
}

export interface StoredAssessmentRecord {
  assessmentId: string;
  caseId: string;
  userId: string;
  responses: QuestionnaireResponses;
  submittedAt: string;
  language: LanguageCode;
  completionPercentage: number;
  source: 'web_questionnaire' | 'voice_checkin' | 'mobile_app';
  version: string; // e.g. "v2.1-comprehensive"
  calculatedDistressScore: number;
  riskBand: 'low' | 'moderate' | 'high' | 'urgent';
  contributingFactors: string[];
}

export interface SupportRequest {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  type: 'counsellor' | 'legal' | 'financial' | 'general' | 'urgent_callback';
  urgency: 'routine' | 'priority' | 'urgent';
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
  notes?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
}

export interface SOSAlertRecord {
  sosId: string;
  caseId: string;
  userId: string;
  userAlias: string;
  timestamp: string;
  locationStatus: 'approximate_district' | 'browser_gps' | 'sandbox_demo';
  latitude?: number;
  longitude?: number;
  district: string;
  state: string;
  responderId: string;
  responderName: string;
  responderDistanceKm?: number;
  alertStatus: 'TRIGGERED' | 'ROUTING' | 'SENT' | 'ACKNOWLEDGED' | 'RESPONSE_IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  acknowledgedAt?: string;
  responseStartedAt?: string;
  resolvedAt?: string;
  source: 'web_sos_button' | 'mobile_sos_quick_action';
  auditReference: string;
  notes?: string;
}
