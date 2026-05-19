import { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const statusConfig: Record<string, { label: string; className: string }> = {
  not_started: { label: 'Não iniciado', className: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'Em progresso', className: 'bg-primary-100 text-primary-700' },
  completed: { label: 'Concluído', className: 'bg-success-50 text-success-600' },
  cancelled: { label: 'Cancelado', className: 'bg-danger-50 text-danger-600' },
};

export default function PerformancePage() {
  const { user } = useAuth();
  const { performanceGoals, addPerformanceGoal, updateGoalProgress } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    title: '',
    description: '',
    category: 'Inglês',
    targetDate: '',
    status: 'not_started' as const,
    progress: 0,
  });

  const goals =
    user?.role === 'student'
      ? performanceGoals.filter((g) => g.userId === user.id)
      : performanceGoals;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data =
      user?.role === 'student'
        ? { ...formData, userId: user.id, userName: user.name }
        : formData;
    addPerformanceGoal(data);
    setShowForm(false);
    setFormData({
      userId: '',
      userName: '',
      title: '',
      description: '',
      category: 'Inglês',
      targetDate: '',
      status: 'not_started',
      progress: 0,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'student' ? 'Meu Desempenho' : 'Acompanhamento de Desempenho'}
          </h1>
          <p className="text-gray-500 mt-1">Metas e progresso de desenvolvimento</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Nova Meta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {user?.role === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Colaborador</label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Ex: student-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Colaborador</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Nome completo"
                    required
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Meta</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Ex: Certificação B2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option>Inglês</option>
                  <option>Liderança</option>
                  <option>Técnico</option>
                  <option>Soft Skills</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Alvo</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="Descreva a meta..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                Criar Meta
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {goals.map((goal) => {
          const config = statusConfig[goal.status];
          return (
            <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <p className="text-xs text-gray-500">
                      {goal.userName} &bull; {goal.category} &bull; Até {new Date(goal.targetDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Progresso</span>
                    <span className="text-sm font-semibold text-primary-600">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                {(user?.role === 'admin' || user?.role === 'teacher') && goal.status !== 'completed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateGoalProgress(goal.id, Math.min(goal.progress + 10, 100), goal.progress + 10 >= 100 ? 'completed' : 'in_progress')
                      }
                      className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium hover:bg-primary-100"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, 100, 'completed')}
                      className="px-3 py-1.5 bg-success-50 text-success-600 rounded-lg text-xs font-medium hover:bg-green-100"
                    >
                      Concluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma meta cadastrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
