import { defineType, defineField } from 'sanity';
import GalleryBlockInput from '../components/GalleryBlockInput';

const aspectRatioOptions = [
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
  { title: 'Własne', value: 'custom' },
];

const customAspectRatioField = defineField({
  name: 'customAspectRatio',
  title: 'Własny aspect ratio',
  type: 'string',
  description: 'Wpisz np. 7 / 5, 21 / 9, 1080 / 1350.',
  fieldset: 'advanced',
  hidden: ({ parent }) => parent?.aspectRatio !== 'custom',
  validation: Rule => Rule.custom((value, context) => {
    if ((context.parent as { aspectRatio?: string })?.aspectRatio !== 'custom') {
      return true;
    }

    return value?.trim()
      ? true
      : 'Podaj własne proporcje, np. 7 / 5.';
  })
});

const customImageSizeFields = [
  defineField({
    name: 'customWidthPx',
    title: 'Własna szerokość renderu (px)',
    type: 'number',
    fieldset: 'advanced',
    description: 'Opcjonalnie. Maksymalnie 1200 px, czyli szerokość kontenera.',
    validation: Rule => Rule.min(1).max(1200).integer()
  }),
  defineField({
    name: 'customHeightPx',
    title: 'Własna wysokość renderu (px)',
    type: 'number',
    fieldset: 'advanced',
    description: 'Opcjonalnie. Jeżeli podasz szerokość, podaj też wysokość.',
    validation: Rule => Rule.custom((value, context) => {
      const parent = context.parent as {
        customWidthPx?: number;
        customHeightPx?: number;
      };

      if (!parent?.customWidthPx && !value) {
        return true;
      }

      if (parent?.customWidthPx && !value) {
        return 'Podaj wysokość px dla własnego rozmiaru.';
      }

      if (!parent?.customWidthPx && value) {
        return 'Podaj też szerokość px dla własnego rozmiaru.';
      }

      return typeof value === 'number' && Number.isInteger(value) && value > 0
        ? true
        : 'Wysokość musi być dodatnią liczbą całkowitą.';
    })
  })
];

export const galleryBlockType = defineType({
  name: 'galleryBlock',
  title: 'Blok Galerii',
  type: 'object',
  components: {
    input: GalleryBlockInput,
  },
  fieldsets: [
    {
      name: 'advanced',
      title: 'Zaawansowane kadrowanie',
      options: { collapsible: true, collapsed: true },
    },
  ],
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
      title: 'Aspect ratio mediów w bloku',
      type: 'string',
      description: 'Stosowane do wszystkich zdjęć i wideo w tym bloku. Pojedynczy element z własnym aspect ratio nadpisuje tę wartość.',
      initialValue: '4 / 3',
      fieldset: 'advanced',
      options: {
        list: aspectRatioOptions,
        layout: 'dropdown'
      }
    }),
    defineField({
      ...customAspectRatioField,
      description: 'Wpisz np. 7 / 5, 21 / 9, 1080 / 1350. Używane, gdy wyżej wybrano "Własne".',
    }),
    defineField({
      name: 'images',
      title: 'Media',
      type: 'array',
      description: 'Najpierw wrzuć wiele plików w narzędziu Media, potem wybieraj je tutaj z biblioteki. Kolejność elementów jest kolejnością na stronie.',
      of: [
        {
          type: 'object',
          name: 'galleryImage',
          title: 'Zdjęcie',
          fieldsets: [
            {
              name: 'advanced',
              title: 'Zaawansowane ustawienia zdjęcia',
              options: { collapsible: true, collapsed: true },
            },
          ],
          fields: [
            defineField({
              name: 'image',
              title: 'Zdjęcie',
              type: 'image',
              description: 'Wybierz z biblioteki Media albo wgraj pojedynczy plik. Do hurtowego uploadu użyj narzędzia Media w lewym menu Studio.',
              options: { hotspot: true }
            }),
            defineField({
              name: 'aspectRatio',
              title: 'Aspect ratio',
              type: 'string',
              initialValue: 'auto',
              fieldset: 'advanced',
              options: {
                list: aspectRatioOptions,
                layout: 'dropdown'
              }
            }),
            customAspectRatioField,
            ...customImageSizeFields,
            defineField({
              name: 'objectPositionX',
              title: 'Kadr poziomo (%)',
              type: 'number',
              initialValue: 50,
              fieldset: 'advanced',
              hidden: true,
              validation: Rule => Rule.min(0).max(100)
            }),
            defineField({
              name: 'objectPositionY',
              title: 'Kadr pionowo (%)',
              type: 'number',
              initialValue: 50,
              fieldset: 'advanced',
              hidden: true,
              validation: Rule => Rule.min(0).max(100)
            })
          ],
          preview: {
            select: {
              media: 'image',
              aspectRatio: 'aspectRatio',
              customAspectRatio: 'customAspectRatio',
              customWidthPx: 'customWidthPx',
              customHeightPx: 'customHeightPx'
            },
            prepare({ media, aspectRatio, customAspectRatio, customWidthPx, customHeightPx }) {
              const ratio = aspectRatio === 'custom' ? customAspectRatio : aspectRatio;
              const size = customWidthPx && customHeightPx
                ? ` • ${customWidthPx}x${customHeightPx}px`
                : '';

              return {
                title: media
                  ? (ratio && ratio !== 'auto' ? `Zdjęcie ${ratio}${size}` : `Zdjęcie auto${size}`)
                  : 'Pusty slot',
                media
              }
            }
          }
        },
        {
          type: 'object',
          name: 'galleryVideo',
          title: 'Wideo',
          fieldsets: [
            {
              name: 'advanced',
              title: 'Zaawansowane ustawienia wideo',
              options: { collapsible: true, collapsed: true },
            },
          ],
          fields: [
            defineField({
              name: 'video',
              title: 'Plik wideo',
              type: 'file',
              options: {
                accept: 'video/*'
              },
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'poster',
              title: 'Poster / miniatura wideo',
              type: 'image',
              options: { hotspot: true }
            }),
            defineField({
              name: 'aspectRatio',
              title: 'Aspect ratio',
              type: 'string',
              initialValue: 'auto',
              fieldset: 'advanced',
              options: {
                list: aspectRatioOptions,
                layout: 'dropdown'
              }
            }),
            customAspectRatioField
          ],
          preview: {
            select: {
              title: 'video.asset.originalFilename',
              media: 'poster',
              aspectRatio: 'aspectRatio',
              customAspectRatio: 'customAspectRatio'
            },
            prepare({ title, media, aspectRatio, customAspectRatio }) {
              const ratio = aspectRatio === 'custom' ? customAspectRatio : aspectRatio;

              return {
                title: title || 'Wideo',
                subtitle: ratio && ratio !== 'auto' ? ratio : 'auto',
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
        {
          type: 'image',
          title: 'Zdjęcie legacy bez aspect ratio',
          options: { hotspot: true }
        }
      ],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      layout: 'layout',
      aspectRatio: 'aspectRatio',
      customAspectRatio: 'customAspectRatio',
      images: 'images'
    },
    prepare({ layout, aspectRatio, customAspectRatio, images }) {
      const ratio = aspectRatio === 'custom' ? customAspectRatio : aspectRatio;

      return {
        title: `Układ: ${layout}`,
        subtitle: `${images ? images.length : 0} elementów${ratio ? ` • ${ratio}` : ''}`,
        media: images && images.length > 0 ? images[0] : null
      }
    }
  }
});
