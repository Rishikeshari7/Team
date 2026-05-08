import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { InviteMemberForm } from "@/components/features/projects/invite-member-form";
import { MemberRow } from "@/components/features/projects/member-row";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectMembersPage({ params }: PageProps) {
  const { id } = await params;
  const me = await requireUser();

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      members: {
        orderBy: { joinedAt: "asc" },
        select: {
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!project) notFound();

  const myMembership = project.members.find((m) => m.userId === me.id);
  if (!myMembership) notFound();

  const isAdmin = myMembership.role === "admin";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to {project.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">
          Admins can invite teammates and manage roles.
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a teammate</CardTitle>
            <CardDescription>
              They must already have an account. Send them the signup link first if they don&apos;t.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteMemberForm projectId={id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team ({project.members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.members.map((m) => (
                <MemberRow
                  key={m.userId}
                  projectId={id}
                  userId={m.userId}
                  name={m.user.name}
                  email={m.user.email}
                  role={m.role}
                  canManage={isAdmin}
                  isSelf={m.userId === me.id}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
