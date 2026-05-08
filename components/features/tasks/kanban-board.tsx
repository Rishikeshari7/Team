"use client";

import { useMemo } from "react";
import { CheckSquare2, Circle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/features/tasks/task-card";
import type { AssigneeOption } from "@/components/features/tasks/task-form-fields";
import type { TaskStatus, TaskWithAssignee } from "@/types/database";

interface Props {
  tasks: TaskWithAssignee[];
  projectId: string;
  assignees: AssigneeOption[];
  isAdmin: boolean;
  currentUserId: string;
}

const COLUMNS: { id: TaskStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "todo", label: "To Do", icon: Circle },
  { id: "in_progress", label: "In Progress", icon: Loader2 },
  { id: "done", label: "Done", icon: CheckSquare2 },
];

export function KanbanBoard({ tasks, projectId, assignees, isAdmin, currentUserId }: Props) {
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, TaskWithAssignee[]> = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map(({ id, label, icon: Icon }) => (
        <div key={id} className="rounded-lg border bg-muted/30 p-3 flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between px-1 pb-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Icon className="size-4 text-muted-foreground" />
              {label}
            </div>
            <Badge variant="secondary" className="font-normal">
              {grouped[id].length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {grouped[id].length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-1 py-4 text-center">
                No tasks here.
              </p>
            ) : (
              grouped[id].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  assignees={assignees}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
