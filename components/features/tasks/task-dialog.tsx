"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TaskFormFields,
  type AssigneeOption,
  type TaskFieldsDefaults,
} from "@/components/features/tasks/task-form-fields";
import {
  createTaskAction,
  updateTaskAction,
  type TaskActionResult,
} from "@/lib/actions/tasks";

interface CreateProps {
  mode: "create";
  projectId: string;
  assignees: AssigneeOption[];
  trigger?: React.ReactNode;
}

interface EditProps {
  mode: "edit";
  projectId: string;
  taskId: string;
  defaults: TaskFieldsDefaults;
  assignees: AssigneeOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
}

export function TaskDialog(props: CreateProps | EditProps) {
  if (props.mode === "create") return <CreateTaskDialog {...props} />;
  return <EditTaskDialog {...props} />;
}

function CreateTaskDialog({ projectId, assignees, trigger }: CreateProps) {
  const [open, setOpen] = useState(false);
  const action = createTaskAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState<TaskActionResult | null, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Task created");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    } else {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" /> New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Capture the work and assign it to a teammate.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <TaskFormFields assignees={assignees} disabled={pending} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTaskDialog({
  projectId,
  taskId,
  defaults,
  assignees,
  open,
  onOpenChange,
  canEdit,
}: EditProps) {
  const action = updateTaskAction.bind(null, taskId, projectId);
  const [state, formAction, pending] = useActionState<TaskActionResult | null, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Task updated");
      onOpenChange(false);
    } else {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{canEdit ? "Edit task" : "Task details"}</DialogTitle>
          <DialogDescription>
            {canEdit
              ? "Update the task details. Members can only edit tasks assigned to them."
              : "You don't have permission to edit this task. Ask a project admin or the assignee."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <TaskFormFields defaults={defaults} assignees={assignees} disabled={!canEdit || pending} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Close
            </Button>
            {canEdit && (
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
