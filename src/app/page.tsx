import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/site";
import { isSanityPreviewRequest } from "@/sanity/preview";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `${settings.title} | Portfolio`,
    description: settings.description,
  };
}

export default async function Home() {
  const isPreview = await isSanityPreviewRequest();
  const settings = await getSiteSettings(isPreview);

  return (
    <>
      <Header contact={settings.contact} />
      <main>
        <Hero settings={settings} />
        <ProjectGrid title={settings.projectsTitle} preview={isPreview} />
      </main>
      <Footer />
    </>
  );
}
