import { client } from "@/sanity/lib/client";

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
    email: "weronika.grzesiowska@example.com",
    phone: "+48 123 456 789",
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

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const data = await client.fetch(`*[_type == "siteSettings"][0]{
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
    }`);

    if (data) {
      return {
        title: data.title || hardcodedSiteSettings.title,
        description: data.description || hardcodedSiteSettings.description,
        heroTitleLines: data.heroTitleLines?.length ? data.heroTitleLines : hardcodedSiteSettings.heroTitleLines,
        heroGreeting: data.heroGreeting || hardcodedSiteSettings.heroGreeting,
        heroBio: data.heroBio?.length ? data.heroBio : hardcodedSiteSettings.heroBio,
        projectsTitle: data.projectsTitle || hardcodedSiteSettings.projectsTitle,
        contact: {
          name: data.contactName || hardcodedSiteSettings.contact.name,
          email: data.contactEmail || hardcodedSiteSettings.contact.email,
          phone: data.contactPhone || hardcodedSiteSettings.contact.phone,
        },
        aboutTitle: data.aboutTitle || hardcodedSiteSettings.aboutTitle,
        aboutContent: data.aboutContent?.length ? data.aboutContent : hardcodedSiteSettings.aboutContent,
        cvTitle: data.cvTitle || hardcodedSiteSettings.cvTitle,
        cvContent: data.cvContent?.length ? data.cvContent : hardcodedSiteSettings.cvContent,
        cvFileUrl: data.cvFileUrl,
      };
    }
  } catch (error) {
    console.error("Error fetching site settings from Sanity:", error);
  }

  return hardcodedSiteSettings;
}
