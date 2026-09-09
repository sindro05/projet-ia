"use client";

import { useState } from "react";
import Link from "next/link";
import StatusMessage from "@/components/StatusMessage";
import {
  predictTemperature,
  predictRain,
  WeatherApiError,
} from "@/lib/weatherApi";

type TemperatureResult = {
  predicted_temperature: number;
};

type RainResult = {
  rain_tomorrow: boolean;
  probability: number;
};

type FetchedWeather = {
  location: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  cloud_cover: number;
  rain_today: boolean;
};

const MADAGASCAR_REGIONS = [
  { name: "Analamanga (Antananarivo)", lat: -18.8792, lon: 47.5079 },
  { name: "Vakinankaratra (Antsirabe)", lat: -19.8659, lon: 47.0333 },
  { name: "Itasy (Miarinarivo)", lat: -19.1167, lon: 46.75 },
  { name: "Bongolava (Tsiroanomandidy)", lat: -18.7667, lon: 46.0333 },
  { name: "Haute Matsiatra (Fianarantsoa)", lat: -21.4536, lon: 47.0854 },
  { name: "Amoron'i Mania (Ambositra)", lat: -20.5333, lon: 47.25 },
  { name: "Vatovavy (Mananjary)", lat: -21.2333, lon: 48.3333 },
  { name: "Fitovinany (Manakara)", lat: -22.1333, lon: 48.0167 },
  { name: "Atsimo-Atsinanana (Farafangana)", lat: -22.8167, lon: 47.8333 },
  { name: "Atsinanana (Toamasina)", lat: -18.1492, lon: 49.4023 },
  { name: "Analanjirofo (Fenoarivo Atsinanana)", lat: -17.3833, lon: 49.4167 },
  { name: "Alaotra-Mangoro (Ambatondrazaka)", lat: -17.8333, lon: 48.4167 },
  { name: "Boeny (Mahajanga)", lat: -15.7167, lon: 46.3167 },
  { name: "Betsiboka (Maevatanana)", lat: -16.95, lon: 46.8333 },
  { name: "Melaky (Maintirano)", lat: -18.0667, lon: 44.0333 },
  { name: "Sofia (Antsohihy)", lat: -14.8833, lon: 47.9833 },
  { name: "Diana (Antsiranana)", lat: -12.2787, lon: 49.2917 },
  { name: "Sava (Sambava)", lat: -14.2667, lon: 50.1667 },
  { name: "Menabe (Morondava)", lat: -20.2833, lon: 44.3167 },
  { name: "Atsimo-Andrefana (Toliara)", lat: -23.35, lon: 43.6667 },
  { name: "Androy (Ambovombe)", lat: -25.1667, lon: 46.0833 },
  { name: "Anosy (Taolagnaro / Fort-Dauphin)", lat: -25.0333, lon: 46.9833 },
  { name: "Ihorombe (Ihosy)", lat: -22.4, lon: 46.1167 },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff =
    now.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  locationLabel: string
): Promise<FetchedWeather> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    "&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover,rain" +
    "&timezone=auto";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer les données météo depuis Open-Meteo."
    );
  }

  const data = await response.json();

  if (!data.current) {
    throw new Error("Les données météo reçues sont invalides.");
  }

  return {
    location: locationLabel,
    temperature: Number(data.current.temperature_2m),
    humidity: Number(data.current.relative_humidity_2m),
    pressure: Number(data.current.surface_pressure),
    wind_speed: Number(data.current.wind_speed_10m),
    cloud_cover: Number(data.current.cloud_cover),
    rain_today: Number(data.current.rain || 0) > 0,
  };
}

