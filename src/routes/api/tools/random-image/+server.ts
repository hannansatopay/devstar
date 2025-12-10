import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, fetch }) => {
  const topic = url.searchParams.get("topic") ?? "";
  const width = clampDimension(url.searchParams.get("width"));
  const height = clampDimension(url.searchParams.get("height"));
  const grayscale = url.searchParams.get("grayscale") === "1";
  const blur = clampBlur(url.searchParams.get("blur"));
  const seed = url.searchParams.get("seed") ?? `${Date.now()}`;

  const keywords = sanitizeTokens(topic);
  const keywordSegment = keywords.length ? keywords.join(",") : "creative";

  const primaryUrl = buildPrimaryUrl(keywordSegment, width, height, grayscale, blur, seed);
  const fallbackUrl = buildFallbackUrl(keywordSegment, width, height, grayscale, blur, seed);

  const primaryResponse = await tryFetch(fetch, primaryUrl);
  const chosenResponse = primaryResponse ?? (await tryFetch(fetch, fallbackUrl));

  if (!chosenResponse || !chosenResponse.body) {
    return json({ message: "Unable to fetch an image at the moment." }, { status: 502 });
  }

  const contentType = chosenResponse.headers.get("content-type") ?? "image/jpeg";
  const contentLength = chosenResponse.headers.get("content-length") ?? undefined;

  return new Response(chosenResponse.body, {
    status: 200,
    headers: {
      "content-type": contentType,
      ...(contentLength ? { "content-length": contentLength } : {}),
      "cache-control": "no-store",
      "x-random-image-source": primaryResponse ? "primary" : "fallback",
    },
  });
};

async function tryFetch(fetchFn: typeof fetch, remoteUrl: string) {
  try {
    const response = await fetchFn(remoteUrl, {
      headers: { accept: "image/*" },
      redirect: "follow",
    });
    if (!response.ok || !response.body) {
      return null;
    }
    return response;
  } catch {
    return null;
  }
}

function clampDimension(raw: string | null) {
  const value = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(value) || value <= 0) return 1280;
  return Math.min(2400, Math.max(320, value));
}

function clampBlur(raw: string | null) {
  const value = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(10, Math.max(0, value));
}

function sanitizeTokens(topic: string) {
  return topic
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9-]/gi, "").toLowerCase())
    .filter(Boolean);
}

function buildPrimaryUrl(
  keywords: string,
  width: number,
  height: number,
  grayscale: boolean,
  blur: number,
  seed: string,
) {
  const base = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keywords).replace(
    /%2C/g,
    ",",
  )}`;
  const params: string[] = [];
  if (grayscale) params.push("grayscale");
  if (blur > 0) params.push(`blur=${Math.min(10, blur)}`);
  params.push(`sig=${seed}`);
  return params.length ? `${base}&${params.join("&")}` : base;
}

function buildFallbackUrl(
  keywords: string,
  width: number,
  height: number,
  grayscale: boolean,
  blur: number,
  seed: string,
) {
  const lock = hashSeed(seed);
  const keywordPath = keywords
    .split(",")
    .map((token) => encodeURIComponent(token))
    .join(",");
  const base = `https://loremflickr.com/${grayscale ? "g/" : ""}${width}/${height}/${keywordPath || "creative"}`;
  const params = new URLSearchParams({ lock: lock.toString() });
  if (blur > 0) {
    params.set("blur", Math.min(5, Math.max(1, Math.round(blur / 2))).toString());
  }
  return `${base}?${params.toString()}`;
}

function hashSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return (hash + 9973) % 9973;
}
