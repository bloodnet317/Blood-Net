import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { ref, get, set, child, onValue } from 'firebase/database';
import { User } from '../types';
import { allInstances, googleProvider, mainProject } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  switchProject: (index: number) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubDB: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(mainProject.auth, (firebaseUser) => {
      if (unsubDB) unsubDB();
      
      if (firebaseUser) {
        const userRef = ref(mainProject.db, `users/${firebaseUser.uid}`);
        unsubDB = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser({ ...snapshot.val(), uid: firebaseUser.uid });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              isDonor: false,
              isVerified: false,
              isAvailable: true,
              donationCount: 0,
              joinedAt: Date.now()
            } as any);
          }
          setLoading(false);
        }, (err) => {
          console.error("DB Sync error:", err);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubDB) unsubDB();
    };
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(mainProject.auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Unauthorized Domain: Please add "${window.location.hostname}" to your Firebase authorized domains list.`);
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(mainProject.auth);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, switchProject: () => {}, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
