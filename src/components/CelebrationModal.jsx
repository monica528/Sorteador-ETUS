import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';

export default function CelebrationModal({ winner, pickupInfo, onClose }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#3BE476', '#8DF768', '#F0EE7A', '#F5B3D8', '#A0E3F3'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#3BE476', '#8DF768', '#F0EE7A', '#F5B3D8', '#A0E3F3'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#3BE476', '#8DF768', '#066E3E', '#F0EE7A', '#F5B3D8'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-slide-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-etus-mint-light via-white to-accent-yellow/20 opacity-50" />
        <div className="relative z-10 space-y-6">
          <div className="text-6xl animate-float">🎉</div>
          <h2 className="text-3xl font-bold text-etus-dark">
            PARABENS!
          </h2>
          <p className="text-xl font-semibold text-n-800">
            Voce ganhou, {winner}!
          </p>
          {pickupInfo && (
            <div className="bg-accent-yellow/20 rounded-xl p-4 text-left space-y-2">
              <p className="font-semibold text-n-800 text-sm">Informacoes de retirada:</p>
              {pickupInfo.date && (
                <p className="text-sm text-n-600">
                  Data limite: <strong>{pickupInfo.date}</strong>
                </p>
              )}
              {pickupInfo.time && (
                <p className="text-sm text-n-600">
                  Horario limite: <strong>{pickupInfo.time}</strong>
                </p>
              )}
              <p className="text-sm text-n-600">
                Procure o RH para retirar seu premio!
              </p>
            </div>
          )}
          <Button variant="success" size="lg" className="w-full" onClick={onClose}>
            Entendi!
          </Button>
        </div>
      </div>
    </div>
  );
}
