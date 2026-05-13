import { draftMode } from "next/headers";
import { headers } from "next/headers";

const SANITY_PREVIEW_HEADER = "x-sanity-presentation-preview";

export async function isSanityPreviewRequest() {
  const [{ isEnabled }, headerStore] = await Promise.all([draftMode(), headers()]);

  return isEnabled || headerStore.get(SANITY_PREVIEW_HEADER) === "1";
}
