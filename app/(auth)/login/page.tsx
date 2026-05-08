import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata = { title: "Sign in · Team Task Manager" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
