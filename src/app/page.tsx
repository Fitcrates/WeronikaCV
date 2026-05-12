import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import { getSiteSettings } from "@/lib/site";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `${settings.title} | Portfolio`,
    description: settings.description,
  };
}

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header contact={settings.contact} />
      <main>
        <Hero settings={settings} />
        <ProjectGrid title={settings.projectsTitle} />
      </main>
    </>
  );
}
