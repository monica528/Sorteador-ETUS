import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Medal } from 'lucide-react';

export default function RankingsPage() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('winners');

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

  const finishedEvents = events.filter((e) => e.status === 'finished');

  // Ranking de ganhadores
  const winnerCounts = {};
  finishedEvents.forEach((event) => {
    (event.winners || []).forEach((w) => {
      const key = w.email || w.name;
      if (!winnerCounts[key]) winnerCounts[key] = { name: w.name, email: w.email, count: 0 };
      winnerCounts[key].count++;
    });
  });
  const topWinners = Object.values(winnerCounts).sort((a, b) => b.count - a.count).slice(0, 20);

  // Ranking de participacao
  const participationCounts = {};
  participants.forEach((p) => {
    const key = p.email || p.name;
    if (!participationCounts[key]) participationCounts[key] = { name: p.name, email: p.email, count: 0 };
    participationCounts[key].count++;
  });
  const topParticipants = Object.values(participationCounts).sort((a, b) => b.count - a.count).slice(0, 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando rankings...</p>
      </div>
    );
  }

  const MEDAL_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n-950">Rankings</h1>
        <p className="text-n-500 mt-1">Acompanhe quem mais participa e ganha</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('winners')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'winners'
              ? 'bg-etus-green/15 text-etus-dark border border-etus-green/30'
              : 'text-n-500 hover:bg-muted'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-1.5" /> Maiores Ganhadores
        </button>
        <button
          onClick={() => setTab('participants')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'participants'
              ? 'bg-etus-green/15 text-etus-dark border border-etus-green/30'
              : 'text-n-500 hover:bg-muted'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" /> Maior Participacao
        </button>
      </div>

      <Card>
        <CardContent>
          {tab === 'winners' ? (
            topWinners.length === 0 ? (
              <p className="text-center text-n-500 py-8">Nenhum ganhador ainda.</p>
            ) : (
              <div className="space-y-3">
                {topWinners.map((w, i) => (
                  <div key={w.email || w.name} className="flex items-center gap-4 py-2">
                    <div className="w-8 text-center">
                      {i < 3 ? (
                        <Medal className={`w-6 h-6 mx-auto ${MEDAL_COLORS[i]}`} />
                      ) : (
                        <span className="text-sm font-medium text-n-500">{i + 1}</span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-etus-mint flex items-center justify-center text-sm font-bold text-etus-dark">
                      {w.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-n-950">{w.name}</p>
                      <p className="text-xs text-n-500">{w.email}</p>
                    </div>
                    <Badge variant="success">{w.count} vitoria{w.count !== 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            )
          ) : (
            topParticipants.length === 0 ? (
              <p className="text-center text-n-500 py-8">Nenhuma participacao ainda.</p>
            ) : (
              <div className="space-y-3">
                {topParticipants.map((p, i) => (
                  <div key={p.email || p.name} className="flex items-center gap-4 py-2">
                    <div className="w-8 text-center">
                      {i < 3 ? (
                        <Medal className={`w-6 h-6 mx-auto ${MEDAL_COLORS[i]}`} />
                      ) : (
                        <span className="text-sm font-medium text-n-500">{i + 1}</span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent-blue/30 flex items-center justify-center text-sm font-bold text-n-800">
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-n-950">{p.name}</p>
                      <p className="text-xs text-n-500">{p.email}</p>
                    </div>
                    <Badge variant="info">{p.count} participacao{p.count !== 1 ? 'es' : ''}</Badge>
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
