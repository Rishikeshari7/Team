// Domain types — re-exported from Prisma so the rest of the app stays pure TS.
import type { Prisma, Role, TaskStatus as PrismaTaskStatus, TaskPriority as PrismaTaskPriority, User, Project, ProjectMember, Task } from "@prisma/client";

export type ProjectRole = Role;
export type TaskStatus = PrismaTaskStatus;
export type TaskPriority = PrismaTaskPriority;

export type Profile = Pick<User, "id" | "name" | "email">;

export type { User, Project, ProjectMember, Task };

export interface ProjectWithRole extends Project {
  role: ProjectRole;
  member_count?: number;
  task_count?: number;
}

export type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: { assignee: { select: { id: true; name: true; email: true } } };
}>;

export type MemberWithProfile = Prisma.ProjectMemberGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } } };
}>;
