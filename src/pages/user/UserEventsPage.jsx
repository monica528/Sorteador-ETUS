import { useEffect, useState } from 'react';
import {
  collection, doc, setDoc, onSnapshot, deleteDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/AuthContext';
import EventCard from '@/components/EventCard';
import CelebrationModal from '@/components/CelebrationModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEventStatus, getRandomLoserMessage, formatDate } from '@/utils/constants';
import { CheckCircle, Trophy, PartyPopper, Clock } from 'lucide-react';

export default function UserEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [allParticipants, setAllParticipants] = useState({});
  const [myJoined, setMyJoined] = useState({});
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState(null);
  const [loserMsg, setLoserMsg] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEvents(all);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'event_participants'), (snap) => {
      const byEvent = {};
      const joined = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (!byEvent[data.eventId]) byEvent[data.eventId] = [];
        byEvent[data.eventId].push({ id: d.id, ...data });
        if (data.uid === user?.uid) {
          joined[data.eventId] = d.id;
        }
      });
      setAllParticipants(byEvent);
      setMyJoined(joined);
    });
    return unsub;
  }, [user]);

  const activeEvents = events
    .filter((e) => e.status !== 'finished')
    .sort((a, b) => (a.drawDate || '').localeCompare(b.drawDate || ''));

  const recentFinished = events
    .filter((e) => e.status === 'finished')
    .sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || ''))
    .slice(0, 3);

  async function hasActiveParticipation() {
    const activeEventIds = activeEvents.map((e) => e.id);
    for (const eid of activeEventIds) {
      if (myJoined[eid]) return true;
    }
    return false;
  }

  async function joinEvent(eventId) {
    if (!user) return;
    const alreadyIn = await hasActiveParticipation();
    if (alreadyIn && !myJoined[eventId]) {
      alert('Voce ja esta participando de outro sorteio ativo. Aguarde o encerramento para participar de outro.');
      return;
    }
    const participantId = `${eventId}_${user.uid}`;
    await setDoc(doc(db, 'event_participants', participantId), {
      eventId,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      uid: user.uid,
      joinedAt: new Date().toISOString(),
    });
  }

  async function leaveEvent(eventId) {
    const participantId = `${eventId}_${user.uid}`;
    await deleteDoc(doc(db, 'event_participants', participantId));
  }

  function checkIfWon(event) {
    if (!event.winners) return false;
    return event.winners.some((w) => w.uid === user.uid);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {celebration && (
        <CelebrationModal
          winner={user.displayName || user.email.split('@')[0]}
          pickupInfo={celebration}
          onClose={() => setCelebration(null)}
        />
      )}

      {loserMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setLoserMsg(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center animate-slide-in">
            <div className="text-5xl mb-4">😔</div>
            <p className="text-lg font-medium text-n-800">{loserMsg}</p>
            <Button variant="outline" className="mt-6" onClick={() => setLoserMsg(null)}>
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-n-950">Eventos Disponiveis</h1>
        <p className="text-n-500 mt-1">Participe dos sorteios ativos e acompanhe os resultados</p>
      </div>

      {/* Active Events */}
      {activeEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-n-800">Nenhum evento ativo no momento</h3>
          <p className="text-n-500 mt-1">Fique de olho! Novos eventos serao criados pelo RH.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeEvents.map((event) => {
            const participants = allParticipants[event.id] || [];
            const hasJoined = event.id in myJoined;
            const status = getEventStatus(event);
            const canJoin = status === 'open' && !hasJoined;
            const isUpcoming = status === 'upcoming';

            return (
              <EventCard
                key={event.id}
                event={{ ...event, status }}
                participantCount={participants.length}
              >
                <div className="space-y-3">
                  {event.participationStartTime && event.participationEndTime && (
                    <div className="flex items-center gap-2 text-xs text-n-500">
                      <Clock className="w-3.5 h-3.5" />
                      Participacao: {event.participationStartTime} - {event.participationEndTime}
                    </div>
                  )}

                  {hasJoined ? (
                    <div className="flex items-center justify-between">
                      <span className="text-etus-dark flex items-center gap-1.5 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Participando
                      </span>
                      <Button variant="outline" size="sm" onClick={() => leaveEvent(event.id)}>
                        Sair
                      </Button>
                    </div>
                  ) : canJoin ? (
                    <Button variant="success" className="w-full" onClick={() => joinEvent(event.id)}>
                      Participar
                    </Button>
                  ) : isUpcoming ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="w-4 h-4 mr-2" /> Abre as {event.participationStartTime || 'em breve'}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Inscricoes encerradas
                    </Button>
                  )}

                  {/* Participant list */}
                  {participants.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-n-500">
                        Participantes ({participants.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {participants.map((p) => (
                          <Badge key={p.id} variant={p.uid === user.uid ? 'success' : 'outline'}>
                            {p.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </EventCard>
            );
          })}
        </div>
      )}

      {/* Recent Results */}
      {recentFinished.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-n-950 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-yellow" /> Resultados Recentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentFinished.map((event) => {
              const won = checkIfWon(event);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  participantCount={event.participantCount || 0}
                >
                  <div className="space-y-2">
                    {event.winnerNames?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-n-500 mb-1.5">Ganhadores:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {event.winnerNames.map((name, i) => (
                            <Badge key={i} variant="success">
                              <Trophy className="w-3 h-3" /> {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {won ? (
                      <Button
                        variant="success"
                        className="w-full"
                        onClick={() => setCelebration({
                          date: event.pickupDeadlineDate ? formatDate(event.pickupDeadlineDate) : null,
                          time: event.pickupDeadlineTime || null,
                        })}
                      >
                        <PartyPopper className="w-4 h-4 mr-2" /> Voce ganhou!
                      </Button>
                    ) : myJoined[event.id] !== undefined || (allParticipants[event.id] || []).some(p => p.uid === user.uid) ? (
                      <Button
                        variant="outline"
                        className="w-full text-n-500"
                        onClick={() => setLoserMsg(getRandomLoserMessage())}
                      >
                        Ver resultado
                      </Button>
                    ) : null}
                  </div>
                </EventCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
