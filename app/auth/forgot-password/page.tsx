import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-6">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--terra-light)] flex items-center justify-center mx-auto mb-6">
          <Mail size={24} className="text-[var(--terra)]" />
        </div>
        <h1 className="font-display text-3xl font-light mb-2">Forgot your password?</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Password reset by email is coming soon. For now, please contact us and we&apos;ll help you regain access.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/contact">
            <Button className="w-full h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl">
              Contact support
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full h-12 rounded-xl">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
