import { getStorage } from "@/lib/storage";
import { readInbox } from "@/lib/brain/reader";
import { InboxManager } from "@/components/inbox/inbox-manager";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const files = await readInbox(getStorage());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Joris Inbox</h1>
        <p className="text-muted-foreground">
          Jedno miejsce na cały chaos. Wrzucasz surowe źródło, klikasz
          „Przetwórz” — i patrzysz, jak wiki się przebudowuje.
        </p>
      </div>
      <InboxManager files={files} />
    </div>
  );
}
