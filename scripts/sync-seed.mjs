// Lokalny reset: kopiuje seed/ → data/ (kanoniczny stan startowy demo).
// Użycie: npm run seed
import { cp, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seed = path.join(root, "seed");
const data = path.join(root, "data");

await rm(data, { recursive: true, force: true });
await mkdir(data, { recursive: true });
await cp(seed, data, { recursive: true });

console.log("✓ data/ przywrócone do stanu seed/");
