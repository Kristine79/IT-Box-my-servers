'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);




type AuthContextType = {
  user: User | null;
  loading: boolean;
  isPaywall: boolean;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  notificationsEnabled: boolean;
  login: () => Promise<void>;
  loginWithEmail: (e: string, p: string, isRegister?: boolean) => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<{ notificationsEnabled: boolean }>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPaywall: false,
  trialEndsAt: null,
  subscriptionEndsAt: null,
  notificationsEnabled: true,
  login: async () => {},
  loginWithEmail: async () => {},
  loginWithApple: async () => {},
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

  useEffect(() => {
    let unsubscribeDoc = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        unsubscribeDoc();
        setLoading(false);
        setIsPaywall(false);
        setTrialEndsAt(null);
        setSubscriptionEndsAt(null);
        return;
      }

      // Check user document for subscription logic
      const userRef = doc(db, 'users', u.uid);
      
      const checkDoc = async () => {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          // New User: 14 days free trial
          const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          await setDoc(userRef, {
            email: u.email,
            trialEndsAt: trialEnd,
            subscriptionEndsAt: null,
            notificationsEnabled: true,
            createdAt: serverTimestamp()
          });
        }
      };
      
      try {
        await checkDoc();
      } catch (checkErr) {
        console.error("Error setting up user doc:", checkErr);
      }

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

          const now = new Date();
          const trialExpired = tEnd ? now > tEnd : false;
          const subExpired = sEnd ? now > sEnd : true;

          // If trial is over and no active subscription (or it's expired) -> Paywall
          setIsPaywall(trialExpired && subExpired);
        }
        setLoading(false);
      }, (err) => {
        console.error("Firestore onSnapshot error:", err);
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

  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string, isRegister = false) => {
    if (isRegister) {
      await createUserWithEmailAndPassword(auth, email, pass);
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<{ notificationsEnabled: boolean }>) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
  };

  return (
    <I18nextProvider i18n={i18n}>
      <AuthContext.Provider value={{ user, loading, isPaywall, trialEndsAt, subscriptionEndsAt, notificationsEnabled, login, loginWithEmail, loginWithApple, logout, updateProfile }}>
        {children}
      </AuthContext.Provider>
    </I18nextProvider>
  );
}
