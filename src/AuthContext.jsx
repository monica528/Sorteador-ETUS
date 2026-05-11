import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext(null);

const RH_EMAILS = [
  'rh@etus.com.br',
  'monica@etus.com.br',
  'felipe.moreira@etus.com.br',
  'vanessa.teixeira@etus.com.br',
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        if (RH_EMAILS.includes(firebaseUser.email.toLowerCase())) {
          setRole('rh');
        } else {
          setRole('participante');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  function logout() {
    return signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
