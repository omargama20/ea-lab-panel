'use client';
import * as React from 'react';
import { createClient } from '@supabase/supabase-js';

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('[LOGIN] mounted. URL:', URL);
console.log('[LOGIN] ANON prefix:', ANON?.slice(0, 12));

const supabase = createClient(URL, ANON);

export default function LoginPage() {
  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('[LOGIN] submit clicked');

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');

    console.log('[LOGIN] emailLen/pwLen:', email.length, password.length);

    // PING para ver request en Network sí o sí
    try {
      const r = await fetch(`${URL}/auth/v1/settings`, { headers: { apikey: ANON } });
      console.log('[PING] status:', r.status);
    } catch (err) {
      console.error('[PING] failed:', err);
      alert('Ping falló: ' + (err as Error).message);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Supabase login error:', error);
        alert(error.message);
        return;
      }
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login fatal error:', err);
      alert('Failed to fetch');
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form onSubmit={signIn} className="mt-4 grid gap-3" autoComplete="on">
        <input name="email" type="email" placeholder="Email" className="p-2 rounded bg-neutral-900" required />
        <input name="password" type="password" placeholder="Password" className="p-2 rounded bg-neutral-900" required />
        <button type="submit" className="mt-2 px-4 py-2 rounded bg-indigo-600">Entrar</button>
      </form>
    </main>
  );
}
