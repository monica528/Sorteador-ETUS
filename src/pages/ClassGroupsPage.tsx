import { Users, Clock, BookOpen } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function ClassGroupsPage() {
  const { classGroups, lessons, attendance } = useData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
        <p className="text-gray-500 mt-1">Gerencie as turmas de inglês</p>
      </div>

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
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    group.active
                      ? 'bg-success-50 text-success-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {group.active ? 'Ativa' : 'Inativa'}
                </span>
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
    </div>
  );
}
