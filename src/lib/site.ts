import { sanityFetch } from "@/sanity/live";

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface SiteSettings {
  title: string;
  description: string;
  heroTitleLines: string[];
  heroGreeting: string;
  heroBio: string[];
  projectsTitle: string;
  contact: ContactInfo;
  aboutTitle: string;
  aboutContent: string[];
  cvTitle: string;
  cvContent: string[];
  cvFileUrl?: string;
}

interface SanitySiteSettings {
  title?: string;
  description?: string;
  heroTitleLines?: string[];
  heroGreeting?: string;
  heroBio?: string[];
  projectsTitle?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  aboutTitle?: string;
  aboutContent?: string[];
  cvTitle?: string;
  cvContent?: string[];
  cvFileUrl?: string;
}

export const hardcodedSiteSettings: SiteSettings = {
  title: "Weronika Grzesiowska",
  description: "Portfolio projektowe Weroniki Grzesiowskiej — grafika, ilustracja, branding.",
  heroTitleLines: ["Weronika", "Grzesiowska"],
  heroGreeting: "Cześć! ;-)",
  heroBio: [
    "Jestem absolwentką komunikacji wizerunkowej na UWr i projektantką z Wrocławia. Na co dzień zajmuję się grafiką komputerową i tworzeniem komunikacji.",
    "Lubię gołębie.",
  ],
  projectsTitle: "Projekty",
  contact: {
    name: "Weronika Grzesiowska",
    email: "weronikagrzesiowska@gmail.com",
    phone: "+48 732 252 434",
  },
  aboutTitle: "O mnie",
  aboutContent: [
    "Jestem projektantką z Wrocławia. Zajmuję się grafiką komputerową, identyfikacją wizualną i komunikacją marek.",
    "Ta treść jest placeholderem developerskim i może zostać zastąpiona w Sanity Studio.",
  ],
  cvTitle: "CV",
  cvContent: [
    "CV może być zarządzane z poziomu Sanity jako opis tekstowy oraz opcjonalny plik PDF.",
  ],
};

export async function getSiteSettings(preview = false): Promise<SiteSettings> {
  try {
    const { data } = await sanityFetch({
      query: `*[_type == "siteSettings"][0]{
      title,
      description,
      heroTitleLines,
      heroGreeting,
      heroBio,
      projectsTitle,
      contactName,
      contactEmail,
      contactPhone,
      aboutTitle,
      aboutContent,
      cvTitle,
      cvContent,
      "cvFileUrl": cvFile.asset->url
    }`,
      perspective: preview ? "drafts" : "published",
      stega: preview,
      tags: ["siteSettings"],
    });

    const settings = data as SanitySiteSettings | null;

    if (settings) {
      return {
        title: settings.title || hardcodedSiteSettings.title,
        description: settings.description || hardcodedSiteSettings.description,
        heroTitleLines: settings.heroTitleLines?.length ? settings.heroTitleLines : hardcodedSiteSettings.heroTitleLines,
        heroGreeting: settings.heroGreeting || hardcodedSiteSettings.heroGreeting,
        heroBio: settings.heroBio?.length ? settings.heroBio : hardcodedSiteSettings.heroBio,
        projectsTitle: settings.projectsTitle || hardcodedSiteSettings.projectsTitle,
        contact: {
          name: settings.contactName || hardcodedSiteSettings.contact.name,
          email: settings.contactEmail || hardcodedSiteSettings.contact.email,
          phone: settings.contactPhone || hardcodedSiteSettings.contact.phone,
        },
        aboutTitle: settings.aboutTitle || hardcodedSiteSettings.aboutTitle,
        aboutContent: settings.aboutContent?.length ? settings.aboutContent : hardcodedSiteSettings.aboutContent,
        cvTitle: settings.cvTitle || hardcodedSiteSettings.cvTitle,
        cvContent: settings.cvContent?.length ? settings.cvContent : hardcodedSiteSettings.cvContent,
        cvFileUrl: settings.cvFileUrl,
      };
    }
  } catch (error) {
    console.error("Error fetching site settings from Sanity:", error);
  }

  return hardcodedSiteSettings;
}
