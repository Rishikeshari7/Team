"use client";

import { useTransition } from "react";
import { Trash2, Crown } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  removeMemberAction,
  updateMemberRoleAction,
} from "@/lib/actions/members";
import type { ProjectRole } from "@/types/database";

interface Props {
  projectId: string;
  userId: string;
  name: string;
  email: string;
  role: ProjectRole;
  canManage: boolean;
  isSelf: boolean;
}

export function MemberRow({
  projectId,
  userId,
  name,
  email,
  role,
  canManage,
  isSelf,
}: Props) {
  const [pending, startTransition] = useTransition();
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function setRole(newRole: ProjectRole) {
    if (newRole === role) return;
    startTransition(async () => {
      try {
        await updateMemberRoleAction(projectId, userId, newRole);
        toast.success("Role updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update");
      }
    });
  }

  function remove() {
    if (!confirm(`Remove ${name} from this project?`)) return;
    startTransition(async () => {
      try {
        await removeMemberAction(projectId, userId);
        toast.success("Member removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove");
      }
    });
  }

  return (
    <TableRow className={pending ? "opacity-60" : undefined}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium leading-tight">
              {name}
              {isSelf && (
                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {canManage && !isSelf ? (
          <Select value={role} onValueChange={(v) => setRole(v as ProjectRole)} disabled={pending}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role === "admin" ? (
              <span className="flex items-center gap-1">
                <Crown className="size-3" /> Admin
              </span>
            ) : (
              "Member"
            )}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {canManage && !isSelf && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={remove}
            disabled={pending}
            aria-label={`Remove ${name}`}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
