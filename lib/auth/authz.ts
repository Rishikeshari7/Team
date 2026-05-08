import "server-only";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function getMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });
}

export async function requireMembership(projectId: string, userId: string) {
  const m = await getMembership(projectId, userId);
  if (!m) throw new Error("Not a member of this project");
  return m;
}

export async function requireAdmin(projectId: string, userId: string) {
  const m = await getMembership(projectId, userId);
  if (!m) throw new Error("Not a member of this project");
  if (m.role !== "admin") throw new Error("Admin permission required");
  return m;
}

export function isAdminRole(role: Role) {
  return role === "admin";
}
