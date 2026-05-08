"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  signSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";
import { signupSchema, loginSchema } from "@/lib/validations/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function startSession(user: { id: string; email: string; name: string }) {
  const token = await signSession({ uid: user.id, email: user.email, name: user.name });
  await setSessionCookie(token);
}

export async function signupAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });
    await startSession(user);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, error: "An account with that email already exists." };
    }
    return { ok: false, error: err instanceof Error ? err.message : "Signup failed" };
  }

  redirect("/projects");
}

export async function loginAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }

  await startSession({ id: user.id, email: user.email, name: user.name });
  redirect("/projects");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
