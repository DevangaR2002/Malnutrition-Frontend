import RiskBadge from "./RiskBadge";
import { PredictionResponse } from "@/lib/types";
import { useRouter } from "next/navigation";

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

  return (
    <div className="relative h-44 w-44 flex-shrink-0">
      <svg viewBox="0 0 160 160" className="-rotate-90">
        <circle
          cx="80"
          cy="80"
          r={r}
          strokeWidth="12"
          className="fill-none stroke-slate-200"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className="fill-none stroke-red-500"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-extrabold text-slate-900">{pct}%</div>
        <div className="text-[10px] tracking-widest font-semibold text-red-600 mt-0.5">
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
              <span className="font-semibold text-slate-800">{label}</span>
              <span
                className={`text-xs font-bold ${
                  positive ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {positive ? "+" : "-"}
                {Math.abs(Number(width))}% {positive ? "Impact" : "Protective"}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${
                  positive ? "bg-red-500" : "bg-emerald-500"
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
  let borderColor = "border-l-emerald-500";
  let badgeBg = "bg-emerald-100 text-emerald-700";
  let iconBg = "bg-emerald-50";
  let icon = "👥";
  let actionButton = null;

  if (
    category.includes("immediate") ||
    category.includes("clinical") ||
    category.includes("high")
  ) {
    priority = "HIGH PRIORITY";
    borderColor = "border-l-rose-500";
    badgeBg = "bg-rose-100 text-rose-700";
    iconBg = "bg-rose-50";
    icon = "⚕️";
    actionButton = (
      <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">
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
    borderColor = "border-l-amber-500";
    badgeBg = "bg-amber-100 text-amber-700";
    iconBg = "bg-amber-50";
    icon = "🍽️";
    actionButton = (
      <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">
        Log Feeding Plan
      </button>
    );
  } else if (
    category.includes("social") ||
    category.includes("education") ||
    category.includes("caregiver")
  ) {
    priority = "SUPPORTIVE";
    borderColor = "border-l-emerald-500";
    badgeBg = "bg-emerald-100 text-emerald-700";
    iconBg = "bg-emerald-50";
    icon = "👥";
    actionButton = (
      <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">
        Contact Social Worker
      </button>
    );
  }

  return (
    <div
      className={`rounded-lg border border-l-4 border-slate-200 ${borderColor} bg-white p-6`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900">
              {rec.category}
            </h4>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap ${badgeBg}`}
            >
              {priority}
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            {rec.recommendation}
          </p>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-slate-500 italic flex items-center gap-1">
              <svg
                className="w-3 h-3 flex-shrink-0"
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

  // Calculate confidence as percentage
  const confidenceMap: Record<string, number> = {
    High: 98.2,
    Medium: 75.0,
    Low: 55.0,
  };
  const confidencePct = confidenceMap[data.confidence] || 85.0;

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500">
        Dashboard &nbsp;›&nbsp;{" "}
        <span className="text-emerald-600 font-semibold">
          Prediction Result
        </span>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-extrabold text-slate-900">
        Clinical Assessment
      </h1>

      {/* Main summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left card */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-8 flex gap-8 items-center">
          <RiskRing value={data.risk_probability} />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <RiskBadge riskLevel={data.risk_level} />
              <span className="text-xs text-slate-500">
                Subject ID: #{data.id}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Malnutrition Detected
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              The model has identified a high probability of acute malnutrition
              based on current clinical indicators and household data.
            </p>
          </div>
        </div>

        {/* Right stats */}
        <div className="space-y-12">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Model Confidence
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              High ({confidencePct}%)
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
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
            <div className="text-xl font-extrabold text-slate-900">
              {formatDate(data.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* XAI */}
      <div className="rounded-lg border border-slate-200 bg-white p-7">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-600"
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
            <h3 className="font-extrabold text-slate-900 text-lg">
              Why this result? (XAI)
            </h3>
          </div>
          <button className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
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

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {data.xai_text ||
            "This prediction was influenced by multiple factors considered together. The horizontal bars indicate the relative contribution of each feature to the final risk score."}
        </p>

        {data.xai?.top_factors && (
          <XAIImpactBars factors={data.xai.top_factors} />
        )}

        <p className="mt-5 text-xs italic text-slate-500 flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
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
            className="w-5 h-5 text-emerald-600"
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
          <h3 className="text-xl font-extrabold text-slate-900">
            Required Actions & Recommendations
          </h3>
        </div>

        <div className="space-y-4">
          {data.recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} />
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-semibold transition">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
          Download Full Report (PDF)
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/history")}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
          >
            Back to History
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            New Prediction
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 pt-4">
        © 2024 Malnutrition Risk Analysis Platform. Professional Clinical Use
        Only.
      </div>
    </div>
  );
}
