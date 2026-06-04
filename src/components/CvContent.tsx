"use client";

import type { SiteSettings } from "@/lib/site";
import { preventOrphans } from "@/lib/typography";
import { useLanguage } from "./LanguageProvider";

interface CvContentProps {
  settings: SiteSettings;
}

export default function CvContent({ settings }: CvContentProps) {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const title = isEnglish ? settings.cvTitleEn : settings.cvTitle;
  const content = isEnglish ? settings.cvContentEn : settings.cvContent;
  const fileUrl = isEnglish ? settings.cvFileEnUrl || settings.cvFileUrl : settings.cvFileUrl;
  const titleEdit = isEnglish ? settings.cvTitleEnEdit : settings.cvTitleEdit;
  const contentEdits = isEnglish ? settings.cvContentEnEdits : settings.cvContentEdits;

  return (
    <div data-translate-ignore>
      <h1 className="content-page__title animate-fade-in" data-sanity={titleEdit}>
        {preventOrphans(title)}
      </h1>
      <div className="content-page__body animate-fade-in-delay-1">
        {content.map((paragraph, index) => (
          <p key={`${language}-${paragraph}-${index}`} data-sanity={contentEdits?.[index]}>
            {preventOrphans(paragraph)}
          </p>
        ))}
        {fileUrl && (
          <p>
            <a className="content-page__link" href={fileUrl} target="_blank" rel="noreferrer">
              {isEnglish ? "Download CV" : "Pobierz CV"}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
