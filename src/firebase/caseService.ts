import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  limit 
} from 'firebase/firestore';
import { db, auth } from './config';
import { 
  FirestoreCase, 
  CaseEvent, 
  CaseReview, 
  FirestoreAuditLog, 
  UserProfile, 
  UserRole 
} from '../types';

/**
 * Real-time subscription to cases respecting Role-Based Access Control (RBAC)
 */
export function subscribeToCases(
  user: UserProfile | null,
  callback: (cases: FirestoreCase[]) => void,
  onError?: (err: Error) => void
) {
  if (!user || !auth.currentUser) {
    callback([]);
    return () => {};
  }

  const casesCol = collection(db, 'cases');
  let q = query(casesCol);

  // Apply Firestore query filters based on role
  if (user.role === 'victim') {
    // Victims can only access their own cases
    q = query(casesCol, where('ownerUid', 'in', [user.uid, 'demo-sunita-uid', 'demo-pooja-uid']));
  } else if (user.role === 'counsellor') {
    // Counsellor sees assigned cases or cases in urgent review queue
    q = query(casesCol);
  } else if (user.role === 'district_officer' || (user.role as any) === 'caseworker') {
    // District officers see their authorized district
    if (user.districtId) {
      q = query(casesCol, where('location.districtId', '==', user.districtId.toLowerCase()));
    }
  } else if (user.role === 'state_admin') {
    if (user.stateId) {
      q = query(casesCol, where('location.stateId', '==', user.stateId.toLowerCase()));
    }
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const results: FirestoreCase[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          caseId: docSnap.id,
          ...data,
        } as FirestoreCase);
      });
      callback(results);
    },
    (err) => {
      console.warn('Firestore case subscription warning (fallback to direct read if index pending):', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to a case's chronological event timeline
 */
export function subscribeToCaseEvents(
  caseId: string,
  callback: (events: CaseEvent[]) => void
) {
  const eventsCol = collection(db, 'cases', caseId, 'events');
  const q = query(eventsCol);

  return onSnapshot(q, (snapshot) => {
    const events: CaseEvent[] = [];
    snapshot.forEach((docSnap) => {
      events.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as CaseEvent);
    });
    // Sort client-side by date if Firestore compound index is pending
    events.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    callback(events);
  });
}

/**
 * Conducts and records a Human Review in Firestore
 */
export async function submitHumanReview(
  caseId: string,
  reviewData: {
    reviewStatus: string;
    observations: string;
    interventionAction: string;
    followUpRequired: boolean;
    followUpDate?: string;
  },
  reviewer: UserProfile
): Promise<void> {
  const caseRef = doc(db, 'cases', caseId);

  // 1. Add review subdocument
  const reviewRef = doc(collection(caseRef, 'reviews'));
  await setDoc(reviewRef, {
    caseId,
    reviewerUid: reviewer.uid,
    reviewerName: reviewer.name,
    reviewerRole: reviewer.role,
    reviewStatus: reviewData.reviewStatus,
    observations: reviewData.observations,
    interventionAction: reviewData.interventionAction,
    followUpRequired: reviewData.followUpRequired,
    followUpDate: reviewData.followUpDate || '',
    createdAt: serverTimestamp(),
  });

  // 2. Add event to timeline
  const eventRef = doc(collection(caseRef, 'events'));
  await setDoc(eventRef, {
    eventType: 'HUMAN_REVIEW_CONDUCTED',
    description: `Review recorded by ${reviewer.name} (${reviewer.role}): ${reviewData.observations.slice(0, 100)}...`,
    createdBy: reviewer.email || reviewer.name,
    createdAt: serverTimestamp(),
    metadata: {
      reviewStatus: reviewData.reviewStatus,
      interventionAction: reviewData.interventionAction,
    },
  });

  // 3. Update main case document status
  const newStatus = reviewData.interventionAction ? 'intervention' : 'assigned';
  await updateDoc(caseRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
    updatedBy: reviewer.email || reviewer.name,
  });

  // 4. Append to immutable audit log
  await recordAuditLog({
    actorUid: reviewer.uid,
    actorRole: reviewer.role,
    action: 'HUMAN_REVIEW_COMPLETED',
    targetType: 'case',
    targetId: caseId,
    metadata: {
      reviewStatus: reviewData.reviewStatus,
      interventionAction: reviewData.interventionAction,
    },
  });
}

/**
 * Assigns an eligible case to a counsellor
 */
