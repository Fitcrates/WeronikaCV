import { NextResponse } from "next/server";

const GOOGLE_TRANSLATE_ENDPOINT =
  "https://translation.googleapis.com/language/translate/v2";
const MAX_TEXTS_PER_REQUEST = 128;

interface TranslateRequestBody {
  texts?: unknown;
  target?: unknown;
}

interface GoogleTranslateResponse {
  data?: {
    translations?: {
      translatedText?: string;
    }[];
  };
  error?: {
    message?: string;
  };
}

function getTranslateApiKey() {
  return (
    process.env.GOOGLE_TRANSLATE_API_KEY ||
    process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY
  );
}

function normalizeTexts(texts: unknown) {
  if (!Array.isArray(texts)) {
    return [];
  }

  return texts
    .filter((text): text is string => typeof text === "string")
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, MAX_TEXTS_PER_REQUEST);
}

export async function POST(request: Request) {
  const apiKey = getTranslateApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Google Translation API key." },
      { status: 500 }
    );
  }

  let body: TranslateRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const texts = normalizeTexts(body.texts);
  const target = body.target === "en" || body.target === "pl" ? body.target : "en";

  if (texts.length === 0) {
    return NextResponse.json({ translations: [] });
  }

  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (referer) {
    requestHeaders.Referer = referer;
  } else if (origin) {
    requestHeaders.Referer = origin;
  }

  const response = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      q: texts,
      target,
      source: target === "en" ? "pl" : "en",
      format: "text",
    }),
  });

  const payload = (await response.json()) as GoogleTranslateResponse;

  if (!response.ok) {
    return NextResponse.json(
      {
        error: payload.error?.message || "Translation request failed.",
        status: response.status,
      },
      { status: response.status }
    );
  }

  return NextResponse.json({
    translations:
      payload.data?.translations?.map(
        (translation) => translation.translatedText || ""
      ) || [],
  });
}
