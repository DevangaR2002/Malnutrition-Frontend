import PredictionForm from "@/components/PredictionForm";

export default function Home() {
  return (
    <main className="container-page">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Malnutrition Risk Prediction</h1>
        <p className="mt-1 text-sm text-gray-600">
          Predict child malnutrition risk using clinical and household
          indicators.
        </p>
      </div>

      <PredictionForm />
    </main>
  );
}
