import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { db } from '@/firebase';
import { useAuth } from '@/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addAdminLog } from '@/utils/adminLog';
import { getEventTypeInfo, formatDate } from '@/utils/constants';
import { Shuffle, Users, Trophy, Calendar } from 'lucide-react';

export default function RHDraw() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState({});
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(null);
  const [results, setResults] = useState({});
  const [manualNames, setManualNames] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'events'), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsub2 = onSnapshot(collection(db, 'event_participants'), (snap) => {
      const byEvent = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (!byEvent[data.eventId]) byEvent[data.eventId] = [];
        byEvent[data.eventId].push({ id: d.id, ...data });
      });
      setParticipants(byEvent);
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const activeEvents = events.filter((e) => e.status !== 'finished');

  function getAllParticipants(eventId) {
    const fromDb = (participants[eventId] || []).map((p) => ({
      name: p.name, uid: p.uid, email: p.email, id: p.id,
    }));
    const manual = (manualNames[eventId] || '')
      .split(/\n|,/)
      .map((v) => v.trim())
      .filter(Boolean)
      .map((name) => ({ name, uid: null, email: null, id: null }));
    return [...fromDb, ...manual];
  }

  function drawEvent(eventId) {
    const allNames = getAllParticipants(eventId);
    if (allNames.length === 0) {
      alert('Nenhum participante inscrito neste evento.');
      return;
    }
    const event = events.find((e) => e.id === eventId);
    const qty = event?.winnerCount || 1;

    setSpinning(eventId);

    setTimeout(async () => {
      const pool = [...allNames];
      const result = [];
      while (pool.length && result.length < qty) {
        const i = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(i, 1)[0]);
      }

      await updateDoc(doc(db, 'events', eventId), {
        status: 'finished',
        winners: result,
        winnerNames: result.map((w) => w.name),
        participantCount: allNames.length,
        finishedAt: new Date().toISOString(),
        drawnBy: user.email,
      });

      await addAdminLog(user, 'draw_event', `Sorteio realizado: ${event.name} - Ganhadores: ${result.map(w => w.name).join(', ')}`);

      setResults((prev) => ({ ...prev, [eventId]: result }));
      setSpinning(null);

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3BE476', '#8DF768', '#066E3E', '#F0EE7A', '#F5B3D8'],
      });
    }, 2500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n-950">Realizar Sorteio</h1>
        <p className="text-n-500 mt-1">Selecione um evento e realize o sorteio</p>
      </div>

      {activeEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-4">🎲</div>
            <h3 className="text-lg font-semibold text-n-800">Nenhum evento disponivel para sorteio</h3>
            <p className="text-n-500 mt-1">Crie um evento primeiro ou aguarde as inscricoes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event list */}
          <div className="space-y-4">
            <h2 className="font-semibold text-n-950">Eventos disponiveis</h2>
            {activeEvents.map((event) => {
              const typeInfo = getEventTypeInfo(event.type);
              const pCount = (participants[event.id] || []).length;
              const isSelected = selectedEvent === event.id;
              return (
                <Card
                  key={event.id}
                  className={`cursor-pointer transition-all ${isSelected ? 'border-etus-green ring-2 ring-etus-green/20' : ''}`}
                  onClick={() => setSelectedEvent(event.id)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-etus flex items-center justify-center text-2xl flex-shrink-0">
                      {typeInfo.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-n-950 truncate">{event.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-n-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(event.drawDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {pCount} inscritos
                        </span>
                      </div>
                    </div>
                    {results[event.id] && (
                      <Badge variant="success">Sorteado</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Draw panel */}
          {selectedEvent && (
            <div className="space-y-4">
              <h2 className="font-semibold text-n-950">Painel do Sorteio</h2>

              {(() => {
                const event = events.find((e) => e.id === selectedEvent);
                const pList = participants[selectedEvent] || [];
                const allP = getAllParticipants(selectedEvent);
                const result = results[selectedEvent];
                const isSpinning = spinning === selectedEvent;

                if (!event) return null;

                return (
                  <Card>
                    <CardContent className="space-y-4">
                      <h3 className="font-semibold text-lg text-n-950">{event.name}</h3>
                      <p className="text-sm text-n-500">
                        Ganhadores: {event.winnerCount || 1} | Inscritos: {allP.length}
                      </p>

                      {/* Participants */}
                      {pList.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-n-600 mb-2">Participantes inscritos:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pList.map((p) => (
                              <Badge key={p.id} variant="outline">{p.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual names */}
                      <Textarea
                        label="Adicionar nomes manualmente"
                        placeholder="Um nome por linha ou separados por virgula"
                        value={manualNames[selectedEvent] || ''}
                        onChange={(e) => setManualNames((prev) => ({ ...prev, [selectedEvent]: e.target.value }))}
                      />

                      {/* Draw button */}
                      {isSpinning ? (
                        <div className="text-center py-8">
                          <div className="text-4xl animate-spin mb-4">🎲</div>
                          <p className="text-lg font-semibold text-etus-dark animate-pulse">
                            Sorteando...
                          </p>
                        </div>
                      ) : result ? (
                        <div className="bg-etus-mint-light rounded-xl p-4 space-y-2">
                          <p className="font-semibold text-etus-dark flex items-center gap-2">
                            <Trophy className="w-5 h-5" /> Ganhadores:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.map((w, i) => (
                              <Badge key={i} variant="success" className="text-sm py-1.5 px-3">
                                🏆 {w.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="success"
                          size="lg"
                          className="w-full animate-pulse-glow"
                          onClick={() => drawEvent(selectedEvent)}
                          disabled={allP.length === 0}
                        >
                          <Shuffle className="w-5 h-5 mr-2" /> Realizar Sorteio
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
