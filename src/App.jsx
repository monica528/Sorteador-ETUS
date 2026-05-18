import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import UserEventsPage from '@/pages/user/UserEventsPage';
import UserMyRafflesPage from '@/pages/user/UserMyRafflesPage';
import RankingsPage from '@/pages/RankingsPage';
import PublicHistoryPage from '@/pages/PublicHistoryPage';
import RHDashboard from '@/pages/rh/RHDashboard';
import RHCreateEvent from '@/pages/rh/RHCreateEvent';
import RHActiveEvents from '@/pages/rh/RHActiveEvents';
import RHParticipants from '@/pages/rh/RHParticipants';
import RHDraw from '@/pages/rh/RHDraw';
import RHHistory from '@/pages/rh/RHHistory';
import RHRankings from '@/pages/rh/RHRankings';
import RHSettings from '@/pages/rh/RHSettings';

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-etus mx-auto flex items-center justify-center animate-pulse-glow">
          <span className="text-white text-2xl font-bold">S</span>
        </div>
        <p className="text-n-500 text-sm animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* User Routes */}
          <Route path="/" element={<UserEventsPage />} />
          <Route path="/meus-sorteios" element={<UserMyRafflesPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/historico" element={<PublicHistoryPage />} />

          {/* RH Routes */}
          <Route path="/rh" element={<ProtectedRoute requiredRole="rh"><RHDashboard /></ProtectedRoute>} />
          <Route path="/rh/criar" element={<ProtectedRoute requiredRole="rh"><RHCreateEvent /></ProtectedRoute>} />
          <Route path="/rh/eventos" element={<ProtectedRoute requiredRole="rh"><RHActiveEvents /></ProtectedRoute>} />
          <Route path="/rh/participantes" element={<ProtectedRoute requiredRole="rh"><RHParticipants /></ProtectedRoute>} />
          <Route path="/rh/sortear" element={<ProtectedRoute requiredRole="rh"><RHDraw /></ProtectedRoute>} />
          <Route path="/rh/historico" element={<ProtectedRoute requiredRole="rh"><RHHistory /></ProtectedRoute>} />
          <Route path="/rh/rankings" element={<ProtectedRoute requiredRole="rh"><RHRankings /></ProtectedRoute>} />
          <Route path="/rh/configuracoes" element={<ProtectedRoute requiredRole="rh"><RHSettings /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
