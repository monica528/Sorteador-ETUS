import { GraduationCap, Shield, BookOpen, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

const roles: { role: UserRole; label: string; description: string; icon: typeof Shield }[] = [
  { role: 'admin', label: 'RH / Administrador', description: 'Acesso completo a dashboards, relatórios e gestão', icon: Shield },
  { role: 'teacher', label: 'Professor', description: 'Gerenciar presenças, avaliações e relatórios', icon: BookOpen },
  { role: 'student', label: 'Aluno', description: 'Acompanhar progresso e enviar feedbacks', icon: User },
];

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ETUS Academy</h1>
          <p className="text-primary-200">Plataforma de Gestão de Desenvolvimento</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Entrar na plataforma</h2>
          <p className="text-sm text-gray-500 mb-6">Selecione seu perfil para continuar</p>

          <div className="space-y-3">
            {roles.map(({ role, label, description, icon: Icon }) => (
              <button
                key={role}
                onClick={() => login(role)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            ETUS Media &copy; {new Date().getFullYear()} &mdash; Plataforma interna
          </p>
        </div>
      </div>
    </div>
  );
}
