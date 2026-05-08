"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { requireAdmin } from "@/lib/auth/authz";
import { inviteMemberSchema } from "@/lib/validations/project";

export type MemberActionResult = { ok: true } | { ok: false; error: string };

export async function inviteMemberAction(
  projectId: string,
  _: MemberActionResult | null,
  formData: FormData,
): Promise<MemberActionResult> {
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "member",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const me = await requireUser();
  await requireAdmin(projectId, me.id);

  const target = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (!target) {
    return {
      ok: false,
      error: "No user with that email. Ask them to sign up first, then invite again.",
    };
  }

  try {
    await prisma.projectMember.create({
      data: {
        projectId,
        userId: target.id,
        role: parsed.data.role,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, error: "That user is already a member of this project." };
    }
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }

  revalidatePath(`/projects/${projectId}/members`);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function removeMemberAction(projectId: string, userId: string) {
  const me = await requireUser();
  await requireAdmin(projectId, me.id);

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
  revalidatePath(`/projects/${projectId}/members`);
  revalidatePath(`/projects/${projectId}`);
}

export async function updateMemberRoleAction(
  projectId: string,
  userId: string,
  role: "admin" | "member",
) {
  const me = await requireUser();
  await requireAdmin(projectId, me.id);

  await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
  });
  revalidatePath(`/projects/${projectId}/members`);
}
