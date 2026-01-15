'use client';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm opacity-80">
        {error.message || 'Unknown error'}
      </p>
      {error.digest ? <p className="text-xs opacity-60">Digest: {error.digest}</p> : null}
    </main>
  );
}
