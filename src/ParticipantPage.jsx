import { useEffect, useState } from 'react';
import {
  collection, doc, setDoc, onSnapshot, deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, CheckCircle, Calendar, Clock, Users, Trophy } from 'lucide-react';

export default function ParticipantPage() {
  const { user, logout } = useAuth();
  const [raffles, setRaffles] = useState([]);
  const [finishedRaffles, setFinishedRaffles] = useState([]);
  const [allParticipants, setAllParticipants] = useState({});
  const [myJoined, setMyJoined] = useState({});
  const [loading, setLoading] = useState(true);

  // Load active and finished raffles
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'raffles'), (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRaffles(all.filter((r) => r.status === 'active'));
      setFinishedRaffles(all.filter((r) => r.status === 'finished'));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Load all participants grouped by raffle
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'raffle_participants'), (snap) => {
      const byRaffle = {};
      const joined = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (!byRaffle[data.raffleId]) byRaffle[data.raffleId] = [];
        byRaffle[data.raffleId].push({ id: d.id, ...data });
        if (data.uid === user?.uid) {
          joined[data.raffleId] = d.id;
        }
      });
      setAllParticipants(byRaffle);
      setMyJoined(joined);
    });
    return unsub;
  }, [user]);

  async function joinRaffle(raffleId) {
    if (!user) return;
    const participantId = `${raffleId}_${user.uid}`;
    await setDoc(doc(db, 'raffle_participants', participantId), {
      raffleId,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      uid: user.uid,
      joinedAt: new Date().toISOString(),
    });
  }

  async function leaveRaffle(raffleId) {
    const participantId = `${raffleId}_${user.uid}`;
    await deleteDoc(doc(db, 'raffle_participants', participantId));
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#151514,#066e3e,#151514)' }}
      >
        <p className="text-white text-lg animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: 'linear-gradient(135deg,#151514,#066e3e,#151514)',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎬 Sorteio Premium</h1>
          <Button variant="outline" className="rounded-2xl" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        <p className="text-sm text-zinc-300">
          Logado como: <strong className="text-white">{user.email}</strong>
        </p>

        {/* Active Raffles */}
        <h2 className="text-xl font-semibold text-white">Sorteios Ativos</h2>

        {raffles.length === 0 ? (
          <Card className="rounded-2xl shadow-2xl">
            <CardContent className="p-6 text-center">
              <p className="text-zinc-400">Nenhum sorteio ativo no momento.</p>
              <p className="text-zinc-500 text-sm mt-1">Aguarde o RH criar um novo sorteio.</p>
            </CardContent>
          </Card>
        ) : (
          raffles.map((raffle) => {
            const participants = allParticipants[raffle.id] || [];
            const hasJoined = raffle.id in myJoined;

            return (
              <Card key={raffle.id} className="rounded-2xl shadow-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{raffle.prize}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {raffle.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {raffle.time}
                        </span>
                      </div>
                    </div>

                    {hasJoined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 flex items-center gap-1 text-sm">
                          <CheckCircle className="w-4 h-4" /> Participando
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-2xl text-red-400 border-red-400 hover:bg-red-900/20"
                          onClick={() => leaveRaffle(raffle.id)}
                        >
                          Sair
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="rounded-2xl"
                        onClick={() => joinRaffle(raffle.id)}
                      >
                        Participar
                      </Button>
                    )}
                  </div>

                  {/* Participants list */}
                  <div className="border-t border-zinc-700 pt-3">
                    <h4 className="text-white font-medium flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" /> Participantes ({participants.length})
                    </h4>
                    {participants.length === 0 ? (
                      <p className="text-zinc-500 text-sm mt-2">
                        Nenhum participante ainda. Seja o primeiro!
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {participants.map((p) => (
                          <span
                            key={p.id}
                            className={`px-3 py-1 rounded-full text-sm ${
                              p.uid === user.uid
                                ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Finished Raffles with Results */}
        {finishedRaffles.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Resultados
            </h2>
            {finishedRaffles.map((raffle) => {
              const isWinner = raffle.winners?.some((w) => w.uid === user.uid);
              return (
                <Card
                  key={raffle.id}
                  className={`rounded-2xl shadow-2xl ${
                    isWinner ? 'border-2 border-yellow-500/50' : ''
                  }`}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{raffle.prize}</h3>
                        <p className="text-sm text-zinc-400">
                          {raffle.date} às {raffle.time} — sorteado em {raffle.finishedAt}
                        </p>
                      </div>
                      {isWinner && (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-sm font-bold">
                          🏆 Você ganhou!
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-300 font-medium">Ganhadores:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {raffle.winnerNames?.map((name, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-200 text-sm"
                          >
                            #{i + 1} {name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {raffle.participantCount} participante(s)
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
