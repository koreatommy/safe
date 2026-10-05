import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/server/adminSession";
import { LoginPageClient } from "./LoginPageClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdminRequest()) redirect("/admin");
  return <LoginPageClient />;
}
