import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEventTypeInfo, formatDate } from '@/utils/constants';
import { Calendar, Trophy, Clock } from 'lucide-react';

export default function UserMyRafflesPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'events'), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(collection(db, 'event_participants'), (snap) => {
      const mine = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.uid === user?.uid);
      setMyParticipations(mine);
      setLoading(false);
    });
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const myEvents = myParticipations.map((p) => {
    const event = events.find((e) => e.id === p.eventId);
    if (!event) return null;
    const won = event.winners?.some((w) => w.uid === user.uid);
    return { ...event, joinedAt: p.joinedAt, won };
  }).filter(Boolean);

  const active = myEvents.filter((e) => e.status !== 'finished');
  const finished = myEvents.filter((e) => e.status === 'finished');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-n-950">Meus Sorteios</h1>
        <p className="text-n-500 mt-1">Acompanhe seus sorteios e resultados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Participacoes" value={myEvents.length} icon="🎫" />
        <StatCard label="Ativos" value={active.length} icon="🔥" />
        <StatCard label="Finalizados" value={finished.length} icon="✅" />
        <StatCard label="Vitorias" value={finished.filter((e) => e.won).length} icon="🏆" />
      </div>

      {/* Active participations */}
      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-n-950">Participando agora</h2>
          {active.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Finished participations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-n-950">Historico</h2>
        {finished.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-n-500">Voce ainda nao participou de nenhum sorteio finalizado.</p>
            </CardContent>
          </Card>
        ) : (
          finished.map((event) => (
            <EventRow key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <Card>
      <CardContent className="text-center py-4">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold text-n-950 mt-1">{value}</p>
        <p className="text-xs text-n-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function EventRow({ event }) {
  const typeInfo = getEventTypeInfo(event.type);
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-etus flex items-center justify-center text-2xl flex-shrink-0">
            {typeInfo.emoji}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-n-950 truncate">{event.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="default">{typeInfo.label}</Badge>
            {event.status === 'finished' ? (
              event.won ? (
                <Badge variant="success"><Trophy className="w-3 h-3" /> Ganhou!</Badge>
              ) : (
                <Badge variant="outline">Nao ganhou</Badge>
              )
            ) : (
              <Badge variant="info">Ativo</Badge>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-n-500 flex-shrink-0 hidden sm:block">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.drawDate)}
          </div>
          {event.joinedAt && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              <Clock className="w-3 h-3" />
              Inscrito em {new Date(event.joinedAt).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
