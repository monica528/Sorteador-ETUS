import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { getEventTypeInfo } from '@/utils/constants';
import { Trash2, Search } from 'lucide-react';

export default function RHParticipants() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [search, setSearch] = useState('');

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

  const filtered = participants
    .filter((p) => selectedEvent === 'all' || p.eventId === selectedEvent)
    .filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()));

  const eventOptions = [
    { value: 'all', label: `Todos os eventos (${participants.length})` },
    ...events.map((e) => ({
      value: e.id,
      label: `${e.name} (${participants.filter((p) => p.eventId === e.id).length})`,
    })),
  ];

  async function removeParticipant(participantId, name) {
    if (!window.confirm(`Remover ${name} do sorteio?`)) return;
    await deleteDoc(doc(db, 'event_participants', participantId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando participantes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n-950">Participantes</h1>
        <p className="text-n-500 mt-1">{participants.length} inscricoes totais</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-n-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-xl border-2 border-input bg-white pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-etus-green focus:border-etus-green transition-all"
          />
        </div>
        <Select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          options={eventOptions}
          className="w-full sm:w-64"
        />
      </div>

      {/* Participant list */}
      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-n-500 py-8">Nenhum participante encontrado.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const event = events.find((e) => e.id === p.eventId);
                const typeInfo = event ? getEventTypeInfo(event.type) : null;
                return (
                  <div key={p.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                    <div className="w-10 h-10 rounded-full bg-etus-mint flex items-center justify-center text-sm font-bold text-etus-dark flex-shrink-0">
                      {p.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-n-950 truncate">{p.name}</p>
                      <p className="text-xs text-n-500 truncate">{p.email}</p>
                    </div>
                    {event && (
                      <Badge variant="default" className="hidden sm:flex">
                        {typeInfo?.emoji} {event.name}
                      </Badge>
                    )}
                    <div className="text-xs text-n-400 hidden md:block">
                      {new Date(p.joinedAt).toLocaleDateString('pt-BR')}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-n-400 hover:text-destructive"
                      onClick={() => removeParticipant(p.id, p.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
