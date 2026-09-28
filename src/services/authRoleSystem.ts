/**
 * Authoritative Central Role & Permission System for Mannik AI Care Core
 * Enforces strict Role-Based Access Control (RBAC) and separates
 * Roles from Clinical Credentials and Permissions.
 */

export const USER_ROLES = {
  VICTIM: 'victim',
  COUNSELLOR: 'counsellor',
  DISTRICT_OFFICER: 'district_officer',
  STATE_ADMIN: 'state_admin',
  NATIONAL_ADMIN: 'national_admin',
  AUDITOR: 'auditor',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const VALID_ROLES: UserRole[] = [
  USER_ROLES.VICTIM,
  USER_ROLES.COUNSELLOR,
  USER_ROLES.DISTRICT_OFFICER,
  USER_ROLES.STATE_ADMIN,
  USER_ROLES.NATIONAL_ADMIN,
  USER_ROLES.AUDITOR,
];

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [USER_ROLES.VICTIM]: 'Victim / Complainant',
  [USER_ROLES.COUNSELLOR]: 'Lead Counsellor',
  [USER_ROLES.DISTRICT_OFFICER]: 'District Welfare Officer',
  [USER_ROLES.STATE_ADMIN]: 'State Administrator',
  [USER_ROLES.NATIONAL_ADMIN]: 'National Administrator',
  [USER_ROLES.AUDITOR]: 'System Auditor',
};

export const ROLE_DASHBOARDS: Record<UserRole, { route: string; view: string; title: string }> = {
  [USER_ROLES.VICTIM]: {
    route: '/dashboard/victim',
    view: 'victim',
    title: 'Victim Check-In Hub',
  },
  [USER_ROLES.COUNSELLOR]: {
    route: '/dashboard/counsellor',
    view: 'counsellor',
    title: 'Lead Counsellor Clinical Queue',
  },
  [USER_ROLES.DISTRICT_OFFICER]: {
    route: '/dashboard/district',
    view: 'district',
    title: 'District Welfare Officer Dashboard',
  },
  [USER_ROLES.STATE_ADMIN]: {
    route: '/dashboard/state',
    view: 'state',
    title: 'State Administrator Dashboard',
  },
  [USER_ROLES.NATIONAL_ADMIN]: {
    route: '/dashboard/national',
    view: 'national',
    title: 'National Administrator Dashboard',
  },
  [USER_ROLES.AUDITOR]: {
    route: '/dashboard/auditor',
    view: 'auditor',
    title: 'System Auditor Dashboard',
  },
};

/**
 * Maps an authenticated user role to its designated primary dashboard route.
 */
export function getDashboardForRole(role: UserRole | string | undefined): string {
  if (!role || !(role in ROLE_DASHBOARDS)) {
    return '/dashboard/victim';
  }
  return ROLE_DASHBOARDS[role as UserRole].route;
}

/**
 * Maps an authenticated user role to its active dashboard view string.
 */
export function getDashboardViewForRole(role: UserRole | string | undefined): 'victim' | 'counsellor' | 'district' | 'state' | 'national' | 'auditor' {
  if (!role || !(role in ROLE_DASHBOARDS)) {
    return 'victim';
  }
  return ROLE_DASHBOARDS[role as UserRole].view as any;
}

export type Permission =
  // Victim permissions
  | 'viewOwnCases'
  | 'createCase'
  | 'submitCheckIn'
  | 'accessGroundingSpace'
  | 'accessSomaticExercises'
  | 'accessStatutoryRights'
  // Counsellor permissions
  | 'viewAssignedCases'
  | 'conductHumanReview'
  | 'recordIntervention'
  | 'accessClinicalNotes'
  // District Officer permissions
  | 'viewDistrictCases'
  | 'assignCounsellors'
  | 'viewDistrictReports'
  | 'dispatchInterventions'
  // State Admin permissions
  | 'viewStateCases'
  | 'viewStateReports'
  | 'manageDistrictUsers'
  // National Admin permissions
  | 'viewAuthorizedNationalReports'
  | 'manageAuthorizedUsers'
  | 'viewSystemOverview'
  | 'manageSystemConfiguration'
  | 'viewNationalDashboard'
  | 'manageThresholds'
  | 'viewAuditLogs'
  // Auditor permissions
  | 'viewSecurityEvents'
  | 'exportAuditTrail';

/**
 * Central Master Permission Matrix
 * Maps each authorized role to its explicit set of permissions.
 */
