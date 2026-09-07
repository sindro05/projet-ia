"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PhotoCapture from "@/components/PhotoCapture";
import StatusMessage from "@/components/StatusMessage";
import { loginUser, ApiError } from "@/lib/api";
import { saveUser, fileToDataUrl } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const canSubmit =
    name.trim().length > 0 && photo !== null && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!photo) {
      setStatus({
        kind: "error",
        message: "Ajoutez une photo avant de continuer.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await loginUser(name.trim(), photo);

      setStatus({
        kind: "success",
        message: result.message,
      });

      const photoDataUrl = await fileToDataUrl(photo);

      saveUser({
        user_id: result.user_id,
        name: result.name,
        photoDataUrl,
      });

      setIsSubmitting(false);

      setTimeout(() => {
        router.push("/weather");
      }, 900);

      return;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Une erreur est survenue.";

      setStatus({
        kind: "error",
        message,
      });
    }

    setIsSubmitting(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg shadow-lg shadow-cyan-500/20">
              🔐
            </div>

            <div>
              <p className="font-bold tracking-tight">
                Smart AI
              </p>
              <p className="text-xs text-slate-400">
                Face Authentication
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Accueil
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
            >
              🌤️ Weather AI
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="relative z-10 flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-4xl shadow-2xl shadow-cyan-500/10">
              👤
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              Vérification sécurisée
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Vérifiez votre identité
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Entrez votre nom et utilisez votre visage pour accéder
              à votre espace personnel.
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

            {/* Security indicator */}
            <div className="mb-7 flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                🛡️
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Connexion par reconnaissance faciale
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Votre identité sera vérifiée avant l'accès.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Votre nom
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    👤
                  </span>

                  <input
                    id="name"
                    type="text"
                    required
                    minLength={1}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Entrez votre nom"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-900 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Vérification du visage
                </label>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <PhotoCapture
                    label="Photo du visage"
                    helpText="Un seul visage, de face, avec un bon éclairage."
                    onChange={setPhoto}
                  />
                </div>
              </div>

              {/* Status */}
              {status && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <StatusMessage
                    kind={status.kind}
                    message={status.message}
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-4 font-semibold text-slate-950 shadow-xl shadow-cyan-500/10 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      🔐 Vérifier mon identité
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Register */}
            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-slate-400">
                Vous n'avez pas encore de profil ?
              </p>

              <Link
                href="/register"
                className="mt-2 inline-flex items-center gap-2 font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                Créer mon profil
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Bottom links */}
          <div className="mt-6 flex justify-center gap-6 text-xs text-slate-500">
            <Link
              href="/"
              className="transition hover:text-slate-300"
            >
              ← Accueil
            </Link>

            <Link
              href="/weather"
              className="transition hover:text-slate-300"
            >
              🌤️ Weather AI
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-5 text-center">
        <p className="text-xs text-slate-600">
          Smart AI · Authentification intelligente · Weather AI
        </p>
      </footer>
    </main>
  );
}