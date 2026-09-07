import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =========================
          BACKGROUND
      ========================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-sky-500/20 blur-3xl" />

        <div className="absolute right-[-180px] top-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-3xl" />

        <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        {/* =========================
            NAVBAR
        ========================= */}
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl shadow-lg shadow-sky-500/20">
              🤖
            </div>

            <div>
              <p className="font-semibold tracking-tight">
                Smart AI
              </p>

              <p className="hidden text-xs text-slate-400 sm:block">
                Intelligence & prédictions
              </p>
            </div>
          </Link>

          {/* NAVIGATION */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
            >
              Se connecter
            </Link>

            <Link
              href="/"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/40"
            >
              <span>🌤️</span>

              <span className="hidden sm:inline">
                Weather AI
              </span>

              <span className="transition-transform group-hover:translate-x-1">
              
              </span>
            </Link>
          </div>
        </nav>

        {/* =========================
            HERO
        ========================= */}
        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          {/* BADGE */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            Système sécurisé
          </div>

          {/* ICON */}
          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 text-4xl shadow-2xl shadow-blue-500/30">
            🔐
          </div>

          {/* TITLE */}
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Votre visage est{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              votre clé.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Créez votre profil avec une photo de votre visage, puis vérifiez
            votre identité simplement grâce à la reconnaissance faciale.
            Aucun mot de passe complexe à retenir.
          </p>

          {/* =========================
              AUTH CARDS
          ========================= */}
          <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
            {/* REGISTER */}
            <Link
              href="/register"
              className="group relative overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 to-blue-600/10 p-6 text-left shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-sky-500/10"
            >
              <div className="absolute right-[-30px] top-[-30px] h-32 w-32 rounded-full bg-sky-500/10 blur-2xl transition group-hover:bg-sky-500/20" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-2xl shadow-lg shadow-sky-500/20">
                  ✨
                </div>

                <h2 className="text-xl font-bold">
                  Créer un profil
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Première visite ? Enregistrez votre nom et votre visage
                  pour créer votre identité.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-sky-300">
                  Commencer

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>

            {/* LOGIN */}
            <Link
              href="/login"
              className="group relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-purple-600/10 p-6 text-left shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-violet-500/10"
            >
              <div className="absolute right-[-30px] top-[-30px] h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 text-2xl shadow-lg shadow-violet-500/20">
                  🔓
                </div>

                <h2 className="text-xl font-bold">
                  Vérifier mon identité
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Déjà inscrit ? Vérifiez votre identité avec une simple
                  photo de votre visage.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-300">
                  Se connecter

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* =========================
              WEATHER ACCESS
          ========================= */}
          <Link
            href="/"
            className="group mt-5 flex w-full max-w-2xl items-center justify-between rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 p-5 text-left shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl shadow-lg shadow-cyan-500/20">
                🌤️
              </div>

              <div>
                <h2 className="font-bold">
                  Weather AI
                </h2>

                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Prédiction de température et de pluie avec le Machine
                  Learning
                </p>
              </div>
            </div>

            <span className="ml-3 text-xl text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-cyan-300">
              
            </span>
          </Link>

          {/* =========================
              FEATURES
          ========================= */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
              🔐 Reconnaissance faciale
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
              🤖 Intelligence artificielle
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
              🌤️ Prédictions météo
            </span>
          </div>
        </section>

        {/* =========================
            FOOTER
        ========================= */}
        <footer className="pb-4 text-center">
          <p className="text-xs text-slate-600">
            Smart AI • Reconnaissance faciale & Machine Learning
          </p>
        </footer>
      </div>
    </main>
  );
}
