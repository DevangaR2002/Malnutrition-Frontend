"use client";

import { useEffect, useState } from "react";
import { loadLastResult } from "@/lib/storage";
import { PredictionResponse } from "@/lib/types";
import ResultPanel from "@/components/ResultPanel";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ResultPage() {
  const [data, setData] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    setData(loadLastResult());
  }, []);

  return (
    <ProtectedRoute>
      <main className="container-page">
        {!data ? (
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-700">No result found.</p>
              <Link className="btn-secondary mt-4 inline-flex" href="/">
                Go back
              </Link>
            </div>
          </div>
        ) : (
          <ResultPanel data={data} />
        )}
      </main>
    </ProtectedRoute>
  );
}
