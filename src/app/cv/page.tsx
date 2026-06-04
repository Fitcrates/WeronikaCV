import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/site";
import { preventOrphans } from "@/lib/typography";
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
          <h1 className="content-page__title animate-fade-in" 
          data-sanity={settings.cvTitleEdit}
          
          >
            {preventOrphans(settings.cvTitle)}
          </h1>
          <div className="content-page__body animate-fade-in-delay-1">
            {settings.cvContent.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} 
              data-sanity={settings.cvContentEdits?.[index]}
              style={{ marginBottom: 48 }}>
                {preventOrphans(paragraph)}
              </p>
            ))}
            <div className="content-page__downloads">
              {settings.cvFileUrl && (
                <p>
                  Pobierz wersję:{" "}
                  <a className="content-page__link" href={settings.cvFileUrl} target="_blank" rel="noreferrer">
                    polską
                  </a>
                </p>
              )}
              {settings.cvFileEnUrl && (
                <p>
                  Pobierz wersję:{" "}
                  <a className="content-page__link" href={settings.cvFileEnUrl} target="_blank" rel="noreferrer">
                    angielską
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
