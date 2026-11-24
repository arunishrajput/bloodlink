import Link from "next/link";
import { DEMO_MODE } from "@/lib/demo";

export function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs text-white">
      <strong>Demo:</strong> blood bank details are real public data; stock levels, donors, camps and requests are simulated.{" "}
      <Link href="/login" className="underline">Try a demo sign-in</Link>
    </div>
  );
}
