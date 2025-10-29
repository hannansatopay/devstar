import { json, type RequestHandler } from "@sveltejs/kit";
import { SCREENSHOT_PROVIDERS, resolveScreenshotProvider } from "$lib/data/websiteScreenshotProviders";

export const GET: RequestHandler = async ({ url, fetch }) => {
  const providerId = url.searchParams.get("provider") ?? "";
  const target = url.searchParams.get("url") ?? "";
  const provider = resolveScreenshotProvider(providerId);

  if (!provider) {
    return json({ message: "Unsupported screenshot provider." }, { status: 400 });
  }

  const sanitized = sanitizeTarget(target);
  if (!sanitized) {
    return json({ message: "A valid http(s) URL is required." }, { status: 400 });
  }

  const width = clampWidth(url.searchParams.get("width"));
  const full = parseBoolean(url.searchParams.get("full"));

  const remoteUrl = provider.build(sanitized, width, full);

  try {
    const response = await fetch(remoteUrl);
    if (!response.ok || !response.body) {
      return json({ message: `Provider responded with ${response.status}.` }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    const contentLength = response.headers.get("content-length") ?? undefined;

    return new Response(response.body, {
      status: 200,
      headers: {
        "content-type": contentType,
        ...(contentLength ? { "content-length": contentLength } : {}),
        "cache-control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Screenshot proxy error:", error);
    return json({ message: "Unable to reach the screenshot provider." }, { status: 502 });
  }
};

function sanitizeTarget(value: string) {
  try {
    const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function clampWidth(raw: string | null) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return 1024;
  return Math.min(1920, Math.max(320, parsed));
}

function parseBoolean(value: string | null) {
  if (!value) return false;
  return value === "1" || value.toLowerCase() === "true";
}
