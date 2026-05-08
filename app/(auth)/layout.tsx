import Link from "next/link";
import { CheckSquare2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <CheckSquare2 className="size-6 text-primary" />
        Team Task Manager
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
