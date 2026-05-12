import Header from "@/components/Header";
import { getSiteSettings } from "@/lib/site";
import { draftMode } from "next/headers";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `${settings.cvTitle} | ${settings.title}`,
    description: settings.description,
  };
}

export default async function CvPage() {
  const { isEnabled } = await draftMode();
  const settings = await getSiteSettings(isEnabled);

  return (
    <>
      <Header contact={settings.contact} />
      <main className="content-page">
        <div className="container content-page__inner">
          <h1 className="content-page__title animate-fade-in">{settings.cvTitle}</h1>
          <div className="content-page__body animate-fade-in-delay-1">
            {settings.cvContent.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {settings.cvFileUrl && (
              <p>
                <a className="content-page__link" href={settings.cvFileUrl} target="_blank" rel="noreferrer">
                  Pobierz CV
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
