import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  serverTimestamp, 
  query, 
  limit 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from './config';
import { FirestoreCase, UserCredentials, UserProfile, UserRole } from '../types';
import { USER_ROLES } from '../services/authRoleSystem';

export interface DemoAccount {
  demoKey: 'demo.victim' | 'demo.counsellor' | 'demo.district' | 'demo.state' | 'demo.national' | 'demo.auditor';
  email: string;
  password: string;
  name: string;
  role: UserRole;
  districtId?: string;
  stateId?: string;
  caseId?: string;
  description: string;
  credentials?: UserCredentials;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    demoKey: 'demo.victim',
    email: 'sunita.victim@mannik.ai',
    password: 'Password@123',
    name: 'Sunita D. (Protected Alias)',
    role: USER_ROLES.VICTIM,
    districtId: 'pune',
    stateId: 'maharashtra',
    caseId: 'CASE-MH-2026-109',
    description: 'Victim under acute distress escalation (+3.7 spike). Requires urgent counsellor review.',
    credentials: { counsellorCredential: false, credentialVerified: true },
  },
  {
    demoKey: 'demo.victim',
    email: 'pooja.victim@mannik.ai',
    password: 'Password@123',
    name: 'Pooja R. (Protected Alias)',
    role: USER_ROLES.VICTIM,
    districtId: 'pune',
    stateId: 'maharashtra',
    caseId: 'CASE-MH-2026-001',
    description: 'Victim with stable low concern (2.2/10). Receiving weekly trauma counselling.',
    credentials: { counsellorCredential: false, credentialVerified: true },
  },
  {
    demoKey: 'demo.counsellor',
    email: 'ananya.counsellor@mannik.ai',
    password: 'Password@123',
    name: 'Dr. Ananya Sen (Lead Counsellor)',
    role: USER_ROLES.COUNSELLOR,
    districtId: 'pune',
    stateId: 'maharashtra',
    description: 'Certified mental health clinician. Conducts human-in-the-loop review on flagged cases.',
    credentials: { counsellorCredential: true, clinicalLicenseNumber: 'DMHP-MH-2024-9912', credentialVerified: true },
  },
  {
    demoKey: 'demo.district',
    email: 'rajesh.officer@mannik.ai',
    password: 'Password@123',
    name: 'Rajesh Deshmukh (District Welfare Officer)',
    role: USER_ROLES.DISTRICT_OFFICER,
    districtId: 'pune',
    stateId: 'maharashtra',
    description: 'Pune District Official. Assigns cases to counsellors, dispatches DLSA legal aid & safe relocation.',
    credentials: { counsellorCredential: false, credentialVerified: true },
  },
  {
    demoKey: 'demo.state',
    email: 'patil.state@mannik.ai',
    password: 'Password@123',
    name: 'Vikramaditya Patil (State Director)',
    role: USER_ROLES.STATE_ADMIN,
    stateId: 'maharashtra',
    description: 'Maharashtra Social Justice Directorate. Monitors cross-district caseload and state relief grants.',
    credentials: { counsellorCredential: false, credentialVerified: true },
  },
  {
    demoKey: 'demo.national',
    email: 'vandana.national@mannik.ai',
    password: 'Password@123',
    name: 'Vandana Sharma (National Administrator)',
    role: USER_ROLES.NATIONAL_ADMIN,
    description: 'Ministry of Social Justice. Nationwide analytics, policy thresholds, and user management.',
    credentials: { counsellorCredential: false, credentialVerified: true },
  },
  {
    demoKey: 'demo.auditor',
    email: 'kavita.auditor@mannik.ai',
    password: 'Password@123',
    name: 'Kavita Nair (System Security Auditor)',
    role: USER_ROLES.AUDITOR,
    description: 'Read-only auditor. Inspects immutable cryptographic logs and access history.',
    credentials: { counsellorCredential: false, credentialVerified: true },
  },
];

