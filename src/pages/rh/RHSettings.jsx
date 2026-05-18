import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, User, FileText } from 'lucide-react';

const RH_EMAILS = [
  'rh@etus.com.br',
  'monica@etus.com.br',
  'felipe.moreira@etus.com.br',
  'vanessa.teixeira@etus.com.br',
];

const ACTION_LABELS = {
  create_event: { label: 'Criou evento', variant: 'success' },
  cancel_event: { label: 'Cancelou evento', variant: 'danger' },
  close_event: { label: 'Encerrou inscricoes', variant: 'warning' },
  draw_event: { label: 'Realizou sorteio', variant: 'info' },
};

export default function RHSettings() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(50)),
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-n-950">Configuracoes</h1>
        <p className="text-n-500 mt-1">Gerenciamento do sistema</p>
      </div>

      {/* Admin Emails */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-n-950 flex items-center gap-2">
            <Shield className="w-4 h-4 text-etus-dark" /> Administradores RH
          </h2>
          <p className="text-sm text-n-500">
            Usuarios com acesso ao painel administrativo
          </p>
          <div className="space-y-2">
            {RH_EMAILS.map((email) => (
              <div key={email} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-etus-mint flex items-center justify-center text-xs font-bold text-etus-dark">
                  {email[0].toUpperCase()}
                </div>
                <span className="text-sm text-n-800">{email}</span>
                <Badge variant="success">Admin</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allowed Domains */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-n-950 flex items-center gap-2">
            <Shield className="w-4 h-4 text-etus-dark" /> Dominios Autorizados
          </h2>
          <div className="flex gap-2">
            <Badge variant="default">@etus.com.br</Badge>
            <Badge variant="default">@bhaz.com.br</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Admin Logs */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-n-950 flex items-center gap-2">
            <FileText className="w-4 h-4 text-etus-dark" /> Logs Administrativos
          </h2>
          <p className="text-sm text-n-500">Ultimas 50 acoes administrativas</p>

          {loading ? (
            <p className="text-n-500 animate-pulse">Carregando logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-n-500 text-center py-4">Nenhum log registrado ainda.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => {
                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, variant: 'outline' };
                return (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-n-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-n-950">{log.userName || log.userEmail}</span>
                        <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>
                      </div>
                      <p className="text-xs text-n-500 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-xs text-n-400 flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
