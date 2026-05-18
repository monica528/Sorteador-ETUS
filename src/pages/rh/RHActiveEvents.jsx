import { useEffect, useState } from 'react';
import {
  collection, doc, deleteDoc, onSnapshot, query, where, getDocs, updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/AuthContext';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addAdminLog } from '@/utils/adminLog';
import { getEventStatus } from '@/utils/constants';
import { Trash2, Ban, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RHActiveEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'event_participants'), (snap) => {
      const byEvent = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (!byEvent[data.eventId]) byEvent[data.eventId] = [];
        byEvent[data.eventId].push({ id: d.id, ...data });
      });
      setParticipants(byEvent);
    });
    return unsub;
  }, []);

  const activeEvents = events
    .filter((e) => e.status !== 'finished')
    .sort((a, b) => (a.drawDate || '').localeCompare(b.drawDate || ''));

  async function cancelEvent(eventId, eventName) {
    if (!window.confirm(`Tem certeza que deseja cancelar o evento "${eventName}"?`)) return;
    const snap = await getDocs(
      query(collection(db, 'event_participants'), where('eventId', '==', eventId)),
    );
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, 'event_participants', d.id))));
    await deleteDoc(doc(db, 'events', eventId));
    await addAdminLog(user, 'cancel_event', `Evento cancelado: ${eventName}`);
  }

  async function closeEvent(eventId, eventName) {
    if (!window.confirm(`Encerrar as inscricoes do evento "${eventName}"?`)) return;
    await updateDoc(doc(db, 'events', eventId), { status: 'closed' });
    await addAdminLog(user, 'close_event', `Inscricoes encerradas: ${eventName}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-n-950">Eventos Ativos</h1>
          <p className="text-n-500 mt-1">{activeEvents.length} evento{activeEvents.length !== 1 ? 's' : ''} em andamento</p>
        </div>
        <Button onClick={() => navigate('/rh/criar')}>
          <Plus className="w-4 h-4 mr-2" /> Criar Evento
        </Button>
      </div>

      {activeEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-n-800">Nenhum evento ativo</h3>
          <p className="text-n-500 mt-1">Crie um novo evento para comecar.</p>
          <Button className="mt-4" onClick={() => navigate('/rh/criar')}>
            <Plus className="w-4 h-4 mr-2" /> Criar Evento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeEvents.map((event) => {
            const pList = participants[event.id] || [];
            const status = getEventStatus(event);
            return (
              <EventCard
                key={event.id}
                event={{ ...event, status }}
                participantCount={pList.length}
              >
                <div className="space-y-3">
                  {/* Participant names */}
                  {pList.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-n-500">Participantes:</p>
                      <div className="flex flex-wrap gap-1">
                        {pList.map((p) => (
                          <Badge key={p.id} variant="outline">{p.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => closeEvent(event.id, event.name)}
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" /> Encerrar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelEvent(event.id, event.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </EventCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
