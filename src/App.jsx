import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Trophy, Shuffle } from 'lucide-react';

export default function App() {
  const fileRef = useRef(null);
  const [names, setNames] = useState('');
  const [qty, setQty] = useState(30);
  const [winners, setWinners] = useState([]);
  const [history, setHistory] = useState([]);
  const [spinning, setSpinning] = useState(false);

  const list = useMemo(
    () => names.split(/\n|,/).map((v) => v.trim()).filter(Boolean),
    [names],
  );

  function draw() {
    setSpinning(true);
    setTimeout(() => {
      const unique = [...new Set(list)];
      const pool = [...unique];
      const result = [];
      while (pool.length && result.length < qty) {
        const i = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(i, 1)[0]);
      }
      setWinners(result);
      setHistory((h) => [
        { date: new Date().toLocaleString('pt-BR'), winners: result },
        ...h,
      ]);
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
      setNames(data.join('\n'));
    };
    reader.readAsBinaryString(file);
  }

  function download() {
    const text =
      'GANHADORES\n\n' +
      winners.map((w, i) => `${i + 1}. ${w}`).join('\n');
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
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Left column — input */}
        <Card className="rounded-2xl shadow-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                🎬 Sorteio Premium
              </h1>
            </div>
            <p className="text-sm text-zinc-300">
              Sistema premium para sorteio de ingressos e campanhas internas
            </p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              ref={fileRef}
              onChange={importExcel}
              className="mb-3 block text-sm text-zinc-300"
            />

            <Textarea
              rows={12}
              placeholder="Cole nomes separados por linha ou vírgula"
              value={names}
              onChange={(e) => setNames(e.target.value)}
            />

            <div>
              <label className="text-sm text-zinc-300">
                Quantidade de ganhadores
              </label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-3">
              <Button className="rounded-2xl flex-1" onClick={draw}>
                <Shuffle className="w-4 h-4 mr-2" />
                Sortear
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={download}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>

            <p className="text-xs text-zinc-500">
              Participantes válidos: {new Set(list).size}
            </p>
          </CardContent>
        </Card>

        {/* Right column — winners */}
        <Card className="rounded-2xl shadow-2xl">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5" /> Ganhadores
            </h2>
            <div className="mt-4 space-y-2 max-h-[600px] overflow-auto">
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
                    <span>{w}</span>
                    <span>#{i + 1}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom — history */}
        <Card className="rounded-2xl shadow-2xl md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white">
              📜 Histórico de Sorteios
            </h3>
            <div className="mt-3 space-y-3">
              {history.length === 0 ? (
                <p className="text-zinc-500">Sem histórico.</p>
              ) : (
                history.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-100 text-zinc-900">
                    <strong>{item.date}</strong>
                    <div className="text-sm mt-1">
                      {item.winners.join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
