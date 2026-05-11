import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Por favor, informe seu nome.');
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'Este email já está cadastrado.',
        'auth/invalid-email': 'Email inválido.',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
        'auth/invalid-credential': 'Email ou senha incorretos.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
      };
      setError(messages[err.code] || `Erro: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg,#151514,#066e3e,#151514)',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <Card className="rounded-2xl shadow-2xl w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">🎬 Sorteio Premium</h1>
            <p className="text-sm text-zinc-300 mt-2">
              {isRegister ? 'Crie sua conta para participar' : 'Faça login para continuar'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-900/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm text-zinc-300">Seu nome completo</label>
                <Input
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-sm text-zinc-300">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Senha</label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="rounded-2xl w-full"
              disabled={loading}
            >
              {isRegister ? (
                <><UserPlus className="w-4 h-4 mr-2" /> Cadastrar</>
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> Entrar</>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-emerald-400 hover:text-emerald-300 underline"
            >
              {isRegister
                ? 'Já tem conta? Faça login'
                : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
