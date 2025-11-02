import { performance } from "node:perf_hooks";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, fetch }) => {
  const { url } = await request.json().catch(() => ({ url: "" }));
  if (typeof url !== "string" || !url.trim()) {
    throw error(400, "Missing URL");
  }

  const target = url.trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const metrics = {
    url: target,
    status: 0,
    ok: false,
    ttfb: 0,
    download: 0,
    total: 0,
    bytes: 0,
  };

  try {
    const start = performance.now();
    const response = await fetch(target, { method: "GET", signal: controller.signal });
    const headersReceived = performance.now();

    metrics.status = response.status;
    metrics.ok = response.ok;
    metrics.ttfb = Number((headersReceived - start).toFixed(2));

    const arrayBuffer = await response.arrayBuffer();
    const finish = performance.now();

    metrics.bytes = arrayBuffer.byteLength;
    metrics.download = Number((finish - headersReceived).toFixed(2));
    metrics.total = Number((finish - start).toFixed(2));

    return json(metrics);
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw error(504, "Request timed out after 15s");
    }
    throw error(502, "Unable to fetch the provided URL from the server.");
  } finally {
    clearTimeout(timeout);
  }
};
