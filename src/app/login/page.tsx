// src/app/login/page.tsx
'use client';

import * as React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');

    if (!email || !password) {
      alert('Escribe correo y contraseña');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Supabase login error:', error);
        alert(error.message || 'Credenciales inválidas');
        return;
      }

      // éxito
      window.location.href = '/dashboard';
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Login fatal error:', msg);
      alert(`No se pudo conectar: ${msg}`);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form onSubmit={signIn} className="mt-4 grid gap-3" autoComplete="on">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="p-2 rounded bg-neutral-900"
          autoComplete="email"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="p-2 rounded bg-neutral-900"
          autoComplete="current-password"
          required
        />
        <button className="mt-2 px-4 py-2 rounded bg-indigo-600">Entrar</button>
      </form>

      <p className="mt-3 text-sm opacity-80">
        ¿Sin cuenta? <a className="underline" href="/signup">Regístrate</a>
      </p>
    </main>
  );
}
