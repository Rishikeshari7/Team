import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <FolderPlus className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No projects yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first project to start organizing tasks and inviting your team.
      </p>
      <Button asChild className="mt-6">
        <Link href="/projects/new">Create a project</Link>
      </Button>
    </div>
  );
}
