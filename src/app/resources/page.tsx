"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";

export default function ResourcesPage() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/predictions/export/dataset", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to export dataset");
      }

      // Convert response to Blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MalnutriAid_research_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                Clinical Resources
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Evidence-based guidelines and educational materials for malnutrition
                assessment
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-end">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition disabled:opacity-70"
              >
                {exporting ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                {exporting ? "Generating CSV..." : "Export Anonymized Dataset"}
              </button>
              {exportError && <p className="text-rose-500 text-sm mt-2">{exportError}</p>}
            </div>
          </div>

          {/* WHO Guidelines */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              WHO Guidelines & Standards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResourceCard
                title="WHO Child Growth Standards"
                description="Official growth charts and standards for children aged 0-5 years, including weight-for-age, height-for-age, and BMI-for-age indicators."
                link="https://www.who.int/tools/child-growth-standards"
                tag="Primary Reference"
              />

              <ResourceCard
                title="SAM Management Guidelines (2013)"
                description="Comprehensive guidelines for the management of Severe Acute Malnutrition in infants and children, including RUTF protocols."
                link="https://www.who.int/publications/i/item/9789241506328"
                tag="Clinical Protocol"
              />

              <ResourceCard
                title="IYCF Global Strategy"
                description="WHO & UNICEF recommendations for Infant and Young Child Feeding practices to prevent malnutrition."
                link="https://www.who.int/teams/nutrition-and-food-safety/food-and-nutrition-actions-in-health-systems/infant-and-young-child-feeding"
                tag="Prevention"
              />

              <ResourceCard
                title="Essential Nutrition Actions (2013)"
                description="Framework for nutrition interventions, caregiver education, and monitoring protocols."
                link="https://www.who.int/publications/i/item/9789241505550"
                tag="Implementation"
              />
            </div>
          </section>

          {/* Clinical Tools */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
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
              Clinical Assessment Tools
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ToolCard
                icon="📏"
                title="MUAC Measurement"
                description="Mid-Upper Arm Circumference guidelines for rapid malnutrition screening in the field."
              />

              <ToolCard
                icon="⚖️"
                title="Z-Score Calculator"
                description="Calculate weight-for-height, height-for-age, and weight-for-age Z-scores using WHO standards."
              />

              <ToolCard
                icon="📊"
                title="Growth Charts"
                description="Downloadable WHO growth charts for tracking child development over time."
              />
            </div>
          </section>

          {/* Disease Management */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              Disease-Specific Protocols
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResourceCard
                title="Diarrhea Management in Children"
                description="ORS and zinc supplementation protocols, feeding recommendations during illness."
                link="https://www.who.int/publications/i/item/9789241598415"
                tag="WHO/UNICEF"
              />

              <ResourceCard
                title="Malaria Treatment Guidelines"
                description="Pediatric malaria diagnosis and treatment, prevention strategies including ITNs."
                link="https://www.who.int/teams/global-malaria-programme/guidelines"
                tag="Treatment"
              />

              <ResourceCard
                title="Tuberculosis in Children (Module 5)"
                description="TB diagnosis, treatment regimens, and nutritional support during TB treatment."
                link="https://www.who.int/publications/i/item/9789240046832"
                tag="TB Guidelines"
              />

              <ResourceCard
                title="Integrated Management of Childhood Illness"
                description="IMCI protocols for combined management of common childhood conditions."
                link="https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/child-health/imci"
                tag="Integrated Care"
              />
            </div>
          </section>

          {/* Educational Materials */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Training & Education
            </h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Healthcare Provider Training
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Online courses and certification programs for malnutrition
                  screening and management
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">
                      WHO e-Learning courses on child nutrition
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">
                      UNICEF SAM Management training modules
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">
                      Community health worker certification programs
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Caregiver Education Materials
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Resources for educating parents and caregivers on nutrition and
                  child health
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">
                      Breastfeeding and complementary feeding guides
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">
                      Recognizing danger signs in children
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">
                      Hygiene and sanitation best practices
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* About the Tool */}
          <section className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              About MalnutriAid
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
              This prediction tool uses machine learning models trained on
              clinical data aligned with WHO Child Growth Standards (2013). The
              model considers multiple risk factors including anthropometric
              measurements, household socioeconomic status, maternal education,
              and active health conditions to provide evidence-based risk
              assessments.
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong className="font-semibold">Important:</strong> This tool is
              designed to assist healthcare providers in clinical decision-making
              and should not replace professional medical judgment. All
              predictions should be verified with proper clinical assessment and
              diagnostic procedures.
            </p>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}

/* ---------- Helper Components ---------- */

function ResourceCard({
  title,
  description,
  link,
  tag,
}: {
  title: string;
  description: string;
  link: string;
  tag: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
          {title}
        </h3>
        <svg
          className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0 transition"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {description}
      </p>
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
        {tag}
      </span>
    </a>
  );
}

function ToolCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
