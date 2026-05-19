import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import type { User, UserRole } from '../types';

const DEFAULT_ADMIN_EMAILS = [
  'monica@etus.com.br',
  'vanessa.teixeira@etus.com.br',
];

const ROLE_OVERRIDES_KEY = 'etus-academy-role-overrides';
const KNOWN_USERS_KEY = 'etus-academy-known-users';

interface KnownUser {
  email: string;
  name: string;
  avatarUrl?: string;
  lastLogin: string;
}

function getRoleOverrides(): Record<string, UserRole> {
  try {
    return JSON.parse(localStorage.getItem(ROLE_OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
}

function getKnownUsers(): KnownUser[] {
  try {
    return JSON.parse(localStorage.getItem(KNOWN_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveKnownUser(user: KnownUser) {
  const users = getKnownUsers();
  const idx = users.findIndex((u) => u.email === user.email);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KNOWN_USERS_KEY, JSON.stringify(users));
}

function getRoleByEmail(email: string): UserRole {
  const overrides = getRoleOverrides();
  if (overrides[email.toLowerCase()]) return overrides[email.toLowerCase()];
  if (DEFAULT_ADMIN_EMAILS.includes(email.toLowerCase())) return 'admin';
  return 'student';
}

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  knownUsers: KnownUser[];
  setUserRole: (email: string, role: UserRole) => void;
  getUserRole: (email: string) => UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>(getKnownUsers());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const role = getRoleByEmail(firebaseUser.email);
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          role,
          avatarUrl: firebaseUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
        });
        const knownUser: KnownUser = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          avatarUrl: firebaseUser.photoURL || undefined,
          lastLogin: new Date().toISOString(),
        };
        saveKnownUser(knownUser);
        setKnownUsers(getKnownUsers());
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  }, []);

  const setUserRole = useCallback((email: string, role: UserRole) => {
    const overrides = getRoleOverrides();
    overrides[email.toLowerCase()] = role;
    localStorage.setItem(ROLE_OVERRIDES_KEY, JSON.stringify(overrides));
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      setUser({ ...user, role });
    }
  }, [user]);

  const getUserRole = useCallback((email: string): UserRole => {
    return getRoleByEmail(email);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loginWithGoogle, logout, isAuthenticated: !!user, loading, error,
      knownUsers, setUserRole, getUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
