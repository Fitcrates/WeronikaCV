import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getSiteSettings } from "@/lib/site";
import { preventOrphans } from "@/lib/typography";
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
          <h1 className="content-page__title animate-fade-in" data-sanity={settings.aboutTitleEdit}>
            {preventOrphans(settings.aboutTitle)}
          </h1>
          <div className="about-page__layout animate-fade-in-delay-1">
            <div className="content-page__body about-page__body">
              {settings.aboutContent.map((paragraph, index) => (
                <p key={`${paragraph}-${index}`} data-sanity={settings.aboutContentEdits?.[index]}>
                  {preventOrphans(paragraph)}
                </p>
              ))}
            </div>
            {settings.aboutImage && (
              <div className="about-page__image-wrap" data-sanity={settings.aboutImage.edit}>
                <Image
                  src={settings.aboutImage.src}
                  alt={settings.aboutImage.alt}
                  width={settings.aboutImage.width || 520}
                  height={settings.aboutImage.height || 650}
                  className="about-page__image"
                  sizes="(max-width: 768px) 100vw, 420px"
                  placeholder={settings.aboutImage.lqip ? "blur" : "empty"}
                  blurDataURL={settings.aboutImage.lqip}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
