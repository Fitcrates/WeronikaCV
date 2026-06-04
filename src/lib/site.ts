import { sanityFetch } from "@/sanity/live";
import { createDataAttribute } from "next-sanity";
import { dataset, projectId } from "@/sanity/env";

export interface ContactInfo {
  nameEdit?: string;
  emailEdit?: string;
  phoneEdit?: string;
  name: string;
  email: string;
  phone: string;
}

export interface SiteSettings {
  titleEdit?: string;
  descriptionEdit?: string;
  heroTitleEdit?: string;
  heroTitleLineEdits?: (string | undefined)[];
  heroGreetingEdit?: string;
  heroBioEdits?: (string | undefined)[];
  projectsTitleEdit?: string;
  aboutTitleEdit?: string;
  aboutContentEdits?: (string | undefined)[];
  cvTitleEdit?: string;
  cvContentEdits?: (string | undefined)[];
  cvTitleEnEdit?: string;
  cvContentEnEdits?: (string | undefined)[];
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
  cvTitleEn: string;
  cvContentEn: string[];
  cvFileEnUrl?: string;
}

interface SanitySiteSettings {
  _id?: string;
  _type?: "siteSettings";
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
  cvTitleEn?: string;
  cvContentEn?: string[];
  cvFileEnUrl?: string;
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
  cvTitleEn: "CV",
  cvContentEn: [
    "The English CV can be managed in Sanity as text content and an optional PDF file.",
  ],
};

function createSiteSettingsEdit(settings: SanitySiteSettings, path: string) {
  if (!settings._id || !settings._type || !path) {
    return undefined;
  }

  return createDataAttribute({
    baseUrl: "/studio",
    dataset,
    id: settings._id,
    path,
    projectId,
    type: settings._type,
  }).toString();
}

function createArrayEditAttributes(settings: SanitySiteSettings, path: string, items?: unknown[]) {
  return items?.map((_, index) => createSiteSettingsEdit(settings, `${path}[${index}]`));
}

export async function getSiteSettings(preview = false): Promise<SiteSettings> {
  try {
    const { data } = await sanityFetch({
      query: `*[_type == "siteSettings"][0]{
      _id,
      _type,
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
      "cvFileUrl": cvFile.asset->url,
      cvTitleEn,
      cvContentEn,
      "cvFileEnUrl": cvFileEn.asset->url
    }`,
      perspective: preview ? undefined : "published",
      stega: preview ? undefined : false,
      tags: ["siteSettings"],
    });

    const settings = data as SanitySiteSettings | null;

    if (settings) {
      const heroTitleLines = settings.heroTitleLines?.length
        ? settings.heroTitleLines
        : hardcodedSiteSettings.heroTitleLines;
      const heroBio = settings.heroBio?.length ? settings.heroBio : hardcodedSiteSettings.heroBio;
      const aboutContent = settings.aboutContent?.length
        ? settings.aboutContent
        : hardcodedSiteSettings.aboutContent;
      const cvContent = settings.cvContent?.length ? settings.cvContent : hardcodedSiteSettings.cvContent;
      const cvContentEn = settings.cvContentEn?.length
        ? settings.cvContentEn
        : hardcodedSiteSettings.cvContentEn;

      return {
        titleEdit: createSiteSettingsEdit(settings, "title"),
        descriptionEdit: createSiteSettingsEdit(settings, "description"),
        heroTitleEdit: createSiteSettingsEdit(settings, "heroTitleLines"),
        heroTitleLineEdits: createArrayEditAttributes(settings, "heroTitleLines", heroTitleLines),
        heroGreetingEdit: createSiteSettingsEdit(settings, "heroGreeting"),
        heroBioEdits: createArrayEditAttributes(settings, "heroBio", heroBio),
        projectsTitleEdit: createSiteSettingsEdit(settings, "projectsTitle"),
        aboutTitleEdit: createSiteSettingsEdit(settings, "aboutTitle"),
        aboutContentEdits: createArrayEditAttributes(settings, "aboutContent", aboutContent),
        cvTitleEdit: createSiteSettingsEdit(settings, "cvTitle"),
        cvContentEdits: createArrayEditAttributes(settings, "cvContent", cvContent),
        cvTitleEnEdit: createSiteSettingsEdit(settings, "cvTitleEn"),
        cvContentEnEdits: createArrayEditAttributes(settings, "cvContentEn", cvContentEn),
        title: settings.title || hardcodedSiteSettings.title,
        description: settings.description || hardcodedSiteSettings.description,
        heroTitleLines,
        heroGreeting: settings.heroGreeting || hardcodedSiteSettings.heroGreeting,
        heroBio,
        projectsTitle: settings.projectsTitle || hardcodedSiteSettings.projectsTitle,
        contact: {
          nameEdit: createSiteSettingsEdit(settings, "contactName"),
          emailEdit: createSiteSettingsEdit(settings, "contactEmail"),
          phoneEdit: createSiteSettingsEdit(settings, "contactPhone"),
          name: settings.contactName || hardcodedSiteSettings.contact.name,
          email: settings.contactEmail || hardcodedSiteSettings.contact.email,
          phone: settings.contactPhone || hardcodedSiteSettings.contact.phone,
        },
        aboutTitle: settings.aboutTitle || hardcodedSiteSettings.aboutTitle,
        aboutContent,
        cvTitle: settings.cvTitle || hardcodedSiteSettings.cvTitle,
        cvContent,
        cvFileUrl: settings.cvFileUrl,
        cvTitleEn: settings.cvTitleEn || hardcodedSiteSettings.cvTitleEn,
        cvContentEn,
        cvFileEnUrl: settings.cvFileEnUrl,
      };
    }
  } catch (error) {
    console.error("Error fetching site settings from Sanity:", error);
  }

  return hardcodedSiteSettings;
}
