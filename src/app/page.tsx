export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.22),rgba(2,6,23,0.9)36%),radial-gradient(circle_at_70%_24%,rgba(56,189,248,0.22),rgba(2,6,23,0.94)42%),#020617]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">VM</div>
          ValueMiner
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="hidden text-sm font-semibold text-slate-200 transition hover:text-white sm:inline"
          >
            Sign In
          </a>
          <a
            href="/dashboard"
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:scale-[1.01]"
          >
            Get Started
          </a>
        </div>
      </header>
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-8 text-center sm:px-10 sm:pt-12">
        <h1 className="mb-6 text-6xl font-black leading-none tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
          <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-violet-500 bg-clip-text text-transparent text-glow">
            Value Miner
          </span>
        </h1>
        <h2 className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          Turn your doom scroll into <span className="text-sky-400">actionable insights.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          The first AI to seamless extract and organize the valuable information from your daily scrolling.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-sky-400 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-violet-500/30 transition hover:scale-[1.02]"
          >
            Get Started Free
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:border-sky-300"
          >
            Sign In
          </a>
        </div>
        <div className="mt-14 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all duration-300 hover:border-sky-400/50 hover:bg-white/10 hover:shadow-lg hover:shadow-sky-500/20 hover:scale-[1.02]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">AI summary</p>
            <p className="mt-3 text-sm text-slate-100">
              &ldquo;Key strategies to improve collaboration; prioritize regular feedback and aligned goals.&rdquo;
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all duration-300 hover:border-sky-400/50 hover:bg-white/10 hover:shadow-lg hover:shadow-sky-500/20 hover:scale-[1.02]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">Action plan</p>
            <p className="mt-3 text-sm text-slate-100">1) Set weekly check-ins; 2) Add a project tool; 3) Publish team norms.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all duration-300 hover:border-sky-400/50 hover:bg-white/10 hover:shadow-lg hover:shadow-sky-500/20 hover:scale-[1.02]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">Push Notification Reminders</p>
            <p className="mt-3 text-sm text-slate-100">
              Customize a reminder schedule to keep relevant new information at front of mind.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
