import { useState } from 'react';
import { Shield, BookOpen, User, UserPlus, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

const ROLE_CONFIG: { role: UserRole; label: string; icon: typeof Shield; color: string }[] = [
  { role: 'admin', label: 'RH / Admin', icon: Shield, color: 'bg-primary-100 text-primary-700' },
  { role: 'teacher', label: 'Professor', icon: BookOpen, color: 'bg-success-50 text-success-700' },
  { role: 'student', label: 'Aluno', icon: User, color: 'bg-warning-50 text-warning-700' },
];

export default function UsersPage() {
  const { knownUsers, setUserRole, getUserRole } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setUserRole(newEmail.trim().toLowerCase(), newRole);
    const existing = knownUsers.find((u) => u.email === newEmail.trim().toLowerCase());
    if (!existing) {
      const users = JSON.parse(localStorage.getItem('etus-academy-known-users') || '[]');
      users.push({
        email: newEmail.trim().toLowerCase(),
        name: newName.trim() || newEmail.split('@')[0],
        lastLogin: '',
      });
      localStorage.setItem('etus-academy-known-users', JSON.stringify(users));
    }
    setNewEmail('');
    setNewName('');
    setNewRole('student');
    setShowAddForm(false);
    window.location.reload();
  };

  const handleRoleChange = (email: string, role: UserRole) => {
    setUserRole(email, role);
  };

  const allUsers = [...knownUsers];
  const overrides = JSON.parse(localStorage.getItem('etus-academy-role-overrides') || '{}');
  Object.keys(overrides).forEach((email) => {
    if (!allUsers.find((u) => u.email === email)) {
      allUsers.push({ email, name: email.split('@')[0], lastLogin: '' });
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-500 mt-1">Adicione pessoas e defina seus perfis de acesso</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Adicionar Pessoa
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Nova Pessoa</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="pessoa@etus.com.br"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome da pessoa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="admin">RH / Administrador</option>
                  <option value="teacher">Professor</option>
                  <option value="student">Aluno</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                Adicionar
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-5">Pessoa</div>
          <div className="col-span-4">Perfil</div>
          <div className="col-span-3">Último Acesso</div>
        </div>

        {allUsers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhum usuário registrado ainda.</p>
            <p className="text-xs text-gray-400 mt-1">As pessoas aparecerão aqui após o primeiro login.</p>
          </div>
        ) : (
          allUsers.map((knownUser) => {
            const currentRole = getUserRole(knownUser.email);
            const roleConfig = ROLE_CONFIG.find((r) => r.role === currentRole) || ROLE_CONFIG[2];
            return (
              <div key={knownUser.email} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 items-center">
                <div className="col-span-5 flex items-center gap-3">
                  {knownUser.avatarUrl ? (
                    <img src={knownUser.avatarUrl} alt={knownUser.name} className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-700">{knownUser.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{knownUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{knownUser.email}</p>
                  </div>
                </div>
                <div className="col-span-4">
                  <select
                    value={currentRole}
                    onChange={(e) => handleRoleChange(knownUser.email, e.target.value as UserRole)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer ${roleConfig.color}`}
                  >
                    <option value="admin">RH / Administrador</option>
                    <option value="teacher">Professor</option>
                    <option value="student">Aluno</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-gray-500">
                    {knownUser.lastLogin
                      ? new Date(knownUser.lastLogin).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Ainda não acessou'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
