import { defineField, defineType } from 'sanity';

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Ustawienia strony',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł strony',
      type: 'string',
      initialValue: 'Weronika Grzesiowska',
    }),
    defineField({
      name: 'description',
      title: 'Opis SEO',
      type: 'text',
    }),
    defineField({
      name: 'heroTitleLines',
      title: 'Nagłówek hero',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'heroGreeting',
      title: 'Przywitanie w hero',
      type: 'string',
    }),
    defineField({
      name: 'heroBio',
      title: 'Akapity bio w hero',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'projectsTitle',
      title: 'Tytuł sekcji projektów',
      type: 'string',
      initialValue: 'Projekty',
    }),
    defineField({
      name: 'contactName',
      title: 'Kontakt: imię i nazwisko',
      type: 'string',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Kontakt: email',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Kontakt: telefon',
      type: 'string',
    }),
    defineField({
      name: 'aboutTitle',
      title: 'O mnie: tytuł',
      type: 'string',
      initialValue: 'O mnie',
    }),
    defineField({
      name: 'aboutContent',
      title: 'O mnie: treść',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'cvTitle',
      title: 'CV: tytuł',
      type: 'string',
      initialValue: 'CV',
    }),
    defineField({
      name: 'cvContent',
      title: 'CV: treść',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'cvFile',
      title: 'CV: plik PDF',
      type: 'file',
      options: { accept: '.pdf' },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Ustawienia strony',
      };
    },
  },
});
