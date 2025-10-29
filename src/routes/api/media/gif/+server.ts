import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { detectMediaKind, runConversion } from "$lib/server/ffmpeg";

const MIN_DURATION = 0.5;
const MAX_DURATION = 30;
const MIN_WIDTH = 120;
const MAX_WIDTH = 960;
const MIN_FPS = 4;
const MAX_FPS = 30;
const MIN_SPEED = 0.25;
const MAX_SPEED = 4;

function toNumber(value: string | null, fallback: number): number {
	if (typeof value !== "string") return fallback;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function stripExtension(name: string): string {
	const idx = name.lastIndexOf(".");
	return idx > 0 ? name.slice(0, idx) : name;
}

function safeFileName(raw: string | null): string {
	if (!raw) return "clip.mp4";
	let value = raw;
	try {
		value = decodeURIComponent(raw);
	} catch {
		value = raw;
	}
	const cleaned = value.split(/[/\\]/).pop() || "clip.mp4";
	return cleaned.trim() || "clip.mp4";
}

export const POST: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);
	const startAt = Math.max(0, toNumber(url.searchParams.get("start"), 0));
	const duration = clamp(toNumber(url.searchParams.get("duration"), 4), MIN_DURATION, MAX_DURATION);
	const width = Math.round(clamp(toNumber(url.searchParams.get("width"), 480), MIN_WIDTH, MAX_WIDTH));
	const fps = Math.round(clamp(toNumber(url.searchParams.get("fps"), 12), MIN_FPS, MAX_FPS));
	const speed = clamp(toNumber(url.searchParams.get("speed"), 1), MIN_SPEED, MAX_SPEED);

	const filename = safeFileName(request.headers.get("x-file-name"));
	const contentType = request.headers.get("content-type") ?? "";

	const arrayBuffer = await request.arrayBuffer();
	if (!arrayBuffer.byteLength) {
		throw error(400, "The uploaded file is empty.");
	}

	const mediaKind = detectMediaKind({ contentType, filename });
	if (!mediaKind.isVideo) {
		throw error(400, "GIF generation requires a video input.");
	}

	const buffer = Buffer.from(arrayBuffer);

	const filters = [`fps=${fps}`, `scale=${width}:-1:flags=lanczos`];
	if (Math.abs(speed - 1) > 0.01) {
		filters.push(`setpts=${(1 / speed).toFixed(3)}*PTS`);
	}

	const result = await runConversion(buffer, {
		inputName: filename,
		outputExtension: "gif",
		preInputArgs: ["-ss", startAt.toFixed(2)],
		args: [
			"-t",
			duration.toFixed(2),
			"-vf",
			filters.join(","),
			"-loop",
			"0"
		]
	});

	const outputName = `${stripExtension(filename) || "clip"}.gif`;

	return new Response(result.buffer, {
		headers: {
			"Content-Type": "image/gif",
			"Content-Length": String(result.buffer.length),
			"Content-Disposition": `attachment; filename="${outputName}"`
		}
	});
};