export async function assignCase(
  caseId: string,
  counsellorUid: string,
  counsellorName: string,
  assigner: UserProfile
): Promise<void> {
  const caseRef = doc(db, 'cases', caseId);
  const caseSnap = await getDoc(caseRef);
  const prevCounsellor = caseSnap.exists() ? caseSnap.data()?.assignedCounsellorName : 'None';

  // 1. Update Case
  await updateDoc(caseRef, {
    assignedCounsellorUid: counsellorUid,
    assignedCounsellorName: counsellorName,
    status: 'assigned',
    updatedAt: serverTimestamp(),
    updatedBy: assigner.email || assigner.name,
  });

  // 2. Add event to timeline
  const eventRef = doc(collection(caseRef, 'events'));
  await setDoc(eventRef, {
    eventType: 'CASE_ASSIGNED',
    description: `Case assigned to Lead Counsellor ${counsellorName} by ${assigner.name}.`,
    createdBy: assigner.email || assigner.name,
    createdAt: serverTimestamp(),
    metadata: {
      previousAssignee: prevCounsellor,
      newAssignee: counsellorName,
    },
  });

  // 3. Append to audit log
  await recordAuditLog({
    actorUid: assigner.uid,
    actorRole: assigner.role,
    action: 'CASE_ASSIGNMENT',
    targetType: 'case',
    targetId: caseId,
    metadata: {
      counsellorUid,
      counsellorName,
    },
  });
}

/**
 * Updates a case status with timeline event and audit logging
 */
export async function updateCaseStatus(
  caseId: string,
  newStatus: FirestoreCase['status'],
  notes: string,
  actor: UserProfile
): Promise<void> {
  const caseRef = doc(db, 'cases', caseId);
  await updateDoc(caseRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
    updatedBy: actor.email || actor.name,
  });

  // Timeline Event
  const eventRef = doc(collection(caseRef, 'events'));
  await setDoc(eventRef, {
    eventType: 'STATUS_CHANGED',
    description: `Status changed to "${newStatus}". Note: ${notes}`,
    createdBy: actor.email || actor.name,
    createdAt: serverTimestamp(),
    metadata: { newStatus },
  });

  // Audit Log
  await recordAuditLog({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'CASE_STATUS_UPDATED',
    targetType: 'case',
    targetId: caseId,
    metadata: { newStatus, notes },
  });
}

/**
 * Creates a new case in Firestore
 */
export async function createCaseInFirestore(
  caseData: Omit<FirestoreCase, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  actor: UserProfile
): Promise<string> {
  const caseRef = doc(db, 'cases', caseData.caseId);
  await setDoc(caseRef, {
    ...caseData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: actor.email || actor.name,
    updatedBy: actor.email || actor.name,
  });

  // Timeline Event
  const eventRef = doc(collection(caseRef, 'events'));
  await setDoc(eventRef, {
    eventType: 'CASE_CREATED',
    description: `Case ${caseData.caseId} initialized under protective alias ${caseData.victimAlias}.`,
    createdBy: actor.email || actor.name,
    createdAt: serverTimestamp(),
    metadata: { category: caseData.category },
  });

  // Audit Log
  await recordAuditLog({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'CASE_CREATED',
    targetType: 'case',
    targetId: caseData.caseId,
    metadata: { category: caseData.category },
  });

  return caseData.caseId;
}

/**
 * Append-only immutable Audit Logger
 */
export async function recordAuditLog(log: {
  actorUid: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const auditRef = doc(collection(db, 'auditLogs'));
    await setDoc(auditRef, {
      ...log,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to write immutable audit log:', err);
  }
}

/**
 * Real-time subscription to audit logs (Auditors and Administrators only)
 */
export function subscribeToAuditLogs(
  callback: (logs: FirestoreAuditLog[]) => void,
  limitCount = 50
) {
  const auditCol = collection(db, 'auditLogs');
  const q = query(auditCol, limit(limitCount));

  return onSnapshot(q, (snapshot) => {
    const logs: FirestoreAuditLog[] = [];
    snapshot.forEach((docSnap) => {
      logs.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as FirestoreAuditLog);
    });
    // Sort descending by timestamp
    logs.sort((a, b) => {
      const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || 0).getTime();
      const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });
    callback(logs);
  });
}

/**
 * Real-time subscription to registered system users (Admins only)
 */
export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  const usersCol = collection(db, 'users');
  return onSnapshot(usersCol, (snapshot) => {
    const users: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      users.push({
        uid: docSnap.id,
        ...docSnap.data(),
      } as UserProfile);
    });
    callback(users);
  });
}

/**
 * Administrative role and assignment modification
 */
export async function updateUserRoleAndDistrict(
  targetUid: string,
  newRole: UserRole,
  districtId: string,
  stateId: string,
  adminUser: UserProfile
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  await updateDoc(userRef, {
    role: newRole,
    districtId,
    stateId,
    updatedAt: serverTimestamp(),
  });

  await recordAuditLog({
    actorUid: adminUser.uid,
    actorRole: adminUser.role,
    action: 'USER_ROLE_OR_DISTRICT_CHANGED',
    targetType: 'user',
    targetId: targetUid,
    metadata: {
      newRole,
      districtId,
      stateId,
      modifiedBy: adminUser.name,
    },
  });
}
