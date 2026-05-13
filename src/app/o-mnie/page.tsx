import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/site";
import { isSanityPreviewRequest } from "@/sanity/preview";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `${settings.aboutTitle} | ${settings.title}`,
    description: settings.description,
  };
}

export default async function AboutPage() {
  const isPreview = await isSanityPreviewRequest();
  const settings = await getSiteSettings(isPreview);

  return (
    <>
      <Header contact={settings.contact} />
      <main className="content-page">
        <div className="container content-page__inner">
          <h1 className="content-page__title animate-fade-in">{settings.aboutTitle}</h1>
          <div className="content-page__body animate-fade-in-delay-1">
            {settings.aboutContent.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
