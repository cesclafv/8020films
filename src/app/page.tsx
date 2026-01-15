import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="flex-1 flex items-center justify-center w-full">
        <Image
          src="/img/8020films-logo-white.png"
          alt="8020 Films"
          width={600}
          height={200}
          className="max-w-full h-auto"
          priority
        />
      </div>
      <a
        href="mailto:christo@8020films.com"
        className="mb-[35px] text-slate-400 hover:text-slate-300 transition-colors text-sm tracking-wide"
      >
        contact
      </a>
    </main>
  );
}
