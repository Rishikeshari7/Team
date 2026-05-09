import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Task Manager",
  description: "Plan, assign, and track work across your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t py-3 text-center text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            Made with
            <Heart className="size-3 fill-red-500 text-red-500" />
            by Raj Mishra
          </span>
        </footer>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
