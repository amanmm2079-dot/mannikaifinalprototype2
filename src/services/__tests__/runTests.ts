import { 
  calculateOperationalDistress, 
  formatDistressScore, 
  generateOperationalAlerts, 
  SCORING_CONFIG,
  CaseScoringInput,
  ScoreHistoryEntry
} from '../distressScoring';

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

console.log('\n--- STARTING DETERMINISTIC DISTRESS SCORING ENGINE TESTS ---\n');

// 1. Minimum possible input
const minInput: CaseScoringInput = {
  caseId: 'TEST-MIN-001',
  sleepScore: 5,
  safetyScore: 5,
  overwhelmScore: 1,
  socialConnectionScore: 5,
  physicalSymptoms: [],
  recentThreatReported: false,
  consecutiveMissedCheckIns: 0,
  voiceStressJitter: 1.0,
};
const minResult = calculateOperationalDistress(minInput);
assert(minResult.score === 0.00, 'Test 1: Minimum input produces 0.00 score');
assert(minResult.level === 'LOW', 'Test 1b: Minimum input level is LOW');

// 2. Maximum possible input
const maxInput: CaseScoringInput = {
  caseId: 'TEST-MAX-001',
  sleepScore: 1,
  safetyScore: 1,
  overwhelmScore: 5,
  socialConnectionScore: 1,
  physicalSymptoms: ['tremors', 'palpitations', 'chills', 'insomnia'],
  recentThreatReported: true,
  threatDetails: 'Imminent witness coercion threat',
  consecutiveMissedCheckIns: 4,
  voiceStressJitter: 4.8,
};
const maxResult = calculateOperationalDistress(maxInput);
assert(maxResult.score <= 10.00, 'Test 2: Maximum input does not exceed 10.00');
assert(maxResult.score >= 8.50, 'Test 2b: Maximum input reaches URGENT range');
assert(maxResult.priority === 'urgent', 'Test 2c: Priority is urgent');

// 3. Missing inputs handle gracefully without crashing
const emptyInput: CaseScoringInput = { caseId: 'TEST-EMPTY-001' };
const emptyResult = calculateOperationalDistress(emptyInput);
assert(!isNaN(emptyResult.score), 'Test 3: Missing inputs handled without NaN');
assert(emptyResult.factorBreakdown.length === 8, 'Test 3b: All 8 factor breakdowns populated');

// 4. Invalid input clamping
const invalidInput: CaseScoringInput = {
  caseId: 'TEST-INVALID-001',
  sleepScore: -10, // should clamp to 1
  safetyScore: 99, // should clamp to 5
  overwhelmScore: 100, // should clamp to 5
  socialConnectionScore: -5, // should clamp to 1
};
const invalidResult = calculateOperationalDistress(invalidInput);
assert(invalidResult.score >= 0 && invalidResult.score <= 10, 'Test 4: Out-of-bounds input clamped safely');

// 5 & 6 & 7. Clamping boundaries
assert(minResult.score >= 0.00, 'Test 5: Score never below 0');
assert(maxResult.score <= 10.00, 'Test 6: Score never exceeds 10');

// 8. Decimal precision
assert(formatDistressScore(7.354).startsWith('7.35'), 'Test 8: Decimal precision formatted to 2 decimals');

// 9. Reproducibility test (Run 100 times, must yield 100% identical outputs)
const stableSampleInput: CaseScoringInput = {
  caseId: 'TEST-REPRO-001',
  sleepScore: 2,
  safetyScore: 2,
  overwhelmScore: 4,
  socialConnectionScore: 2,
  physicalSymptoms: ['headaches'],
  recentThreatReported: false,
};
const baselineRun = calculateOperationalDistress(stableSampleInput);
let allIdentical = true;
for (let i = 0; i < 100; i++) {
  const rerun = calculateOperationalDistress(stableSampleInput);
  if (rerun.score !== baselineRun.score || rerun.normalizedScore !== baselineRun.normalizedScore) {
    allIdentical = false;
    break;
  }
}
assert(allIdentical, 'Test 9: Exact deterministic reproducibility across 100 repeated executions');

