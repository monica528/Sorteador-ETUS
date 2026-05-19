import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const { classGroups, teacherReports, addTeacherReport } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classGroupId: '',
    bimester: 1,
    year: new Date().getFullYear(),
    summary: '',
    achievements: '',
    challenges: '',
    recommendations: '',
    nextSteps: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const group = classGroups.find((g) => g.id === formData.classGroupId);
    addTeacherReport({
      ...formData,
      teacherId: user?.id ?? '',
      teacherName: user?.name ?? '',
      classGroupName: group?.name ?? '',
    });
    setShowForm(false);
    setFormData({
      classGroupId: '',
      bimester: 1,
      year: new Date().getFullYear(),
      summary: '',
      achievements: '',
      challenges: '',
      recommendations: '',
      nextSteps: '',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios do Professor</h1>
          <p className="text-gray-500 mt-1">Relatórios bimestrais sobre as turmas</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Relatório
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Relatório Bimestral</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select
                  value={formData.classGroupId}
                  onChange={(e) => setFormData({ ...formData, classGroupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                >
                  <option value="">Selecione...</option>
                  {classGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bimestre</label>
                <select
                  value={formData.bimester}
                  onChange={(e) => setFormData({ ...formData, bimester: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {[1, 2, 3, 4].map((b) => (
                    <option key={b} value={b}>{b}° Bimestre</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo Geral</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Resumo geral do bimestre..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conquistas</label>
                <textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                  placeholder="O que a turma conquistou..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desafios</label>
                <textarea
                  value={formData.challenges}
                  onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                  placeholder="Desafios enfrentados..."
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recomendações</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                  placeholder="Recomendações para o próximo bimestre..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próximos Passos</label>
                <textarea
                  value={formData.nextSteps}
                  onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                  placeholder="O que será trabalhado a seguir..."
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                Salvar Relatório
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {teacherReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.classGroupName}</h3>
                  <p className="text-sm text-gray-500">
                    {report.bimester}° Bimestre / {report.year} &bull; Prof. {report.teacherName}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumo Geral</h4>
                <p className="text-sm text-gray-600">{report.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-success-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-success-600 mb-2">Conquistas</h4>
                  <p className="text-sm text-gray-700">{report.achievements}</p>
                </div>
                <div className="p-4 bg-warning-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-warning-600 mb-2">Desafios</h4>
                  <p className="text-sm text-gray-700">{report.challenges}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-primary-600 mb-2">Recomendações</h4>
                  <p className="text-sm text-gray-700">{report.recommendations}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Próximos Passos</h4>
                  <p className="text-sm text-gray-700">{report.nextSteps}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {teacherReports.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum relatório encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
