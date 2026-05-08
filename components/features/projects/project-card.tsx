import Link from "next/link";
import { ArrowRight, Crown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectRole } from "@/types/database";

interface Props {
  id: string;
  name: string;
  description: string | null;
  role: ProjectRole;
  taskCount?: number;
  memberCount?: number;
}

export function ProjectCard({ id, name, description, role, taskCount, memberCount }: Props) {
  return (
    <Link href={`/projects/${id}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1">{name}</CardTitle>
            <Badge variant={role === "admin" ? "default" : "secondary"} className="shrink-0">
              {role === "admin" ? (
                <span className="flex items-center gap-1">
                  <Crown className="size-3" /> Admin
                </span>
              ) : (
                "Member"
              )}
            </Badge>
          </div>
          {description ? (
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          ) : (
            <CardDescription className="italic text-muted-foreground/70">No description</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" /> {memberCount ?? 0} {memberCount === 1 ? "member" : "members"}
          </span>
          <span>·</span>
          <span>
            {taskCount ?? 0} {taskCount === 1 ? "task" : "tasks"}
          </span>
        </CardContent>
        <CardFooter className="text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open project <ArrowRight className="ml-1 size-4" />
        </CardFooter>
      </Card>
    </Link>
  );
}