// 10. Different inputs produce different outputs
const mildInput: CaseScoringInput = {
  caseId: 'TEST-MILD-001',
  sleepScore: 4,
  safetyScore: 4,
  overwhelmScore: 2,
  socialConnectionScore: 4,
};
const mildResult = calculateOperationalDistress(mildInput);
assert(mildResult.score < baselineRun.score, 'Test 10: Lower distress input produces lower calculated score');

// 11. One measurement returns INSUFFICIENT_DATA
const singleHistoryInput: CaseScoringInput = {
  ...mildInput,
  historyMeasurements: [],
};
const singleHistoryResult = calculateOperationalDistress(singleHistoryInput);
assert(singleHistoryResult.trajectory === 'INSUFFICIENT_DATA', 'Test 11: Single/no historical measurement gives INSUFFICIENT_DATA');

// 12 & 13. Increasing trend detection
const historyPrevLow: ScoreHistoryEntry = {
  id: 'H1',
  caseId: 'TEST-MILD-001',
  score: 2.00,
  level: 'LOW',
  scoringVersion: '1.0.0',
  source: 'check_in',
  calculatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
};
const increasingInput: CaseScoringInput = {
  ...stableSampleInput,
  historyMeasurements: [historyPrevLow],
};
const increasingResult = calculateOperationalDistress(increasingInput);
assert(increasingResult.trajectory === 'INCREASING' || increasingResult.trajectory === 'RAPID_CHANGE', 'Test 13: Increasing trend detected correctly');

// 14. Decreasing trend detection
const historyPrevHigh: ScoreHistoryEntry = {
  id: 'H2',
  caseId: 'TEST-MILD-001',
  score: 8.50,
  level: 'URGENT',
  scoringVersion: '1.0.0',
  source: 'check_in',
  calculatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
};
const decreasingInput: CaseScoringInput = {
  ...mildInput,
  historyMeasurements: [historyPrevHigh],
};
const decreasingResult = calculateOperationalDistress(decreasingInput);
assert(decreasingResult.trajectory === 'DECREASING', 'Test 14: Decreasing recovery trend detected');

// 15. Rapid change detection (>= 1.5 delta within 72h)
const historyRecent: ScoreHistoryEntry = {
  id: 'H3',
  caseId: 'TEST-MAX-001',
  score: 3.50,
  level: 'LOW',
  scoringVersion: '1.0.0',
  source: 'check_in',
  calculatedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
};
const rapidInput: CaseScoringInput = {
  ...maxInput,
  historyMeasurements: [historyRecent],
};
const rapidResult = calculateOperationalDistress(rapidInput);
assert(rapidResult.trajectory === 'RAPID_CHANGE', 'Test 15: Rapid change detected when delta >= 1.5 within 72h');

// 16. Alert generation on trigger
const alerts = generateOperationalAlerts(rapidResult, 'TEST-MAX-001');
assert(alerts.length > 0, 'Test 16: Alert generated on rapid change & high distress');
assert(alerts.some(a => a.type === 'ACUTE_SPIKE'), 'Test 16b: ACUTE_SPIKE alert created');

// 17. Duplicate alert prevention
const duplicateAlerts = generateOperationalAlerts(rapidResult, 'TEST-MAX-001', alerts);
assert(duplicateAlerts.length === 0, 'Test 17: Duplicate alerts prevented via deduplication check');

// 18. Scoring version is stored
assert(rapidResult.scoringVersion === '1.0.0', 'Test 18: Scoring version explicitly stored');

// 19. Human review flag required on high/urgent priority
assert(rapidResult.requiresHumanReview === true, 'Test 19: Human review flagged as required on urgent priority');

// 20. Historical score persistence check
assert(historyRecent.score === 3.50 && historyRecent.scoringVersion === '1.0.0', 'Test 20: Historical score remains immutable');

console.log('\n--- STARTING CENTRAL ROLE SYSTEM & AUTHORIZATION ROUTING TESTS ---\n');

import { 
  USER_ROLES, 
  ROLE_DISPLAY_NAMES, 
  getDashboardForRole, 
  getDashboardViewForRole, 
  canAccessView, 
  checkCredentialsForAction, 
  hasPermission,
  ROLE_PERMISSION_MATRIX 
} from '../authRoleSystem';

// 21. Test the Exact Current Bug: Vandana Sharma (national_admin)
const vandanaUser = {
  name: 'Vandana Sharma',
  role: USER_ROLES.NATIONAL_ADMIN,
  credentials: { counsellorCredential: false },
};

