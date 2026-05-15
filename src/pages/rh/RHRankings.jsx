import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { EVENT_TYPES, getEventTypeInfo } from '@/utils/constants';
import { Trophy, Users, Medal, BarChart3 } from 'lucide-react';

export default function RHRankings() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('winners');
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

  const finishedEvents = events
    .filter((e) => e.status === 'finished')
    .filter((e) => typeFilter === 'all' || e.type === typeFilter);

  // Winner ranking
  const winnerCounts = {};
  finishedEvents.forEach((event) => {
    (event.winners || []).forEach((w) => {
      const key = w.email || w.name;
      if (!winnerCounts[key]) winnerCounts[key] = { name: w.name, email: w.email, count: 0 };
      winnerCounts[key].count++;
    });
  });
  const topWinners = Object.values(winnerCounts).sort((a, b) => b.count - a.count);

  // Participation ranking
  const filteredEventIds = typeFilter === 'all'
    ? null
    : new Set(events.filter((e) => e.type === typeFilter).map((e) => e.id));
  const filteredParticipants = filteredEventIds
    ? participants.filter((p) => filteredEventIds.has(p.eventId))
    : participants;

  const participationCounts = {};
  filteredParticipants.forEach((p) => {
    const key = p.email || p.name;
    if (!participationCounts[key]) participationCounts[key] = { name: p.name, email: p.email, count: 0 };
    participationCounts[key].count++;
  });
  const topParticipants = Object.values(participationCounts).sort((a, b) => b.count - a.count);

  // Engagement by event type
  const engagementByType = {};
  events.forEach((e) => {
    const type = e.type || 'outros';
    if (!engagementByType[type]) engagementByType[type] = { events: 0, participants: 0 };
    engagementByType[type].events++;
    engagementByType[type].participants += participants.filter((p) => p.eventId === e.id).length;
  });

  const filterOptions = [
    { value: 'all', label: 'Todos os tipos' },
    ...EVENT_TYPES,
  ];

  const MEDAL_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando rankings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n-950">Rankings e Metricas</h1>
        <p className="text-n-500 mt-1">Engajamento dos colaboradores nos sorteios</p>
      </div>

      {/* Engagement by Type */}
      <Card>
        <CardContent>
          <h2 className="font-semibold text-n-950 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-etus-dark" /> Engajamento por Tipo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(engagementByType).map(([type, data]) => {
              const info = getEventTypeInfo(type);
              return (
                <div key={type} className="bg-muted rounded-xl p-3 text-center">
                  <span className="text-xl">{info.emoji}</span>
                  <p className="text-sm font-medium text-n-950 mt-1">{info.label}</p>
                  <p className="text-xs text-n-500">{data.events} eventos | {data.participants} inscricoes</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('winners')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'winners'
                ? 'bg-etus-green/15 text-etus-dark border border-etus-green/30'
                : 'text-n-500 hover:bg-muted'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-1.5" /> Ganhadores
          </button>
          <button
            onClick={() => setTab('participants')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'participants'
                ? 'bg-etus-green/15 text-etus-dark border border-etus-green/30'
                : 'text-n-500 hover:bg-muted'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1.5" /> Participacao
          </button>
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={filterOptions}
          className="w-full sm:w-48"
        />
      </div>

      <Card>
        <CardContent>
          {tab === 'winners' ? (
            topWinners.length === 0 ? (
              <p className="text-center text-n-500 py-8">Nenhum ganhador registrado.</p>
            ) : (
              <div className="space-y-3">
                {topWinners.map((w, i) => (
                  <div key={w.email || w.name} className="flex items-center gap-4 py-2">
                    <div className="w-8 text-center">
                      {i < 3 ? <Medal className={`w-6 h-6 mx-auto ${MEDAL_COLORS[i]}`} /> : <span className="text-sm font-medium text-n-500">{i + 1}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-etus-mint flex items-center justify-center text-sm font-bold text-etus-dark">
                      {w.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-n-950">{w.name}</p>
                      <p className="text-xs text-n-500">{w.email}</p>
                    </div>
                    <Badge variant="success">{w.count}x</Badge>
                  </div>
                ))}
              </div>
            )
          ) : (
            topParticipants.length === 0 ? (
              <p className="text-center text-n-500 py-8">Nenhuma participacao registrada.</p>
            ) : (
              <div className="space-y-3">
                {topParticipants.map((p, i) => (
                  <div key={p.email || p.name} className="flex items-center gap-4 py-2">
                    <div className="w-8 text-center">
                      {i < 3 ? <Medal className={`w-6 h-6 mx-auto ${MEDAL_COLORS[i]}`} /> : <span className="text-sm font-medium text-n-500">{i + 1}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent-blue/30 flex items-center justify-center text-sm font-bold text-n-800">
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-n-950">{p.name}</p>
                      <p className="text-xs text-n-500">{p.email}</p>
                    </div>
                    <Badge variant="info">{p.count}x</Badge>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
