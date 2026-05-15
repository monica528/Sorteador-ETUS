import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Plus, CalendarCheck, Users, Shuffle,
  History, Trophy, Settings, LogOut, Ticket, Menu, X, Home,
} from 'lucide-react';
import { useState } from 'react';

const RH_NAV = [
  { to: '/rh', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/rh/criar', icon: Plus, label: 'Criar Evento' },
  { to: '/rh/eventos', icon: CalendarCheck, label: 'Eventos Ativos' },
  { to: '/rh/participantes', icon: Users, label: 'Participantes' },
  { to: '/rh/sortear', icon: Shuffle, label: 'Realizar Sorteio' },
  { to: '/rh/historico', icon: History, label: 'Historico' },
  { to: '/rh/rankings', icon: Trophy, label: 'Rankings' },
  { to: '/rh/configuracoes', icon: Settings, label: 'Configuracoes' },
];

const USER_NAV = [
  { to: '/', icon: Home, label: 'Eventos', end: true },
  { to: '/meus-sorteios', icon: Ticket, label: 'Meus Sorteios' },
  { to: '/rankings', icon: Trophy, label: 'Rankings' },
  { to: '/historico', icon: History, label: 'Historico' },
];

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-etus-green/15 text-etus-dark border border-etus-green/30'
            : 'text-n-600 hover:bg-muted hover:text-n-950'
        }`
      }
    >
      <Icon className="w-4.5 h-4.5" />
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRH = role === 'rh';
  const navItems = isRH ? RH_NAV : USER_NAV;

  function handleLogout() {
    logout().then(() => navigate('/'));
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-etus-dark">Sorteio ETUS</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-muted">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:sticky top-0 left-0 z-50 md:z-auto
        w-64 h-screen bg-white border-r border-border
        flex flex-col transition-transform duration-300 ease-in-out
      `}>
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-etus flex items-center justify-center">
              <span className="text-white text-lg font-bold">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-n-950 leading-tight">Sorteio ETUS</h1>
              <p className="text-xs text-n-500">{isRH ? 'Painel RH' : 'Area do Colaborador'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-etus-mint flex items-center justify-center text-sm font-bold text-etus-dark">
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-n-950 truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-n-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-n-600" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
