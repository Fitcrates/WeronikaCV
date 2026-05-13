import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, useCdn } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
  stega: {
    studioUrl: '/studio',
  },
})

export function getSanityReadToken() {
  return process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_KEY
}

export function getSanityClient(preview = false) {
  if (!preview) {
    return client
  }

  const token = getSanityReadToken()

  if (!token) {
    return client
  }

  return client.withConfig({
    token,
    useCdn: false,
    perspective: 'drafts',
    stega: true,
  })
}
