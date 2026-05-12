import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, useCdn } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
})

export function getSanityClient(preview = false) {
  if (!preview) {
    return client
  }

  const token = process.env.SANITY_API_READ_TOKEN

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
