import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  collection, doc, deleteDoc, getDocs, addDoc, onSnapshot, query, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Trophy, Shuffle, LogOut, Users, Trash2 } from 'lucide-react';

export default function RHPage() {
  const { user, logout } = useAuth();
  const fileRef = useRef(null);
  const [manualNames, setManualNames] = useState('');
  const [qty, setQty] = useState(1);
  const [prize, setPrize] = useState('');
  const [winners, setWinners] = useState([]);
  const [history, setHistory] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [tab, setTab] = useState('participantes');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'participants'), (snap) => {
      setParticipants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'draws'), orderBy('finishedAt', 'desc')),
      (snap) => {
        setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return unsub;
  }, []);

  const allNames = useMemo(() => {
    const fromFirestore = participants.map((p) => ({ name: p.name, uid: p.uid }));
    const fromManual = manualNames
      .split(/\n|,/)
      .map((v) => v.trim())
      .filter(Boolean)
      .map((name) => ({ name, uid: null }));
    return [...fromFirestore, ...fromManual];
  }, [participants, manualNames]);

  function draw() {
    if (allNames.length === 0) return;
    setSpinning(true);
    setTimeout(async () => {
      const pool = [...allNames];
      const result = [];
      while (pool.length && result.length < qty) {
        const i = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(i, 1)[0]);
      }
      setWinners(result);

      await addDoc(collection(db, 'draws'), {
        prize: prize || 'Sorteio',
        winners: result,
        winnerNames: result.map((w) => w.name),
        participantCount: allNames.length,
        finishedAt: new Date().toLocaleString('pt-BR'),
        status: 'finished',
        drawnBy: user.email,
      });

      setSpinning(false);
    }, 2200);
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

  function download() {
    const header = prize
      ? `SORTEIO: ${prize}\n\nGANHADORES\n\n`
      : 'GANHADORES\n\n';
    const text =
      header + winners.map((w, i) => `${i + 1}. ${w.name}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ganhadores.txt';
    a.click();
  }

  async function removeParticipant(id) {
    await deleteDoc(doc(db, 'participants', id));
  }

  async function clearAllParticipants() {
    const snap = await getDocs(collection(db, 'participants'));
    const deletes = snap.docs.map((d) => deleteDoc(doc(db, 'participants', d.id)));
    await Promise.all(deletes);
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
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">🎬 Sorteio Premium</h1>
            <p className="text-sm text-zinc-300">
              Painel RH — {user.email}
            </p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={tab === 'participantes' ? 'default' : 'outline'}
            className="rounded-2xl"
            onClick={() => setTab('participantes')}
          >
            <Users className="w-4 h-4 mr-2" /> Participantes ({allNames.length})
          </Button>
          <Button
            variant={tab === 'sorteio' ? 'default' : 'outline'}
            className="rounded-2xl"
            onClick={() => setTab('sorteio')}
          >
            <Shuffle className="w-4 h-4 mr-2" /> Sortear
          </Button>
          <Button
            variant={tab === 'historico' ? 'default' : 'outline'}
            className="rounded-2xl"
            onClick={() => setTab('historico')}
          >
            <Trophy className="w-4 h-4 mr-2" /> Histórico
          </Button>
        </div>

        {/* Participants Tab */}
        {tab === 'participantes' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" /> Cadastrados ({participants.length})
                </h2>
                <p className="text-xs text-zinc-400">
                  Participantes que se cadastraram pelo app
                </p>
                {participants.length === 0 ? (
                  <p className="text-zinc-500">Nenhum participante cadastrado ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-auto">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-zinc-100 text-zinc-900 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-zinc-500 ml-2">{p.email}</span>
                        </div>
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {participants.length > 0 && (
                  <Button
                    variant="outline"
                    className="rounded-2xl text-red-400 border-red-400 hover:bg-red-900/20"
                    onClick={clearAllParticipants}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Limpar todos
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  Adicionar nomes manualmente
                </h2>
                <p className="text-xs text-zinc-400">
                  Nomes adicionados aqui serão incluídos no sorteio junto com os cadastrados
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  ref={fileRef}
                  onChange={importExcel}
                  className="mb-3 block text-sm text-zinc-300"
                />
                <Textarea
                  rows={10}
                  placeholder="Cole nomes separados por linha ou vírgula"
                  value={manualNames}
                  onChange={(e) => setManualNames(e.target.value)}
                />
                <p className="text-xs text-zinc-500">
                  Total para sorteio: {allNames.length} participante(s)
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Draw Tab */}
        {tab === 'sorteio' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">Configurar Sorteio</h2>

                <div>
                  <label className="text-sm text-zinc-300">O que será sorteado?</label>
                  <Input
                    type="text"
                    placeholder="Ex: Ingressos Cinema, Kit Natal, Vale-presente..."
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">Quantidade de ganhadores</label>
                  <Input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </div>

                <p className="text-sm text-zinc-400">
                  Participantes disponíveis: <strong className="text-white">{allNames.length}</strong>
                </p>

                <div className="flex gap-3">
                  <Button
                    className="rounded-2xl flex-1"
                    onClick={draw}
                    disabled={spinning || allNames.length === 0}
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    {spinning ? 'Sorteando...' : 'Sortear'}
                  </Button>
                  {winners.length > 0 && (
                    <Button variant="outline" className="rounded-2xl" onClick={download}>
                      <Download className="w-4 h-4 mr-2" /> Exportar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5" /> Ganhadores
                </h2>
                {prize && (
                  <p className="text-sm text-zinc-300 mt-1">Prêmio: {prize}</p>
                )}
                <div className="mt-4 space-y-2 max-h-[400px] overflow-auto">
                  {spinning && (
                    <div className="p-4 rounded-2xl text-center animate-pulse bg-yellow-100 text-yellow-900">
                      🍿 Girando roleta...
                    </div>
                  )}
                  {!spinning && winners.length === 0 ? (
                    <p className="text-zinc-500">Nenhum sorteio realizado.</p>
                  ) : (
                    !spinning &&
                    winners.map((w, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-zinc-100 flex justify-between text-zinc-900"
                      >
                        <span>{w.name}</span>
                        <span>#{i + 1}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
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
                    <div key={item.id} className="p-3 rounded-xl bg-zinc-100 text-zinc-900">
                      <div className="flex justify-between items-center">
                        <strong>{item.finishedAt}</strong>
                        {item.prize && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {item.prize}
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1">
                        {item.winnerNames?.join(', ')}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {item.participantCount} participante(s) — por {item.drawnBy}
                      </div>
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
