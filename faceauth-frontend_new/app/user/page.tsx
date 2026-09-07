"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearUser, getUser, StoredUser } from "@/lib/auth";

export default function UserPage() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = getUser();

    if (!stored) {
      router.replace("/login");
      return;
    }

    setUser(stored);
    setChecked(true);
  }, [router]);

  function handleLogout() {
    clearUser();
    router.push("/login");
  }

  if (!checked || !user) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =========================
          BACKGROUND
      ========================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-sky-500/20 blur-3xl" />

        <div className="absolute right-[-150px] top-1/4 h-[450px] w-[450px] rounded-full bg-violet-500/20 blur-3xl" />

        <div className="absolute bottom-[-200px] left-1/3 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-5xl px-5 py-6 sm:px-8 lg:px-10">
        {/* =========================
            NAVBAR
        ========================= */}
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
          {/* Logo */}
          <Link
            href="/user"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl shadow-lg shadow-sky-500/20">
              👤
            </div>

            <div>
              <p className="font-semibold tracking-tight">Mon espace</p>

              <p className="hidden text-xs text-slate-400 sm:block">
                Weather AI
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/weather"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/40"
            >
              <span>🌤️</span>

              <span className="hidden sm:inline">
                Weather AI
              </span>

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </nav>

        {/* =========================
            HEADER
        ========================= */}
        <section className="mt-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            Identité vérifiée
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Bienvenue,{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              {user.name}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Retrouvez vos informations de profil et accédez rapidement aux
            fonctionnalités de Weather AI.
          </p>
        </section>

        {/* =========================
            PROFILE CARD
        ========================= */}
        <section className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
          <div className="grid md:grid-cols-[260px_1fr]">
            {/* PHOTO */}
            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-violet-500/10 p-6">
              {user.photoDataUrl ? (
                <div className="relative aspect-[3/4] w-full max-w-[210px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.photoDataUrl}
                    alt={`Photo de ${user.name}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-xs font-medium text-white/80">
                      Profil vérifié
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-square w-40 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-6xl shadow-2xl shadow-sky-500/20">
                  👤
                </div>
              )}
            </div>

            {/* INFORMATIONS */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-sky-300">
                    Profil utilisateur
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {user.name}
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-lg">
                  ✓
                </div>
              </div>

              {/* Informations */}
              <div className="mt-8 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">
                    Nom
                  </p>

                  <p className="mt-1 font-medium text-slate-200">
                    {user.name}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">
                    Identifiant de profil
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-slate-300">
                    {user.user_id}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.05] p-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Statut
                    </p>

                    <p className="mt-1 text-sm font-medium text-emerald-300">
                      Compte connecté
                    </p>
                  </div>

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/weather"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3.5 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/40"
                >
                  🌤️
                  <span>Voir la météo</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-slate-300 transition-all hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
                >
                  🚪
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            QUICK ACCESS
        ========================= */}
        <section className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Link
            href="/weather"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-1 hover:border-sky-400/20 hover:bg-white/[0.07]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400/10 text-2xl">
                🌡️
              </div>

              <div>
                <h3 className="font-semibold">
                  Prédiction météo
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Température et pluie
                </p>
              </div>

              <span className="ml-auto text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-sky-300">
                →
              </span>
            </div>
          </Link>

          {/* <Link
            href="/"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.07]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/10 text-2xl">
                🏠
              </div>

              <div>
                <h3 className="font-semibold">
                  Accueil
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Retour à la page principale
                </p>
              </div>

              <span className="ml-auto text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-violet-300">
                →
              </span>
            </div>
          </Link> */}
        </section>

        {/* =========================
            FOOTER
        ========================= */}
        <footer className="mt-12 pb-6 text-center">
          <p className="text-xs text-slate-600">
            Weather AI • Espace utilisateur
          </p>
        </footer>
      </div>
    </main>
  );
}

