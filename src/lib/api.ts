import { PredictionRequest, PredictionResponse } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function healthCheck() {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function predictRisk(
  payload: PredictionRequest,
): Promise<PredictionResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api/predictions/predict`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.detail || data?.message || "Prediction request failed";
    throw new Error(msg);
  }

  return data;
}

export async function loginUser(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || "Login failed");
  }
  return data;
}

export async function registerUser(username: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || "Registration failed");
  }
  return data;
}
