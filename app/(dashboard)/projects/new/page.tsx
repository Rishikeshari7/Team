import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateProjectForm } from "@/components/features/projects/create-project-form";

export const metadata = { title: "New project · Team Task Manager" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All projects
      </Link>
      <CreateProjectForm />
    </div>
  );
}
