import { defineLive } from 'next-sanity/live'
import { client, getSanityReadToken } from '@/sanity/lib/client'

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: getSanityReadToken(),
  browserToken: false,
})
