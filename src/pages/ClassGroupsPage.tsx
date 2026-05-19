import { useState } from 'react';
import { Users, Clock, BookOpen, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface ClassForm {
  name: string;
  description: string;
  teacherName: string;
  schedule: string;
  active: boolean;
}

const emptyForm: ClassForm = {
  name: '',
  description: '',
  teacherName: '',
  schedule: '',
  active: true,
};

export default function ClassGroupsPage() {
  const { classGroups, lessons, attendance, addClassGroup, updateClassGroup, deleteClassGroup } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassForm>(emptyForm);

  const handleOpenNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (groupId: string) => {
    const group = classGroups.find((g) => g.id === groupId);
    if (!group) return;
    setForm({
      name: group.name,
      description: group.description,
      teacherName: group.teacherName,
      schedule: group.schedule,
      active: group.active,
    });
    setEditingId(groupId);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateClassGroup(editingId, {
        name: form.name,
        description: form.description,
        teacherName: form.teacherName,
        schedule: form.schedule,
        active: form.active,
      });
    } else {
      addClassGroup({
        name: form.name,
        description: form.description,
        teacherId: 'teacher-1',
        teacherName: form.teacherName,
        schedule: form.schedule,
        studentIds: [],
        active: form.active,
      });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      deleteClassGroup(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-500 mt-1">Gerencie as turmas de inglês</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Turma
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Editar Turma' : 'Criar Nova Turma'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Turma Avançada - Manhã"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                <input
                  type="text"
                  value={form.teacherName}
                  onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                  placeholder="Nome do professor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <input
                  type="text"
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  placeholder="Ex: Seg/Qua/Sex 08:00-09:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.active ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="true">Ativa</option>
                  <option value="false">Inativa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição da turma, nível, objetivos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                {editingId ? 'Salvar Alterações' : 'Criar Turma'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {classGroups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">Nenhuma turma cadastrada.</p>
          {isAdmin && (
            <button onClick={handleOpenNew} className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
              Criar primeira turma
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classGroups.map((group) => {
            const classLessons = lessons.filter((l) => l.classGroupId === group.id);
            const classAtt = attendance
              .filter((a) => a.classGroupId === group.id)
              .flatMap((a) => a.records);
            const present = classAtt.filter((r) => r.present).length;
            const rate = classAtt.length > 0 ? Math.round((present / classAtt.length) * 100) : 0;

            return (
              <div key={group.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        group.active
                          ? 'bg-success-50 text-success-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {group.active ? 'Ativa' : 'Inativa'}
                    </span>
                    {isAdmin && (
                      <>
                        <button onClick={() => handleEdit(group.id)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(group.id)} className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-gray-900">{group.studentIds.length}</p>
                    <p className="text-xs text-gray-500">Alunos</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-gray-900">{classLessons.length}</p>
                    <p className="text-xs text-gray-500">Aulas</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-gray-900">{rate}%</p>
                    <p className="text-xs text-gray-500">Presença</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <span>Professor: <strong className="text-gray-700">{group.teacherName}</strong></span>
                  <span>{group.schedule}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
