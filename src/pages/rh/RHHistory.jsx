import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { getEventTypeInfo, formatDate, EVENT_TYPES } from '@/utils/constants';
import { Calendar, Users, Trophy, Download, Search } from 'lucide-react';

export default function RHHistory() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'events'), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(collection(db, 'event_participants'), (snap) => {
      setParticipants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const finished = events
    .filter((e) => e.status === 'finished')
    .filter((e) => !search || e.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => typeFilter === 'all' || e.type === typeFilter)
    .sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || ''));

  function exportToExcel() {
    const data = finished.map((e) => ({
      'Evento': e.name,
      'Tipo': getEventTypeInfo(e.type).label,
      'Data do Sorteio': formatDate(e.drawDate),
      'Participantes': e.participantCount || 0,
      'Ganhadores': (e.winnerNames || []).join(', '),
      'Realizado por': e.drawnBy || '',
      'Data/Hora': e.finishedAt ? new Date(e.finishedAt).toLocaleString('pt-BR') : '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historico');
    XLSX.writeFile(wb, `historico-sorteios-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const filterOptions = [
    { value: 'all', label: 'Todos os tipos' },
    ...EVENT_TYPES,
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando historico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-n-950">Historico Completo</h1>
          <p className="text-n-500 mt-1">{finished.length} sorteio{finished.length !== 1 ? 's' : ''} realizado{finished.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" onClick={exportToExcel} disabled={finished.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Exportar Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-n-400" />
          <input
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-xl border-2 border-input bg-white pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-etus-green focus:border-etus-green transition-all"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={filterOptions}
          className="w-full sm:w-48"
        />
      </div>

      {finished.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-n-800">Nenhum sorteio realizado ainda</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {finished.map((event) => {
            const typeInfo = getEventTypeInfo(event.type);
            const eventParticipants = participants.filter((p) => p.eventId === event.id);
            return (
              <Card key={event.id} className="animate-slide-in">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-etus flex items-center justify-center text-xl flex-shrink-0">
                        {typeInfo.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-n-950">{event.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-n-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(event.drawDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event.participantCount || eventParticipants.length} participantes
                          </span>
                          <span>Realizado por: {event.drawnBy}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="default">{typeInfo.label}</Badge>
                  </div>

                  {event.winnerNames?.length > 0 && (
                    <div className="bg-etus-mint-light/50 rounded-xl p-3">
                      <p className="text-xs font-medium text-etus-dark mb-2 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" /> Ganhadores:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {event.winnerNames.map((name, i) => (
                          <Badge key={i} variant="success">🏆 {name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All participants (RH can see this) */}
                  {eventParticipants.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-n-500 mb-1.5">Todos os participantes:</p>
                      <div className="flex flex-wrap gap-1">
                        {eventParticipants.map((p) => (
                          <Badge key={p.id} variant="outline">{p.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
