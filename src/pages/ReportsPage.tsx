import { useState } from 'react';
import { FileText, Plus, User, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const { classGroups, teacherReports, addTeacherReport, teacherEvaluations, attendance, studentFeedback } = useData();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>(isAdmin ? 'student' : 'teacher');
  const [showForm, setShowForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(classGroups[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
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

  const selectedClass = classGroups.find((g) => g.id === selectedClassId);
  const studentsInClass = selectedClass
    ? selectedClass.studentIds.map((sid) => {
        const att = attendance
          .filter((a) => a.classGroupId === selectedClassId)
          .flatMap((a) => a.records)
          .filter((r) => r.studentId === sid);
        const present = att.filter((r) => r.present).length;
        const total = att.length;
        const evals = teacherEvaluations.filter((ev) => ev.studentId === sid && ev.classGroupId === selectedClassId);
        const feedbacks = studentFeedback.filter((fb) => fb.studentId === sid && fb.classGroupId === selectedClassId);
        const studentName = att[0]?.studentName || evals[0]?.studentName || feedbacks[0]?.studentName || sid;
        return { id: sid, name: studentName, present, total, evals, feedbacks };
      })
    : [];

  const selectedStudent = studentsInClass.find((s) => s.id === selectedStudentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500 mt-1">Relatórios bimestrais e avaliações individuais</p>
        </div>
        {activeTab === 'teacher' && (user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Relatório
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('student')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'student' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Relatório por Aluno
        </button>
        <button
          onClick={() => setActiveTab('teacher')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'teacher' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Relatórios do Professor
        </button>
      </div>

      {activeTab === 'student' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <select
                value={selectedClassId}
                onChange={(e) => { setSelectedClassId(e.target.value); setSelectedStudentId(''); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Selecione uma turma</option>
                {classGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!selectedClassId}
              >
                <option value="">Todos os alunos</option>
                {studentsInClass.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedStudentId && selectedStudent ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-700">{selectedStudent.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                    <p className="text-sm text-gray-500">{selectedClass?.name} &bull; {selectedClass?.schedule}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-700">
                      {selectedStudent.total > 0 ? Math.round((selectedStudent.present / selectedStudent.total) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Presença</p>
                  </div>
                  <div className="text-center p-4 bg-success-50 rounded-lg">
                    <p className="text-2xl font-bold text-success-700">{selectedStudent.present}/{selectedStudent.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Aulas Presentes</p>
                  </div>
                  <div className="text-center p-4 bg-warning-50 rounded-lg">
                    <p className="text-2xl font-bold text-warning-700">{selectedStudent.evals.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Avaliações</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-700">{selectedStudent.feedbacks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Feedbacks</p>
                  </div>
                </div>
              </div>

              {selectedStudent.evals.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    Avaliações do Professor
                  </h4>
                  <div className="space-y-4">
                    {selectedStudent.evals.map((ev) => (
                      <div key={ev.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-900">{ev.bimester}° Bimestre / {ev.year}</span>
                          <span className="text-sm font-bold text-primary-700">Nota: {ev.overallScore}/10</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {[
                            { label: 'Speaking', value: ev.speaking },
                            { label: 'Listening', value: ev.listening },
                            { label: 'Reading', value: ev.reading },
                            { label: 'Writing', value: ev.writing },
                            { label: 'Participação', value: ev.participation },
                          ].map((skill) => (
                            <div key={skill.label} className="text-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${skill.value * 10}%` }} />
                              </div>
                              <p className="text-xs text-gray-500" translate="no">{skill.label}</p>
                              <p className="text-xs font-semibold text-gray-700">{skill.value}/10</p>
                            </div>
                          ))}
                        </div>
                        {ev.strengths && (
                          <p className="text-xs text-gray-600"><strong className="text-success-600">Pontos fortes:</strong> {ev.strengths}</p>
                        )}
                        {ev.areasToImprove && (
                          <p className="text-xs text-gray-600 mt-1"><strong className="text-warning-600">A melhorar:</strong> {ev.areasToImprove}</p>
                        )}
                        {ev.comments && (
                          <p className="text-xs text-gray-600 mt-1"><strong>Comentários:</strong> {ev.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.feedbacks.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Feedbacks do Aluno
                  </h4>
                  <div className="space-y-3">
                    {selectedStudent.feedbacks.map((fb) => (
                      <div key={fb.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(0, fb.month - 1).toLocaleString('pt-BR', { month: 'long' })} / {fb.year}
                          </span>
                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">Geral: {fb.rating}/5</span>
                            <span className="text-xs px-2 py-0.5 bg-success-50 text-success-700 rounded-full">Conteúdo: {fb.contentRating}/5</span>
                            <span className="text-xs px-2 py-0.5 bg-warning-50 text-warning-700 rounded-full">Professor: {fb.teacherRating}/5</span>
                          </div>
                        </div>
                        {fb.comments && <p className="text-xs text-gray-600">{fb.comments}</p>}
                        {fb.suggestions && <p className="text-xs text-gray-500 mt-1"><strong>Sugestão:</strong> {fb.suggestions}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Registro de Presença</h4>
                <div className="space-y-2">
                  {attendance
                    .filter((a) => a.classGroupId === selectedClassId)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((a) => {
                      const record = a.records.find((r) => r.studentId === selectedStudentId);
                      if (!record) return null;
                      return (
                        <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">
                            {new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                          {record.present ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-success-600">
                              <CheckCircle className="w-4 h-4" /> Presente
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-danger-600">
                              <XCircle className="w-4 h-4" /> Ausente
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : selectedClassId ? (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-4">Aluno</div>
                <div className="col-span-2 text-center">Presença</div>
                <div className="col-span-2 text-center">Avaliações</div>
                <div className="col-span-2 text-center">Feedbacks</div>
                <div className="col-span-2 text-center">Ação</div>
              </div>
              {studentsInClass.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-700">{s.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {s.total > 0 ? Math.round((s.present / s.total) * 100) : 0}%
                    </span>
                    <p className="text-xs text-gray-400">{s.present}/{s.total}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-gray-900">{s.evals.length}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-gray-900">{s.feedbacks.length}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => setSelectedStudentId(s.id)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Ver Relatório
                    </button>
                  </div>
                </div>
              ))}
              {studentsInClass.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  <p className="text-sm">Nenhum aluno nesta turma.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Selecione uma turma para ver os relatórios individuais.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'teacher' && (
        <div>
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
      )}
    </div>
  );
}
