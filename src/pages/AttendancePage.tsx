import { useState } from 'react';
import { ClipboardCheck, Check, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { mockUsers } from '../lib/mockData';

export default function AttendancePage() {
  const { user } = useAuth();
  const { classGroups, lessons, attendance, addAttendance } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [filterClass, setFilterClass] = useState('');

  const filteredAttendance = filterClass
    ? attendance.filter((a) => a.classGroupId === filterClass)
    : attendance;

  const selectedClass = classGroups.find((g) => g.id === selectedClassId);
  const classLessons = lessons.filter((l) => l.classGroupId === selectedClassId);

  const handleStartForm = () => {
    setShowForm(true);
    setSelectedClassId('');
    setSelectedLessonId('');
    setPresenceMap({});
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const group = classGroups.find((g) => g.id === classId);
    if (group) {
      const map: Record<string, boolean> = {};
      group.studentIds.forEach((id) => { map[id] = true; });
      setPresenceMap(map);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    const lesson = lessons.find((l) => l.id === selectedLessonId);
    addAttendance({
      lessonId: selectedLessonId,
      classGroupId: selectedClassId,
      date: lesson?.date ?? new Date().toISOString().split('T')[0],
      records: selectedClass.studentIds.map((id) => {
        const student = mockUsers.find((u) => u.id === id);
        return { studentId: id, studentName: student?.name ?? '', present: presenceMap[id] ?? false };
      }),
    });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Presença</h1>
          <p className="text-gray-500 mt-1">Controle de frequência por aula</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={handleStartForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Registrar Presença
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Presença</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={!selectedClassId}
                >
                  <option value="">Selecione...</option>
                  {classLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {new Date(l.date + 'T12:00:00').toLocaleDateString('pt-BR')} - {l.topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClass && (
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-gray-700">Alunos:</p>
                {selectedClass.studentIds.map((id) => {
                  const student = mockUsers.find((u) => u.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{student?.name}</span>
                      <button
                        type="button"
                        onClick={() => setPresenceMap((prev) => ({ ...prev, [id]: !prev[id] }))}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          presenceMap[id]
                            ? 'bg-success-50 text-success-600'
                            : 'bg-danger-50 text-danger-600'
                        }`}
                      >
                        {presenceMap[id] ? 'Presente' : 'Ausente'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium" disabled={!selectedLessonId}>
                Salvar Presença
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filtrar por turma:</label>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Todas</option>
          {classGroups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredAttendance
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((record) => {
            const lesson = lessons.find((l) => l.id === record.lessonId);
            const group = classGroups.find((g) => g.id === record.classGroupId);
            const present = record.records.filter((r) => r.present).length;
            return (
              <div key={record.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-primary-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{lesson?.topic ?? 'Aula'}</h4>
                      <p className="text-xs text-gray-500">{group?.name} &bull; {new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary-600">
                    {present}/{record.records.length} presentes
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.records.map((r) => (
                    <span
                      key={r.studentId}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        r.present ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
                      }`}
                    >
                      {r.present ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {r.studentName}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
