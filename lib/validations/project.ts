import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: z.enum(["admin", "member"]).default("member"),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
