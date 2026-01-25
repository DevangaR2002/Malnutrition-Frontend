"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { predictRisk } from "@/lib/api";
import { addToHistory, saveLastResult } from "@/lib/storage";
import { PredictionRequest, WealthIndex, Gender } from "@/lib/types";

const EDUCATION_OPTIONS = ["No education", "Primary", "Secondary", "Higher"];
const WEALTH_OPTIONS: WealthIndex[] = ["Low", "Middle", "High"];
const GENDER_OPTIONS: Gender[] = ["Male", "Female"];

export default function PredictionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PredictionRequest>({
    age_months: 24,
    gender: "Male",
    mother_education: "No education",
    household_wealth_index: "Low",
    height_cm: 70,
    weight_kg: 8.5,
    has_diarrhea: false,
    has_malaria: false,
    has_tb: false,
  });

  function update<K extends keyof PredictionRequest>(
    key: K,
    value: PredictionRequest[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.age_months <= 0 || form.age_months > 59) {
      setError("Age must be between 1 and 59 months.");
      return;
    }
    if (form.height_cm <= 30 || form.height_cm > 130) {
      setError("Height looks invalid. Please check (cm).");
      return;
    }
    if (form.weight_kg <= 1 || form.weight_kg > 30) {
      setError("Weight looks invalid. Please check (kg).");
      return;
    }

    setLoading(true);
    try {
      const result = await predictRisk(form);
      saveLastResult(result);
      addToHistory(result);
      router.push("/result");
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="text-lg font-semibold">Malnutrition Risk Prediction</h1>
        <p className="text-sm text-gray-600">
          Enter child and household details to receive a risk score and
          recommendations.
        </p>
      </div>

      <div className="card-body">
        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Age (months)</label>
              <input
                className="input mt-2"
                type="number"
                value={form.age_months}
                onChange={(e) => update("age_months", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Gender</label>
              <select
                className="select mt-2"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value as Gender)}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Height (cm)</label>
              <input
                className="input mt-2"
                type="number"
                step="0.1"
                value={form.height_cm}
                onChange={(e) => update("height_cm", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Weight (kg)</label>
              <input
                className="input mt-2"
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => update("weight_kg", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mother Education</label>
              <select
                className="select mt-2"
                value={form.mother_education}
                onChange={(e) => update("mother_education", e.target.value)}
              >
                {EDUCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Household Wealth Index
              </label>
              <select
                className="select mt-2"
                value={form.household_wealth_index}
                onChange={(e) =>
                  update(
                    "household_wealth_index",
                    e.target.value as WealthIndex,
                  )
                }
              >
                {WEALTH_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.has_diarrhea}
                onChange={(e) => update("has_diarrhea", e.target.checked)}
              />
              Has diarrhea
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.has_malaria}
                onChange={(e) => update("has_malaria", e.target.checked)}
              />
              Has malaria
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.has_tb}
                onChange={(e) => update("has_tb", e.target.checked)}
              />
              Has TB
            </label>
          </div>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Predicting..." : "Predict Risk"}
          </button>
        </form>
      </div>
    </div>
  );
}
