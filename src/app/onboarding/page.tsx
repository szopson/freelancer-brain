import Link from "next/link";
import { Brain } from "lucide-react";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getStorage } from "@/lib/storage";
import { readInbox } from "@/lib/brain/reader";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const inbox = await readInbox(getStorage());
  const seedFiles = inbox.map((f) => f.path);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="size-5 text-primary" />
          <span className="font-semibold tracking-tight">FreelancerBrain</span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Godzina do porządku. Zaczynamy.
            </h1>
            <p className="mt-1 text-muted-foreground">
              Pięć kroków — i Joris przejmuje pilnowanie twoich projektów.
            </p>
          </div>
          <OnboardingWizard seedFiles={seedFiles} />
        </div>
      </main>
    </div>
  );
}
