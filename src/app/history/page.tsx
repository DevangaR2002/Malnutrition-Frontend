"use client";

import { useEffect, useState } from "react";
import { clearHistory, loadHistory, saveLastResult } from "@/lib/storage";
import { PredictionResponse } from "@/lib/types";
import Link from "next/link";
import RiskBadge from "@/components/RiskBadge";

export default function HistoryPage() {
  const [items, setItems] = useState<PredictionResponse[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  function openItem(item: PredictionResponse) {
    saveLastResult(item);
    window.location.href = "/result";
  }

  function onClear() {
    clearHistory();
    setItems([]);
  }

  return (
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

      {items.length === 0 ? (
        <div className="card">
          <div className="card-body text-sm text-gray-700">
            No history yet. Run a prediction first.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => openItem(item)}
              className="card w-full text-left hover:shadow-md transition"
            >
              <div className="card-body flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">
                    #{item.id} • {item.input_summary?.age_months ?? "?"} months
                    • {item.input_summary?.gender ?? "?"}
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
  );
}
