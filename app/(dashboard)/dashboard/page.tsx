import Link from "next/link";
import {
  AlertTriangle,
  CheckSquare2,
  Circle,
  ListTodo,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { StatCard } from "@/components/features/dashboard/stat-card";
import {
  AssigneeBarChart,
  StatusPieChart,
} from "@/components/features/dashboard/charts";
import { formatDueDate, isOverdue } from "@/lib/date";

export const metadata = { title: "Dashboard · Team Task Manager" };

function isoDate(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : null;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const tasks = await prisma.task.findMany({
    where: { project: { members: { some: { userId: user.id } } } },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }],
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      projectId: true,
      assignee: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  const totals = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => isOverdue(isoDate(t.dueDate), t.status)).length,
  };

  const statusData = [
    { name: "To Do", value: totals.todo },
    { name: "In Progress", value: totals.in_progress },
    { name: "Done", value: totals.done },
  ];

  const byAssignee = new Map<string, { name: string; count: number }>();
  for (const t of tasks) {
    if (!t.assignee) continue;
    const current = byAssignee.get(t.assignee.id) ?? { name: t.assignee.name, count: 0 };
    current.count += 1;
    byAssignee.set(t.assignee.id, current);
  }
  const assigneeData = Array.from(byAssignee.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const overdue = tasks.filter((t) => isOverdue(isoDate(t.dueDate), t.status)).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A live snapshot of work across all your projects.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={totals.total} icon={ListTodo} />
        <StatCard label="To Do" value={totals.todo} icon={Circle} />
        <StatCard label="In Progress" value={totals.in_progress} icon={Loader2} accent="text-blue-600" />
        <StatCard label="Done" value={totals.done} icon={CheckSquare2} accent="text-emerald-600" />
        <StatCard label="Overdue" value={totals.overdue} icon={AlertTriangle} accent="text-red-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by status</CardTitle>
            <CardDescription>Distribution across all your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={statusData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks per assignee</CardTitle>
            <CardDescription>Who has the most work in flight.</CardDescription>
          </CardHeader>
          <CardContent>
            <AssigneeBarChart data={assigneeData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-600" />
            Overdue tasks
          </CardTitle>
          <CardDescription>
            {overdue.length === 0
              ? "Nothing is overdue. Nice."
              : "These need attention now."}
          </CardDescription>
        </CardHeader>
        {overdue.length > 0 && (
          <CardContent>
            <ul className="divide-y">
              {overdue.map((t) => (
                <li key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/projects/${t.projectId}`}
                      className="font-medium hover:underline line-clamp-1"
                    >
                      {t.title}
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{t.project?.name ?? "Project"}</span>
                      <span>·</span>
                      <span>{t.assignee?.name ?? "Unassigned"}</span>
                    </div>
                  </div>
                  <Badge variant="destructive" className="shrink-0">
                    Due {formatDueDate(isoDate(t.dueDate))}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
