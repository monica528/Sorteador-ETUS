import { Calendar, Clock, Users, Ticket, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEventTypeInfo, formatDate } from '@/utils/constants';

const STATUS_BADGES = {
  open: { label: 'Aberto', variant: 'success' },
  upcoming: { label: 'Em breve', variant: 'info' },
  closed: { label: 'Encerrado', variant: 'warning' },
  finished: { label: 'Finalizado', variant: 'outline' },
};

export default function EventCard({ event, participantCount = 0, children, onClick }) {
  const typeInfo = getEventTypeInfo(event.type);
  const statusBadge = STATUS_BADGES[event.status] || STATUS_BADGES.open;

  return (
    <Card
      className={`overflow-hidden animate-slide-in ${onClick ? 'cursor-pointer hover:border-etus-green' : ''}`}
      onClick={onClick}
    >
      {event.imageUrl && (
        <div className="h-44 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!event.imageUrl && (
        <div className="h-32 bg-gradient-etus flex items-center justify-center">
          <span className="text-5xl">{typeInfo.emoji}</span>
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-n-950 truncate">{event.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{typeInfo.emoji} {typeInfo.label}</Badge>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-n-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-etus-dark" />
            {formatDate(event.drawDate)}
          </span>
          {event.drawTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-etus-dark" />
              {event.drawTime}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-etus-dark" />
            {participantCount} participante{participantCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-etus-dark" />
            {event.ticketCount || event.winnerCount || 1} ingresso{(event.ticketCount || event.winnerCount || 1) !== 1 ? 's' : ''}
          </span>
          {event.ticketType && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-etus-dark" />
              {event.ticketType === 'fisico' ? 'Físico' : 'Virtual'}
            </span>
          )}
        </div>

        {children && <div className="pt-2 border-t border-border">{children}</div>}
      </div>
    </Card>
  );
}
