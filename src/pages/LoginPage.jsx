import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase';
import { Button } from '@/components/ui/button';

const googleProvider = new GoogleAuthProvider();
const ALLOWED_DOMAINS = ['etus.com.br', 'bhaz.com.br'];

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';
      const domain = email.split('@')[1]?.toLowerCase();
      if (!ALLOWED_DOMAINS.includes(domain)) {
        await auth.signOut();
        setError(`Acesso permitido apenas para emails @etus.com.br e @bhaz.com.br. Voce tentou com: ${email}`);
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Erro ao entrar com Google: ${err.message}`);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-n-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-etus-green/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-pink/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-etus-mint/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-etus flex items-center justify-center shadow-lg animate-float">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-n-950">Sorteio ETUS</h1>
            <p className="text-n-500 mt-1">Plataforma de sorteios corporativos</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-border p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-n-950">Bem-vindo!</h2>
            <p className="text-sm text-n-500 mt-1">
              Faca login com sua conta Google corporativa
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? 'Entrando...' : 'Entrar com Google'}
          </Button>

          <p className="text-xs text-n-400 text-center">
            Acesso restrito para emails @etus.com.br e @bhaz.com.br
          </p>
        </div>

        <p className="text-center text-xs text-n-400">
          Sorteio ETUS &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
