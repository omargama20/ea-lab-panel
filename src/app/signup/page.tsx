// src/app/signup/page.tsx
'use client';
import * as React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');

    if (!email || !password) return alert('Completa email y password');

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Supabase signup error:', error);
      alert(error.message);
      return;
    }
    alert('Cuenta creada. Revisa tu email si exige confirmación.');
    window.location.href = '/login';
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <form onSubmit={signUp} className="mt-4 grid gap-3">
        <input name="email" type="email" placeholder="Email" className="p-2 rounded bg-neutral-900" required />
        <input name="password" type="password" placeholder="Password" className="p-2 rounded bg-neutral-900" required />
        <button className="mt-2 px-4 py-2 rounded bg-emerald-600">Registrarme</button>
      </form>
    </main>
  );
}
