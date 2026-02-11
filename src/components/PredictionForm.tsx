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

    // Validation
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
      setError(err.message || "Prediction request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="w-6 h-6 text-emerald-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Malnutrition Risk Prediction
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enter child, household, and clinical details for WHO-aligned risk
          assessment.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Child measurements */}
        <Section
          title="Child Information"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          <Grid>
            <Field label="Age (months)">
              <input
                type="number"
                className="input"
                value={form.age_months}
                onChange={(e) => update("age_months", Number(e.target.value))}
              />
            </Field>

            <Field label="Gender">
              <select
                className="select"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value as Gender)}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>

            <Field label="Height (cm)">
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.height_cm}
                onChange={(e) => update("height_cm", Number(e.target.value))}
              />
            </Field>

            <Field label="Weight (kg)">
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.weight_kg}
                onChange={(e) => update("weight_kg", Number(e.target.value))}
              />
            </Field>
          </Grid>
        </Section>

        {/* Household factors */}
        <Section
          title="Household & Caregiver Factors"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          }
        >
          <Grid>
            <Field label="Mother's Education Level">
              <select
                className="select"
                value={form.mother_education}
                onChange={(e) => update("mother_education", e.target.value)}
              >
                {EDUCATION_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </Field>

            <Field label="Household Wealth Index">
              <select
                className="select"
                value={form.household_wealth_index}
                onChange={(e) =>
                  update(
                    "household_wealth_index",
                    e.target.value as WealthIndex,
                  )
                }
              >
                {WEALTH_OPTIONS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </Section>

        {/* Health conditions */}
        <Section
          title="Recent Health Conditions"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Toggle
              label="Diarrhea"
              checked={form.has_diarrhea}
              onChange={(v) => update("has_diarrhea", v)}
            />
            <Toggle
              label="Malaria"
              checked={form.has_malaria}
              onChange={(v) => update("has_malaria", v)}
            />
            <Toggle
              label="Tuberculosis (TB)"
              checked={form.has_tb}
              onChange={(v) => update("has_tb", v)}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1">
            <svg
              className="w-3 h-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Active infections directly influence nutritional risk and WHO
            recommendations.
          </p>
        </Section>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Predicting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Predict Risk
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ---------- Layout helpers ---------- */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-emerald-600">{icon}</span>}
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition flex items-center justify-center gap-2
        ${
          checked
            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        }`}
    >
      {checked && (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {label}
    </button>
  );
}
