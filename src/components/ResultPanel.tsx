import RiskBadge from "./RiskBadge";
import { PredictionResponse } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generatePredictionPDF } from "@/lib/pdfService";

const FEATURE_LABELS: Record<string, string> = {
  Disease_Count: "Infectious Diseases (Active)",
  Mother_Education_Encoded: "Maternal Education Level",
  Age_Group_Encoded: "Age-related Vulnerability",
  Wealth_Index_Encoded: "Household Wealth Index",
  Weight_kg: "Low Body Weight",
  Height_cm: "Low Height for Age",
  BMI: "Body Mass Index",
};

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- Circular Risk Gauge ---------- */
function RiskRing({ value }: { value: number }) {
  const pct = Math.round(value * 1000) / 10;
  const r = 60;
  const c = 2 * Math.PI * r;
  const dash = c * value;

  let strokeColor = "stroke-emerald-500 dark:stroke-emerald-400";
  let textColor = "text-emerald-600 dark:text-emerald-400";

  if (value >= 0.8) {
    strokeColor = "stroke-rose-500 dark:stroke-rose-400";
    textColor = "text-rose-600 dark:text-rose-400";
  } else if (value >= 0.5) {
    strokeColor = "stroke-amber-500 dark:stroke-amber-400";
    textColor = "text-amber-600 dark:text-amber-400";
  }

  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 160 160" className="-rotate-90">
        <circle
          cx="80"
          cy="80"
          r={r}
          strokeWidth="12"
          className="fill-none stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className={`fill-none ${strokeColor} transition-all duration-1000 ease-out`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {pct}%
        </div>
        <div className={`text-[10px] tracking-widest font-semibold mt-0.5 ${textColor}`}>
          PROBABILITY
        </div>
      </div>
    </div>
  );
}

