import { useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import RHPage from './RHPage';
import ParticipantPage from './ParticipantPage';

export default function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#151514,#066e3e,#151514)' }}
      >
        <p className="text-white text-lg animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  if (role === 'rh') return <RHPage />;
  return <ParticipantPage />;
}
