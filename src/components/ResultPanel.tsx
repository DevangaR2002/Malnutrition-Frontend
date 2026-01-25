import RiskBadge from "./RiskBadge";
import RecommendationCard from "./RecommendationCard";
import { PredictionResponse } from "@/lib/types";

export default function ResultPanel({ data }: { data: PredictionResponse }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">Prediction Result</h2>
          <RiskBadge riskLevel={data.risk_level} />
        </div>

        <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500">Confidence</div>
            <div className="text-2xl font-semibold">{data.confidence}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Created At</div>
            <div className="text-sm font-medium">{data.created_at}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Recommendations</h3>
        <div className="space-y-4">
          {data.recommendations?.map((rec, idx) => (
            <RecommendationCard key={idx} rec={rec} />
          ))}
        </div>
      </div>
    </div>
  );
}
