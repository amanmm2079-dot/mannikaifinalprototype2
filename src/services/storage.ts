import { 
  AtrocityCase, 
  AuditLogEntry, 
  CaseAlert, 
  CheckIn, 
  Intervention, 
  RiskAssessment, 
  SystemIntegrationStatus, 
  ThresholdConfig, 
  User, 
  UserRole,
  StoredAssessmentRecord
} from '../types';
import { calculateDynamicDistressScore, DEFAULT_THRESHOLDS, evaluateRiskAssessment } from './aiService';
import { canAccessView as verifyRoleAccess } from './authRoleSystem';

const CASES_STORAGE_KEY = 'mannik_ai_cases_v2';
const AUDIT_STORAGE_KEY = 'mannik_ai_audit_logs_v2';
const THRESHOLDS_STORAGE_KEY = 'mannik_ai_thresholds_v2';
const OFFLINE_QUEUE_KEY = 'mannik_ai_offline_queue_v2';
const CURRENT_USER_KEY = 'mannik_ai_current_user_v2';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-victim-01',
    name: 'Sunita D. (Protected Alias)',
    role: 'victim',
    language: 'hi',
    district: 'Pune',
    state: 'Maharashtra',
    loginId: 'CASE-MH-2026-109',
    passcode: '1234',
    sessionToken: 'tok-victim-sunita-9102',
  },
  {
    id: 'usr-victim-02',
    name: 'Pooja R. (Protected Alias)',
    role: 'victim',
    language: 'mr',
    district: 'Pune',
    state: 'Maharashtra',
    loginId: 'CASE-MH-2026-001',
    passcode: '1234',
    sessionToken: 'tok-victim-pooja-8812',
  },
  {
    id: 'usr-counsellor-01',
    name: 'Dr. Ananya Sen (Lead Clinical Counsellor)',
    role: 'counsellor',
    language: 'en',
    district: 'Pune',
    state: 'Maharashtra',
    assignedCasesCount: 14,
    loginId: 'counsellor@dmhp.gov.in',
    passcode: 'counsellor123',
    sessionToken: 'tok-counsellor-ananya-4491',
  },
  {
    id: 'usr-caseworker-01',
    name: 'Officer Rajesh Deshmukh (District Welfare Officer)',
    role: 'district_officer',
    language: 'mr',
    district: 'Pune',
    state: 'Maharashtra',
    assignedCasesCount: 28,
    loginId: 'welfare@pune.gov.in',
    passcode: 'welfare123',
    sessionToken: 'tok-caseworker-rajesh-7721',
  },
  {
    id: 'usr-state-admin-01',
    name: 'Shri Vikramaditya Patil (State Director, Social Justice)',
    role: 'state_admin',
    language: 'en',
    state: 'Maharashtra',
    loginId: 'admin@maharashtra.gov.in',
    passcode: 'state123',
    sessionToken: 'tok-state-patil-3312',
  },
  {
    id: 'usr-nat-admin-01',
    name: 'Joint Secretary Vandana Sharma (Ministry of Social Justice)',
    role: 'national_admin',
    language: 'en',
    loginId: 'admin@socialjustice.gov.in',
    passcode: 'national123',
    sessionToken: 'tok-nat-sharma-1190',
  },
  {
    id: 'usr-sys-admin-01',
    name: 'Kavita Nair (Lead Systems & Cryptographic Auditor)',
    role: 'auditor',
    language: 'en',
    loginId: 'sysadmin@mannik.gov.in',
    passcode: 'audit123',
    sessionToken: 'tok-sys-kavita-0021',
  },
];

