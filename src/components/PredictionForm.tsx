"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { predictRisk } from "@/lib/api";
import { addToHistory, saveLastResult } from "@/lib/storage";
import { PredictionRequest, WealthIndex, Gender } from "@/lib/types";

const EDUCATION_OPTIONS = ["No education", "Primary", "Secondary", "Higher"];
const WEALTH_OPTIONS: WealthIndex[] = ["Low", "Middle", "High"];
const GENDER_OPTIONS: Gender[] = ["Male", "Female"];

type Step = "child" | "household" | "conditions" | "review";

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: "child", label: "CHILD INFO", icon: "👶" },
  { id: "household", label: "HOUSEHOLD", icon: "🏠" },
  { id: "conditions", label: "CONDITIONS", icon: "🩺" },
  { id: "review", label: "REVIEW", icon: "📋" },
];

function validateAnthropometrics(age: number, gender: string, height: number, weight: number): string | null {
  if (age < 0 || age > 60) return "Please enter a valid age between 0 and 60 months.";
  
  let minH = 0, maxH = 0, minW = 0, maxW = 0;
  
  if (gender === "Male") {
    if (age <= 12) { minH = 45; maxH = 80; minW = 2.5; maxW = 11; }
    else if (age <= 24) { minH = 70; maxH = 92; minW = 8; maxW = 14; }
    else if (age <= 36) { minH = 82; maxH = 100; minW = 10; maxW = 16; }
    else if (age <= 48) { minH = 90; maxH = 108; minW = 12; maxW = 18; }
    else if (age <= 60) { minH = 96; maxH = 115; minW = 14; maxW = 21; }
  } else {
    if (age <= 12) { minH = 44; maxH = 78; minW = 2.4; maxW = 10.5; }
    else if (age <= 24) { minH = 68; maxH = 90; minW = 7.5; maxW = 13; }
    else if (age <= 36) { minH = 80; maxH = 98; minW = 9.5; maxW = 15; }
    else if (age <= 48) { minH = 88; maxH = 106; minW = 11.5; maxW = 17; }
    else if (age <= 60) { minH = 94; maxH = 112; minW = 13.5; maxW = 20; }
  }

  if (height < minH || height > maxH) {
    return `For a ${age}-month old ${gender}, height must be between ${minH} and ${maxH} cm.`;
  }
  if (weight < minW || weight > maxW) {
    return `For a ${age}-month old ${gender}, weight must be between ${minW} and ${maxW} kg.`;
  }

  return null;
}

