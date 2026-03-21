import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function BookCancelPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-400" />
        </div>
        <h1 className="font-display text-4xl font-light mb-3">Payment cancelled</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          No charge was made. You can go back and try again whenever you're ready.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/professionals">
            <Button className="w-full h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl">
              Back to professionals
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full h-12 rounded-xl">
              Go to my dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
