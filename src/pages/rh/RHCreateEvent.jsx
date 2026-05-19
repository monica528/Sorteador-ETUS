import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { useAuth } from '@/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EVENT_TYPES, TICKET_TYPES } from '@/utils/constants';
import { addAdminLog } from '@/utils/adminLog';
import { Upload, Save, ArrowLeft } from 'lucide-react';

export default function RHCreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'cinema',
    ticketCount: 1,
    winnerCount: 1,
    drawDate: '',
    drawTime: '',
    eventDate: '',
    participationStartTime: '',
    participationEndTime: '',
    pickupDeadlineDate: '',
    pickupDeadlineTime: '',
    ticketType: 'fisico',
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.drawDate) {
      alert('Preencha o nome do evento e a data do sorteio.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        try {
          const imageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
          const uploadPromise = uploadBytes(imageRef, imageFile).then(() => getDownloadURL(imageRef));
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout')), 15000)
          );
          imageUrl = await Promise.race([uploadPromise, timeoutPromise]);
        } catch (err) {
          console.warn('Upload de imagem falhou:', err.message);
          alert('Upload de imagem falhou. O evento sera criado sem imagem. Para ativar upload, configure o Firebase Storage no console.');
          imageUrl = '';
        }
      }

      const eventData = {
        name: form.name.trim(),
        type: form.type,
        ticketCount: Number(form.ticketCount) || 1,
        winnerCount: Number(form.winnerCount) || 1,
        drawDate: form.drawDate,
        drawTime: form.drawTime,
        eventDate: form.eventDate || '',
        participationStartTime: form.participationStartTime || '',
        participationEndTime: form.participationEndTime || '',
        pickupDeadlineDate: form.pickupDeadlineDate || '',
        pickupDeadlineTime: form.pickupDeadlineTime || '',
        ticketType: form.ticketType,
        imageUrl,
        status: 'active',
        createdBy: user.email,
        createdAt: new Date().toISOString(),
        winners: [],
        winnerNames: [],
        participantCount: 0,
      };

      await addDoc(collection(db, 'events'), eventData);
      await addAdminLog(user, 'create_event', `Evento criado: ${form.name}`);
      navigate('/rh/eventos');
    } catch (err) {
      alert(`Erro ao criar evento: ${err.message}`);
    }
    setSubmitting(false);
  }

  const typeOptions = EVENT_TYPES.map((t) => ({ ...t }));
  const ticketOptions = TICKET_TYPES.map((t) => ({ ...t }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/rh')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-n-950">Criar Evento</h1>
          <p className="text-n-500 mt-1">Preencha as informacoes do novo sorteio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-semibold text-n-950">Informacoes Principais</h2>
            <Input
              label="Nome do Evento"
              placeholder="Ex: Sorteio Cinema - Dezembro"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Tipo do Evento"
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                options={typeOptions}
              />
              <Select
                label="Tipo de Ingresso"
                value={form.ticketType}
                onChange={(e) => update('ticketType', e.target.value)}
                options={ticketOptions}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Quantidade de Ingressos"
                type="number"
                min="1"
                value={form.ticketCount}
                onChange={(e) => update('ticketCount', e.target.value)}
              />
              <Input
                label="Quantidade de Ganhadores"
                type="number"
                min="1"
                value={form.winnerCount}
                onChange={(e) => update('winnerCount', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-semibold text-n-950">Datas e Horarios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Data do Sorteio *"
                type="date"
                value={form.drawDate}
                onChange={(e) => update('drawDate', e.target.value)}
                required
              />
              <Input
                label="Horario do Sorteio"
                type="time"
                value={form.drawTime}
                onChange={(e) => update('drawTime', e.target.value)}
              />
            </div>
            <Input
              label="Data do Evento (opcional)"
              type="date"
              value={form.eventDate}
              onChange={(e) => update('eventDate', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Participation time control */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-semibold text-n-950">Controle de Participacao</h2>
            <p className="text-sm text-n-500">Defina quando a participacao abre e fecha automaticamente</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Horario de Abertura"
                type="time"
                value={form.participationStartTime}
                onChange={(e) => update('participationStartTime', e.target.value)}
              />
              <Input
                label="Horario de Fechamento"
                type="time"
                value={form.participationEndTime}
                onChange={(e) => update('participationEndTime', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pickup */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-semibold text-n-950">Retirada do Premio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Data Limite de Retirada"
                type="date"
                value={form.pickupDeadlineDate}
                onChange={(e) => update('pickupDeadlineDate', e.target.value)}
              />
              <Input
                label="Horario Limite de Retirada"
                type="time"
                value={form.pickupDeadlineTime}
                onChange={(e) => update('pickupDeadlineTime', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-semibold text-n-950">Imagem do Evento</h2>
            <p className="text-sm text-n-500">Banner, cartaz ou arte promocional</p>
            <div className="flex flex-col items-center gap-4">
              {imagePreview ? (
                <div className="relative w-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-n-600 hover:text-n-950"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-etus-green hover:bg-etus-mint-light/30 transition-all">
                  <Upload className="w-8 h-8 mx-auto text-n-400 mb-2" />
                  <p className="text-sm text-n-600">Clique para enviar imagem</p>
                  <p className="text-xs text-n-400 mt-1">PNG, JPG ate 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/rh')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            {submitting ? 'Criando...' : 'Criar Evento'}
          </Button>
        </div>
      </form>
    </div>
  );
}
