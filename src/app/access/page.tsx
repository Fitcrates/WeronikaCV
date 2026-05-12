import AccessForm from "@/components/AccessForm";
import { getSiteSettings } from "@/lib/site";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `Dostęp | ${settings.title}`,
    description: "Strona portfolio z ograniczonym dostępem.",
  };
}

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const settings = await getSiteSettings();
  const { from } = await searchParams;
  const redirectTo = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";

  return (
    <main className="access-page">
      <section className="access-card animate-fade-in">
        <p className="access-card__eyebrow">Ograniczony dostęp</p>
        <h1 className="access-card__title">{settings.title}</h1>
        <p className="access-card__text">
          To portfolio jest udostępniane wybranemu gronu. Wpisz hasło, aby zobaczyć zawartość.
        </p>
        <AccessForm redirectTo={redirectTo} />
      </section>
    </main>
  );
}
