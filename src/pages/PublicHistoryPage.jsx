import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { getEventTypeInfo, formatDate, EVENT_TYPES } from '@/utils/constants';
import { Calendar, Users, Trophy, Search } from 'lucide-react';

export default function PublicHistoryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const finished = events
    .filter((e) => e.status === 'finished')
    .filter((e) => !search || e.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => typeFilter === 'all' || e.type === typeFilter)
    .sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || ''));

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
      <div>
        <h1 className="text-2xl font-bold text-n-950">Historico de Sorteios</h1>
        <p className="text-n-500 mt-1">Resultados publicos de todos os sorteios realizados</p>
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
            <div className="text-5xl mb-4">📜</div>
            <h3 className="text-lg font-semibold text-n-800">Nenhum sorteio finalizado</h3>
            <p className="text-n-500 mt-1">Os resultados aparecerão aqui após os sorteios serem realizados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {finished.map((event) => {
            const typeInfo = getEventTypeInfo(event.type);
            return (
              <Card key={event.id} className="animate-slide-in">
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt="" className="w-full sm:w-24 h-32 sm:h-24 rounded-xl object-cover" />
                  ) : (
                    <div className="w-full sm:w-24 h-20 sm:h-24 rounded-xl bg-gradient-etus flex items-center justify-center text-3xl flex-shrink-0">
                      {typeInfo.emoji}
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-n-950">{event.name}</h3>
                      <Badge variant="default">{typeInfo.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-n-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(event.drawDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {event.participantCount || 0} participantes
                      </span>
                    </div>
                    {event.winnerNames?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {event.winnerNames.map((name, i) => (
                          <Badge key={i} variant="success">
                            <Trophy className="w-3 h-3" /> {name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
