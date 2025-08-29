// app/dashboard/page.tsx
import { supabaseServer } from '../lib/supabaseServer'

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('usage_credits')
    .select('credits')
    .eq('user_id', user?.id)
    .maybeSingle();

  const credits = data?.credits ?? 0;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-4 p-4 rounded-lg border border-neutral-800">
        <p className="text-lg">Créditos disponibles: <b>{credits}</b></p>
        <a href="/pricing" className="inline-block mt-4 px-4 py-2 rounded bg-indigo-600">Comprar créditos</a>
        <a href="/copilot" className="inline-block mt-4 ml-3 px-4 py-2 rounded bg-emerald-600">Abrir Copilot SMC</a>
      </div>
    </main>
  );
}
