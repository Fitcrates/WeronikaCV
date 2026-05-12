import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/site";
import { draftMode } from "next/headers";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `${settings.title} | Portfolio`,
    description: settings.description,
  };
}

export default async function Home() {
  const { isEnabled } = await draftMode();
  const settings = await getSiteSettings(isEnabled);

  return (
    <>
      <Header contact={settings.contact} />
      <main>
        <Hero settings={settings} />
        <ProjectGrid title={settings.projectsTitle} preview={isEnabled} />
      </main>
      <Footer />
    </>
  );
}
