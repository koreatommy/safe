import { AdminPageClient } from "./AdminPageClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<Record<string, string | string[]>>;
};

export default async function AdminPage({ params }: PageProps) {
  await params;
  return <AdminPageClient />;
}