// Initial synthetic cases covering realistic scenarios
const INITIAL_SYNTHETIC_CASES: AtrocityCase[] = [
  {
    id: 'CASE-MH-2026-109',
    victimAlias: 'Sunita D.',
    registrationChannel: 'app',
    district: 'Pune',
    state: 'Maharashtra',
    incidentType: 'Atrocity Act Sec 3(1)(r) & Physical Intimidation',
    preferredLanguage: 'hi',
    assignedCounsellorId: 'usr-counsellor-01',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerId: 'usr-caseworker-01',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    currentDistressScore: 9.1,
    previousDistressScore: 5.4,
    scoreChange: 3.7,
    riskState: 'urgent',
    trajectory: 'acute_spike',
    consecutiveMissedCheckIns: 0,
    lastCheckInDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    nextScheduledCheckIn: new Date(Date.now() + 86400000).toISOString(),
    status: 'under_human_review',
    consentGiven: true,
    isSyntheticDemo: true,
    historyCheckIns: [
      {
        id: 'chk-010',
        caseId: 'CASE-MH-2026-109',
        channel: 'voice',
        language: 'hi',
        textResponse: 'Mujhe bahut darr lag raha hai... kal raat ghar ke bahar log dhamki de rahe the. Baccho ko lekar kahan jaun?',
        answers: {
          sleepQuality: 1,
          safetyFeel: 1,
          overwhelmLevel: 5,
          socialConnection: 1,
          physicalSymptoms: ['Trembling hands', 'Insomnia', 'Chest tightness'],
        },
        audioFeatures: {
          pitchVariability: 46.2,
          microTremorJitter: 4.8,
          pauseDensity: 42,
          speechRateWpm: 82,
          voiceStressLevel: 'high',
        },
        distressScore: 9.1,
        analysisStatus: 'completed',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'chk-009',
        caseId: 'CASE-MH-2026-109',
        channel: 'chat',
        language: 'hi',
        textResponse: 'Thoda behtar tha pehle lekin ab wapas chinta shuru ho gayi hai.',
        answers: {
          sleepQuality: 3,
          safetyFeel: 3,
          overwhelmLevel: 3,
          socialConnection: 3,
        },
        distressScore: 5.4,
        analysisStatus: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'chk-008',
        caseId: 'CASE-MH-2026-109',
        channel: 'form',
        language: 'hi',
        textResponse: 'Normal lag raha tha, police FIR ke baad thoda hosla mila tha.',
        answers: {
          sleepQuality: 3,
          safetyFeel: 4,
          overwhelmLevel: 2,
          socialConnection: 4,
        },
        distressScore: 4.2,
        analysisStatus: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    ],
    recentAssessments: [
      {
        id: 'RSK-901',
        caseId: 'CASE-MH-2026-109',
        score: 9.1,
        previousScore: 5.4,
        scoreChange: 3.7,
        riskState: 'urgent',
        escalationFlag: true,
        confidence: 94,
        trajectory: 'acute_spike',
        contributingFactors: [
          'Acute score spike (+3.7) detected within 48h',
          'Vocal frequency micro-tremor (4.8%) indicates acute acoustic distress',
          'Direct mention of imminent retaliatory threats outside dwelling',
          'Perceived personal & familial safety score dropped to 1/5',
        ],
        modelVersion: 'Mannik-AcousticNLP-v2.6',
        humanReviewRequired: true,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ],
    activeAlerts: [
      {
        id: 'ALT-109-01',
        caseId: 'CASE-MH-2026-109',
        victimAlias: 'Sunita D.',
        district: 'Pune',
        state: 'Maharashtra',
        priority: 'urgent',
        status: 'new',
        currentDistressScore: 9.1,
        previousScore: 5.4,
        trajectory: 'acute_spike',
        reason: 'Acute Psychological Distress Spike (+3.7) with Reported Threat to Life',
        triggeringFactors: [
          'Acoustic tremor > 4.5%',
          'Reported nighttime intimidation by perpetrators',
          'Urgent human review required before dispatching protection unit',
        ],
        assignedCounsellorId: 'usr-counsellor-01',
        assignedCaseworkerId: 'usr-caseworker-01',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ],
    interventions: [
      {
        id: 'INT-109-A',
        caseId: 'CASE-MH-2026-109',
        victimAlias: 'Sunita D.',
        category: 'witness_protection',
        title: 'Emergency Witness Protection & Safe Relocation',
        recommendationReason: 'Imminent threat to life and children following testimony in atrocity special court.',
        priority: 'urgent',
        assignedDepartment: 'District Witness Protection Committee & SP Rural Police',
        status: 'recommended',
        targetDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        actionNotes: [
          {
            author: 'Mannik AI Engine',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            note: 'Preliminary intervention recommendation queued for Dr. Ananya Sen validation.',
          }
        ]
      }
    ]
  },
  {
    id: 'CASE-MH-2026-001',
    victimAlias: 'Pooja R.',
    registrationChannel: 'app',
    district: 'Pune',
    state: 'Maharashtra',
    incidentType: 'Atrocity Act Sec 3(1)(w) - Harassment',
    preferredLanguage: 'mr',
    assignedCounsellorId: 'usr-counsellor-01',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerId: 'usr-caseworker-01',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    currentDistressScore: 2.2,
    previousDistressScore: 2.6,
    scoreChange: -0.4,
    riskState: 'low',
    trajectory: 'stable',
    consecutiveMissedCheckIns: 0,
    lastCheckInDate: new Date(Date.now() - 86400000).toISOString(),
    nextScheduledCheckIn: new Date(Date.now() + 86400000 * 6).toISOString(),
    status: 'active_monitoring',
    consentGiven: true,
    isSyntheticDemo: true,
    historyCheckIns: [
      {
        id: 'chk-001',
        caseId: 'CASE-MH-2026-001',
        channel: 'chat',
        language: 'mr',
        textResponse: 'आज बरे वाटत आहे. समुपदेशक मॅडम सोबत बोलून खूप शांत वाटले. सुरक्षित वाटते आता.',
        answers: {
          sleepQuality: 4,
          safetyFeel: 5,
          overwhelmLevel: 1,
          socialConnection: 4,
        },
        distressScore: 2.2,
        analysisStatus: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'chk-002',
        caseId: 'CASE-MH-2026-001',
        channel: 'form',
        language: 'mr',
        textResponse: 'सर्व ठीक आहे.',
        answers: {
          sleepQuality: 4,
          safetyFeel: 4,
          overwhelmLevel: 2,
          socialConnection: 4,
        },
        distressScore: 2.6,
        analysisStatus: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      }
    ],
    recentAssessments: [],
    activeAlerts: [],
    interventions: [
      {
        id: 'INT-001-A',
        caseId: 'CASE-MH-2026-001',
        victimAlias: 'Pooja R.',
        category: 'counselling',
        title: 'Weekly Trauma Recovery Counselling',
        recommendationReason: 'Post-incident stabilization and somatic relaxation.',
        priority: 'routine',
        assignedDepartment: 'District Mental Health Programme (DMHP)',
        status: 'in_progress',
        targetDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        actionNotes: [
          {
            author: 'Dr. Ananya Sen',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            note: 'Session 3 completed. Patient reports significant reduction in startle response.',
          }
        ]
      }
    ]
  },
  {
    id: 'CASE-MH-2026-042',
    victimAlias: 'Ramesh K.',
    registrationChannel: 'sms',
    district: 'Pune',
    state: 'Maharashtra',
    incidentType: 'Atrocity Act Sec 3(1)(f) - Land Dispossession',
    preferredLanguage: 'hi',
    assignedCounsellorId: 'usr-counsellor-01',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerId: 'usr-caseworker-01',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    currentDistressScore: 6.8,
    previousDistressScore: 5.1,
    scoreChange: 1.7,
    riskState: 'high',
    trajectory: 'gradual_increase',
    consecutiveMissedCheckIns: 1,
    lastCheckInDate: new Date(Date.now() - 3600000 * 18).toISOString(),
    nextScheduledCheckIn: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'under_human_review',
    consentGiven: true,
    isSyntheticDemo: true,
    historyCheckIns: [
      {
        id: 'chk-042',
        caseId: 'CASE-MH-2026-042',
        channel: 'sms',
        language: 'hi',
        textResponse: 'Kheti par dabav badh gaya hai. Wakil sahab ki fees nahi de pa raha hoon. Bahut pareshaan hoon.',
        answers: {
          sleepQuality: 2,
          safetyFeel: 2,
          overwhelmLevel: 4,
          socialConnection: 2,
        },
        distressScore: 6.8,
        analysisStatus: 'completed',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      }
    ],
    recentAssessments: [
      {
        id: 'RSK-042',
        caseId: 'CASE-MH-2026-042',
        score: 6.8,
        previousScore: 5.1,
        scoreChange: 1.7,
        riskState: 'high',
        escalationFlag: true,
        confidence: 88,
        trajectory: 'gradual_increase',
        contributingFactors: [
          'Score increased by +1.7 across last two check-ins',
          'Financial distress linked to legal defense expenditures',
          'Elevated sleep disruption (2/5) and social alienation',
        ],
        modelVersion: 'Mannik-AcousticNLP-v2.6',
        humanReviewRequired: true,
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      }
    ],
    activeAlerts: [
      {
        id: 'ALT-042-01',
        caseId: 'CASE-MH-2026-042',
        victimAlias: 'Ramesh K.',
        district: 'Pune',
        state: 'Maharashtra',
        priority: 'high',
        status: 'under_review',
        currentDistressScore: 6.8,
        previousScore: 5.1,
        trajectory: 'gradual_increase',
        reason: 'Sustained Upward Distress Trajectory with Legal & Financial Strain',
        triggeringFactors: [
          'Financial exhaustion in court proceedings',
          'Gradual climb over 6.5 threshold band',
        ],
        assignedCounsellorId: 'usr-counsellor-01',
        assignedCaseworkerId: 'usr-caseworker-01',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      }
    ],
    interventions: [
      {
        id: 'INT-042-A',
        caseId: 'CASE-MH-2026-042',
        victimAlias: 'Ramesh K.',
        category: 'legal_aid',
        title: 'District Legal Services Authority (DLSA) Free Senior Advocate Assignment',
        recommendationReason: 'Eliminate out-of-pocket litigation costs under PoA Act rules.',
        priority: 'high',
        assignedDepartment: 'DLSA Pune & Department of Social Justice',
        status: 'in_progress',
        targetDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        actionNotes: [
          {
            author: 'Rajesh Deshmukh',
            timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
            note: 'Application forwarded to DLSA Secretary for expedited panel lawyer appointment.',
          }
        ]
      }
    ]
  },
  {
    id: 'CASE-RJ-2026-088',
    victimAlias: 'Vikram S.',
    registrationChannel: 'ivrs',
    district: 'Jaipur',
    state: 'Rajasthan',
    incidentType: 'Atrocity Act Sec 3(1)(x) - Social Boycott',
    preferredLanguage: 'hi',
    assignedCounsellorId: 'usr-counsellor-01',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerId: 'usr-caseworker-01',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    currentDistressScore: 7.2,
    previousDistressScore: 6.0,
    scoreChange: 1.2,
    riskState: 'high',
    trajectory: 'gradual_increase',
    consecutiveMissedCheckIns: 3,
    lastCheckInDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    nextScheduledCheckIn: new Date(Date.now() - 86400000).toISOString(),
    status: 'under_human_review',
    consentGiven: true,
    isSyntheticDemo: true,
    historyCheckIns: [],
    recentAssessments: [
      {
        id: 'RSK-088',
        caseId: 'CASE-RJ-2026-088',
        score: 7.2,
        previousScore: 6.0,
        scoreChange: 1.2,
        riskState: 'high',
        escalationFlag: true,
        confidence: 86,
        trajectory: 'gradual_increase',
        contributingFactors: [
          '3 consecutive IVRS & SMS automated check-ins unanswered',
          'High isolation risk in rural area under ongoing community boycott',
          'Physical welfare check mandated by Standard Operating Procedure',
        ],
        modelVersion: 'Mannik-AcousticNLP-v2.6',
        humanReviewRequired: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ],
    activeAlerts: [
      {
        id: 'ALT-088-01',
        caseId: 'CASE-RJ-2026-088',
        victimAlias: 'Vikram S.',
        district: 'Jaipur',
        state: 'Rajasthan',
        priority: 'high',
        status: 'action_required',
        currentDistressScore: 7.2,
        previousScore: 6.0,
        trajectory: 'gradual_increase',
        reason: '3 Consecutive Missed Scheduled Check-Ins - Field Welfare Verification Required',
        triggeringFactors: [
          'Repeated engagement blackout',
          'Prior high vulnerability baseline',
        ],
        assignedCounsellorId: 'usr-counsellor-01',
        assignedCaseworkerId: 'usr-caseworker-01',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ],
    interventions: []
  },
  {
    id: 'CASE-TN-2026-033',
    victimAlias: 'Anil M.',
    registrationChannel: 'app',
    district: 'Madurai',
    state: 'Tamil Nadu',
    incidentType: 'Atrocity Act Sec 3(2)(va)',
    preferredLanguage: 'ta',
    assignedCounsellorId: 'usr-counsellor-01',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerId: 'usr-caseworker-01',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    currentDistressScore: 3.4,
    previousDistressScore: 7.8,
    scoreChange: -4.4,
    riskState: 'low',
    trajectory: 'improving',
    consecutiveMissedCheckIns: 0,
    lastCheckInDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    nextScheduledCheckIn: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'active_monitoring',
    consentGiven: true,
    isSyntheticDemo: true,
    historyCheckIns: [],
    recentAssessments: [],
    activeAlerts: [
      {
        id: 'ALT-033-01',
        caseId: 'CASE-TN-2026-033',
        victimAlias: 'Anil M.',
        district: 'Madurai',
        state: 'Tamil Nadu',
        priority: 'moderate',
        status: 'false_positive',
        currentDistressScore: 3.4,
        previousScore: 7.8,
        trajectory: 'improving',
        reason: 'Acoustic background thunder noise falsely elevated speech jitter; cleared after counsellor telephone check',
        triggeringFactors: ['Environmental acoustic interference'],
        assignedCounsellorId: 'usr-counsellor-01',
        assignedCaseworkerId: 'usr-caseworker-01',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        acknowledgedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        resolvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        reviewerNotes: 'Spoke directly with victim. He confirmed high background storm static distorted mic. No distress or safety threats present.',
      }
    ],
    interventions: []
  },
  {
    id: 'CASE-KA-2026-015',
    victimAlias: 'Meena T.',
    registrationChannel: 'portal',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    incidentType: 'Atrocity Act Sec 3(1)(w)',
    preferredLanguage: 'kn',
    assignedCounsellorId: 'usr-counsellor-01',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerId: 'usr-caseworker-01',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    currentDistressScore: 1.8,
    previousDistressScore: 2.1,
    scoreChange: -0.3,
    riskState: 'low',
    trajectory: 'stable',
    consecutiveMissedCheckIns: 0,
    lastCheckInDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    nextScheduledCheckIn: new Date(Date.now() + 86400000 * 11).toISOString(),
    status: 'rehabilitated_stable',
    consentGiven: true,
    isSyntheticDemo: true,
    historyCheckIns: [],
    recentAssessments: [],
    activeAlerts: [],
    interventions: [
      {
        id: 'INT-015-A',
        caseId: 'CASE-KA-2026-015',
        victimAlias: 'Meena T.',
        category: 'rehabilitation',
        title: 'State Atrocity Relief Fund Compensation & Livelihood Grant',
        recommendationReason: 'Statutory 100% compensation stage disbursal completed; tailoring self-employment unit set up.',
        priority: 'routine',
        assignedDepartment: 'Social Welfare Department Karnataka',
        status: 'completed',
        targetDate: new Date(Date.now() - 86400000 * 10).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        actionNotes: [
          {
            author: 'Rajesh Deshmukh',
            timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
            note: 'Final relief installment credited to DBT bank account. Case transitioned to quarterly wellness check.',
          }
        ]
      }
    ]
  }
];

export const INITIAL_INTEGRATION_STATUS: SystemIntegrationStatus = {
  nhaaPortalSync: {
    status: 'connected',
    lastSync: '2 minutes ago',
    totalSyncedCases: 1482,
  },
  ivrsGateway: {
    status: 'online',
    activeTrunks: 32,
    completedCalls24h: 384,
  },
  smsGateway: {
    status: 'online',
    deliveryRatePercent: 99.4,
    queuedMessages: 0,
  },
  fcmPushService: {
    status: 'operational',
    activeListeners: 412,
  },
};

export const SOMATIC_EXERCISES: Array<{
  id: string;
  title: string;
  hindiTitle: string;
  tagline: string;
  durationMinutes: number;
  stepsCount: number;
  category: 'bilateral' | 'sensory' | 'breath' | 'muscle';
  icon: string;
  steps: Array<{
    title: string;
    instruction: string;
    durationSeconds: number;
  }>;
}> = [
  {
    id: 'butterfly_hug',
    title: 'Butterfly Hug (EMDR Bilateral Tapping)',
    hindiTitle: 'बटरफ्लाई आलिंगन (द्विपक्षीय स्पर्श)',
    tagline: 'Gentle alternating taps across your collarbone to de-escalate sudden trauma triggers & panic.',
    durationMinutes: 5,
    stepsCount: 4,
    category: 'bilateral',
    icon: '🦋',
    steps: [
      {
        title: 'Cross Your Arms Gently',
        instruction: 'Cross your hands over your chest so your middle fingertips rest just beneath your collarbones, like butterfly wings.',
        durationSeconds: 15,
      },
      {
        title: 'Breathe in Deeply',
        instruction: 'Draw in a long, soft breath through your nose. Feel your chest expand with warmth.',
        durationSeconds: 15,
      },
      {
        title: 'Alternating Gentle Taps (Left, Right)',
        instruction: 'Tap gently: Left... Right... Left... Right... like the slow flapping of butterfly wings. Maintain a slow, rhythmic tempo.',
        durationSeconds: 90,
      },
      {
        title: 'Grounding Sensation',
        instruction: 'Notice the feeling of your feet flat on the floor. Whisper gently: "I am safe in this present moment."',
        durationSeconds: 30,
      }
    ]
  },
  {
    id: 'sensory_54321',
    title: '5-4-3-2-1 Sensory Grounding',
    hindiTitle: 'पंच-इंद्रिय स्थिरता (5-4-3-2-1 तकनीक)',
    tagline: 'Connect your 5 physical senses to anchor your mind back to the safe physical room.',
    durationMinutes: 6,
    stepsCount: 5,
    category: 'sensory',
    icon: '👁️',
    steps: [
      {
        title: '5 Things You Can SEE',
        instruction: 'Look around quietly. Name 5 distinct objects in front of you (e.g. door, curtain, shoe, water bottle, light).',
        durationSeconds: 40,
      },
      {
        title: '4 Things You Can TOUCH / FEEL',
        instruction: 'Notice 4 physical textures (e.g. the fabric of your clothes, the floor under your feet, cool air on your skin).',
        durationSeconds: 40,
      },
      {
        title: '3 Things You Can HEAR',
        instruction: 'Close your eyes. Listen closely for 3 ambient sounds (e.g. birds outside, wind, your own steady breath).',
        durationSeconds: 30,
      },
      {
        title: '2 Things You Can SMELL',
        instruction: 'Take a soft breath. Notice any faint aroma in the room or on your hands.',
        durationSeconds: 20,
      },
      {
        title: '1 Thing You Can TASTE',
        instruction: 'Notice the sensation in your mouth, or take a gentle sip of cool fresh water.',
        durationSeconds: 20,
      }
    ]
  },
  {
    id: 'box_breathing',
    title: 'Box Breathing (4-4-4-4 Rhythm)',
    hindiTitle: 'चौकोर श्वास क्रिया (4-4-4-4 लय)',
    tagline: 'Equalized autonomic nervous system regulation used by medical trauma teams.',
    durationMinutes: 4,
    stepsCount: 4,
    category: 'breath',
    icon: '⏹️',
    steps: [
      {
        title: 'Inhale for 4 Seconds',
        instruction: 'Breathe in smoothly through your nose for 4 counts: 1... 2... 3... 4...',
        durationSeconds: 16,
      },
      {
        title: 'Hold for 4 Seconds',
        instruction: 'Hold the breath softly in your chest for 4 counts: 1... 2... 3... 4...',
        durationSeconds: 16,
      },
      {
        title: 'Exhale for 4 Seconds',
        instruction: 'Release the breath gently out your mouth for 4 counts: 1... 2... 3... 4...',
        durationSeconds: 16,
      },
      {
        title: 'Rest Empty for 4 Seconds',
        instruction: 'Stay gently still before the next breath: 1... 2... 3... 4...',
        durationSeconds: 16,
      }
    ]
  },
  {
    id: 'progressive_relaxation',
    title: 'Progressive Shoulder & Jaw Release',
    hindiTitle: 'कंधे व जबड़े का तनाव मुक्ति व्यायाम',
    tagline: 'Dissolve trapped physical tension from emotional vigilance and startle responses.',
    durationMinutes: 5,
    stepsCount: 3,
    category: 'muscle',
    icon: '🧘',
    steps: [
      {
        title: 'Shoulder Elevation & Drop',
        instruction: 'Squeeze shoulders tight up towards your ears for 5 seconds... now let them drop completely with a long exhale.',
        durationSeconds: 30,
      },
      {
        title: 'Jaw & Facial Unclench',
        instruction: 'Part your teeth slightly. Let your tongue rest softly on the floor of your mouth. Release forehead tension.',
        durationSeconds: 30,
      },
      {
        title: 'Fist Release',
        instruction: 'Clench both fists firmly for 5 seconds... now open both palms wide and feel blood flow return.',
        durationSeconds: 30,
      }
    ]
  }
];

export const STATUTORY_COMPENSATION_RIGHTS = [
  {
    stage: 'Stage 1: Immediate Relief',
    percentage: 25,
    title: '25% upon Registration of First Information Report (FIR)',
    statutoryRule: 'Scheduled Castes & Scheduled Tribes (Prevention of Atrocities) Rules, Schedule II',
    amountSample: '₹1,00,000 to ₹2,50,000 via Direct Benefit Transfer (DBT)',
    documentsNeeded: ['Certified copy of FIR', 'Aadhaar / Bank Account Passbook', 'Caste Certificate'],
  },
  {
    stage: 'Stage 2: Investigation Stage',
    percentage: 50,
    title: '50% upon Filing of Police Chargesheet in Special Court',
    statutoryRule: 'Section 15A & Rules Under PoA Act (Mandatory within 60 days of FIR)',
    amountSample: '₹2,00,000 to ₹5,00,000 DBT Disbursal',
    documentsNeeded: ['Certified Chargesheet copy from Special Atrocity Court', 'Welfare Officer Verification'],
  },
  {
    stage: 'Stage 3: Conclusion & Rehabilitation',
    percentage: 25,
    title: '25% upon Conclusion of Trial in Special Court',
    statutoryRule: 'Final Disbursal + Lifetime Economic Rehabilitation & Pension entitlement',
    amountSample: 'Balance amount + monthly sustenance allowance if breadwinner affected',
    documentsNeeded: ['Special Court Judgment order', 'Relief committee sanction letter'],
  }
];

/**
 * Storage management helper
 */
export class AppStore {
  private static listeners: Set<() => void> = new Set();

  static subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private static notify() {
    this.listeners.forEach(fn => fn());
  }

  // Authentication & Verification
  static authenticate(loginId: string, passcode: string): { success: boolean; user?: User; error?: string } {
    const cleanId = loginId.trim().toLowerCase();
    const cleanPass = passcode.trim();

    const matched = DEMO_USERS.find(u => 
      (u.loginId && u.loginId.toLowerCase() === cleanId) ||
      (u.id.toLowerCase() === cleanId)
    );

    if (!matched) {
      return { success: false, error: 'Invalid Case ID or Official Username. Please verify credentials.' };
    }

    if (matched.passcode && matched.passcode !== cleanPass) {
      return { success: false, error: 'Incorrect Passcode / Password for this account.' };
    }

    const authenticatedUser: User = {
      ...matched,
      sessionToken: `sess-${Date.now()}-${matched.id}`,
      lastLoginAt: new Date().toISOString(),
    };

    this.setCurrentUser(authenticatedUser);
    this.logAudit({
      actorId: authenticatedUser.id,
      actorName: authenticatedUser.name,
      actorRole: authenticatedUser.role,
      action: 'USER_LOGIN_SUCCESS',
      resourceType: 'auth',
      resourceId: authenticatedUser.id,
      details: `Successful authenticated login as ${authenticatedUser.role} via ID: ${loginId}`,
    });

    return { success: true, user: authenticatedUser };
  }

  static logout() {
    if (typeof window === 'undefined') return;
    const currentUser = this.getCurrentUser();
    this.logAudit({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'USER_LOGOUT',
      resourceType: 'auth',
      resourceId: currentUser.id,
      details: `User signed out of active session.`,
    });
    // Set to guest / default victim
    localStorage.removeItem(CURRENT_USER_KEY);
    this.notify();
  }

  // Role Access Control RBAC verification
  static canAccessView(user: User, view: string): boolean {
    return verifyRoleAccess(user.role, view, user.credentials);
  }

  // Get current simulated user
  static getCurrentUser(): User {
    if (typeof window === 'undefined') return DEMO_USERS[0];
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEMO_USERS[0];
  }

  static setCurrentUser(user: User) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    this.notify();
  }

  // Get threshold configuration
  static getThresholds(): ThresholdConfig {
    if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;
    const saved = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_THRESHOLDS;
  }

  static updateThresholds(config: ThresholdConfig) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(config));
    const user = this.getCurrentUser();
    this.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'UPDATE_THRESHOLD_CONFIG',
      resourceType: 'threshold',
      resourceId: 'SYSTEM_THRESHOLDS',
      details: `Updated thresholds: UrgentMin=${config.urgentBandMin}, EscalationDelta=${config.escalationDeltaWarning}`,
    });
    this.notify();
  }

  // Get all cases
  static getCases(): AtrocityCase[] {
    if (typeof window === 'undefined') return INITIAL_SYNTHETIC_CASES;
    const saved = localStorage.getItem(CASES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored cases', e);
      }
    }
    // Initialize default cases
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(INITIAL_SYNTHETIC_CASES));
    return INITIAL_SYNTHETIC_CASES;
  }

  static saveCases(cases: AtrocityCase[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
    this.notify();
  }

  static getCaseById(caseId: string): AtrocityCase | undefined {
    return this.getCases().find(c => c.id === caseId);
  }

  static addCase(newCase: AtrocityCase) {
    const cases = this.getCases();
    const existingIndex = cases.findIndex(c => c.id === newCase.id);
    if (existingIndex >= 0) {
      cases[existingIndex] = newCase;
    } else {
      cases.unshift(newCase);
    }
    this.saveCases(cases);
  }

  // Alias helper for omnichannel & automated check-in ingestion
  static recordCheckIn(
    caseId: string,
    checkInData: Omit<CheckIn, 'id' | 'createdAt' | 'distressScore' | 'analysisStatus' | 'caseId'> & { caseId?: string },
    isOffline: boolean = false
  ) {
    return this.submitCheckIn(caseId, { ...checkInData, caseId: checkInData.caseId || caseId }, isOffline);
  }

  // Add a new check-in to a case (Online or Offline)
  static submitCheckIn(caseId: string, checkInData: Omit<CheckIn, 'id' | 'createdAt' | 'distressScore' | 'analysisStatus'>, isOffline: boolean = false): {
    checkIn: CheckIn;
    assessment?: RiskAssessment;
    alertCreated?: CaseAlert;
  } {
    const cases = this.getCases();
    const caseItem = cases.find(c => c.id === caseId);
    const currentUser = this.getCurrentUser();

    // Calculate score using our multimodal AI engine
    const { score, contributingFactors } = calculateDynamicDistressScore(
      checkInData.answers,
      checkInData.textResponse,
      checkInData.audioFeatures,
      caseItem ? caseItem.consecutiveMissedCheckIns : 0
    );

    const checkIn: CheckIn = {
      ...checkInData,
      id: `chk-${Date.now().toString().slice(-6)}`,
      distressScore: score,
      analysisStatus: isOffline ? 'offline_pending' : 'completed',
      offlineSynced: !isOffline,
      createdAt: new Date().toISOString(),
    };

    if (isOffline) {
      // Save in offline queue
      this.enqueueOfflineCheckIn(caseId, checkIn);
      return { checkIn };
    }

    if (!caseItem) {
      return { checkIn };
    }

    // Evaluate Risk Assessment
    const thresholds = this.getThresholds();
    const assessment = evaluateRiskAssessment(
      caseId,
      score,
      caseItem.currentDistressScore,
      contributingFactors,
      0, // reset missed checkins
      thresholds
    );

    // Update case record
    caseItem.previousDistressScore = caseItem.currentDistressScore;
    caseItem.currentDistressScore = score;
    caseItem.scoreChange = Number((score - caseItem.previousDistressScore).toFixed(1));
    caseItem.riskState = assessment.riskState;
    caseItem.trajectory = assessment.trajectory;
    caseItem.consecutiveMissedCheckIns = 0;
    caseItem.lastCheckInDate = checkIn.createdAt;
    caseItem.historyCheckIns.unshift(checkIn);
    caseItem.recentAssessments.unshift(assessment);

    let createdAlert: CaseAlert | undefined;

    // Trigger alert if high/urgent concern or acute spike
    if (assessment.humanReviewRequired) {
      createdAlert = {
        id: `ALT-${caseId.slice(-3)}-${Date.now().toString().slice(-4)}`,
        caseId: caseItem.id,
        victimAlias: caseItem.victimAlias,
        district: caseItem.district,
        state: caseItem.state,
        priority: assessment.riskState === 'urgent' ? 'urgent' : 'high',
        status: 'new',
        currentDistressScore: score,
        previousScore: caseItem.previousDistressScore,
        trajectory: assessment.trajectory,
        reason: assessment.riskState === 'urgent' 
          ? `Urgent Escalation Detected: Score ${score}/10 with rapid trajectory` 
          : `High Distress Level Flagged: Score ${score}/10 requiring human review`,
        triggeringFactors: assessment.contributingFactors.slice(0, 3),
        assignedCounsellorId: caseItem.assignedCounsellorId,
        assignedCaseworkerId: caseItem.assignedCaseworkerId,
        createdAt: new Date().toISOString(),
      };
      caseItem.activeAlerts.unshift(createdAlert);
      caseItem.status = 'under_human_review';
    }

    this.saveCases(cases);

    this.logAudit({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'CHECKIN_SUBMITTED_AND_SCORED',
      resourceType: 'check_in',
      resourceId: checkIn.id,
      details: `Check-in submitted via ${checkIn.channel}. Dynamic distress score: ${score}/10. Risk state: ${assessment.riskState}`,
    });

    return { checkIn, assessment, alertCreated: createdAlert };
  }

  // Offline queue operations
  static getOfflineQueue(): Array<{ caseId: string; checkIn: CheckIn }> {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static enqueueOfflineCheckIn(caseId: string, checkIn: CheckIn) {
    const queue = this.getOfflineQueue();
    queue.push({ caseId, checkIn });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    this.notify();
  }

  static syncOfflineQueue(): number {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    queue.forEach(item => {
      // Re-run online submission
      this.submitCheckIn(item.caseId, {
        caseId: item.caseId,
        channel: item.checkIn.channel,
        language: item.checkIn.language,
        textResponse: item.checkIn.textResponse,
        answers: item.checkIn.answers,
        audioFeatures: item.checkIn.audioFeatures,
      }, false);
      syncedCount++;
    });

    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    this.notify();
    return syncedCount;
  }

  // Human Review: Update alert status
  static updateAlertStatus(
    caseId: string,
    alertId: string,
    newStatus: CaseAlert['status'],
    notes?: string
  ) {
    const cases = this.getCases();
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const alert = caseItem.activeAlerts.find(a => a.id === alertId);
    if (!alert) return;

    const user = this.getCurrentUser();
    alert.status = newStatus;
    if (notes) alert.reviewerNotes = notes;
    if (newStatus === 'acknowledged') alert.acknowledgedAt = new Date().toISOString();
    if (newStatus === 'resolved' || newStatus === 'false_positive') alert.resolvedAt = new Date().toISOString();

    // If all alerts are resolved/false positive, update case status
    const remainingUnresolved = caseItem.activeAlerts.some(a => a.status === 'new' || a.status === 'under_review' || a.status === 'action_required');
    if (!remainingUnresolved) {
      caseItem.status = caseItem.interventions.some(i => i.status === 'in_progress') ? 'intervention_active' : 'active_monitoring';
    }

    this.saveCases(cases);

    this.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'ALERT_HUMAN_REVIEW_UPDATE',
      resourceType: 'alert',
      resourceId: alertId,
      details: `Alert ${alertId} status transitioned to "${newStatus}". Notes: ${notes || 'None'}`,
    });
  }

  // Add intervention
  static addIntervention(caseId: string, interventionData: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt' | 'actionNotes'>) {
    const cases = this.getCases();
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const user = this.getCurrentUser();
    const newIntervention: Intervention = {
      ...interventionData,
      id: `INT-${caseId.slice(-3)}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actionNotes: [
        {
          author: `${user.name} (${user.role})`,
          timestamp: new Date().toISOString(),
          note: `Intervention initiated for category: ${interventionData.category}. Priority: ${interventionData.priority}`,
        }
      ]
    };

    caseItem.interventions.unshift(newIntervention);
    caseItem.status = 'intervention_active';
    this.saveCases(cases);

    this.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'INTERVENTION_INITIATED',
      resourceType: 'intervention',
      resourceId: newIntervention.id,
      details: `Created intervention "${newIntervention.title}" for Case ${caseId}. Assigned to: ${newIntervention.assignedDepartment}`,
    });
  }

  // Update intervention status
  static updateInterventionStatus(caseId: string, interventionId: string, status: Intervention['status'], noteText?: string) {
    const cases = this.getCases();
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const intervention = caseItem.interventions.find(i => i.id === interventionId);
    if (!intervention) return;

    const user = this.getCurrentUser();
    intervention.status = status;
    intervention.updatedAt = new Date().toISOString();
    if (noteText) {
      intervention.actionNotes.unshift({
        author: `${user.name} (${user.role})`,
        timestamp: new Date().toISOString(),
        note: noteText,
      });
    }

    this.saveCases(cases);

    this.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'INTERVENTION_STATUS_UPDATE',
      resourceType: 'intervention',
      resourceId: interventionId,
      details: `Intervention status updated to ${status}. Note: ${noteText || 'None'}`,
    });
  }

  // Audit Logs (Cryptographically secured with simulated SHA-256 hash)
  static getAuditLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'checksum'>) {
    if (typeof window === 'undefined') return;
    const logs = this.getAuditLogs();
    const timestamp = new Date().toISOString();
    const rawString = `${entry.actorId}:${entry.action}:${entry.resourceId}:${timestamp}`;
    
    // Simple deterministic hash simulation for immutable ledger
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      hash = ((hash << 5) - hash) + rawString.charCodeAt(i);
      hash |= 0;
    }
    const checksum = '0x' + Math.abs(hash).toString(16).padStart(8, '0') + 'a7f9';

    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp,
      checksum,
    };

    logs.unshift(fullEntry);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    this.notify();
  }

  // Comprehensive Multi-Section Assessment Storage
  static getAssessments(caseId?: string): StoredAssessmentRecord[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('mannik_comprehensive_assessments_v2');
    const all: StoredAssessmentRecord[] = saved ? JSON.parse(saved) : [];
    if (caseId) return all.filter(a => a.caseId === caseId);
    return all;
  }

  static submitComprehensiveAssessment(record: StoredAssessmentRecord) {
    if (typeof window === 'undefined') return;
    const all = this.getAssessments();
    all.unshift(record);
    localStorage.setItem('mannik_comprehensive_assessments_v2', JSON.stringify(all.slice(0, 100)));

    // Link into case history & update distress score
    const cases = this.getCases();
    const caseItem = cases.find(c => c.id === record.caseId);
    if (caseItem) {
      const checkInItem: CheckIn = {
        id: record.assessmentId,
        caseId: record.caseId,
        channel: record.source === 'voice_checkin' ? 'voice' : 'form',
        language: record.language,
        textResponse: record.responses.optionalTextNotes || `Comprehensive Check-In (${record.version}): Emotional state=${record.responses.emotionalState}, stress=${record.responses.stressLevel}/10`,
        answers: {
          sleepQuality: record.responses.sleepQuality === 'restful' ? 5 : record.responses.sleepQuality === 'interrupted' ? 3 : record.responses.sleepQuality === 'nightmares_insomnia' ? 2 : 1,
          safetyFeel: record.responses.feelingSafe === 'completely_safe' ? 5 : record.responses.feelingSafe === 'mostly_safe' ? 4 : record.responses.feelingSafe === 'somewhat_unsafe' ? 2 : 1,
          overwhelmLevel: Math.max(1, Math.min(5, Math.round(record.responses.stressLevel / 2))),
          socialConnection: record.responses.socialInteraction === 'connected' ? 5 : record.responses.socialInteraction === 'limited' ? 3 : 1,
        },
        distressScore: record.calculatedDistressScore,
        analysisStatus: 'completed',
        createdAt: record.submittedAt,
      };

      caseItem.historyCheckIns.unshift(checkInItem);
      caseItem.previousDistressScore = caseItem.currentDistressScore;
      caseItem.currentDistressScore = record.calculatedDistressScore;
      caseItem.scoreChange = Number((record.calculatedDistressScore - caseItem.previousDistressScore).toFixed(1));
      caseItem.lastCheckInDate = record.submittedAt;

      // Update trajectory
      if (caseItem.scoreChange >= 1.8) {
        caseItem.trajectory = 'acute_spike';
        caseItem.riskState = 'urgent';
      } else if (caseItem.scoreChange > 0.4) {
        caseItem.trajectory = 'gradual_increase';
        caseItem.riskState = record.calculatedDistressScore >= 8.5 ? 'urgent' : record.calculatedDistressScore >= 6.5 ? 'high' : 'moderate';
      } else if (caseItem.scoreChange < -0.4) {
        caseItem.trajectory = 'improving';
        caseItem.riskState = record.calculatedDistressScore <= 3.5 ? 'low' : 'moderate';
      }

      this.saveCases(cases);
    }

    this.logAudit({
      actorId: record.userId,
      actorName: 'Survivor Check-In',
      actorRole: 'victim',
      action: 'COMPREHENSIVE_ASSESSMENT_SUBMITTED',
      resourceType: 'check_in',
      resourceId: record.assessmentId,
      details: `Submitted 6-step check-in (${record.version}). Score: ${record.calculatedDistressScore}/10 (${record.riskBand}). Completion: ${record.completionPercentage}%`,
    });

    this.notify();
  }

  // Reset to initial demo state
  static resetDemoData() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(INITIAL_SYNTHETIC_CASES));
    localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(DEFAULT_THRESHOLDS));
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    this.logAudit({
      actorId: 'usr-nat-admin-01',
      actorName: 'National Administrator',
      actorRole: 'national_admin',
      action: 'DEMO_DATA_RESET',
      resourceType: 'case',
      resourceId: 'ALL',
      details: 'Restored initial synthetic demo cases and default distress thresholds.',
    });
    this.notify();
  }
}
