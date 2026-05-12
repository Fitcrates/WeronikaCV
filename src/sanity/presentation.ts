import { defineLocations } from 'sanity/presentation';

export const presentationLocations = {
  siteSettings: defineLocations({
    locations: [
      { title: 'Strona główna', href: '/' },
      { title: 'O mnie', href: '/o-mnie' },
      { title: 'CV', href: '/cv' },
    ],
  }),
  project: defineLocations({
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    resolve: (doc) => {
      if (!doc?.slug) {
        return {
          message: 'Dodaj slug projektu, aby zobaczyć podgląd strony.',
          tone: 'caution',
        };
      }

      return {
        locations: [
          { title: doc.title || 'Projekt', href: `/projekt/${doc.slug}` },
          { title: 'Strona główna', href: '/' },
        ],
      };
    },
  }),
};
