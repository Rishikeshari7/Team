"use client";

import { useTransition, useState } from "react";
import { CalendarClock, MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/lib/actions/tasks";
import { formatDueDate, isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus, TaskWithAssignee } from "@/types/database";
import { TaskDialog } from "@/components/features/tasks/task-dialog";
import type { AssigneeOption } from "@/components/features/tasks/task-form-fields";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

interface Props {
  task: TaskWithAssignee;
  projectId: string;
  assignees: AssigneeOption[];
  isAdmin: boolean;
  currentUserId: string;
}

export function TaskCard({ task, projectId, assignees, isAdmin, currentUserId }: Props) {
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const isAssignee = task.assigneeId === currentUserId;
  const canEdit = isAdmin || isAssignee;
  const dueIso = task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null;
  const overdue = isOverdue(dueIso, task.status);
  const dueLabel = formatDueDate(dueIso);
  const initials = task.assignee?.name
    ? task.assignee.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  function changeStatus(status: TaskStatus) {
    if (!canEdit || status === task.status) return;
    startTransition(async () => {
      try {
        await updateTaskStatusAction(task.id, projectId, status);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update status");
      }
    });
  }

  function deleteTask() {
    if (!isAdmin) return;
    if (!confirm("Delete this task? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteTaskAction(task.id, projectId);
        toast.success("Task deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  return (
    <>
      <Card
        className={cn(
          "p-3 cursor-pointer hover:shadow-md transition-shadow space-y-2",
          pending && "opacity-60",
        )}
        onClick={() => setEditOpen(true)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium leading-snug line-clamp-2">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => e.stopPropagation()}
                disabled={pending || !canEdit}
                aria-label="Task actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {(["todo", "in_progress", "done"] as TaskStatus[]).map((s) => (
                <DropdownMenuItem
                  key={s}
                  disabled={s === task.status}
                  onSelect={() => changeStatus(s)}
                >
                  Move to {STATUS_LABELS[s]}
                </DropdownMenuItem>
              ))}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={deleteTask} className="text-destructive">
                    <Trash2 className="size-4" /> Delete task
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("border-0", PRIORITY_STYLES[task.priority])}>
            {task.priority}
          </Badge>
          {dueLabel && (
            <Badge
              variant={overdue ? "destructive" : "outline"}
              className="font-normal"
            >
              {overdue ? <AlertTriangle className="size-3" /> : <CalendarClock className="size-3" />}
              {dueLabel}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[140px]">
              {task.assignee?.name ?? "Unassigned"}
            </span>
          </div>
        </div>
      </Card>

      <TaskDialog
        mode="edit"
        projectId={projectId}
        taskId={task.id}
        defaults={{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: dueIso,
          assigneeId: task.assigneeId,
        }}
        assignees={assignees}
        open={editOpen}
        onOpenChange={setEditOpen}
        canEdit={canEdit}
      />
    </>
  );
}
