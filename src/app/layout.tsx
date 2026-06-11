import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FreelancerBrain — Drugi Mózg dla solo-konsultanta",
  description:
    "Pilnuję twoich projektów i zobowiązań. Wrzuć chaos — maile, notatki, eksporty rozmów — a Joris zbuduje z nich żywą pamięć twojej firmy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans grain">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
