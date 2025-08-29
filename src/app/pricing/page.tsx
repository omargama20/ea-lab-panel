// app/pricing/page.tsx
'use client';
import { useState } from 'react';

async function startCheckout(price_lookup_key: string) {
  const r = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ price_lookup_key, successPath: '/dashboard', cancelPath: '/pricing' }),
  });
  const data = await r.json();
  if (data.url) window.location.href = data.url;
  else alert(data.error || 'No se pudo iniciar checkout');
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Recargar Créditos</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="p-5 rounded-lg border border-neutral-800">
          <h2 className="text-xl font-medium">Paquete 100</h2>
          <p className="text-sm opacity-75 mt-1">100 créditos</p>
          <button
            className="mt-4 px-4 py-2 rounded bg-indigo-600"
            disabled={loading=== '100'}
            onClick={async ()=>{ setLoading('100'); await startCheckout('credits_100'); setLoading(null); }}
          >Comprar</button>
        </div>
        <div className="p-5 rounded-lg border border-neutral-800">
          <h2 className="text-xl font-medium">Paquete 500</h2>
          <p className="text-sm opacity-75 mt-1">500 créditos</p>
          <button
            className="mt-4 px-4 py-2 rounded bg-indigo-600"
            disabled={loading=== '500'}
            onClick={async ()=>{ setLoading('500'); await startCheckout('credits_500'); setLoading(null); }}
          >Comprar</button>
        </div>
      </div>
    </main>
  );
}
