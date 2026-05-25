import { useState, useRef } from 'react';
import { Award, Printer, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface CertificateData {
  studentName: string;
  courseName: string;
  classGroupId: string;
  workload: string;
  startDate: string;
  endDate: string;
  teacherName: string;
  adminName: string;
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const { classGroups } = useData();
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';
  const printRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<CertificateData>({
    studentName: '',
    courseName: '',
    classGroupId: '',
    workload: '40',
    startDate: '',
    endDate: '',
    teacherName: '',
    adminName: user?.name ?? '',
  });

  const selectedClass = classGroups.find((g) => g.id === form.classGroupId);

  const handleClassChange = (classGroupId: string) => {
    const group = classGroups.find((g) => g.id === classGroupId);
    setForm((prev) => ({
      ...prev,
      classGroupId,
      courseName: group?.name ?? prev.courseName,
      teacherName: group?.teacherName ?? prev.teacherName,
    }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Certificado - ${form.studentName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Space Grotesk', sans-serif; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: landscape A4; margin: 0; }
          }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificados</h1>
          <p className="text-gray-500 mt-1">Gerar certificados de conclusão para alunos</p>
        </div>
      </div>

      {!isAdmin ? (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Apenas administradores e professores podem gerar certificados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Certificado</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma (opcional)</label>
                <select
                  value={form.classGroupId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Selecione ou preencha manualmente...</option>
                  {classGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Aluno *</label>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Nome completo do aluno"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso *</label>
                <input
                  type="text"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder={selectedClass?.name ?? 'Ex: Inglês Básico - Manhã'}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária</label>
                  <input
                    type="text"
                    value={form.workload}
                    onChange={(e) => setForm({ ...form, workload: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                  <input
                    type="text"
                    value={form.teacherName}
                    onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Nome do professor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsável RH</label>
                  <input
                    type="text"
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!form.studentName || !form.courseName}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  Visualizar
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!form.studentName || !form.courseName}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">Pré-visualização</h3>
            {showPreview || (form.studentName && form.courseName) ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ aspectRatio: '1.414' }}>
                <div ref={printRef}>
                  <div style={{
                    width: '100%',
                    aspectRatio: '1.414',
                    position: 'relative',
                    background: '#FBFAF9',
                    fontFamily: "'Space Grotesk', sans-serif",
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5%',
                  }}>
                    {/* Border decoration */}
                    <div style={{
                      position: 'absolute',
                      inset: '12px',
                      border: '3px solid #3BE476',
                      borderRadius: '12px',
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'absolute',
                      inset: '18px',
                      border: '1px solid #BDFBA6',
                      borderRadius: '10px',
                      pointerEvents: 'none',
                    }} />

                    {/* Watermark logo */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '50%',
                      opacity: 0.04,
                      pointerEvents: 'none',
                    }}>
                      <img src="/logo-etus-academy.png" alt="" style={{ width: '100%' }} />
                    </div>

                    {/* Corner accents */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #066E3E 0%, #3BE476 100%)',
                      borderRadius: '0 0 100% 0',
                      opacity: 0.15,
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(315deg, #066E3E 0%, #3BE476 100%)',
                      borderRadius: '100% 0 0 0',
                      opacity: 0.15,
                    }} />

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                      {/* Logo */}
                      <div style={{ marginBottom: '8px' }}>
                        <img src="/logo-etus-academy.png" alt="ETUS Academy" style={{ height: '60px', margin: '0 auto', display: 'block' }} />
                      </div>

                      <p style={{ fontSize: '10px', color: '#6E6D68', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 300 }}>
                        Certificado de Conclusão
                      </p>

                      <p style={{ fontSize: '11px', color: '#6E6D68', marginBottom: '4px' }}>
                        Certificamos que
                      </p>

                      <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#151514', marginBottom: '8px', lineHeight: 1.2 }}>
                        {form.studentName || 'Nome do Aluno'}
                      </h2>

                      <p style={{ fontSize: '11px', color: '#6E6D68', lineHeight: 1.6, maxWidth: '80%', margin: '0 auto 16px' }}>
                        concluiu com êxito o curso de <strong style={{ color: '#066E3E' }}>{form.courseName || 'Nome do Curso'}</strong>
                        {form.workload && <>, com carga horária de <strong>{form.workload} horas</strong></>}
                        {form.startDate && form.endDate && (
                          <>, no período de <strong>{formatDate(form.startDate)}</strong> a <strong>{formatDate(form.endDate)}</strong></>
                        )}
                        , promovido pela <strong>ETUS Media</strong> através do programa <strong>ETUS Academy</strong>.
                      </p>

                      <p style={{ fontSize: '9px', color: '#908E89', marginBottom: '24px', fontStyle: 'italic' }}>
                        Quem sonha evolui.
                      </p>

                      {/* Signatures */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginTop: '8px' }}>
                        {form.teacherName && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '140px', borderTop: '1px solid #D6D4D1', paddingTop: '6px' }}>
                              <p style={{ fontSize: '10px', fontWeight: 500, color: '#151514' }}>{form.teacherName}</p>
                              <p style={{ fontSize: '8px', color: '#908E89' }}>Professor(a)</p>
                            </div>
                          </div>
                        )}
                        {form.adminName && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '140px', borderTop: '1px solid #D6D4D1', paddingTop: '6px' }}>
                              <p style={{ fontSize: '10px', fontWeight: 500, color: '#151514' }}>{form.adminName}</p>
                              <p style={{ fontSize: '8px', color: '#908E89' }}>RH / Gestão de Pessoas</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <p style={{ fontSize: '7px', color: '#BEBBB7', marginTop: '16px' }}>
                        {today} &bull; ETUS Media &mdash; Gestão de Desenvolvimento
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm" style={{ aspectRatio: '1.414' }}>
                <div className="text-center">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Preencha os dados para visualizar o certificado</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
