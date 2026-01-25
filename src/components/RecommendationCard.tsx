import { Recommendation } from "@/lib/types";

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold">{rec.category}</h4>
          <span className="text-xs text-gray-500">{rec.source}</span>
        </div>
        <p className="mt-2 text-sm text-gray-700">{rec.recommendation}</p>
      </div>
    </div>
  );
}