export const ROLE_PERMISSION_MATRIX: Record<UserRole, readonly Permission[]> = {
  [USER_ROLES.VICTIM]: [
    'viewOwnCases',
    'createCase',
    'submitCheckIn',
    'accessGroundingSpace',
    'accessSomaticExercises',
    'accessStatutoryRights',
  ],
  [USER_ROLES.COUNSELLOR]: [
    'viewAssignedCases',
    'conductHumanReview',
    'recordIntervention',
    'accessClinicalNotes',
    'accessGroundingSpace',
    'accessSomaticExercises',
    'accessStatutoryRights',
  ],
  [USER_ROLES.DISTRICT_OFFICER]: [
    'viewDistrictCases',
    'assignCounsellors',
    'viewDistrictReports',
    'dispatchInterventions',
    'viewAuditLogs',
  ],
  [USER_ROLES.STATE_ADMIN]: [
    'viewStateCases',
    'viewStateReports',
    'manageDistrictUsers',
    'viewAuditLogs',
  ],
  [USER_ROLES.NATIONAL_ADMIN]: [
    'viewAuthorizedNationalReports',
    'manageAuthorizedUsers',
    'viewSystemOverview',
    'manageSystemConfiguration',
    'viewNationalDashboard',
    'manageThresholds',
    'viewAuditLogs',
    'viewSecurityEvents',
  ],
  [USER_ROLES.AUDITOR]: [
    'viewAuditLogs',
    'viewSecurityEvents',
    'exportAuditTrail',
  ],
};

/**
 * Validates if a role has an explicit permission.
 */
export function hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
  if (!role || !(role in ROLE_PERMISSION_MATRIX)) return false;
  return ROLE_PERMISSION_MATRIX[role as UserRole].includes(permission);
}

export interface UserCredentials {
  counsellorCredential?: boolean;
  clinicalLicenseNumber?: string;
  credentialVerified?: boolean;
}

export type CredentialCheckStatus = 'PASS' | 'NOT_REQUIRED' | 'FAIL';

/**
 * Checks if credentials are valid for a requested action or view.
 * Government administrative roles (national_admin, state_admin, district_officer, auditor)
 * and victims NEVER require counsellor credentials!
 */
export function checkCredentialsForAction(
  role: UserRole | string | undefined,
  credentials?: UserCredentials,
  actionOrView?: string
): { status: CredentialCheckStatus; reason?: string } {
  // Only the counsellor role, or clinical-specific actions, evaluate counsellor credentials
  if (role !== USER_ROLES.COUNSELLOR && actionOrView !== 'counsellor' && actionOrView !== 'clinical_review') {
    return {
      status: 'NOT_REQUIRED',
    };
  }

  // If role is counsellor, verify their clinical credential status
  if (role === USER_ROLES.COUNSELLOR) {
    if (credentials?.counsellorCredential === false || credentials?.credentialVerified === false) {
      return {
        status: 'FAIL',
        reason: 'Lead Clinical Counsellor credentials are unverified or expired.',
      };
    }
    return {
      status: 'PASS',
    };
  }

  // Non-counsellors attempting a clinical counsellor-only action
  return {
    status: 'NOT_REQUIRED',
  };
}

/**
 * Evaluates whether a given user can access a specific view.
 */
export function canAccessView(
  userRole: UserRole | string | undefined,
  view: string,
  credentials?: UserCredentials
): boolean {
  if (!userRole) return false;

  // Universal open views
  if (view === 'home' || view === 'exercises' || view === 'rights' || view === 'safety_plan') {
    return true;
  }

  // Exact view-to-role mappings
  switch (userRole) {
    case USER_ROLES.VICTIM:
      return view === 'victim';

    case USER_ROLES.COUNSELLOR:
      // Counsellor can access counsellor queue and preview the victim check-in experience
      if (view === 'counsellor' || view === 'victim') {
        const cred = checkCredentialsForAction(userRole, credentials, view);
        return cred.status !== 'FAIL';
      }
      return false;

    case USER_ROLES.DISTRICT_OFFICER:
      return view === 'district';

    case USER_ROLES.STATE_ADMIN:
      // State Admin accesses state dashboard
      return view === 'state' || view === 'national'; // national view in 'state' mode

    case USER_ROLES.NATIONAL_ADMIN:
      // National Admin accesses national dashboard and system administration panel
      return view === 'national' || view === 'admin' || view === 'state';

    case USER_ROLES.AUDITOR:
      // Auditor accesses auditor dashboard or admin panel audit view
      return view === 'auditor' || view === 'admin';

    default:
      return false;
  }
}

export interface AuthorizationFailureLog {
  userUid?: string;
  requestedRoute: string;
  actualRole: string;
  requiredRoleOrPermission: string;
  timestamp: string;
  reason: string;
}

const failureLogs: AuthorizationFailureLog[] = [];

/**
 * Records authorization failures without leaking sensitive tokens or passwords.
 */
export function logAuthorizationFailure(log: AuthorizationFailureLog) {
  failureLogs.push(log);
  if (failureLogs.length > 50) failureLogs.shift();
  console.warn(
    `[SECURITY 403] Authorization denied: UID="${log.userUid || 'anonymous'}", Role="${log.actualRole}", Route="${log.requestedRoute}", Required="${log.requiredRoleOrPermission}", Reason="${log.reason}"`
  );
}

export function getAuthorizationFailureLogs(): AuthorizationFailureLog[] {
  return [...failureLogs];
}
