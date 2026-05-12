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
          { title: 'Portret + dwa mniejsze zdjęcia', value: 'portrait-stack' },
          { title: 'Równa siatka zdjęć', value: 'grid' },
        ],
        layout: 'dropdown'
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect ratio zdjęć w bloku',
      type: 'string',
      description: 'Stosowane do wszystkich zdjęć w tym bloku. Pojedyncze zdjęcie z własnym aspect ratio nadpisuje tę wartość.',
      initialValue: '4 / 3',
      options: {
        list: [
          { title: 'Auto / oryginalne', value: 'auto' },
          { title: 'Kwadrat 1:1', value: '1 / 1' },
          { title: 'Poziome 4:3', value: '4 / 3' },
          { title: 'Pionowe 3:4', value: '3 / 4' },
          { title: 'Szerokie 16:9', value: '16 / 9' },
          { title: 'Pionowe 9:16', value: '9 / 16' },
          { title: 'Portret 4:5', value: '4 / 5' },
          { title: 'Poziome 5:4', value: '5 / 4' },
          { title: 'Poziome 3:2', value: '3 / 2' },
          { title: 'Pionowe 2:3', value: '2 / 3' },
        ],
        layout: 'dropdown'
      }
    }),
    defineField({
      name: 'images',
      title: 'Zdjęcia',
      type: 'array',
      description: 'Dodawaj zdjęcia z proporcjami albo pusty slot. Pozycje w tablicy są zachowywane w renderze.',
      of: [
        {
          type: 'object',
          name: 'galleryImage',
          title: 'Zdjęcie z proporcjami',
          fields: [
            defineField({
              name: 'image',
              title: 'Zdjęcie',
              type: 'image',
              description: 'Zostaw puste, jeżeli ten element ma być pustym miejscem w siatce.',
              options: { hotspot: true }
            }),
            defineField({
              name: 'aspectRatio',
              title: 'Aspect ratio',
              type: 'string',
              initialValue: 'auto',
              options: {
                list: [
                  { title: 'Auto / oryginalne', value: 'auto' },
                  { title: 'Kwadrat 1:1', value: '1 / 1' },
                  { title: 'Poziome 4:3', value: '4 / 3' },
                  { title: 'Pionowe 3:4', value: '3 / 4' },
                  { title: 'Szerokie 16:9', value: '16 / 9' },
                  { title: 'Pionowe 9:16', value: '9 / 16' },
                  { title: 'Portret 4:5', value: '4 / 5' },
                  { title: 'Poziome 5:4', value: '5 / 4' },
                  { title: 'Poziome 3:2', value: '3 / 2' },
                  { title: 'Pionowe 2:3', value: '2 / 3' },
                ],
                layout: 'dropdown'
              }
            })
          ],
          preview: {
            select: {
              media: 'image',
              aspectRatio: 'aspectRatio'
            },
            prepare({ media, aspectRatio }) {
              return {
                title: media
                  ? (aspectRatio && aspectRatio !== 'auto' ? `Zdjęcie ${aspectRatio}` : 'Zdjęcie auto')
                  : 'Pusty slot',
                media
              }
            }
          }
        },
        {
          type: 'object',
          name: 'galleryEmptySlot',
          title: 'Pusty slot',
          fields: [
            defineField({
              name: 'note',
              title: 'Notatka',
              type: 'string',
              description: 'Opcjonalna notatka tylko dla edytora.'
            })
          ],
          preview: {
            prepare() {
              return {
                title: 'Pusty slot'
              }
            }
          }
        },
        { type: 'image', options: { hotspot: true } }
      ],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      layout: 'layout',
      aspectRatio: 'aspectRatio',
      images: 'images'
    },
    prepare({ layout, aspectRatio, images }) {
      return {
        title: `Układ: ${layout}`,
        subtitle: `${images ? images.length : 0} zdjęć${aspectRatio ? ` • ${aspectRatio}` : ''}`,
        media: images && images.length > 0 ? images[0] : null
      }
    }
  }
});
