import { useState } from 'react';
import { BookOpen, Plus, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function LessonsPage() {
  const { user } = useAuth();
  const { classGroups, lessons, addLesson } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({ classGroupId: '', date: '', topic: '', description: '' });

  const filteredLessons = selectedClass
    ? lessons.filter((l) => l.classGroupId === selectedClass)
    : lessons;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLesson({ ...formData, teacherId: user?.id ?? '' });
    setFormData({ classGroupId: '', date: '', topic: '', description: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aulas</h1>
          <p className="text-gray-500 mt-1">Registro de aulas ministradas</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Aula
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nova Aula</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <select
                value={formData.classGroupId}
                onChange={(e) => setFormData({ ...formData, classGroupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Selecione...</option>
                {classGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tópico</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Present Perfect"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descrição da aula"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                Salvar Aula
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filtrar por turma:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas</option>
            {classGroups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredLessons
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((lesson) => {
            const group = classGroups.find((g) => g.id === lesson.classGroupId);
            return (
              <div key={lesson.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{lesson.topic}</h4>
                  <p className="text-sm text-gray-500 truncate">{lesson.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(lesson.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </div>
                  <span className="text-xs text-primary-600 font-medium">{group?.name}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
