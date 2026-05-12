import { defineType, defineField } from 'sanity';

export const galleryBlockType = defineType({
  name: 'galleryBlock',
  title: 'Blok Galerii',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      title: 'Układ (Layout)',
      type: 'string',
      options: {
        list: [
          { title: 'Pełna szerokość (1 zdjęcie)', value: 'full' },
          { title: 'Dwie równe kolumny (2 zdjęcia)', value: 'two-col' },
          { title: 'Jedno duże lewe, dwa małe prawe (3 zdjęcia)', value: 'one-two' },
          { title: 'Dwa małe lewe, jedno duże prawe (3 zdjęcia)', value: 'two-one' },
          { title: 'Trzy równe kolumny (3 zdjęcia)', value: 'three-col' },
          { title: 'Dwa duże góra, dwa małe dół (Hero)', value: 'hero-two' },
          { title: 'Równa siatka zdjęć', value: 'grid' },
        ],
        layout: 'dropdown'
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'images',
      title: 'Zdjęcia',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      layout: 'layout',
      images: 'images'
    },
    prepare({ layout, images }) {
      return {
        title: `Układ: ${layout}`,
        subtitle: `${images ? images.length : 0} zdjęć`,
        media: images && images.length > 0 ? images[0] : null
      }
    }
  }
});
