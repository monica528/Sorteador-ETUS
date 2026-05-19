import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClassGroupsPage from './pages/ClassGroupsPage';
import LessonsPage from './pages/LessonsPage';
import AttendancePage from './pages/AttendancePage';
import FeedbackPage from './pages/FeedbackPage';
import EvaluationsPage from './pages/EvaluationsPage';
import ReportsPage from './pages/ReportsPage';
import PerformancePage from './pages/PerformancePage';
import UsersPage from './pages/UsersPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/turmas" element={<ClassGroupsPage />} />
          <Route path="/aulas" element={<LessonsPage />} />
          <Route path="/presenca" element={<AttendancePage />} />
          <Route path="/feedbacks" element={<FeedbackPage />} />
          <Route path="/avaliacoes" element={<EvaluationsPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/desempenho" element={<PerformancePage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
