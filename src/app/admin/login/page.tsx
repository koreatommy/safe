import { LoginPageClient } from "./LoginPageClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<Record<string, string | string[]>>;
};

export default async function LoginPage({ params }: PageProps) {
  await params;
  return <LoginPageClient />;
}
