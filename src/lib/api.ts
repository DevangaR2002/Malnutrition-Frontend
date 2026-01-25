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
  const res = await fetch(`${BASE_URL}/api/predictions/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.detail || data?.message || "Prediction request failed";
    throw new Error(msg);
  }

  return data;
}