/* ---------- XAI Bars ---------- */
function XAIImpactBars({
  factors,
}: {
  factors: { feature: string; impact: number }[];
}) {
  const max = Math.max(...factors.map((f) => Math.abs(f.impact)), 1);

  return (
    <div className="space-y-5">
      {factors.map((f, i) => {
        const label = FEATURE_LABELS[f.feature] ?? f.feature;
        const positive = f.impact > 0;
        const width = Math.min((Math.abs(f.impact) / max) * 100, 100).toFixed(
          0,
        );

        return (
          <div key={i}>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {label}
              </span>
              <span
                className={`text-xs font-bold ${positive
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
                  }`}
              >
                {positive ? "+" : "-"}
                {Math.abs(Number(width))}% {positive ? "Impact" : "Protective"}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-2 rounded-full ${positive
                  ? "bg-red-500 dark:bg-red-400"
                  : "bg-emerald-500 dark:bg-emerald-400"
                  }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Recommendation Card with Icon & Actions ---------- */
function RecommendationCard({
  rec,
}: {
  rec: { category: string; recommendation: string; source: string };
}) {
  const category = rec.category.toLowerCase();

  // Determine priority and styling
  let priority = "SUPPORTIVE";
  let borderColor = "border-l-emerald-500 dark:border-l-emerald-400";
  let badgeBg =
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  let iconBg = "bg-emerald-50 dark:bg-emerald-900/30";
  let icon = "👥";
  let actionButton = null;

  if (
    category.includes("immediate") ||
    category.includes("clinical") ||
    category.includes("high")
  ) {
    priority = "HIGH PRIORITY";
    borderColor = "border-l-rose-500 dark:border-l-rose-400";
    badgeBg =
      "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    iconBg = "bg-rose-50 dark:bg-rose-900/30";
    icon = "⚕️";
    actionButton = (
      <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition">
        Initiate Referral
      </button>
    );
  } else if (
    category.includes("nutrition") ||
    category.includes("feeding") ||
    category.includes("weight") ||
    category.includes("wasting")
  ) {
    priority = "MEDIUM PRIORITY";
    borderColor = "border-l-amber-500 dark:border-l-amber-400";
    badgeBg =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    iconBg = "bg-amber-50 dark:bg-amber-900/30";
    icon = "🍽️";
    actionButton = (
      <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition">
        Log Feeding Plan
      </button>
    );
  } else if (
    category.includes("social") ||
    category.includes("education") ||
    category.includes("caregiver")
  ) {
    priority = "SUPPORTIVE";
    borderColor = "border-l-emerald-500 dark:border-l-emerald-400";
    badgeBg =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    iconBg = "bg-emerald-50 dark:bg-emerald-900/30";
    icon = "👥";
    actionButton = (
      <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition">
        Contact Social Worker
      </button>
    );
  }

  return (
    <div
      className={`rounded-lg border border-l-4 border-slate-200 dark:border-slate-800 ${borderColor} bg-white dark:bg-slate-900 p-6`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`shrink-0 w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {rec.category}
            </h4>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap ${badgeBg}`}
            >
              {priority}
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {rec.recommendation}
          </p>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1">
              <svg
                className="w-3 h-3 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              {rec.source}
            </p>
            {actionButton}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPanel({ data }: { data: PredictionResponse }) {
  const router = useRouter();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [actualRisk, setActualRisk] = useState("Low Risk");
  const [comments, setComments] = useState("");

  const submitFeedback = async () => {
    if (isCorrect === null) return;
    setFeedbackStatus("submitting");

    const payload = {
      is_correct: isCorrect,
      actual_risk_level: isCorrect ? null : actualRisk,
      comments: comments || null,
    };

  
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8000/api/predictions/${data.id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit");
      setFeedbackStatus("success");
    } catch (err) {
      console.error(err);
      setFeedbackStatus("error");
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePredictionPDF(data);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate confidence as percentage
  const confidenceMap: Record<string, number> = {
    High: 98.2,
    Medium: 75.0,
    Low: 55.0,
  };
  const confidencePct = confidenceMap[data.confidence] || 85.0;

  let headingText = "Low Malnutrition Risk";
  let descText = "The model indicates a low probability of malnutrition. Continue standard preventative care and monitoring.";

  if (data.risk_probability >= 0.8) {
    headingText = "Severe Malnutrition Risk";
    descText = "The model has identified a high probability of acute malnutrition based on current clinical indicators and household data. Immediate clinical action is advised.";
  } else if (data.risk_probability >= 0.5) {
    headingText = "Moderate Malnutrition Risk";
    descText = "The model detects moderate risk factors for malnutrition. Close monitoring, early nutritional intervention, and follow-ups are highly recommended.";
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Dashboard &nbsp;›&nbsp;{" "}
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          Prediction Result
        </span>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        Clinical Assessment
      </h1>

      {/* Main summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left card */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex gap-8 items-center">
          <RiskRing value={data.risk_probability} />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <RiskBadge riskLevel={data.risk_level} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Subject ID: #{data.id}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {headingText}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {descText}
            </p>
          </div>
        </div>

        {/* Right stats */}
        <div className="space-y-12">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Model Confidence
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              High ({confidencePct}%)
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-xs font-semibold uppercase tracking-wide">
                Assessment Time
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatDate(data.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* XAI */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
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
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              Why this result? (XAI)
            </h3>
          </div>
          <button className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
            How it works
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {data.xai_text ||
            "This prediction was influenced by multiple factors considered together. The horizontal bars indicate the relative contribution of each feature to the final risk score."}
        </p>

        {data.xai?.top_factors && (
          <XAIImpactBars factors={data.xai.top_factors} />
        )}

        <p className="mt-5 text-xs italic text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Factors ranked by SHAP contribution to this prediction.
        </p>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <svg
            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Required Actions & Recommendations
          </h3>
        </div>

        <div className="space-y-4">
          {data.recommendations?.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} />
          ))}
        </div>
      </div>

      
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Clinical Feedback
          </h3>
        </div>

        {feedbackStatus === "success" ? (
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Thank you! Your clinical review has been recorded to improve future model predictions.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Do you agree with the ML unit's risk assessment of <strong>{data.risk_level}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCorrect(true)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition ${isCorrect === true ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}
              >
                Yes, I agree
              </button>
              <button
                onClick={() => setIsCorrect(false)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition ${isCorrect === false ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/30 dark:border-rose-400 dark:text-rose-300" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}
              >
                No, needs correction
              </button>
            </div>

            {isCorrect === false && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Actual Risk Level Observed
                  </label>
                  <select
                    value={actualRisk}
                    onChange={(e) => setActualRisk(e.target.value)}
                    className="w-full sm:max-w-xs border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Low Risk">Low Risk (Normal)</option>
                    <option value="Medium Risk">Medium Risk (Moderate)</option>
                    <option value="High Risk">High Risk (Severe)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Note (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Why does the model estimate differ from biological reality contextually...?"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {isCorrect !== null && (
              <button
                onClick={submitFeedback}
                disabled={feedbackStatus === "submitting"}
                className="btn-primary mt-2 flex items-center gap-2"
              >
                {feedbackStatus === "submitting" ? "Submitting..." : "Submit Review"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            )}

            {feedbackStatus === "error" && (
              <div className="text-xs text-rose-500 font-semibold mt-2">Failed to submit feedback. Check connection or if prediction ID already reviewed.</div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                  clipRule="evenodd"
                />
              </svg>
              Download Full Report (PDF)
            </>
          )}
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Open Analytics
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition"
          >
            New Prediction
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
        © 2024 Malnutrition Risk Analysis Platform. Professional Clinical Use
        Only.
      </div>
    </div>
  );
}
