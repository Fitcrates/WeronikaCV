import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { presentationLocations } from './src/sanity/presentation'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    presentationTool({
      previewUrl: {
        initial: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        locations: presentationLocations,
      },
    }),
    deskTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
