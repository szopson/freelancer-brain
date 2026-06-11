// Adapter storage: ścieżki logiczne względem korzenia danych demo,
// np. "inbox/2026-06-10-mail.txt" albo "brain/clients/outlet-pro.md".
export interface Storage {
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, content: string): Promise<void>;
  appendFile(path: string, content: string): Promise<void>;
  listFiles(prefix: string): Promise<string[]>;
  deleteFile(path: string): Promise<void>;
  deletePrefix(prefix: string): Promise<void>;
}
