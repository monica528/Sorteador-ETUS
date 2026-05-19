import { Users, BookOpen, ClipboardCheck, TrendingUp, Star, MessageSquare } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { classGroups, lessons, attendance, studentFeedback, teacherEvaluations, performanceGoals } = useData();

  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  const totalStudents = classGroups.reduce((sum, g) => sum + g.studentIds.length, 0);
  const totalLessons = lessons.length;
  const totalAttendanceRecords = attendance.flatMap((a) => a.records);
  const presentCount = totalAttendanceRecords.filter((r) => r.present).length;
  const attendanceRate = totalAttendanceRecords.length > 0 ? Math.round((presentCount / totalAttendanceRecords.length) * 100) : 0;
  const avgFeedbackRating = studentFeedback.length > 0 ? (studentFeedback.reduce((sum, f) => sum + f.rating, 0) / studentFeedback.length).toFixed(1) : '0';

  const attendanceByClass = classGroups.map((group) => {
    const classAttendance = attendance.filter((a) => a.classGroupId === group.id).flatMap((a) => a.records);
    const present = classAttendance.filter((r) => r.present).length;
    const rate = classAttendance.length > 0 ? Math.round((present / classAttendance.length) * 100) : 0;
    return { name: group.name.split(' - ')[0], presença: rate };
  });

  const skillsData = [
    { skill: 'Speaking', score: 3.5 },
    { skill: 'Listening', score: 3.5 },
    { skill: 'Reading', score: 4.0 },
    { skill: 'Writing', score: 3.3 },
    { skill: 'Participação', score: 4.0 },
  ];

  const goalStatusData = [
    { name: 'Em progresso', value: performanceGoals.filter((g) => g.status === 'in_progress').length },
    { name: 'Concluído', value: performanceGoals.filter((g) => g.status === 'completed').length },
    { name: 'Não iniciado', value: performanceGoals.filter((g) => g.status === 'not_started').length },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: 'Total de Alunos', value: totalStudents, icon: Users, color: 'bg-primary-100 text-primary-600' },
    { label: 'Aulas Registradas', value: totalLessons, icon: BookOpen, color: 'bg-success-50 text-success-600' },
    { label: 'Taxa de Presença', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'bg-warning-50 text-warning-600' },
    { label: 'Nota Média (Feedback)', value: avgFeedbackRating, icon: Star, color: 'bg-danger-50 text-danger-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do programa de desenvolvimento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Presença por Turma</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceByClass}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip formatter={(value) => [`${value}%`, 'Presença']} />
              <Bar dataKey="presença" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Média de Habilidades</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={skillsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} fontSize={12} />
              <YAxis type="category" dataKey="skill" fontSize={12} width={90} />
              <Tooltip formatter={(value) => [Number(value).toFixed(1), 'Nota']} />
              <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Metas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={goalStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {goalStatusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Avaliações</h3>
          <div className="space-y-3">
            {teacherEvaluations.slice(0, 4).map((evaluation) => (
              <div key={evaluation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{evaluation.studentName}</p>
                  <p className="text-sm text-gray-500">{evaluation.bimester}° Bimestre / {evaluation.year}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold text-primary-600">{evaluation.overallScore.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const { attendance, studentFeedback, teacherEvaluations, performanceGoals } = useData();

  const myAttendance = attendance.flatMap((a) => a.records).filter((r) => r.studentId === user?.id);
  const myPresent = myAttendance.filter((r) => r.present).length;
  const myRate = myAttendance.length > 0 ? Math.round((myPresent / myAttendance.length) * 100) : 0;

  const myEvaluations = teacherEvaluations.filter((e) => e.studentId === user?.id);
  const myFeedbacks = studentFeedback.filter((f) => f.studentId === user?.id);
  const myGoals = performanceGoals.filter((g) => g.userId === user?.id);
  const latestEval = myEvaluations[myEvaluations.length - 1];

  const skillsProgress = latestEval
    ? [
        { skill: 'Speaking', score: latestEval.speaking },
        { skill: 'Listening', score: latestEval.listening },
        { skill: 'Reading', score: latestEval.reading },
        { skill: 'Writing', score: latestEval.writing },
        { skill: 'Participação', score: latestEval.participation },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Acompanhe seu progresso nas aulas de inglês</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-500">Minha Presença</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{myRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-warning-500" />
            <span className="text-sm text-gray-500">Nota Geral</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{latestEval?.overallScore.toFixed(1) ?? '-'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-success-500" />
            <span className="text-sm text-gray-500">Feedbacks Enviados</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{myFeedbacks.length}</p>
        </div>
      </div>

      {skillsProgress.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Habilidades</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={skillsProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} fontSize={12} />
                <YAxis type="category" dataKey="skill" fontSize={12} width={90} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Metas</h3>
            <div className="space-y-4">
              {myGoals.map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 text-sm">{goal.title}</p>
                    <span className="text-xs font-medium text-primary-600">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
              {myGoals.length === 0 && <p className="text-sm text-gray-500">Nenhuma meta definida ainda.</p>}
            </div>
          </div>
        </div>
      )}

      {latestEval && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Última Avaliação do Professor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-success-50 rounded-lg">
              <p className="text-sm font-medium text-success-600 mb-1">Pontos Fortes</p>
              <p className="text-sm text-gray-700">{latestEval.strengths}</p>
            </div>
            <div className="p-4 bg-warning-50 rounded-lg">
              <p className="text-sm font-medium text-warning-600 mb-1">Pontos a Melhorar</p>
              <p className="text-sm text-gray-700">{latestEval.areasToImprove}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 italic">&ldquo;{latestEval.comments}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
