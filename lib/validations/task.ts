import { z } from "zod";

export const taskStatusEnum = z.enum(["todo", "in_progress", "done"]);
export const taskPriorityEnum = z.enum(["low", "medium", "high"]);

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  status: taskStatusEnum.default("todo"),
  priority: taskPriorityEnum.default("medium"),
  due_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-MM-dd")
    .optional()
    .or(z.literal("")),
  assignee_id: z.string().uuid().optional().or(z.literal("")),
});

export const taskStatusSchema = z.object({
  id: z.string().uuid(),
  status: taskStatusEnum,
});

export type TaskInput = z.infer<typeof taskSchema>;
