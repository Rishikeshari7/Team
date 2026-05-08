"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { requireAdmin } from "@/lib/auth/authz";
import { projectSchema } from "@/lib/validations/project";

export type ProjectActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createProjectAction(
  _: ProjectActionResult | null,
  formData: FormData,
): Promise<ProjectActionResult> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await requireUser();

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      createdById: user.id,
      members: {
        create: { userId: user.id, role: "admin" },
      },
    },
    select: { id: true },
  });

  revalidatePath("/projects");
  return { ok: true, id: project.id };
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireUser();
  await requireAdmin(projectId, user.id);

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/projects");
  redirect("/projects");
}
