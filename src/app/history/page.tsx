"use client";

import { useEffect, useState } from "react";
import { saveLastResult } from "@/lib/storage";
import { PredictionResponse } from "@/lib/types";
import Link from "next/link";
import RiskBadge from "@/components/RiskBadge";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HistoryPage() {
  const [items, setItems] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/predictions/history`,
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
        console.error("Failed to load history from secure server", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  async function openItem(item: PredictionResponse) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/predictions/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        const fullData = await res.json();
        saveLastResult(fullData);
        window.location.href = "/result";
      } else {
        console.error("Failed to fetch full prediction details");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function onClear() {
    setItems([]);
  }

  return (
    <ProtectedRoute>
      <main className="container-page">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Prediction History</h1>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              onClick={onClear}
              disabled={items.length === 0}
            >
              Clear
            </button>
            <Link className="btn-primary" href="/">
              New Prediction
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body text-sm text-gray-700">
              <svg
                className="animate-spin h-5 w-5 text-indigo-600 inline-block mr-2"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Synchronizing with database...
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="card">
            <div className="card-body text-sm text-gray-700">
              No history found in your secure profile yet. Run a prediction
              first.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => openItem(item)}
                className="card w-full text-left cursor-pointer hover:shadow-md transition"
              >
                <div className="card-body flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">
                      #{item.id} • {item.input_summary?.age_months ?? "?"}{" "}
                      months • {item.input_summary?.gender ?? "?"}
                    </div>
                    <div className="text-xs text-gray-500">
                      H: {item.input_summary?.height_cm ?? "?"} cm • W:{" "}
                      {item.input_summary?.weight_kg ?? "?"} kg •{" "}
                      {item.created_at}
                    </div>
                  </div>
                  <RiskBadge riskLevel={item.risk_level} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
