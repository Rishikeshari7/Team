"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { getMembership, requireAdmin, requireMembership } from "@/lib/auth/authz";
import { taskSchema, taskStatusEnum } from "@/lib/validations/task";

export type TaskActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

const NONE = "__none__";

function parseAssignee(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString();
  if (!s || s === NONE) return null;
  return s;
}

function parseDueDate(v: FormDataEntryValue | null): Date | null {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  // Stored as DATE in Postgres; passing ISO string with T00:00:00Z keeps it stable.
  return new Date(`${s}T00:00:00Z`);
}

export async function createTaskAction(
  projectId: string,
  _: TaskActionResult | null,
  formData: FormData,
): Promise<TaskActionResult> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    due_date: formData.get("due_date"),
    assignee_id: parseAssignee(formData.get("assignee_id")) ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const me = await requireUser();
  await requireMembership(projectId, me.id);

  const task = await prisma.task.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseDueDate(formData.get("due_date")),
      assigneeId: parseAssignee(formData.get("assignee_id")),
      createdById: me.id,
    },
    select: { id: true },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { ok: true, id: task.id };
}

export async function updateTaskAction(
  taskId: string,
  projectId: string,
  _: TaskActionResult | null,
  formData: FormData,
): Promise<TaskActionResult> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    due_date: formData.get("due_date"),
    assignee_id: parseAssignee(formData.get("assignee_id")) ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const me = await requireUser();
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, assigneeId: true },
  });
  if (!existing) return { ok: false, error: "Task not found" };

  const membership = await getMembership(existing.projectId, me.id);
  if (!membership) return { ok: false, error: "Not a member of this project" };
  const canEdit = membership.role === "admin" || existing.assigneeId === me.id;
  if (!canEdit) return { ok: false, error: "You can only edit tasks assigned to you." };

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseDueDate(formData.get("due_date")),
      assigneeId: parseAssignee(formData.get("assignee_id")),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTaskStatusAction(
  taskId: string,
  projectId: string,
  rawStatus: string,
) {
  const status = taskStatusEnum.parse(rawStatus);
  const me = await requireUser();
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, assigneeId: true },
  });
  if (!existing) throw new Error("Task not found");

  const membership = await getMembership(existing.projectId, me.id);
  if (!membership) throw new Error("Not a member of this project");
  const canEdit = membership.role === "admin" || existing.assigneeId === me.id;
  if (!canEdit) throw new Error("You can only update tasks assigned to you.");

  await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const me = await requireUser();
  await requireAdmin(projectId, me.id);
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}
