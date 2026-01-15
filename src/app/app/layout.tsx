export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="font-medium">App</span>
          <span className="text-sm opacity-70">Navbar placeholder</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
