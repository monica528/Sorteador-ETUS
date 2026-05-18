import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getEventTypeInfo, formatDate } from '@/utils/constants';
import {
  CalendarCheck, Users, Trophy, TrendingUp, Plus, ArrowRight,
} from 'lucide-react';

export default function RHDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const activeEvents = events.filter((e) => e.status !== 'finished');
  const finishedEvents = events.filter((e) => e.status === 'finished');
  const totalWinners = finishedEvents.reduce((sum, e) => sum + (e.winnerNames?.length || 0), 0);
  const uniqueParticipants = new Set(participants.map((p) => p.email)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-n-500 animate-pulse">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-n-950">Dashboard</h1>
          <p className="text-n-500 mt-1">Visao geral dos sorteios</p>
        </div>
        <Button onClick={() => navigate('/rh/criar')}>
          <Plus className="w-4 h-4 mr-2" /> Criar Evento
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={CalendarCheck} label="Total de Eventos" value={events.length} color="bg-etus-green/15 text-etus-dark" />
        <MetricCard icon={CalendarCheck} label="Eventos Ativos" value={activeEvents.length} color="bg-accent-blue/20 text-blue-700" />
        <MetricCard icon={Users} label="Participacoes" value={participants.length} color="bg-accent-pink/20 text-pink-700" />
        <MetricCard icon={Trophy} label="Ganhadores" value={totalWinners} color="bg-accent-yellow/20 text-yellow-700" />
      </div>

      {/* Engagement */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-n-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-etus-dark" /> Engajamento
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-n-950">{uniqueParticipants}</p>
              <p className="text-xs text-n-500">Colaboradores unicos</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-n-950">
                {events.length > 0 ? Math.round(participants.length / events.length) : 0}
              </p>
              <p className="text-xs text-n-500">Media por evento</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-n-950">{finishedEvents.length}</p>
              <p className="text-xs text-n-500">Sorteios realizados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {activeEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-n-950">Eventos Ativos</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/rh/eventos')}>
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {activeEvents.slice(0, 5).map((event) => {
              const typeInfo = getEventTypeInfo(event.type);
              const pCount = participants.filter((p) => p.eventId === event.id).length;
              return (
                <Card key={event.id}>
                  <CardContent className="flex items-center gap-4 py-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-etus flex items-center justify-center text-xl flex-shrink-0">
                      {typeInfo.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-n-950 truncate">{event.name}</p>
                      <p className="text-xs text-n-500">{formatDate(event.drawDate)} {event.drawTime && `as ${event.drawTime}`}</p>
                    </div>
                    <Badge variant="info">{pCount} inscritos</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-n-950">{value}</p>
          <p className="text-xs text-n-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
