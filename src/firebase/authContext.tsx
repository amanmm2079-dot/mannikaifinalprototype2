import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UserRole } from '../types';
import { recordAuditLog } from './caseService';
import { DEMO_ACCOUNTS, DemoAccount, ensureFirebaseAuthAccount, seedFirestoreCollections } from './seedService';
import { USER_ROLES, VALID_ROLES, logAuthorizationFailure } from '../services/authRoleSystem';

export interface AuthDiagnostic {
  isAuthenticated: boolean;
  uid: string;
  email: string;
  emailVerified: boolean;
  roleClaim: string;
  firestoreRole: string;
  active: boolean;
  resolvedRole: UserRole;
  authConfigError: string | null;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authConfigError: string | null;
  authDiagnostic: AuthDiagnostic;
  login: (email: string, pass: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  quickDemoLogin: (acc: DemoAccount) => Promise<UserProfile>;
  refreshIdToken: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authConfigError, setAuthConfigError] = useState<string | null>(null);
  const [tokenClaimRole, setTokenClaimRole] = useState<string>('none');

  // Resolves authoritative profile following priority:
  // 1. Firebase Authentication Identity
  // 2. Custom claims / token claims
  // 3. Firestore user document (/users/{uid})
  const resolveUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    let resolvedRole: UserRole = USER_ROLES.VICTIM;
    let claimRole: string | undefined = undefined;

    // 1 & 2: Inspect Firebase Auth identity and token claims
    try {
      const tokenResult = await firebaseUser.getIdTokenResult();
      claimRole = (tokenResult.claims.role as string) || (tokenResult.claims.userRole as string);
      setTokenClaimRole(claimRole || 'none');
    } catch (e) {
      console.warn('Could not inspect token claims:', e);
      setTokenClaimRole('none');
    }

    // 3: Fetch Firestore user profile
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let firestoreRole: string | undefined = undefined;
    let docData: Partial<UserProfile> | null = null;

