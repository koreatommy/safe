import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/server/adminSession";
import { AdminPageClient } from "./AdminPageClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");
  return <AdminPageClient />;
}