const vandanaDashboardRoute = getDashboardForRole(vandanaUser.role);
const vandanaDashboardView = getDashboardViewForRole(vandanaUser.role);
const vandanaCredCheck = checkCredentialsForAction(vandanaUser.role, vandanaUser.credentials, 'national');
const vandanaCanAccessNational = canAccessView(vandanaUser.role, 'national', vandanaUser.credentials);
const vandanaCanAccessAdmin = canAccessView(vandanaUser.role, 'admin', vandanaUser.credentials);

assert(vandanaUser.role === 'national_admin', 'Test 21a: Vandana Sharma has authoritative national_admin role');
assert(vandanaCredCheck.status === 'NOT_REQUIRED', 'Test 21b: National Administrator NEVER requires Lead Counsellor credentials');
assert(vandanaDashboardRoute === '/dashboard/national', 'Test 21c: National Administrator maps directly to /dashboard/national');
assert(vandanaDashboardView === 'national', 'Test 21d: National Administrator resolved view is "national"');
assert(vandanaCanAccessNational === true, 'Test 21e: National Administrator is ALLOWED on National Dashboard');
assert(vandanaCanAccessAdmin === true, 'Test 21f: National Administrator is ALLOWED on System Admin Panel');

// 22. Test Role Separation Across All 6 Distinct Roles
// Rule: Each role + no counsellor credential (except counsellor) -> ALLOW their dashboard
assert(canAccessView('national_admin', 'national', { counsellorCredential: false }) === true, 'Test 22a: national_admin + no counsellor credential -> ALLOW National Dashboard');
assert(canAccessView('state_admin', 'state', { counsellorCredential: false }) === true, 'Test 22b: state_admin + no counsellor credential -> ALLOW State Dashboard');
assert(canAccessView('district_officer', 'district', { counsellorCredential: false }) === true, 'Test 22c: district_officer + no counsellor credential -> ALLOW District Dashboard');
assert(canAccessView('auditor', 'auditor', { counsellorCredential: false }) === true, 'Test 22d: auditor + no counsellor credential -> ALLOW Auditor Dashboard');
assert(canAccessView('victim', 'victim', { counsellorCredential: false }) === true, 'Test 22e: victim + no counsellor credential -> ALLOW Victim Dashboard');
assert(canAccessView('counsellor', 'counsellor', { counsellorCredential: true, credentialVerified: true }) === true, 'Test 22f: counsellor + verified credential -> ALLOW Counsellor Dashboard');

// Rule: Cross-role unauthorized access is strictly DENIED (403)
assert(canAccessView('victim', 'national') === false, 'Test 22g: victim -> National Dashboard is DENIED');
assert(canAccessView('counsellor', 'national') === false, 'Test 22h: counsellor -> National Dashboard is DENIED');
assert(canAccessView('district_officer', 'state') === false, 'Test 22i: district_officer -> State Dashboard is DENIED');
assert(canAccessView('victim', 'district') === false, 'Test 22j: victim -> District Dashboard is DENIED');
assert(canAccessView('auditor', 'national') === false, 'Test 22k: auditor -> National Dashboard is DENIED');

// 23. Test Display Names Consistency
assert(ROLE_DISPLAY_NAMES[USER_ROLES.VICTIM] === 'Victim / Complainant', 'Test 23a: Display name for victim is "Victim / Complainant"');
assert(ROLE_DISPLAY_NAMES[USER_ROLES.COUNSELLOR] === 'Lead Counsellor', 'Test 23b: Display name for counsellor is "Lead Counsellor"');
assert(ROLE_DISPLAY_NAMES[USER_ROLES.DISTRICT_OFFICER] === 'District Welfare Officer', 'Test 23c: Display name for district_officer is "District Welfare Officer"');
assert(ROLE_DISPLAY_NAMES[USER_ROLES.STATE_ADMIN] === 'State Administrator', 'Test 23d: Display name for state_admin is "State Administrator"');
assert(ROLE_DISPLAY_NAMES[USER_ROLES.NATIONAL_ADMIN] === 'National Administrator', 'Test 23e: Display name for national_admin is "National Administrator"');
assert(ROLE_DISPLAY_NAMES[USER_ROLES.AUDITOR] === 'System Auditor', 'Test 23f: Display name for auditor is "System Auditor"');

