export default function RiskBadge({ riskLevel }: { riskLevel: string }) {
  const isHigh = riskLevel?.toLowerCase().includes("high");
  return (
    <span
      className={`badge ${isHigh ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
    >
      {riskLevel || "Unknown"}
    </span>
  );
}