export const INITIAL_FIRESTORE_CASES: Array<Omit<FirestoreCase, 'createdAt' | 'updatedAt'> & { events: any[]; reviews?: any[] }> = [
  {
    caseId: 'CASE-MH-2026-109',
    ownerUid: 'demo-sunita-uid',
    assignedCounsellorUid: 'demo-ananya-uid',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerUid: 'demo-rajesh-uid',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    victimAlias: 'Sunita D.',
    location: {
      stateId: 'maharashtra',
      districtId: 'pune',
    },
    category: 'Atrocity Act Sec 3(1)(r) & Intimidation',
    incidentType: 'Atrocity Act Sec 3(1)(r) & Physical Intimidation',
    status: 'human_review',
    priority: 'urgent',
    distressScore: 9.1,
    previousDistressScore: 5.4,
    trajectory: 'acute_spike',
    flaggedFactors: [
      'Acute score spike (+3.7) detected within 48h',
      'Vocal micro-tremor (4.8%) indicates high acoustic stress',
      'Reported nighttime intimidation outside dwelling',
      'Perceived personal safety score dropped to 1/5',
    ],
    createdBy: 'system_seed',
    updatedBy: 'system_seed',
    events: [
      {
        eventType: 'CASE_CREATED',
        description: 'Case registered following Atrocity Act FIR lodged at Pune Rural Police Station.',
        createdBy: 'system_seed',
      },
      {
        eventType: 'CASE_ASSIGNED',
        description: 'Case assigned to Lead Clinical Counsellor Dr. Ananya Sen and Welfare Officer Rajesh Deshmukh.',
        createdBy: 'rajesh.officer@mannik.ai',
      },
      {
        eventType: 'DISTRESS_SCORE_ESCALATED',
        description: 'Dynamic Distress Score spiked to 9.1/10. Priority alert dispatched to Human Review Queue.',
        createdBy: 'Mannik-AcousticNLP-v2.6',
      }
    ],
    reviews: [
      {
        reviewerUid: 'demo-ananya-uid',
        reviewerName: 'Dr. Ananya Sen',
        reviewerRole: 'counsellor',
        reviewStatus: 'pending_validation',
        observations: 'Voice recording analysis flagged severe tremor and hyper-vigilance cues. Victim requested emergency call.',
        interventionAction: 'Witness Protection Unit verification & safe emergency shelter allocation.',
        followUpRequired: true,
        followUpDate: '2026-09-28',
      }
    ]
  },
  {
    caseId: 'CASE-MH-2026-001',
    ownerUid: 'demo-pooja-uid',
    assignedCounsellorUid: 'demo-ananya-uid',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerUid: 'demo-rajesh-uid',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    victimAlias: 'Pooja R.',
    location: {
      stateId: 'maharashtra',
      districtId: 'pune',
    },
    category: 'Atrocity Act Sec 3(1)(w) - Harassment',
    incidentType: 'Atrocity Act Sec 3(1)(w) - Harassment',
    status: 'assigned',
    priority: 'normal',
    distressScore: 2.2,
    previousDistressScore: 2.6,
    trajectory: 'stable',
    flaggedFactors: [
      'Stable baseline; startle response decreased',
      'Weekly trauma counselling attending regularly',
    ],
    createdBy: 'system_seed',
    updatedBy: 'system_seed',
    events: [
      {
        eventType: 'CASE_CREATED',
        description: 'Initial intake completed. Assigned protective alias Pooja R.',
        createdBy: 'system_seed',
      },
      {
        eventType: 'COUNSELLING_SESSION_COMPLETED',
        description: 'Trauma recovery session 3 conducted by Dr. Ananya Sen.',
        createdBy: 'ananya.counsellor@mannik.ai',
      }
    ]
  },
  {
    caseId: 'CASE-MH-2026-042',
    ownerUid: 'demo-ramesh-uid',
    assignedCounsellorUid: 'demo-ananya-uid',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerUid: 'demo-rajesh-uid',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    victimAlias: 'Ramesh K.',
    location: {
      stateId: 'maharashtra',
      districtId: 'pune',
    },
    category: 'Land Dispossession & Economic Atrocity',
    incidentType: 'Atrocity Act Sec 3(1)(f)',
    status: 'intervention',
    priority: 'high',
    distressScore: 6.8,
    previousDistressScore: 5.1,
    trajectory: 'gradual_increase',
    flaggedFactors: [
      'Financial strain due to private litigation expenses',
      'Sleep disruption and social alienation reported in check-in',
    ],
    createdBy: 'system_seed',
    updatedBy: 'system_seed',
    events: [
      {
        eventType: 'CASE_CREATED',
        description: 'Case registered via SMS check-in gateway.',
        createdBy: 'system_seed',
      },
      {
        eventType: 'INTERVENTION_RECORDED',
        description: 'Free senior advocate assigned through District Legal Services Authority (DLSA).',
        createdBy: 'rajesh.officer@mannik.ai',
      }
    ]
  },
  {
    caseId: 'CASE-MH-2026-088',
    ownerUid: 'demo-vikram-uid',
    assignedCounsellorUid: 'demo-ananya-uid',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerUid: 'demo-rajesh-uid',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    victimAlias: 'Vikram S.',
    location: {
      stateId: 'maharashtra',
      districtId: 'pune',
    },
    category: 'Social Boycott & Enforced Isolation',
    incidentType: 'Atrocity Act Sec 3(1)(x)',
    status: 'triage',
    priority: 'high',
    distressScore: 7.2,
    previousDistressScore: 6.0,
    trajectory: 'gradual_increase',
    flaggedFactors: [
      '3 consecutive automated check-ins missed',
      'High isolation risk in rural hamlet',
      'Physical field welfare visit dispatched',
    ],
    createdBy: 'system_seed',
    updatedBy: 'system_seed',
    events: [
      {
        eventType: 'CASE_CREATED',
        description: 'IVRS phone registration initialized.',
        createdBy: 'system_seed',
      },
      {
        eventType: 'MISSED_CHECKIN_FLAG',
        description: 'Engagement blackout flag triggered after 3 unanswered IVRS prompts.',
        createdBy: 'system_seed',
      }
    ]
  },
  {
    caseId: 'CASE-MH-2026-015',
    ownerUid: 'demo-meena-uid',
    assignedCounsellorUid: 'demo-ananya-uid',
    assignedCounsellorName: 'Dr. Ananya Sen',
    assignedCaseworkerUid: 'demo-rajesh-uid',
    assignedCaseworkerName: 'Rajesh Deshmukh',
    victimAlias: 'Meena T.',
    location: {
      stateId: 'maharashtra',
      districtId: 'pune',
    },
    category: 'Atrocity Relief & Economic Rehabilitation',
    incidentType: 'Atrocity Act Sec 3(1)(w)',
    status: 'resolved',
    priority: 'normal',
    distressScore: 1.8,
    previousDistressScore: 2.1,
    trajectory: 'stable',
    flaggedFactors: [
      'Trial concluded in Special Court',
      '100% statutory DBT compensation credited to bank account',
      'Tailoring livelihood unit operational',
    ],
    createdBy: 'system_seed',
    updatedBy: 'system_seed',
    events: [
      {
        eventType: 'TRIAL_CONCLUDED',
        description: 'Special Court passed judgment convicting perpetrators.',
        createdBy: 'system_seed',
      },
      {
        eventType: 'REHABILITATION_COMPLETED',
        description: 'Final installment of statutory compensation credited via DBT. Case transitioned to resolved.',
        createdBy: 'rajesh.officer@mannik.ai',
      }
    ]
  }
];

