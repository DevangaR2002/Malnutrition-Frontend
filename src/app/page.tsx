import PredictionForm from "@/components/PredictionForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
        <PredictionForm />
      </main>
    </ProtectedRoute>
  );
}
