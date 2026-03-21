"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export function DashboardLogout() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="gap-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
    >
      <LogOut size={15} />
      Sign out
    </Button>
  );
}
