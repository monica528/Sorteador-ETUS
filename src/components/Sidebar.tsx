import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Star,
  FileText,
  Target,
  LogOut,
  GraduationCap,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/turmas', label: 'Turmas', icon: Users },
  { to: '/aulas', label: 'Aulas', icon: BookOpen },
  { to: '/presenca', label: 'Presença', icon: ClipboardCheck },
  { to: '/feedbacks', label: 'Feedbacks', icon: MessageSquare },
  { to: '/avaliacoes', label: 'Avaliações', icon: Star },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/desempenho', label: 'Desempenho', icon: Target },
  { to: '/usuarios', label: 'Usuários', icon: UserCog },
];

const teacherLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/aulas', label: 'Aulas', icon: BookOpen },
  { to: '/presenca', label: 'Presença', icon: ClipboardCheck },
  { to: '/avaliacoes', label: 'Avaliações', icon: Star },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
];

const studentLinks = [
  { to: '/dashboard', label: 'Meu Progresso', icon: LayoutDashboard },
  { to: '/feedbacks', label: 'Meus Feedbacks', icon: MessageSquare },
  { to: '/desempenho', label: 'Meu Desempenho', icon: Target },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'teacher'
        ? teacherLinks
        : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ETUS Academy</h1>
            <p className="text-xs text-gray-500">Gestão de Desenvolvimento</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {user?.name?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'RH / Admin' : user?.role === 'teacher' ? 'Professor' : 'Aluno'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
