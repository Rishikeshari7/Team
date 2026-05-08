"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createProjectAction, type ProjectActionResult } from "@/lib/actions/projects";

export function CreateProjectForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ProjectActionResult | null, FormData>(
    createProjectAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Project created");
      router.push(`/projects/${state.id}`);
    } else {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New project</CardTitle>
        <CardDescription>
          You&apos;ll be added as the project admin and can invite teammates next.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={80} disabled={pending} placeholder="Marketing site rebuild" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              maxLength={500}
              disabled={pending}
              placeholder="What is this project about?"
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
