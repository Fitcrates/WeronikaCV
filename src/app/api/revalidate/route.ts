import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

interface SanityRevalidatePayload {
  _type?: string;
  slug?: string | { current?: string };
}

function getExpectedSecret() {
  return process.env.SANITY_REVALIDATE_SECRET;
}

function getProvidedSecret(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return new URL(request.url).searchParams.get("secret");
}

function getSlug(payload: SanityRevalidatePayload) {
  if (typeof payload.slug === "string") {
    return payload.slug;
  }

  return payload.slug?.current;
}

async function getPayload(request: Request): Promise<SanityRevalidatePayload> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const expectedSecret = getExpectedSecret();
  const providedSecret = getProvidedSecret(request);

  if (!expectedSecret) {
    return NextResponse.json(
      { revalidated: false, message: "Missing SANITY_REVALIDATE_SECRET." },
      { status: 500 }
    );
  }

  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid revalidation secret." },
      { status: 401 }
    );
  }

  const payload = await getPayload(request);
  const paths = new Set<string>(["/"]);

  if (payload._type === "siteSettings") {
    paths.add("/o-mnie");
    paths.add("/cv");
  }

  if (payload._type === "project") {
    const slug = getSlug(payload);

    if (slug) {
      paths.add(`/projekt/${slug}`);
    } else {
      revalidatePath("/projekt/[slug]", "page");
    }
  }

  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    revalidated: true,
    paths: Array.from(paths),
    now: Date.now(),
  });
}
