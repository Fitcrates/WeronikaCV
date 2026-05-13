import { defineType, defineField } from 'sanity';
import FolderColorInput from '../components/FolderColorInput';

export const projectType = defineType({
  name: 'project',
  title: 'Projekt',
  type: 'document',
  groups: [
    { name: 'content', title: 'Treść', default: true },
    { name: 'media', title: 'Media i galeria' },
    { name: 'settings', title: 'Ustawienia' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł projektu',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'settings',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'thumbnail',
      title: 'Miniatura (na stronie głównej)',
      type: 'image',
      group: 'media',
      description: 'Wybierz z biblioteki Media. Hurtowy upload i tagowanie plików są w narzędziu Media w lewym menu Studio.',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Kolejność na stronie głównej',
      type: 'number',
      group: 'settings',
      initialValue: 0,
    }),
    defineField({
      name: 'folderColor',
      title: 'Kolor folderu',
      type: 'string',
      group: 'settings',
      description: 'Wybierz kolor z palety albo wpisz własny kod HEX.',
      components: {
        input: FolderColorInput,
      },
      validation: Rule => Rule.required().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, {
        name: 'hex color',
        invert: false,
      })
    }),
    defineField({
      name: 'description',
      title: 'Opis projektu',
      type: 'text',
      group: 'content',
    }),
    defineField({
      name: 'scope',
      title: 'Zakres',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'actions',
      title: 'Działania (Actions / Zakres)',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'year',
      title: 'Rok wykonania',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'gallery',
      title: 'Galeria (Bloki zdjęć)',
      type: 'array',
      group: 'media',
      description: 'Buduj galerie z wcześniej wgranych assetów. Do hurtowego uploadu użyj narzędzia Media, a tutaj wybieraj gotowe zdjęcia i wideo.',
      of: [{ type: 'galleryBlock' }]
    })
  ]
});
