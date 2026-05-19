import { useState } from 'react';
import { Star, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { mockUsers } from '../lib/mockData';

export default function EvaluationsPage() {
  const { user } = useAuth();
  const { classGroups, teacherEvaluations, addTeacherEvaluation } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    classGroupId: '',
    bimester: 1,
    year: new Date().getFullYear(),
    speaking: 3,
    listening: 3,
    reading: 3,
    writing: 3,
    participation: 3,
    strengths: '',
    areasToImprove: '',
    comments: '',
  });

  const selectedClass = classGroups.find((g) => g.id === formData.classGroupId);
  const students = selectedClass
    ? mockUsers.filter((u) => selectedClass.studentIds.includes(u.id))
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = mockUsers.find((u) => u.id === formData.studentId);
    const overallScore =
      (formData.speaking + formData.listening + formData.reading + formData.writing + formData.participation) / 5;
    addTeacherEvaluation({
      ...formData,
      teacherId: user?.id ?? '',
      studentName: student?.name ?? '',
      overallScore,
    });
    setShowForm(false);
  };

  const skillLabel = (value: number) => {
    if (value <= 1) return 'Iniciante';
    if (value <= 2) return 'Básico';
    if (value <= 3) return 'Intermediário';
    if (value <= 4) return 'Bom';
    return 'Excelente';
  };

  const skillColor = (value: number) => {
    if (value <= 2) return 'text-danger-500';
    if (value <= 3) return 'text-warning-500';
    return 'text-success-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliações do Professor</h1>
          <p className="text-gray-500 mt-1">Avaliação bimestral de cada aluno</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Avaliação
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Avaliação</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select
                  value={formData.classGroupId}
                  onChange={(e) => setFormData({ ...formData, classGroupId: e.target.value, studentId: '' })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={!formData.classGroupId}
                >
                  <option value="">Selecione...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['speaking', 'listening', 'reading', 'writing', 'participation'] as const).map((skill) => (
                <div key={skill} className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{skill === 'participation' ? 'Participação' : skill}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData[skill]}
                    onChange={(e) => setFormData({ ...formData, [skill]: Number(e.target.value) })}
                    className="w-full"
                  />
                  <p className={`text-sm font-medium ${skillColor(formData[skill])}`}>
                    {formData[skill]} - {skillLabel(formData[skill])}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pontos Fortes</label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pontos a Melhorar</label>
                <textarea
                  value={formData.areasToImprove}
                  onChange={(e) => setFormData({ ...formData, areasToImprove: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentários Gerais</label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                Salvar Avaliação
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {teacherEvaluations.map((evaluation) => {
          const group = classGroups.find((g) => g.id === evaluation.classGroupId);
          return (
            <div key={evaluation.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{evaluation.studentName}</h4>
                    <p className="text-xs text-gray-500">
                      {group?.name} &bull; {evaluation.bimester}° Bimestre / {evaluation.year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  <span className="text-lg font-bold text-primary-600">{evaluation.overallScore.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { label: 'Speaking', value: evaluation.speaking },
                  { label: 'Listening', value: evaluation.listening },
                  { label: 'Reading', value: evaluation.reading },
                  { label: 'Writing', value: evaluation.writing },
                  { label: 'Participação', value: evaluation.participation },
                ].map((skill) => (
                  <div key={skill.label} className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{skill.label}</p>
                    <p className={`text-lg font-bold ${skillColor(skill.value)}`}>{skill.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-success-50 rounded-lg">
                  <p className="text-xs font-medium text-success-600 mb-1">Pontos Fortes</p>
                  <p className="text-sm text-gray-700">{evaluation.strengths}</p>
                </div>
                <div className="p-3 bg-warning-50 rounded-lg">
                  <p className="text-xs font-medium text-warning-600 mb-1">Pontos a Melhorar</p>
                  <p className="text-sm text-gray-700">{evaluation.areasToImprove}</p>
                </div>
              </div>
              {evaluation.comments && (
                <p className="text-sm text-gray-600 mt-3 italic">&ldquo;{evaluation.comments}&rdquo;</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
