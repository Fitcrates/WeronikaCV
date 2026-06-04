import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CvContent from "@/components/CvContent";
import { getSiteSettings } from "@/lib/site";
import { isSanityPreviewRequest } from "@/sanity/preview";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `${settings.cvTitle} | ${settings.title}`,
    description: settings.description,
  };
}

export default async function CvPage() {
  const isPreview = await isSanityPreviewRequest();
  const settings = await getSiteSettings(isPreview);

  return (
    <>
      <Header contact={settings.contact} />
      <main className="content-page">
        <div className="container content-page__inner">
          <CvContent settings={settings} />
        </div>
      </main>
      <Footer />
    </>
  );
}
