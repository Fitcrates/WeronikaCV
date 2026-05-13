import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client, getSanityReadToken } from '@/sanity/lib/client';

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: getSanityReadToken() }),
});
