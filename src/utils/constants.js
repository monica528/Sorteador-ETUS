export const EVENT_TYPES = [
  { value: 'cinema', label: 'Cinema', emoji: '🎬' },
  { value: 'show', label: 'Show', emoji: '🎤' },
  { value: 'teatro', label: 'Teatro', emoji: '🎭' },
  { value: 'curso', label: 'Curso', emoji: '📚' },
  { value: 'palestra', label: 'Palestra', emoji: '🎙️' },
  { value: 'feira', label: 'Feira', emoji: '🎪' },
  { value: 'viagem', label: 'Viagem', emoji: '✈️' },
  { value: 'kits', label: 'Kits', emoji: '🎁' },
  { value: 'outros', label: 'Outros', emoji: '🎉' },
];

export const TICKET_TYPES = [
  { value: 'fisico', label: 'Físico' },
  { value: 'virtual', label: 'Virtual' },
];

export const LOSER_MESSAGES = [
  'Não foi dessa vez 😅',
  'Quase! Tenta no próximo 👀',
  'A sorte estava de folga hoje 🍀',
  'Não desanima! O próximo pode ser seu 💪',
  'Quem sabe na próxima? 🤞',
  'Fica de olho nos próximos sorteios! 🔎',
  'A sua hora vai chegar! ⏳',
  'Continue participando! 🚀',
];

export function getEventTypeInfo(type) {
  return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1];
}

export function getRandomLoserMessage() {
  return LOSER_MESSAGES[Math.floor(Math.random() * LOSER_MESSAGES.length)];
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function getEventStatus(event) {
  const now = new Date();
  if (event.status === 'finished') return 'finished';
  if (event.participationStartTime && event.participationEndTime) {
    const startParts = event.participationStartTime.split(':');
    const endParts = event.participationEndTime.split(':');
    const [y, m, d] = (event.drawDate || '').split('-').map(Number);
    if (y && m && d) {
      const start = new Date(y, m - 1, d, Number(startParts[0]), Number(startParts[1]));
      const end = new Date(y, m - 1, d, Number(endParts[0]), Number(endParts[1]));
      if (now < start) return 'upcoming';
      if (now > end) return 'closed';
    }
  }
  return 'open';
}
