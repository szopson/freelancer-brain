import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto mt-4 flex h-13 max-w-5xl items-center justify-between rounded-2xl glass px-4 backdrop-saturate-150 sm:mx-6 lg:mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <Brain className="size-5 text-primary" />
          <span className="font-display text-sm font-medium tracking-tight gradient-text">
            FreelancerBrain
          </span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
            LIGHT · demo
          </span>
        </Link>
        <nav className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            render={<Link href="/app/brief" />}
          >
            Demo
          </Button>
          <Button size="sm" render={<Link href="/onboarding" />}>
            Zacznij <ArrowRight className="size-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