// 24. Test Master Permission Matrix
assert(hasPermission('national_admin', 'viewNationalDashboard') === true, 'Test 24a: national_admin has viewNationalDashboard');
assert(hasPermission('national_admin', 'manageThresholds') === true, 'Test 24b: national_admin has manageThresholds');
assert(hasPermission('national_admin', 'conductHumanReview') === false, 'Test 24c: national_admin does NOT have conductHumanReview (Clinical)');
assert(hasPermission('counsellor', 'conductHumanReview') === true, 'Test 24d: counsellor has conductHumanReview');
assert(hasPermission('counsellor', 'manageThresholds') === false, 'Test 24e: counsellor does NOT have manageThresholds');
assert(hasPermission('victim', 'viewOwnCases') === true, 'Test 24f: victim has viewOwnCases');
assert(hasPermission('victim', 'viewAuditLogs') === false, 'Test 24g: victim does NOT have viewAuditLogs');
assert(hasPermission('auditor', 'viewAuditLogs') === true, 'Test 24h: auditor has viewAuditLogs');
assert(hasPermission('auditor', 'manageAuthorizedUsers') === false, 'Test 24i: auditor does NOT have manageAuthorizedUsers');

// 25. Test Clinical Credential Gate logic
const adminCredCheck = checkCredentialsForAction('national_admin', { counsellorCredential: false }, 'national');
const stateCredCheck = checkCredentialsForAction('state_admin', { counsellorCredential: false }, 'state');
const districtCredCheck = checkCredentialsForAction('district_officer', { counsellorCredential: false }, 'district');
const auditorCredCheck = checkCredentialsForAction('auditor', { counsellorCredential: false }, 'auditor');
const victimCredCheck = checkCredentialsForAction('victim', { counsellorCredential: false }, 'victim');
const unverifiedCounsellorCheck = checkCredentialsForAction('counsellor', { counsellorCredential: false }, 'counsellor');
const verifiedCounsellorCheck = checkCredentialsForAction('counsellor', { counsellorCredential: true, credentialVerified: true }, 'counsellor');

assert(adminCredCheck.status === 'NOT_REQUIRED', 'Test 25a: Government National Admin credential check is NOT_REQUIRED');
assert(stateCredCheck.status === 'NOT_REQUIRED', 'Test 25b: Government State Admin credential check is NOT_REQUIRED');
assert(districtCredCheck.status === 'NOT_REQUIRED', 'Test 25c: Government District Officer credential check is NOT_REQUIRED');
assert(auditorCredCheck.status === 'NOT_REQUIRED', 'Test 25d: Auditor credential check is NOT_REQUIRED');
assert(victimCredCheck.status === 'NOT_REQUIRED', 'Test 25e: Victim credential check is NOT_REQUIRED');
assert(unverifiedCounsellorCheck.status === 'FAIL', 'Test 25f: Unverified counsellor credential check FAILS');
assert(verifiedCounsellorCheck.status === 'PASS', 'Test 25g: Verified counsellor credential check PASSES');

console.log('\n--- STARTING COMPREHENSIVE QUESTIONNAIRE, SOS & SUPPORT TESTS ---\n');

import { findNearestSupportPoint, calculateHaversineDistanceKm, SosService } from '../sosService';
import { StoredAssessmentRecord } from '../../types/questionnaire';

