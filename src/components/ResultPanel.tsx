import RiskBadge from "./RiskBadge";
import RecommendationCard from "./RecommendationCard";
import { PredictionResponse } from "@/lib/types";

const FEATURE_LABELS: Record<string, string> = {
  Disease_Count: "Presence of infectious diseases",
  Mother_Education_Encoded: "Maternal education level",
  Age_Group_Encoded: "Age-related nutritional vulnerability",
  Wealth_Index_Encoded: "Household economic status",
  Weight_kg: "Low body weight",
  Height_cm: "Low height for age",
  BMI: "Body mass index",
};

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
            <div className="text-xs text-gray-500">Risk Probability</div>
            <div className="text-2xl font-semibold">
              {(data.risk_probability * 100).toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Created At</div>
            <div className="text-sm font-medium">{data.created_at}</div>
          </div>
        </div>

        <div className="card-body pt-0">
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">
              Why this result?
            </h3>

            {data.xai_text ? (
              <>
                <p className="mt-1 text-sm text-blue-800">{data.xai_text}</p>
                <div className="mt-1 text-xs italic text-blue-700">
                  Model-based explanation (XAI)
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-blue-800">
                  This assessment was determined using clinical rule-based
                  criteria. The child shows adequate growth indicators, no
                  active infections, and favorable socioeconomic conditions.
                </p>
                <div className="mt-1 text-xs italic text-blue-700">
                  Clinical rule-based assessment
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {data.xai?.top_factors && data.xai.top_factors.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Most influencing factors
          </h3>

          <ul className="mt-2 space-y-1 text-sm text-gray-800 list-disc list-inside">
            {data.xai.top_factors.map((factor, idx) => (
              <li key={idx}>
                {FEATURE_LABELS[factor.feature] ?? factor.feature}
              </li>
            ))}
          </ul>

          <div className="mt-1 text-xs italic text-gray-500">
            Factors ranked by contribution to this prediction
          </div>
        </div>
      )}

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
