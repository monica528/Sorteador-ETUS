import { GraduationCap, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #151514 0%, #066E3E 50%, #151514 100%)' }}>
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: '#3BE476' }} />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: '#8DF768' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: '#A0E3F3' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-etus rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ETUS Academy</h1>
          <p className="text-gray-400 font-light">Plataforma de Gestão de Desenvolvimento</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Entrar na plataforma</h2>
          <p className="text-sm text-gray-500 mb-6">Use sua conta Google corporativa para acessar</p>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-100 rounded-lg">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          )}

          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-medium text-gray-700 group-hover:text-primary-600">Entrar com Google</span>
            <LogIn className="w-4 h-4 text-gray-400 group-hover:text-primary-400" />
          </button>

          <div className="mt-6 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              O acesso é feito com sua conta Google corporativa.<br />
              Seu perfil (Admin, Professor ou Aluno) será atribuído automaticamente.
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            ETUS Media &copy; {new Date().getFullYear()} &mdash; Plataforma interna
          </p>
        </div>
      </div>
    </div>
  );
}
