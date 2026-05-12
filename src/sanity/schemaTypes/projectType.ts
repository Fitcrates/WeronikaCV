import { defineType, defineField } from 'sanity';

export const projectType = defineType({
  name: 'project',
  title: 'Projekt',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł projektu',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'thumbnail',
      title: 'Miniatura (na stronie głównej)',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Kolejność na stronie głównej',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'folderColor',
      title: 'Kolor folderu',
      type: 'string',
      description: 'Kod HEX koloru (np. #EAD7D7)',
      validation: Rule => Rule.required().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, {
        name: 'hex color',
        invert: false,
      })
    }),
    defineField({
      name: 'description',
      title: 'Opis projektu',
      type: 'text',
    }),
    defineField({
      name: 'scope',
      title: 'Zakres',
      type: 'string',
    }),
    defineField({
      name: 'actions',
      title: 'Działania (Actions / Zakres)',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Rok wykonania',
      type: 'string',
    }),
    defineField({
      name: 'gallery',
      title: 'Galeria (Bloki zdjęć)',
      type: 'array',
      of: [{ type: 'galleryBlock' }]
    })
  ]
});
