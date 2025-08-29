// app/login/page.tsx
'use client';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LoginPage() {
  async function signIn(e: any) {
    e.preventDefault();
    const email = e.target.email.value, password = e.target.password.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else window.location.href = '/dashboard';
  }
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form onSubmit={signIn} className="mt-4 grid gap-3">
        <input name="email" placeholder="Email" className="p-2 rounded bg-neutral-900" />
        <input name="password" type="password" placeholder="Password" className="p-2 rounded bg-neutral-900" />
        <button className="mt-2 px-4 py-2 rounded bg-indigo-600">Entrar</button>
      </form>
    </main>
  );
}

