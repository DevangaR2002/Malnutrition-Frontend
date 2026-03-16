"use client";

import { useEffect, useState } from "react";
import { PredictionResponse } from "@/lib/types";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function DashboardPage() {
  const [items, setItems] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:8000/api/predictions/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);  


  const totalAssessments = items.length;
  const severeCases = items.filter((i) =>
    i.risk_level?.toLowerCase().includes("high"),
  ).length;
  const moderateCases = items.filter(
    (i) =>
      i.risk_level?.toLowerCase().includes("medium") ||
      i.risk_level?.toLowerCase().includes("moderate"),
  ).length;

  const severePct =
    totalAssessments > 0
      ? ((severeCases / totalAssessments) * 100).toFixed(1)
      : "0";

  const lowCases = totalAssessments - severeCases - moderateCases;

  const doughnutData = {
    labels: ["Severe Malnutrition", "Moderate Risk", "Low Risk"],
    datasets: [
      {
        data: [severeCases, moderateCases, lowCases],
        backgroundColor: [
          "rgba(244, 63, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
        borderColor: [
          "rgba(244, 63, 94, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData: Record<
    string,
    { high: number; med: number; low: number }
  > = {};
  items.forEach((item) => {
    const d = new Date(item.created_at);
    const month = d.toLocaleString("default", { month: "short" });
    if (!monthlyData[month]) {
      monthlyData[month] = { high: 0, med: 0, low: 0 };
    }
    const isHigh = item.risk_level?.toLowerCase().includes("high");
    const isMed =
      item.risk_level?.toLowerCase().includes("medium") ||
      item.risk_level?.toLowerCase().includes("moderate");

    if (isHigh) monthlyData[month].high++;
    else if (isMed) monthlyData[month].med++;
    else monthlyData[month].low++;
  });

  const monthLabels = Object.keys(monthlyData);
  const trendData = {
    labels: monthLabels,
    datasets: [
      {
        label: "At Risk (Severe + Mod)",
        data: monthLabels.map((m) => monthlyData[m].high + monthlyData[m].med),
        fill: true,
        backgroundColor: "rgba(244, 63, 94, 0.2)",
        borderColor: "rgba(244, 63, 94, 1)",
        tension: 0.4,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const ageGroups: Record<string, { high: number; med: number; low: number }> =
    {
      "0-6m": { high: 0, med: 0, low: 0 },
      "6-12m": { high: 0, med: 0, low: 0 },
      "12-24m": { high: 0, med: 0, low: 0 },
      "24-60m": { high: 0, med: 0, low: 0 },
    };

  let maleAtRisk = 0;
  let femaleAtRisk = 0;

  items.forEach((item) => {
    const age = item.input_summary?.age_months ?? 0;
    let group = "0-6m";
    if (age >= 24) group = "24-60m";
    else if (age >= 12) group = "12-24m";
    else if (age >= 6) group = "6-12m";

    const isHigh = item.risk_level?.toLowerCase().includes("high") ?? false;
    const isMed =
      (item.risk_level?.toLowerCase().includes("medium") ||
        item.risk_level?.toLowerCase().includes("moderate")) ??
      false;

    if (isHigh) ageGroups[group].high++;
    else if (isMed) ageGroups[group].med++;
    else ageGroups[group].low++;

    if (isHigh || isMed) {
      if (item.input_summary?.gender === "Male") maleAtRisk++;
      else if (item.input_summary?.gender === "Female") femaleAtRisk++;
    }
  });

  const ageData = {
    labels: Object.keys(ageGroups),
    datasets: [
      {
        label: "Severe",
        data: Object.values(ageGroups).map((g) => g.high),
        backgroundColor: "rgba(244, 63, 94, 0.8)",
      },
      {
        label: "Moderate",
        data: Object.values(ageGroups).map((g) => g.med),
        backgroundColor: "rgba(245, 158, 11, 0.8)",
      },
      {
        label: "Low Risk",
        data: Object.values(ageGroups).map((g) => g.low),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
      },
    ],
  };

  const genderData = {
    labels: ["Male (At Risk)", "Female (At Risk)"],
    datasets: [
      {
        data: [maleAtRisk, femaleAtRisk],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(236, 72, 153, 0.8)"],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(236, 72, 153, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <ProtectedRoute>
      <main className="container-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Clinical Quality Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Live systemic view of clinical diagnostics and trends.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No Data Available
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You haven't processed any clinical assessments yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 shadow-sm"
            >
              Start First Assessment
            </Link>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="flex gap-3 mb-8 justify-end">
              <Link className="btn-secondary" href="/history">
                View Data Logs
              </Link>
              <Link className="btn-primary" href="/">
                New Prediction
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card p-5 flex items-center justify-between col-span-1 md:col-span-1 border-0 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-slate-600 dark:text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {totalAssessments}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Total Assessments
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 flex items-center justify-between col-span-1 md:col-span-1 border-0 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{lowCases}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Normal / Low Risk
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 flex items-center justify-between col-span-1 md:col-span-1 border-0 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-amber-600 dark:text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{moderateCases}</div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Moderate Risk
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 flex items-center justify-between col-span-1 md:col-span-1 border-0 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-rose-600 dark:text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{severeCases}</div>
                      <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold pb-1">
                        {severePct}%
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Severe Malnutrition
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="card lg:col-span-2 flex flex-col p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Malnutrition Flags by Month
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total assessments flagged as Moderate or Severe risk over
                    time.
                  </p>
                </div>
                <div className="relative flex-1 min-h-[250px]">
                  {monthLabels.length > 0 ? (
                    <Line data={trendData} options={trendOptions} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      No temporal data available
                    </div>
                  )}
                </div>
              </div>

              <div className="card lg:col-span-1 flex flex-col p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Risk Distribution
                  </h3>
                </div>
                <div className="relative flex-1 min-h-[250px] flex items-center justify-center">
                  {totalAssessments > 0 ? (
                    <Doughnut
                      data={doughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "bottom" },
                        },
                        cutout: "70%",
                      }}
                    />
                  ) : (
                    <div className="text-slate-400 text-sm">No data</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="card lg:col-span-2 flex flex-col p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Malnutrition by Age Group
                  </h3>
                  <p className="text-xs text-slate-500">
                    Breakdown of risk severity across critical early childhood
                    developmental stages.
                  </p>
                </div>
                <div className="relative flex-1 min-h-[250px]">
                  {totalAssessments > 0 ? (
                    <Bar
                      data={ageData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { stacked: true },
                          y: { stacked: true, beginAtZero: true },
                        },
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              <div className="card lg:col-span-1 flex flex-col p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Gender Vulnerability
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribution of At-Risk cases.
                  </p>
                </div>
                <div className="relative flex-1 min-h-[250px] flex items-center justify-center">
                  {maleAtRisk > 0 || femaleAtRisk > 0 ? (
                    <Doughnut
                      data={genderData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  ) : (
                    <div className="text-slate-400 text-sm">
                      No at-risk instances recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