/*
 * -------------------------------------------------------
 * PETIT CHEVRON ANIMÉ POUR LES SECTIONS REPLIABLES
 * -------------------------------------------------------
 */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-300 ${
        open ? "rotate-180" : "rotate-0"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function WeatherPage() {
  const [mode, setMode] = useState<"gps" | "region" | null>(null);
  const [loadingSource, setLoadingSource] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [fetchedWeather, setFetchedWeather] =
    useState<FetchedWeather | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const [tempDayOfYear, setTempDayOfYear] = useState(getDayOfYear());
  const [tempHumidity, setTempHumidity] = useState(100);
  const [tempPressure, setTempPressure] = useState(900);
  const [tempWindSpeed, setTempWindSpeed] = useState(0);
  const [tempCloudCover, setTempCloudCover] = useState(100);
  const [showTempInputs, setShowTempInputs] = useState(false);

  const [loadingTemperature, setLoadingTemperature] = useState(false);
  const [temperatureResult, setTemperatureResult] =
    useState<TemperatureResult | null>(null);
  const [temperatureError, setTemperatureError] = useState<string | null>(
    null
  );

  const [rainHumidity, setRainHumidity] = useState(100);
  const [rainPressure, setRainPressure] = useState(900);
  const [rainWindSpeed, setRainWindSpeed] = useState(0);
  const [rainCloudCover, setRainCloudCover] = useState(100);
  const [rainToday, setRainToday] = useState(true);
  const [showRainInputs, setShowRainInputs] = useState(false);

  const [loadingRain, setLoadingRain] = useState(false);
  const [rainResult, setRainResult] = useState<RainResult | null>(null);
  const [rainError, setRainError] = useState<string | null>(null);

  const applyFetchedWeather = (weather: FetchedWeather) => {
    setFetchedWeather(weather);

    setTempDayOfYear(getDayOfYear());
    setTempHumidity(weather.humidity);
    setTempPressure(weather.pressure);
    setTempWindSpeed(weather.wind_speed);
    setTempCloudCover(weather.cloud_cover);

    setRainHumidity(weather.humidity);
    setRainPressure(weather.pressure);
    setRainWindSpeed(weather.wind_speed);
    setRainCloudCover(weather.cloud_cover);
    setRainToday(weather.rain_today);

    setTemperatureResult(null);
    setRainResult(null);
    setTemperatureError(null);
    setRainError(null);
  };

  const handleUseGps = () => {
    setMode("gps");
    setSourceError(null);
    setFetchedWeather(null);

    if (!navigator.geolocation) {
      setSourceError(
        "La géolocalisation n'est pas supportée par votre navigateur."
      );
      return;
    }

    setLoadingSource(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weather = await fetchCurrentWeather(
            latitude,
            longitude,
            "Ma position (GPS)"
          );
          applyFetchedWeather(weather);
        } catch (err) {
          setSourceError(
            err instanceof Error
              ? err.message
              : "Impossible de récupérer les données météo."
          );
        } finally {
          setLoadingSource(false);
        }
      },
      (geoError) => {
        let message = "Impossible d'obtenir votre position.";

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message = "Vous avez refusé l'accès à votre position.";
            break;
          case geoError.POSITION_UNAVAILABLE:
            message = "Votre position est actuellement indisponible.";
            break;
          case geoError.TIMEOUT:
            message = "La récupération de votre position a expiré.";
            break;
        }

        setSourceError(message);
        setLoadingSource(false);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 300000 }
    );
  };

  const handleSelectRegion = async (regionName: string) => {
    setSelectedRegion(regionName);
    setMode("region");
    setSourceError(null);

    if (!regionName) {
      setFetchedWeather(null);
      return;
    }

    const region = MADAGASCAR_REGIONS.find((r) => r.name === regionName);

    if (!region) {
      return;
    }

    setLoadingSource(true);

    try {
      const weather = await fetchCurrentWeather(
        region.lat,
        region.lon,
        region.name
      );
      applyFetchedWeather(weather);
    } catch (err) {
      setSourceError(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les données météo."
      );
    } finally {
      setLoadingSource(false);
    }
  };

  const handleTemperaturePrediction = async () => {
    setTemperatureError(null);
    setTemperatureResult(null);
    setLoadingTemperature(true);

    try {
      const result = await predictTemperature({
        day_of_year: tempDayOfYear,
        humidity: tempHumidity,
        pressure: tempPressure,
        wind_speed: tempWindSpeed,
        cloud_cover: tempCloudCover,
      });

      setTemperatureResult(result as TemperatureResult);
    } catch (err) {
      console.error("Erreur prédiction température:", err);

      if (err instanceof WeatherApiError) {
        setTemperatureError(err.message);
      } else {
        setTemperatureError(
          "Impossible d'effectuer la prédiction de température."
        );
      }
    } finally {
      setLoadingTemperature(false);
    }
  };

  const handleRainPrediction = async () => {
    setRainError(null);
    setRainResult(null);
    setLoadingRain(true);

    try {
      const result = await predictRain({
        humidity: rainHumidity,
        pressure: rainPressure,
        wind_speed: rainWindSpeed,
        cloud_cover: rainCloudCover,
        rain_today: rainToday,
      });

      setRainResult(result as RainResult);
    } catch (err) {
      console.error("Erreur prédiction pluie:", err);

      if (err instanceof WeatherApiError) {
        setRainError(err.message);
      } else {
        setRainError("Impossible d'effectuer la prédiction de pluie.");
      }
    } finally {
      setLoadingRain(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg shadow-lg shadow-cyan-500/20">
              🌦️
            </div>
            <div>
              <p className="font-bold tracking-tight">Weather AI</p>
              <p className="text-xs text-slate-400">
                Prévisions intelligentes
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/user"
              className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
            >
              👤 Mon espace
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-4xl shadow-2xl shadow-cyan-500/10">
            🤖
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            Intelligence artificielle + météo
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Prévision météo
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              intelligente
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
            Récupérez automatiquement les conditions météo actuelles par
            votre position GPS ou en choisissant une région de Madagascar.
          </p>
        </div>

        {/* -------------------------------------------------
            SOURCE DE DONNÉES : GPS OU RÉGION
        -------------------------------------------------- */}
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-semibold">
            Source des données météo
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={loadingSource}
              className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                mode === "gps"
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {loadingSource && mode === "gps" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Récupération...
                </>
              ) : (
                <>📍 Utiliser ma position</>
              )}
            </button>

            <div>
              <select
                value={selectedRegion}
                onChange={(e) => handleSelectRegion(e.target.value)}
                disabled={loadingSource}
                className={`w-full rounded-xl border px-4 py-3 font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  mode === "region"
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                <option value="" className="bg-slate-900">
                  🗺️ Choisir une région de Madagascar
                </option>
                {MADAGASCAR_REGIONS.map((region) => (
                  <option
                    key={region.name}
                    value={region.name}
                    className="bg-slate-900"
                  >
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sourceError && (
            <div className="mt-4">
              <StatusMessage kind="error" message={sourceError} />
            </div>
          )}

          {fetchedWeather && !sourceError && (
            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
              <p className="text-sm text-cyan-300">
                📍 {fetchedWeather.location}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-slate-400">Humidité</p>
                  <p className="font-semibold">
                    {fetchedWeather.humidity.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Pression</p>
                  <p className="font-semibold">
                    {fetchedWeather.pressure.toFixed(0)} hPa
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Vent</p>
                  <p className="font-semibold">
                    {fetchedWeather.wind_speed.toFixed(1)} km/h
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Nuages</p>
                  <p className="font-semibold">
                    {fetchedWeather.cloud_cover.toFixed(0)}%
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Les champs de saisie ont été remplis automatiquement. Déroulez
                "Ajuster manuellement" dans chaque carte si vous voulez les
                modifier.
              </p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl gap-8 md:grid-cols-2">
          {/* =================================================
              TEMPÉRATURE
          ================================================= */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">
            <div className="text-4xl">🌡️</div>
            <h2 className="mt-4 text-2xl font-bold">
              Température demain
            </h2>

            {temperatureError && (
              <div className="mt-4">
                <StatusMessage kind="error" message={temperatureError} />
              </div>
            )}

            {/* -------------------------------------------------
                BOUTON REPLIABLE : "Ajuster manuellement"
            -------------------------------------------------- */}
            <button
              type="button"
              onClick={() => setShowTempInputs((v) => !v)}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
            >
              <span>⚙️ Ajuster manuellement les paramètres</span>
              <Chevron open={showTempInputs} />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                showTempInputs
                  ? "mt-4 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div>
                    <label className="block text-sm text-slate-400">
                      Jour de l'année (1-365)
                    </label>
                    <input
                      type="number"
                      value={tempDayOfYear}
                      onChange={(e) =>
                        setTempDayOfYear(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400">
                      Humidité (%)
                    </label>
                    <input
                      type="number"
                      value={tempHumidity}
                      onChange={(e) =>
                        setTempHumidity(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400">
                      Pression (hPa)
                    </label>
                    <input
                      type="number"
                      value={tempPressure}
                      onChange={(e) =>
                        setTempPressure(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400">
                      Vitesse du vent (km/h)
                    </label>
                    <input
                      type="number"
                      value={tempWindSpeed}
                      onChange={(e) =>
                        setTempWindSpeed(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400">
                      Couverture nuageuse (%)
                    </label>
                    <input
                      type="number"
                      value={tempCloudCover}
                      onChange={(e) =>
                        setTempCloudCover(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTemperaturePrediction}
              disabled={loadingTemperature}
              className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loadingTemperature ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-900" />
                  Prédiction...
                </span>
              ) : (
                "Prédire la température"
              )}
            </button>

            {(fetchedWeather || temperatureResult) && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Aujourd'hui
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-200">
                    {fetchedWeather
                      ? `${fetchedWeather.temperature.toFixed(1)}°C`
                      : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-blue-300">
                    Demain (prédit)
                  </p>
                  <p className="mt-2 text-3xl font-extrabold">
                    {temperatureResult
                      ? `${temperatureResult.predicted_temperature.toFixed(1)}°C`
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              PLUIE
          ================================================= */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">
            <div className="text-4xl">🌧️</div>
            <h2 className="mt-4 text-2xl font-bold">Pluie demain</h2>

            {rainError && (
              <div className="mt-4">
                <StatusMessage kind="error" message={rainError} />
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowRainInputs((v) => !v)}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
            >
              <span>⚙️ Ajuster manuellement les paramètres</span>
              <Chevron open={showRainInputs} />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                showRainInputs
                  ? "mt-4 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div>
                    <label className="block text-sm text-slate-400">
                      Humidité (%)
                    </label>
                    <input
                      type="number"
                      value={rainHumidity}
                      onChange={(e) =>
                        setRainHumidity(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400">
                      Pression (hPa)
                    </label>
                    <input
                      type="number"
                      value={rainPressure}
                      onChange={(e) =>
                        setRainPressure(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400">
                      Vitesse du vent (km/h)
                    </label>
                    <input
                      type="number"
                      value={rainWindSpeed}
                      onChange={(e) =>
                        setRainWindSpeed(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400">
                      Couverture nuageuse (%)
                    </label>
                    <input
                      type="number"
                      value={rainCloudCover}
                      onChange={(e) =>
                        setRainCloudCover(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rainToday}
                      onChange={(e) => setRainToday(e.target.checked)}
                      className="h-5 w-5 rounded border-white/10 bg-white/5"
                    />
                    <label className="text-sm text-slate-400">
                      Pluie aujourd'hui
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRainPrediction}
              disabled={loadingRain}
              className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loadingRain ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-900" />
                  Prédiction...
                </span>
              ) : (
                "Prédire la pluie"
              )}
            </button>

            {rainResult && (
              <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-6 text-center">
                <p className="text-sm text-blue-300">
                  Résultat de la prédiction
                </p>
                <p className="mt-2 text-3xl font-extrabold">
                  {rainResult.rain_tomorrow
                    ? "🌧️ Pluie prévue"
                    : "☀️ Pas de pluie"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Probabilité : {(rainResult.probability * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">
          Prédictions réalisées par votre modèle ML
        </div>
      </footer>
    </main>
  );
}