import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { KanbanBoard } from "@/components/features/tasks/kanban-board";
import { TaskDialog } from "@/components/features/tasks/task-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      members: {
        select: {
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: { assignee: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!project) notFound();

  const myMembership = project.members.find((m) => m.userId === user.id);
  if (!myMembership) notFound();

  const isAdmin = myMembership.role === "admin";
  const assignees = project.members.map((m) => ({ id: m.user.id, name: m.user.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Admin" : "Member"}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${id}/members`}>
              <Users className="size-4" /> Members
              <Badge variant="secondary" className="ml-1 font-normal">
                {project.members.length}
              </Badge>
            </Link>
          </Button>
          <TaskDialog mode="create" projectId={id} assignees={assignees} />
        </div>
      </div>

      <KanbanBoard
        tasks={project.tasks}
        projectId={id}
        assignees={assignees}
        isAdmin={isAdmin}
        currentUserId={user.id}
      />

      {!isAdmin && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Settings2 className="size-3" /> You can update tasks assigned to you. Ask an admin to manage other tasks.
        </p>
      )}
    </div>
  );
}
