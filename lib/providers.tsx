'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { PlanId, getPlanLimits, PlanLimits } from '@/lib/planLimits';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);




type ThemeMode = 'neumorphic' | 'glassmorphism' | 'defi';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isPaywall: boolean;
  isAdmin: boolean;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  notificationsEnabled: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  canUsePremiumTheme: boolean;
  userPlan: PlanId;
  planLimits: PlanLimits;
  login: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  loginWithEmail: (e: string, p: string, isRegister?: boolean) => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<{ notificationsEnabled: boolean; theme?: ThemeMode }>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPaywall: false,
  isAdmin: false,
  trialEndsAt: null,
  subscriptionEndsAt: null,
  notificationsEnabled: true,
  theme: 'neumorphic',
  setTheme: () => {},
  canUsePremiumTheme: false,
  userPlan: 'free',
  planLimits: getPlanLimits('free'),
  login: async () => {},
  loginWithGitHub: async () => {},
  loginWithEmail: async () => {},
  loginWithApple: async () => {},
  loginWithMagicLink: async () => {},
  logout: async () => {},
  updateProfile: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaywall, setIsPaywall] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<Date | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setThemeState] = useState<ThemeMode>('neumorphic');
  const [userPlan, setUserPlan] = useState<PlanId>('free');

  useEffect(() => {
    let unsubscribeDoc = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
      } else {
        // Force a guest user if not signed in
        setUser({ 
          uid: 'guest_user', 
          email: 'guest@stackbox.pro', 
          displayName: 'Guest',
          isAnonymous: true,
          providerId: '',
          metadata: {},
          photoURL: null,
          phoneNumber: null,
          emailVerified: false,
          tenantId: null,
          refreshToken: '',
          toJSON: () => ({}),
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as unknown as import('firebase/auth').IdTokenResult),
          reload: async () => {},
          providerData: [],
        } as unknown as User);
      }
      
      const currentUser = u || { uid: 'guest_user', email: 'guest@stackbox.pro' };
      
      // Check user document for subscription logic
      const userRef = doc(db, 'users', currentUser.uid);
      
      const checkDoc = async () => {
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            // New User: 14 days free trial
            const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            await setDoc(userRef, {
              email: currentUser.email || 'guest@stackbox.pro',
              trialEndsAt: trialEnd,
              subscriptionEndsAt: null,
              notificationsEnabled: true,
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Error setting up user doc:", err);
        }
      };
      
      await checkDoc();

      // Ensure we clean up any existing listener before starting a new one
      unsubscribeDoc();
      unsubscribeDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const tEnd = data.trialEndsAt ? (data.trialEndsAt.toDate ? data.trialEndsAt.toDate() : new Date(data.trialEndsAt)) : null;
          const sEnd = data.subscriptionEndsAt ? (data.subscriptionEndsAt.toDate ? data.subscriptionEndsAt.toDate() : new Date(data.subscriptionEndsAt)) : null;
          
          setTrialEndsAt(tEnd);
          setSubscriptionEndsAt(sEnd);
          setNotificationsEnabled(data.notificationsEnabled !== false);
          const plan = (data.plan as PlanId) || 'free';
          setUserPlan(plan);

          const now = new Date();
          const trialExpired = tEnd ? now > tEnd : false;
          const subExpired = sEnd ? now > sEnd : true;

          // If trial is over and no active subscription (or it's expired) -> Paywall
          setIsPaywall(trialExpired && subExpired);
          
          // Theme: load saved or default to neumorphic
          const savedTheme = data.theme as ThemeMode;
          if (savedTheme === 'glassmorphism' || savedTheme === 'neumorphic' || savedTheme === 'defi') {
            setThemeState(savedTheme);
          }
          
          // Can use premium theme if has active subscription or trial
          const canUsePremium = !trialExpired || !subExpired;
          // If they selected premium but can't use it, revert to neumorphic
          if ((savedTheme === 'glassmorphism' || savedTheme === 'defi') && !canUsePremium) {
            setThemeState('neumorphic');
          }
        }
        setLoading(false);
      }, (err) => {
        console.error("Firestore onSnapshot error:", err);
        // Even if errors occur (like permissions), we stop loading to show the app
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDoc();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    await signInWithPopup(auth, provider);
  };

  const loginWithMagicLink = async (email: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/pricing`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  const loginWithEmail = async (email: string, pass: string, isRegister = false) => {
    if (isRegister) {
      await createUserWithEmailAndPassword(auth, email, pass);
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  };

  const logout = async () => {
    if (user?.isAnonymous) {
      await signOut(auth); // Signing out will trigger anonymous re-auth in Providers
      return;
    }
    await signOut(auth);
  };

  const setTheme = async (newTheme: ThemeMode) => {
    if (!user) return;
    if (newTheme === 'glassmorphism' || newTheme === 'defi') {
      const now = new Date();
      const trialActive = trialEndsAt ? now <= trialEndsAt : false;
      const subActive = subscriptionEndsAt ? now <= subscriptionEndsAt : false;
      if (!trialActive && !subActive) {
        // Can't switch to premium without active subscription
        return;
      }
    }
    setThemeState(newTheme);
    await setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
  };

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = !!(user && !user.isAnonymous && user.email && adminEmails.includes(user.email.toLowerCase()));

  const canUsePremiumTheme = !user?.isAnonymous && (!!trialEndsAt && new Date() <= trialEndsAt || !!subscriptionEndsAt && new Date() <= subscriptionEndsAt);

  const updateProfile = async (data: Partial<{ notificationsEnabled: boolean; theme?: ThemeMode }>) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
  };

  return (
    <I18nextProvider i18n={i18n}>
      <AuthContext.Provider value={{ user, loading, isPaywall, isAdmin, trialEndsAt, subscriptionEndsAt, notificationsEnabled, theme, setTheme, canUsePremiumTheme, userPlan, planLimits: getPlanLimits(userPlan), login, loginWithGitHub, loginWithEmail, loginWithApple, loginWithMagicLink, logout, updateProfile }}>
        {children}
      </AuthContext.Provider>
    </I18nextProvider>
  );
}
