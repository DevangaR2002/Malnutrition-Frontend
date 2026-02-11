import { Recommendation } from "@/lib/types";
import { JSX } from "react";

function inferPriority(category: string): {
  level: string;
  borderColor: string;
  badgeBg: string;
  iconBg: string;
  icon: string;
  actionButton: JSX.Element | null;
} {
  const c = category.toLowerCase();

  // HIGH PRIORITY - Immediate/Clinical/Severe
  if (
    c.includes("immediate") ||
    c.includes("clinical") ||
    c.includes("severe") ||
    c.includes("sam") ||
    c.includes("high")
  ) {
    return {
      level: "HIGH PRIORITY",
      borderColor: "border-l-rose-500",
      badgeBg: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      iconBg: "bg-rose-100 dark:bg-rose-900/40",
      icon: "⚕️",
      actionButton: (
        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">
          Initiate Referral
        </button>
      ),
    };
  }

  // MEDIUM PRIORITY - Nutrition/Feeding/Weight
  if (
    c.includes("nutrition") ||
    c.includes("feeding") ||
    c.includes("weight") ||
    c.includes("wasting") ||
    c.includes("stunting") ||
    c.includes("growth")
  ) {
    return {
      level: "MEDIUM PRIORITY",
      borderColor: "border-l-amber-500",
      badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      icon: "🍽️",
      actionButton: (
        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">
          Log Feeding Plan
        </button>
      ),
    };
  }

  // SUPPORTIVE - Social/Education/Caregiver
  return {
    level: "SUPPORTIVE",
    borderColor: "border-l-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    icon: "👥",
    actionButton: (
      <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">
        Contact Social Worker
      </button>
    ),
  };
}

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  const priority = inferPriority(rec.category);

  return (
    <div
      className={`rounded-xl border border-l-4 ${priority.borderColor} bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`shrink-0 w-12 h-12 rounded-lg ${priority.iconBg} flex items-center justify-center text-2xl`}
        >
          {priority.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {rec.category}
            </h4>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap ${priority.badgeBg}`}
            >
              {priority.level}
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
            {priority.actionButton}
          </div>
        </div>
      </div>
    </div>
  );
}