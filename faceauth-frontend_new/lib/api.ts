export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type AuthResponse = {
  success: boolean;
  message: string;
  user_id: number;
  name: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * FastAPI validation errors (422) come back as:
 * { detail: [{ loc, msg, type, ... }] }
 * Other handled errors (400/401/...) usually come back as:
 * { detail: "some message" }
 * This normalizes both shapes into a single readable string.
 */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          typeof item === "object" && item && "msg" in item
            ? String((item as { msg: unknown }).msg)
            : JSON.stringify(item)
        )
        .join(" ");
    }
  }
  return fallback;
}

async function postForm(path: string, name: string, photo: File): Promise<AuthResponse> {
  const form = new FormData();
  form.append("name", name);
  form.append("photo", photo);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifiez qu'il est démarré et accessible.",
      0
    );
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // response had no JSON body
  }

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(body, "Une erreur est survenue."),
      response.status
    );
  }

  return body as AuthResponse;
}

export function registerUser(name: string, photo: File): Promise<AuthResponse> {
  return postForm("/auth/register", name, photo);
}

export function loginUser(name: string, photo: File): Promise<AuthResponse> {
  return postForm("/auth/login", name, photo);
}
