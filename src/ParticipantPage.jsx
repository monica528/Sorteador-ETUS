import { useEffect, useState } from 'react';
import { collection, doc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, CheckCircle, Clock, Trophy } from 'lucide-react';

export default function ParticipantPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDraw, setActiveDraw] = useState(null);
  const [myResults, setMyResults] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, 'participants', user.uid),
      (snap) => {
        if (snap.exists()) {
          setRegistered(true);
          setName(snap.data().name);
        }
        setLoading(false);
      },
    );
    return unsub;
  }, [user]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'draws'), where('status', '==', 'active')),
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          setActiveDraw({ id: d.id, ...d.data() });
        } else {
          setActiveDraw(null);
        }
      },
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, 'draws'), where('status', '==', 'finished')),
      (snap) => {
        const results = [];
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.winners && data.winners.some((w) => w.uid === user.uid)) {
            results.push({ id: d.id, ...data });
          }
        });
        setMyResults(results);
      },
    );
    return unsub;
  }, [user]);

  async function handleRegister(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await setDoc(doc(db, 'participants', user.uid), {
      name: name.trim(),
      email: user.email,
      uid: user.uid,
      registeredAt: new Date().toISOString(),
    });
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#151514,#066e3e,#151514)' }}>
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎬 Sorteio Premium</h1>
          <Button variant="outline" className="rounded-2xl" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        <Card className="rounded-2xl shadow-2xl">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-zinc-300">
              Logado como: <strong className="text-white">{user.email}</strong>
            </p>

            {registered ? (
              <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-700 text-emerald-200 flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Você está participando!</p>
                  <p className="text-sm">Nome: <strong>{name}</strong></p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-300">
                    Confirme seu nome para participar do sorteio
                  </label>
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="rounded-2xl w-full" disabled={saving}>
                  {saving ? 'Salvando...' : 'Participar do Sorteio'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {activeDraw && (
          <Card className="rounded-2xl shadow-2xl border-2 border-yellow-500/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-yellow-200">
                <Clock className="w-5 h-5 animate-pulse" />
                <div>
                  <p className="font-semibold">Sorteio em andamento!</p>
                  {activeDraw.prize && (
                    <p className="text-sm">Prêmio: <strong>{activeDraw.prize}</strong></p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {myResults.length > 0 && (
          <Card className="rounded-2xl shadow-2xl">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Você ganhou!
              </h2>
              {myResults.map((draw) => (
                <div key={draw.id} className="p-3 rounded-xl bg-yellow-100 text-yellow-900">
                  <strong>{draw.prize || 'Sorteio'}</strong>
                  <span className="text-sm ml-2">— {draw.finishedAt}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
