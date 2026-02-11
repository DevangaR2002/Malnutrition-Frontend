import Link from "next/link";

export default function Navbar() {
  return (
    <div className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Malnutrition Risk
        </Link>
        <div className="flex gap-3 text-sm">
          <Link href="/" className="hover:underline">
            Predict
          </Link>
          <Link href="/history" className="hover:underline">
            History
          </Link>
        </div>
      </div>
    </div>
  );
}
