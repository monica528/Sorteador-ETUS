import { useState } from 'react';
import { MessageSquare, Plus, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { classGroups, studentFeedback, addStudentFeedback } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classGroupId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    rating: 5,
    contentRating: 5,
    teacherRating: 5,
    comments: '',
    suggestions: '',
  });

  const myFeedback =
    user?.role === 'student'
      ? studentFeedback.filter((f) => f.studentId === user.id)
      : studentFeedback;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudentFeedback({
      ...formData,
      studentId: user?.id ?? '',
      studentName: user?.name ?? '',
    });
    setShowForm(false);
    setFormData({
      classGroupId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      rating: 5,
      contentRating: 5,
      teacherRating: 5,
      comments: '',
      suggestions: '',
    });
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? 'text-warning-500 fill-warning-500' : 'text-gray-300'}`} />
    ));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'student' ? 'Meus Feedbacks' : 'Feedbacks dos Alunos'}
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.role === 'student'
              ? 'Envie feedbacks mensais sobre as aulas'
              : 'Acompanhe os feedbacks enviados pelos alunos'}
          </p>
        </div>
        {user?.role === 'student' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Feedback
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enviar Feedback</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2025, i).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota Geral (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-center gap-1 mt-1">{renderStars(formData.rating)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.contentRating}
                  onChange={(e) => setFormData({ ...formData, contentRating: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-center gap-1 mt-1">{renderStars(formData.contentRating)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.teacherRating}
                  onChange={(e) => setFormData({ ...formData, teacherRating: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-center gap-1 mt-1">{renderStars(formData.teacherRating)}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentários</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="O que você achou das aulas neste mês?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sugestões</label>
              <textarea
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="Alguma sugestão de melhoria?"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                Enviar Feedback
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {myFeedback.map((fb) => {
          const group = classGroups.find((g) => g.id === fb.classGroupId);
          const monthName = new Date(fb.year, fb.month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          return (
            <div key={fb.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{fb.studentName}</h4>
                    <p className="text-xs text-gray-500">{group?.name} &bull; {monthName}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">{renderStars(fb.rating)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Conteúdo</p>
                  <div className="flex gap-0.5">{renderStars(fb.contentRating)}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Professor</p>
                  <div className="flex gap-0.5">{renderStars(fb.teacherRating)}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{fb.comments}</p>
              {fb.suggestions && (
                <p className="text-sm text-gray-500 italic">Sugestão: {fb.suggestions}</p>
              )}
            </div>
          );
        })}
        {myFeedback.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum feedback encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
