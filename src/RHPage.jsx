import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  collection, doc, deleteDoc, addDoc, onSnapshot, query, orderBy,
  updateDoc, where, getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Download, Trophy, Shuffle, LogOut, Users, Trash2, Plus, Calendar, Clock,
} from 'lucide-react';

export default function RHPage() {
  const { user, logout } = useAuth();
  const fileRef = useRef(null);
  const [tab, setTab] = useState('sorteios');

  // Create raffle form
  const [prize, setPrize] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [drawTime, setDrawTime] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);

  // Active raffles
  const [raffles, setRaffles] = useState([]);
  const [raffleParticipants, setRaffleParticipants] = useState({});
  const [history, setHistory] = useState([]);
  const [spinning, setSpinning] = useState(null);
  const [winners, setWinners] = useState({});

  // Manual names for selected raffle
  const [manualNames, setManualNames] = useState('');
  const [selectedRaffle, setSelectedRaffle] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'raffles'), orderBy('createdAt', 'desc')),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRaffles(all.filter((r) => r.status === 'active'));
        setHistory(all.filter((r) => r.status === 'finished'));
      },
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'raffle_participants'), (snap) => {
      const byRaffle = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (!byRaffle[data.raffleId]) byRaffle[data.raffleId] = [];
        byRaffle[data.raffleId].push({ id: d.id, ...data });
      });
      setRaffleParticipants(byRaffle);
    });
    return unsub;
  }, []);

  async function createRaffle(e) {
    e.preventDefault();
    if (!prize.trim() || !drawDate || !drawTime) return;
    await addDoc(collection(db, 'raffles'), {
      prize: prize.trim(),
      date: drawDate,
      time: drawTime,
      winnerCount: Number(winnerCount) || 1,
      status: 'active',
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      winners: [],
      winnerNames: [],
    });
    setPrize('');
    setDrawDate('');
    setDrawTime('');
    setWinnerCount(1);
    setTab('sorteios');
  }

  function getParticipantsForRaffle(raffleId) {
    const fromFirestore = (raffleParticipants[raffleId] || []).map((p) => ({
      name: p.name, uid: p.uid, id: p.id,
    }));
    if (selectedRaffle === raffleId && manualNames.trim()) {
      const fromManual = manualNames
        .split(/\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)
        .map((name) => ({ name, uid: null, id: null }));
      return [...fromFirestore, ...fromManual];
    }
    return fromFirestore;
  }

  function drawRaffle(raffleId) {
    const allNames = getParticipantsForRaffle(raffleId);
    if (allNames.length === 0) return;
    const raffle = raffles.find((r) => r.id === raffleId);
    const qty = raffle?.winnerCount || 1;

    setSpinning(raffleId);
    setTimeout(async () => {
      const pool = [...allNames];
      const result = [];
      while (pool.length && result.length < qty) {
        const i = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(i, 1)[0]);
      }

      await updateDoc(doc(db, 'raffles', raffleId), {
        status: 'finished',
        winners: result,
        winnerNames: result.map((w) => w.name),
        participantCount: allNames.length,
        finishedAt: new Date().toLocaleString('pt-BR'),
        drawnBy: user.email,
      });

      setWinners((prev) => ({ ...prev, [raffleId]: result }));
      setSpinning(null);
    }, 2200);
  }

  async function deleteRaffle(raffleId) {
    const snap = await getDocs(
      query(collection(db, 'raffle_participants'), where('raffleId', '==', raffleId)),
    );
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, 'raffle_participants', d.id))));
    await deleteDoc(doc(db, 'raffles', raffleId));
  }

  async function removeParticipant(participantDocId) {
    await deleteDoc(doc(db, 'raffle_participants', participantDocId));
  }

  function importExcel(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils
        .sheet_to_json(ws, { header: 1 })
        .flat()
        .filter(Boolean);
      setManualNames(data.join('\n'));
    };
    reader.readAsBinaryString(file);
  }

  function downloadWinners(raffle) {
    const w = raffle.winnerNames || [];
    const header = `SORTEIO: ${raffle.prize}\nData: ${raffle.date} às ${raffle.time}\n\nGANHADORES\n\n`;
    const text = header + w.map((name, i) => `${i + 1}. ${name}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ganhadores.txt';
    a.click();
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: 'linear-gradient(135deg,#151514,#066e3e,#151514)',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">🎬 Sorteio Premium</h1>
            <p className="text-sm text-zinc-300">Painel RH — {user.email}</p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={tab === 'sorteios' ? 'default' : 'outline'}
            className="rounded-2xl"
            onClick={() => setTab('sorteios')}
          >
            <Shuffle className="w-4 h-4 mr-2" /> Sorteios Ativos ({raffles.length})
          </Button>
          <Button
            variant={tab === 'criar' ? 'default' : 'outline'}
            className="rounded-2xl"
            onClick={() => setTab('criar')}
          >
            <Plus className="w-4 h-4 mr-2" /> Criar Sorteio
          </Button>
          <Button
            variant={tab === 'historico' ? 'default' : 'outline'}
            className="rounded-2xl"
            onClick={() => setTab('historico')}
          >
            <Trophy className="w-4 h-4 mr-2" /> Histórico
          </Button>
        </div>

        {/* Create Raffle Tab */}
        {tab === 'criar' && (
          <Card className="rounded-2xl shadow-2xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Criar Novo Sorteio</h2>
              <form onSubmit={createRaffle} className="space-y-4 max-w-md">
                <div>
                  <label className="text-sm text-zinc-300">O que será sorteado?</label>
                  <Input
                    type="text"
                    placeholder="Ex: Ingressos Cinema, Kit Natal..."
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Data do sorteio
                    </label>
                    <Input
                      type="date"
                      value={drawDate}
                      onChange={(e) => setDrawDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Horário
                    </label>
                    <Input
                      type="time"
                      value={drawTime}
                      onChange={(e) => setDrawTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-zinc-300">Quantidade de ganhadores</label>
                  <Input
                    type="number"
                    min="1"
                    value={winnerCount}
                    onChange={(e) => setWinnerCount(Number(e.target.value))}
                  />
                </div>
                <Button type="submit" className="rounded-2xl">
                  <Plus className="w-4 h-4 mr-2" /> Criar Sorteio
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Active Raffles Tab */}
        {tab === 'sorteios' && (
          <div className="space-y-6">
            {raffles.length === 0 ? (
              <Card className="rounded-2xl shadow-2xl">
                <CardContent className="p-6 text-center">
                  <p className="text-zinc-400">Nenhum sorteio ativo. Crie um novo sorteio!</p>
                  <Button className="rounded-2xl mt-4" onClick={() => setTab('criar')}>
                    <Plus className="w-4 h-4 mr-2" /> Criar Sorteio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              raffles.map((raffle) => {
                const parts = getParticipantsForRaffle(raffle.id);
                const isSpinning = spinning === raffle.id;
                const raffleWinners = winners[raffle.id] || [];

                return (
                  <Card key={raffle.id} className="rounded-2xl shadow-2xl">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{raffle.prize}</h3>
                          <p className="text-sm text-zinc-300 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            {raffle.date} às {raffle.time}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="rounded-2xl"
                            onClick={() => drawRaffle(raffle.id)}
                            disabled={isSpinning || parts.length === 0}
                          >
                            <Shuffle className="w-4 h-4 mr-2" />
                            {isSpinning ? 'Sorteando...' : 'Sortear'}
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-2xl text-red-400 border-red-400 hover:bg-red-900/20"
                            onClick={() => deleteRaffle(raffle.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {isSpinning && (
                        <div className="p-4 rounded-2xl text-center animate-pulse bg-yellow-100 text-yellow-900">
                          🍿 Girando roleta...
                        </div>
                      )}

                      {raffleWinners.length > 0 && (
                        <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-700">
                          <h4 className="text-emerald-200 font-semibold flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> Ganhadores
                          </h4>
                          <div className="mt-2 space-y-1">
                            {raffleWinners.map((w, i) => (
                              <p key={i} className="text-emerald-100">
                                #{i + 1} — {w.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <Users className="w-4 h-4" /> Participantes ({parts.length})
                        </h4>
                        {parts.length === 0 ? (
                          <p className="text-zinc-500 text-sm mt-2">Nenhum participante ainda.</p>
                        ) : (
                          <div className="mt-2 space-y-1 max-h-[300px] overflow-auto">
                            {parts.map((p, i) => (
                              <div
                                key={p.id || i}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-200 flex justify-between items-center text-sm"
                              >
                                <span>{p.name}</span>
                                {p.id && (
                                  <button
                                    onClick={() => removeParticipant(p.id)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Manual names for this raffle */}
                      <div className="border-t border-zinc-700 pt-4">
                        <button
                          className="text-sm text-emerald-400 hover:text-emerald-300 underline"
                          onClick={() => setSelectedRaffle(selectedRaffle === raffle.id ? null : raffle.id)}
                        >
                          {selectedRaffle === raffle.id ? 'Fechar' : 'Adicionar nomes manualmente'}
                        </button>
                        {selectedRaffle === raffle.id && (
                          <div className="mt-3 space-y-3">
                            <input
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              ref={fileRef}
                              onChange={importExcel}
                              className="block text-sm text-zinc-300"
                            />
                            <Textarea
                              rows={6}
                              placeholder="Cole nomes separados por linha ou vírgula"
                              value={manualNames}
                              onChange={(e) => setManualNames(e.target.value)}
                            />
                            <p className="text-xs text-zinc-500">
                              Nomes manuais serão incluídos neste sorteio
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'historico' && (
          <Card className="rounded-2xl shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white">📜 Histórico de Sorteios</h3>
              <div className="mt-3 space-y-3">
                {history.length === 0 ? (
                  <p className="text-zinc-500">Sem histórico.</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-zinc-100 text-zinc-900">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <strong className="text-lg">{item.prize}</strong>
                          <p className="text-sm text-zinc-600">
                            {item.date} às {item.time} — sorteado em {item.finishedAt}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-2xl"
                          onClick={() => downloadWinners(item)}
                        >
                          <Download className="w-3 h-3 mr-1" /> Exportar
                        </Button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Ganhadores:</p>
                        <p className="text-sm">{item.winnerNames?.join(', ')}</p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {item.participantCount} participante(s) — por {item.drawnBy}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
