import { defineLive } from 'next-sanity/live'
import { client, getSanityReadToken } from '@/sanity/lib/client'

const sanityReadToken = getSanityReadToken()
const sanityBrowserToken = process.env.SANITY_API_READ_TOKEN || false

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: sanityReadToken,
  browserToken: sanityBrowserToken,
})