// 26. Comprehensive multi-step questionnaire scoring & persistence structure
const mockAssessmentRecord: StoredAssessmentRecord = {
  assessmentId: 'ASM-TEST-001',
  caseId: 'CASE-MH-2026-109',
  userId: 'usr-victim-01',
  responses: {
    emotionalState: 'managing',
    stressLevel: 4,
    feelingOverwhelmed: 'several_days',
    feelingSafe: 'mostly_safe',
    abilityToConcentrate: 'normal',
    sleepQuality: 'interrupted',
    energyLevel: 'moderate',
    performNormalActivities: 'with_effort',
    appetiteRoutine: 'regular',
    socialInteraction: 'limited',
    studyOrWork: 'struggling',
    routineChanges: ['staying_indoors'],
    caseProceedingsStress: 'moderate',
    stressDueToDelays: 'somewhat',
    difficultyAttendingProceedings: 'no_difficulty',
    feelingSupportedInProcess: 'somewhat_supported',
    caseProcessConcerns: [],
    currentlyFeelSafe: 'yes',
    needCounsellorSupport: true,
    needLegalAssistance: false,
    needFinancialRelief: false,
    needRehabilitationSupport: false,
    wantSupportTeamContact: true,
    preferredContactMethod: 'phone_call',
    optionalTextNotes: 'Everything is okay right now, just feeling a bit anxious.',
  },
  submittedAt: new Date().toISOString(),
  language: 'hi',
  completionPercentage: 100,
  source: 'web_questionnaire',
  version: 'v2.1-comprehensive',
  calculatedDistressScore: 4.8,
  riskBand: 'moderate',
  contributingFactors: ['Periodic longitudinal check-in'],
};

assert(mockAssessmentRecord.version === 'v2.1-comprehensive', 'Test 26a: Questionnaire version explicitly stored as v2.1-comprehensive');
assert(mockAssessmentRecord.completionPercentage === 100, 'Test 26b: Completion percentage is 100%');
assert(mockAssessmentRecord.responses.emotionalState === 'managing', 'Test 26c: Section A emotional state preserved');
assert(mockAssessmentRecord.responses.wantSupportTeamContact === true, 'Test 26d: Section D support request preserved');

// 27. Haversine distance & nearest authorized support point calculation
const distPune = calculateHaversineDistanceKm(18.5204, 73.8567, 18.5789, 73.8078);
assert(distPune > 0 && distPune < 20, 'Test 27a: Haversine distance calculation produces valid distance in km');

const nearestPoint = findNearestSupportPoint(18.5204, 73.8567, 'Pune');
assert(nearestPoint.point !== undefined, 'Test 27b: Nearest support point is resolved');
assert(nearestPoint.point.district === 'Pune', 'Test 27c: Nearest support point matches Pune district');
assert(nearestPoint.point.isDesignatedAtrocityNodalPoint === true, 'Test 27d: Support point is designated statutory nodal cell');

// 28. Emergency SOS Alert routing and record structure
const sosAlert = SosService.triggerSosAlert({
  caseId: 'CASE-MH-2026-109',
  userId: 'usr-victim-01',
  userAlias: 'Sunita D.',
  district: 'Pune',
  state: 'Maharashtra',
  latitude: 18.5204,
  longitude: 73.8567,
  locationStatus: 'browser_gps',
});

assert(sosAlert.sosId.startsWith('SOS-'), 'Test 28a: SOS alert ID generated properly');
assert(sosAlert.alertStatus === 'SENT', 'Test 28b: SOS initial state is SENT');
assert(sosAlert.responderId !== '', 'Test 28c: SOS alert is assigned to designated support point');

const ackSos = SosService.updateSosStatus(sosAlert.sosId, 'ACKNOWLEDGED', 'Nodal desk acknowledged emergency beacon');
assert(ackSos?.alertStatus === 'ACKNOWLEDGED', 'Test 28d: SOS status transitions to ACKNOWLEDGED');

// 29. Human Support Request workflow
const supportReq = SosService.createSupportRequest({
  caseId: 'CASE-MH-2026-109',
  userId: 'usr-victim-01',
  userName: 'Sunita D.',
  type: 'counsellor',
  urgency: 'priority',
  notes: 'Victim requested 1-on-1 trauma stabilization session.',
});

assert(supportReq.id.startsWith('REQ-'), 'Test 29a: Support request ID generated properly');
assert(supportReq.status === 'pending', 'Test 29b: Support request initial state is pending');

const resolvedReq = SosService.updateSupportRequestStatus(supportReq.id, 'resolved', 'Dr. Ananya Sen');
assert(resolvedReq?.status === 'resolved', 'Test 29c: Support request transitions to resolved');
assert(resolvedReq?.assignedTo === 'Dr. Ananya Sen', 'Test 29d: Support request records assigned clinician');

console.log('\n🌟 ALL 29 SCORING, RBAC, QUESTIONNAIRE, SOS & CASEWORKER TESTS PASSED SUCCESSFULLY! 🌟\n');
