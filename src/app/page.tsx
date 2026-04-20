import { HomePageClient } from "./HomePageClient";

type PageProps = {
  params: Promise<Record<string, string | string[]>>;
};

export default async function HomePage({ params }: PageProps) {
  await params;
  return <HomePageClient />;
}
