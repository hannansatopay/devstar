import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { detectMediaKind, runConversion } from "$lib/server/ffmpeg";

type Action = "video" | "audio" | "thumbnail";

const MIN_WIDTH = 320;
const MAX_WIDTH = 1920;

function ensureAction(value: string | null): Action {
	if (typeof value !== "string") {
		throw error(400, "Missing action.");
	}
	const normalised = value.toLowerCase();
	if (normalised === "video" || normalised === "audio" || normalised === "thumbnail") {
		return normalised;
	}
	throw error(400, "Unsupported action.");
}

function toNumber(value: string | null, fallback: number): number {
	if (typeof value !== "string") return fallback;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function stripExtension(name: string): string {
	const idx = name.lastIndexOf(".");
	return idx > 0 ? name.slice(0, idx) : name;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
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
	const action = ensureAction(url.searchParams.get("action"));

	const start = Math.max(0, toNumber(url.searchParams.get("start"), 0));
	const end = Math.max(start + 0.2, toNumber(url.searchParams.get("end"), start));
	const length = Math.max(0.5, end - start);

	const filename = safeFileName(request.headers.get("x-file-name"));
	const contentType = request.headers.get("content-type") ?? "";
	const arrayBuffer = await request.arrayBuffer();
	if (!arrayBuffer.byteLength) {
		throw error(400, "The uploaded file is empty.");
	}

	const mediaKind = detectMediaKind({ contentType, filename });
	if (!mediaKind.isVideo) {
		throw error(400, "Only video files are supported for this tool.");
	}

	const buffer = Buffer.from(arrayBuffer);
	const baseName = stripExtension(filename) || "clip";

	if (action === "video") {
		const width = Math.round(
			clamp(toNumber(url.searchParams.get("width"), 1280), MIN_WIDTH, MAX_WIDTH)
		);
		const muted = url.searchParams.get("muted") === "true";
		const args = [
			"-t",
			length.toFixed(2),
			"-vf",
			`scale=${width}:-2:flags=lanczos`,
			"-c:v",
			"libx264",
			"-preset",
			"medium",
			"-movflags",
			"+faststart"
		];
		if (muted) {
			args.push("-an");
		} else {
			args.push("-c:a", "aac", "-b:a", "160k");
		}

		const result = await runConversion(buffer, {
			inputName: filename,
			outputExtension: "mp4",
			preInputArgs: ["-ss", start.toFixed(2)],
			args
		});

		const outputName = `${baseName}-edited.mp4`;

		return new Response(result.buffer, {
			headers: {
				"Content-Type": "video/mp4",
				"Content-Length": String(result.buffer.length),
				"Content-Disposition": `attachment; filename="${outputName}"`
			}
		});
	}

	if (action === "audio") {
		const args = [
			"-t",
			length.toFixed(2),
			"-vn",
			"-c:a",
			"libmp3lame",
			"-q:a",
			"2"
		];

		const result = await runConversion(buffer, {
			inputName: filename,
			outputExtension: "mp3",
			preInputArgs: ["-ss", start.toFixed(2)],
			args
		});

		const outputName = `${baseName}-audio.mp3`;

		return new Response(result.buffer, {
			headers: {
				"Content-Type": "audio/mpeg",
				"Content-Length": String(result.buffer.length),
				"Content-Disposition": `attachment; filename="${outputName}"`
			}
		});
	}

	const width = Math.round(
		clamp(toNumber(url.searchParams.get("thumbWidth"), 640), 160, MAX_WIDTH)
	);

	const args = [
		"-vframes",
		"1",
		"-vf",
		`scale=${width}:-2`,
		"-q:v",
		"2"
	];

	const result = await runConversion(buffer, {
		inputName: filename,
		outputExtension: "jpg",
		preInputArgs: ["-ss", start.toFixed(2)],
		args
	});

	const outputName = `${baseName}-thumbnail.jpg`;

	return new Response(result.buffer, {
		headers: {
			"Content-Type": "image/jpeg",
			"Content-Length": String(result.buffer.length),
			"Content-Disposition": `attachment; filename="${outputName}"`
		}
	});
};
