import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { apiVersion, dataset, projectId } from './src/sanity/env'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    deskTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
