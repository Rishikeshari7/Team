import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { ProjectCard } from "@/components/features/projects/project-card";
import { ProjectsEmptyState } from "@/components/features/projects/empty-state";

export const metadata = { title: "Projects · Team Task Manager" };

export default async function ProjectsPage() {
  const user = await requireUser();

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    orderBy: { joinedAt: "desc" },
    select: {
      role: true,
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { members: true, tasks: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            All the projects you&apos;re a member of.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="size-4" /> New project
          </Link>
        </Button>
      </div>

      {memberships.length === 0 ? (
        <ProjectsEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ role, project: p }) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              role={role}
              taskCount={p._count.tasks}
              memberCount={p._count.members}
            />
          ))}
        </div>
      )}
    </div>
  );
}
