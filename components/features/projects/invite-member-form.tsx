"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMemberAction, type MemberActionResult } from "@/lib/actions/members";

interface Props {
  projectId: string;
}

export function InviteMemberForm({ projectId }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = inviteMemberAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState<MemberActionResult | null, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Member added");
      formRef.current?.reset();
    } else {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
      <div className="grid gap-2">
        <Label htmlFor="invite-email">Invite by email</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder="teammate@example.com"
          required
          disabled={pending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="invite-role">Role</Label>
        <Select name="role" defaultValue="member" disabled={pending}>
          <SelectTrigger id="invite-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add member"}
      </Button>
    </form>
  );
}