export default function PredictionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("child");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PredictionRequest>({
    mother_education: "No education",
    household_wealth_index: "Low",
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

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  function validateCurrentStep(): boolean {
    setError(null);
    if (currentStep === "child") {
      if (form.age_months === undefined) {
        setError("Please enter a valid age.");
        return false;
      }
      if (!form.gender) {
        setError("Please select the child's gender.");
        return false;
      }
      if (form.height_cm === undefined) {
        setError("Please enter the child's height.");
        return false;
      }
      if (form.weight_kg === undefined) {
        setError("Please enter the child's weight.");
        return false;
      }

      const validationError = validateAnthropometrics(form.age_months, form.gender, form.height_cm, form.weight_kg);
      if (validationError) {
        setError(validationError);
        return false;
      }
    }

    return true;
  }

  function goNext(e?: React.MouseEvent) {
    e?.preventDefault();
    if (validateCurrentStep()) {
      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentStepIndex + 1].id);
      }
    }
  }

  function goBack(e?: React.MouseEvent) {
    e?.preventDefault();
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateCurrentStep()) return;

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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          Malnutrition Risk Prediction
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          AI-assisted diagnostic tool based on WHO clinical standards.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
          <div
            className="absolute top-6 left-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 -z-10 transition-all duration-300"
            style={{
              width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = idx < currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentStep(step.id);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isActive
                    ? "bg-emerald-500 dark:bg-emerald-600 text-white scale-110 shadow-lg"
                    : isCompleted
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                >
                  {isCompleted ? "✓" : step.icon}
                </button>
                <span
                  className={`mt-2 text-xs font-semibold tracking-wide ${isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                    }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8">
        <form onSubmit={onSubmit} className="space-y-8">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <svg
                className="w-5 h-5 shrink-0 mt-0.5"
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

          {/* Step 1: Child Info */}
          {currentStep === "child" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Basic Information
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enter clinical measurements of the child
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Age (months)
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 24"
                    className="input w-full"
                    value={form.age_months === undefined ? "" : form.age_months}
                    onChange={(e) =>
                      update("age_months", e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Gender
                  </label>
                  <select
                    className="select w-full"
                    value={form.gender || ""}
                    onChange={(e) => update("gender", e.target.value as Gender)}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 85.5"
                    className="input w-full"
                    value={form.height_cm === undefined ? "" : form.height_cm}
                    onChange={(e) =>
                      update("height_cm", e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 10.2"
                    className="input w-full"
                    value={form.weight_kg === undefined ? "" : form.weight_kg}
                    onChange={(e) =>
                      update("weight_kg", e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Household */}
          {currentStep === "household" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Household & Caregiver
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Socioeconomic and educational factors
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Mother's Education Level
                  </label>
                  <select
                    className="select w-full"
                    value={form.mother_education || ""}
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
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Household Wealth Index
                  </label>
                  <select
                    className="select w-full"
                    value={form.household_wealth_index || ""}
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
            </div>
          )}

          {/* Step 3: Conditions */}
          {currentStep === "conditions" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Recent Health Conditions
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Select any active conditions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <ConditionToggle
                  icon="💧"
                  label="Diarrhea"
                  checked={form.has_diarrhea ?? false}
                  onChange={(v) => update("has_diarrhea", v)}
                />
                <ConditionToggle
                  icon="🦟"
                  label="Malaria"
                  checked={form.has_malaria ?? false}
                  onChange={(v) => update("has_malaria", v)}
                />
                <ConditionToggle
                  icon="🦠"
                  label="Has TB"
                  checked={form.has_tb ?? false}
                  onChange={(v) => update("has_tb", v)}
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  The prediction accuracy increases with more complete data.
                  Ensure measurements are recorded using calibrated medical
                  equipment.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
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
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Review & Submit
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Verify all information before prediction
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <ReviewSection title="Child Information">
                  <ReviewItem label="Age" value={form.age_months ? `${form.age_months} months` : "Not provided"} />
                  <ReviewItem label="Gender" value={form.gender || "Not provided"} />
                  <ReviewItem label="Height" value={form.height_cm ? `${form.height_cm} cm` : "Not provided"} />
                  <ReviewItem label="Weight" value={form.weight_kg ? `${form.weight_kg} kg` : "Not provided"} />
                </ReviewSection>

                <ReviewSection title="Household">
                  <ReviewItem
                    label="Mother's Education"
                    value={form.mother_education || "Not provided"}
                  />
                  <ReviewItem
                    label="Wealth Index"
                    value={form.household_wealth_index || "Not provided"}
                  />
                </ReviewSection>

                <ReviewSection title="Health Conditions">
                  <ReviewItem
                    label="Diarrhea"
                    value={form.has_diarrhea ? "Yes" : "No"}
                  />
                  <ReviewItem
                    label="Malaria"
                    value={form.has_malaria ? "Yes" : "No"}
                  />
                  <ReviewItem label="TB" value={form.has_tb ? "Yes" : "No"} />
                </ReviewSection>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                goBack(e);
              }}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel
            </button>

            {currentStep !== "review" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goNext(e);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Predict Risk
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        ALIGNED WITH WHO CHILD GROWTH STANDARDS (2013)
      </div>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function ConditionToggle({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-lg border p-4 transition-all ${checked
        ? "border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800"
        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-semibold text-slate-900 dark:text-white">
        {label}
      </div>
    </button>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}:</span>
      <span className="font-semibold text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}
