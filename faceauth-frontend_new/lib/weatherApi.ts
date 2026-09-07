export const WEATHER_API_URL =
  process.env.NEXT_PUBLIC_WEATHER_API_URL || "http://127.0.0.1:8001";

export type TemperatureRequest = {
  day_of_year: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  cloud_cover: number;
};

export type RainRequest = {
  humidity: number;
  pressure: number;
  wind_speed: number;
  cloud_cover: number;
  rain_today: boolean;
};

export class WeatherApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "WeatherApiError";
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${WEATHER_API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new WeatherApiError(
      "Impossible de joindre le backend météo. Vérifiez qu'il est démarré (port 8001).",
      0
    );
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body
  }

  if (!response.ok) {
    let detail = "Une erreur est survenue.";

    if (data && typeof data === "object" && "detail" in data) {
      const rawDetail = (data as { detail: unknown }).detail;

      if (Array.isArray(rawDetail)) {
        // FastAPI/Pydantic validation errors: array of {loc, msg, type, ...}
        detail = rawDetail
          .map((err) => {
            if (err && typeof err === "object" && "msg" in err) {
              const loc =
                "loc" in err && Array.isArray((err as any).loc)
                  ? (err as any).loc.join(".")
                  : "";
              return loc
                ? `${loc}: ${(err as { msg: unknown }).msg}`
                : String((err as { msg: unknown }).msg);
            }
            return JSON.stringify(err);
          })
          .join(" | ");
      } else if (typeof rawDetail === "string") {
        detail = rawDetail;
      } else {
        detail = JSON.stringify(rawDetail);
      }
    }

    console.error("Validation error detail:", data);
    throw new WeatherApiError(detail, response.status);
  }

  return data as T;
}

export function predictTemperature(
  payload: TemperatureRequest
): Promise<{ predicted_temperature: number }> {
  return postJson("/weather/predict-temperature", payload);
}

export function predictRain(
  payload: RainRequest
): Promise<{ rain_tomorrow: boolean; probability: number }> {
  return postJson("/weather/predict-rain", payload);
}