    try {
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        docData = userSnap.data() as UserProfile;
        firestoreRole = docData.role;
      }
    } catch (err) {
      console.warn('Error fetching user document from Firestore:', err);
    }

    // Check for mismatch between Custom Claim and Firestore Profile
    if (claimRole && firestoreRole && claimRole !== firestoreRole) {
      const mismatchMsg = `Security Mismatch: Firebase token claim role (${claimRole}) differs from Firestore profile role (${firestoreRole}).`;
      setAuthConfigError(mismatchMsg);
      logAuthorizationFailure({
        userUid: firebaseUser.uid,
        requestedRoute: 'auth_claim_verification',
        actualRole: firestoreRole,
        requiredRoleOrPermission: claimRole,
        timestamp: new Date().toISOString(),
        reason: mismatchMsg,
      });
      // Prefer custom claim if explicitly provisioned, otherwise firestore role
      resolvedRole = (claimRole as UserRole) || (firestoreRole as UserRole);
    } else if (claimRole && VALID_ROLES.includes(claimRole as UserRole)) {
      resolvedRole = claimRole as UserRole;
      setAuthConfigError(null);
    } else if (firestoreRole && VALID_ROLES.includes(firestoreRole as UserRole)) {
      resolvedRole = firestoreRole as UserRole;
      setAuthConfigError(null);
    } else {
      // Find matching demo account by email if present
      const matchedDemo = DEMO_ACCOUNTS.find(
        (d) => d.email.toLowerCase() === (firebaseUser.email || '').toLowerCase()
      );
      if (matchedDemo) {
        resolvedRole = matchedDemo.role;
      }
      setAuthConfigError(null);
    }

    // Build the resolved profile
    const matchedDemo = DEMO_ACCOUNTS.find(
      (d) => d.email.toLowerCase() === (firebaseUser.email || '').toLowerCase()
    );

    const profile: UserProfile = {
      uid: firebaseUser.uid,
      name: docData?.name || matchedDemo?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Authenticated User',
      email: firebaseUser.email || '',
      role: resolvedRole,
      active: docData?.active ?? true,
      districtId: docData?.districtId || matchedDemo?.districtId || 'pune',
      stateId: docData?.stateId || matchedDemo?.stateId || 'maharashtra',
      language: docData?.language || 'hi',
      credentials: docData?.credentials || matchedDemo?.credentials || {
        counsellorCredential: resolvedRole === USER_ROLES.COUNSELLOR,
        credentialVerified: true,
      },
      createdAt: docData?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // If doc did not exist, persist it to Firestore
    if (!docData) {
      try {
        await setDoc(userDocRef, profile, { merge: true });
      } catch (err) {
        console.warn('Could not persist resolved profile to Firestore:', err);
      }
    }

    return profile;
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await resolveUserProfile(firebaseUser);
          setUserProfile(profile);

          // Seed demo collections if authenticated as national admin or primary developer
          if (profile.role === 'national_admin' || firebaseUser.email === 'babitamishra0511987@gmail.com') {
            seedFirestoreCollections().catch((err) => {
              console.info('Auto-seed check complete:', err?.message || err);
            });
          }
        } catch (err) {
          console.error('Error resolving user profile:', err);
        }
      } else {
        // Fallback to default demo user for review if not signed in
        const defaultDemo = DEMO_ACCOUNTS[0]; // Sunita D. (Victim)
        setUserProfile({
          uid: 'demo-sunita-uid',
          name: defaultDemo.name,
          email: defaultDemo.email,
          role: defaultDemo.role,
          active: true,
          districtId: defaultDemo.districtId,
          stateId: defaultDemo.stateId,
          language: 'hi',
          credentials: defaultDemo.credentials || { counsellorCredential: false, credentialVerified: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setTokenClaimRole('none');
        setAuthConfigError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolveUserProfile]);

  const refreshIdToken = async () => {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      setTokenClaimRole((tokenResult.claims.role as string) || 'none');
      const profile = await resolveUserProfile(auth.currentUser);
      setUserProfile(profile);
    }
  };

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await resolveUserProfile(res.user);
      setUserProfile(profile);

      await recordAuditLog({
        actorUid: res.user.uid,
        actorRole: profile.role,
        action: 'AUTHENTICATION_LOGIN_SUCCESS',
        targetType: 'auth',
        targetId: res.user.uid,
        metadata: { email, role: profile.role },
      });

      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await recordAuditLog({
        actorUid: currentUser.uid,
        actorRole: userProfile?.role || 'user',
        action: 'AUTHENTICATION_LOGOUT',
        targetType: 'auth',
        targetId: currentUser.uid,
      });
    }
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const quickDemoLogin = async (acc: DemoAccount): Promise<UserProfile> => {
    setLoading(true);
    try {
      // 1. Authenticate with real Firebase Auth account
      const { uid } = await ensureFirebaseAuthAccount(acc);

      // 2. Persist in Firestore users collection
      const userRef = doc(db, 'users', uid);
      const prof: UserProfile = {
        uid,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        active: true,
        districtId: acc.districtId,
        stateId: acc.stateId,
        language: 'hi',
        credentials: acc.credentials || {
          counsellorCredential: acc.role === USER_ROLES.COUNSELLOR,
          credentialVerified: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(userRef, prof, { merge: true });
      } catch (e) {
        console.warn('Could not write user profile to firestore:', e);
      }

      setUserProfile(prof);

      await recordAuditLog({
        actorUid: uid,
        actorRole: acc.role,
        action: 'DEMO_ACCOUNT_AUTHENTICATED',
        targetType: 'auth',
        targetId: uid,
        metadata: { role: acc.role, name: acc.name },
      });

      return prof;
    } catch (err) {
      console.warn('Fallback to local demo session if offline:', err);
      const fallbackProf: UserProfile = {
        uid: `demo-${acc.role}-uid`,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        active: true,
        districtId: acc.districtId,
        stateId: acc.stateId,
        language: 'hi',
        credentials: acc.credentials || {
          counsellorCredential: acc.role === USER_ROLES.COUNSELLOR,
          credentialVerified: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUserProfile(fallbackProf);
      return fallbackProf;
    } finally {
      setLoading(false);
    }
  };

  const authDiagnostic: AuthDiagnostic = {
    isAuthenticated: !!currentUser,
    uid: currentUser?.uid || userProfile?.uid || 'anonymous',
    email: currentUser?.email || userProfile?.email || 'unauthenticated',
    emailVerified: currentUser?.emailVerified ?? false,
    roleClaim: tokenClaimRole,
    firestoreRole: userProfile?.role || 'none',
    active: userProfile?.active ?? false,
    resolvedRole: userProfile?.role || USER_ROLES.VICTIM,
    authConfigError,
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authConfigError,
        authDiagnostic,
        login,
        logout,
        resetPassword,
        quickDemoLogin,
        refreshIdToken,
        isDemoMode: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