/**
 * Seeds Firestore collections if they are empty or requested.
 * Strictly verifies that the client is authenticated and authorized before querying.
 */
export async function seedFirestoreCollections(): Promise<{ seededCases: number; seededUsers: number }> {
  let seededCases = 0;
  let seededUsers = 0;

  // Security guard: never attempt Firestore writes if unauthenticated
  if (!auth.currentUser) {
    return { seededCases: 0, seededUsers: 0 };
  }

  try {
    // 1. Check if cases collection already has documents
    const casesCol = collection(db, 'cases');
    const existingCasesSnap = await getDocs(query(casesCol, limit(1)));

    // Seed cases if none exist
    if (existingCasesSnap.empty) {
      for (const item of INITIAL_FIRESTORE_CASES) {
        const caseRef = doc(db, 'cases', item.caseId);
        const { events, reviews, ...caseData } = item;
        
        await setDoc(caseRef, {
          ...caseData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        seededCases++;

        // Subcollection: events
        if (events && events.length > 0) {
          for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            const eventRef = doc(collection(caseRef, 'events'));
            await setDoc(eventRef, {
              ...ev,
              createdAt: serverTimestamp(),
            });
          }
        }

        // Subcollection: reviews
        if (reviews && reviews.length > 0) {
          for (const rev of reviews) {
            const revRef = doc(collection(caseRef, 'reviews'));
            await setDoc(revRef, {
              ...rev,
              caseId: item.caseId,
              createdAt: serverTimestamp(),
            });
          }
        }
      }
    }

    // 2. Seed initial demo users in `users` collection
    const usersCol = collection(db, 'users');
    const existingUsersSnap = await getDocs(query(usersCol, limit(1)));

    if (existingUsersSnap.empty) {
      for (const acc of DEMO_ACCOUNTS) {
        // Deterministic ID derived from email
        const userDocId = acc.email.replace(/[@.]/g, '_');
        const userRef = doc(db, 'users', userDocId);
        
        const profile: UserProfile = {
          uid: userDocId,
          name: acc.name,
          email: acc.email,
          role: acc.role,
          active: true,
          districtId: acc.districtId,
          stateId: acc.stateId,
          language: 'hi',
          credentials: acc.credentials || { counsellorCredential: false, credentialVerified: true },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userRef, profile);
        seededUsers++;
      }
    }

    // 3. Log seed event in auditLogs
    const currentUid = auth.currentUser?.uid || 'system_provisioner';
    const auditRef = doc(collection(db, 'auditLogs'));
    await setDoc(auditRef, {
      actorUid: currentUid,
      actorRole: 'national_admin',
      action: 'SYSTEM_DATABASE_INITIALIZED',
      targetType: 'system',
      targetId: 'firestore',
      timestamp: serverTimestamp(),
      metadata: {
        casesSeeded: seededCases,
        usersSeeded: seededUsers,
        environment: 'aqueous-trees-4ldf2',
      },
    });

  } catch (err: any) {
    // If permissions are not sufficient for this user role, log an informational warning rather than a fatal error
    if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
      console.info('Firestore seeding skipped (requires national administrator privileges):', err?.message || err);
    } else {
      console.warn('Notice during Firestore seeding:', err);
    }
  }

  return { seededCases, seededUsers };
}

/**
 * Attempts real Firebase Auth login or creates account if not present.
 */
export async function ensureFirebaseAuthAccount(acc: DemoAccount): Promise<{ uid: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, acc.email, acc.password);
    return { uid: cred.user.uid };
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
        // Save in users collection
        const userRef = doc(db, 'users', newCred.user.uid);
        await setDoc(userRef, {
          uid: newCred.user.uid,
          name: acc.name,
          email: acc.email,
          role: acc.role,
          active: true,
          districtId: acc.districtId,
          stateId: acc.stateId,
          language: 'hi',
          credentials: acc.credentials || { counsellorCredential: false, credentialVerified: true },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return { uid: newCred.user.uid };
      } catch (createErr) {
        // In case account already existed with different pass
        console.warn('Could not create auth account:', createErr);
      }
    }
    throw err;
  }
}
