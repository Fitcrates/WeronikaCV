import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { presentationLocations } from './src/sanity/presentation'

const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

function getPreviewUrl(path = '/') {
  return new URL(path, previewOrigin).toString()
}

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    presentationTool({
      allowOrigins: [previewOrigin],
      previewUrl: {
        initial: getPreviewUrl('/'),
        previewMode: {
          enable: getPreviewUrl('/api/draft-mode/enable'),
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
