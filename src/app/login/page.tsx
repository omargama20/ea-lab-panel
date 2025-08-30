'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LOGIN] intent with', email, password);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('❌ Error: ' + error.message);
    } else {
      console.log('[LOGIN SUCCESS]', data);
      window.location.href = '/dashboard';
    }
  };

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="mt-4 grid gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="p-2 rounded bg-neutral-900"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="p-2 rounded bg-neutral-900"
        />
        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">
          Entrar
        </button>
      </form>
      <p className="mt-2 text-sm">
        ¿Sin cuenta? <a href="/signup" className="text-indigo-400">Regístrate</a>
      </p>
    </main>
  );
}
