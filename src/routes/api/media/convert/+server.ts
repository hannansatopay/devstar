import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { detectMediaKind, runConversion } from "$lib/server/ffmpeg";

const MIME_BY_EXTENSION: Record<string, string> = {
	mp3: "audio/mpeg",
	wav: "audio/wav",
	ogg: "audio/ogg",
	mp4: "video/mp4",
	webm: "video/webm",
	gif: "image/gif",
	mkv: "video/x-matroska"
};

type PresetContext = {
	isAudio: boolean;
	isVideo: boolean;
};

function buildArgs(target: string, ctx: PresetContext): string[] {
	switch (target) {
		case "mp3":
			return ["-vn", "-c:a", "libmp3lame", "-q:a", "2"];
		case "wav":
			return ["-vn", "-c:a", "pcm_s16le", "-ar", "44100"];
		case "ogg":
			return ["-vn", "-c:a", "libvorbis", "-q:a", "5"];
		case "gif":
			if (!ctx.isVideo) {
				throw error(400, "GIF conversion requires a video source.");
			}
			return ["-vf", "fps=12,scale=540:-1:flags=lanczos", "-loop", "0"];
		case "webm":
			if (ctx.isVideo) {
				return ["-c:v", "libvpx-vp9", "-b:v", "1.2M", "-c:a", "libopus"];
			}
			return ["-vn", "-c:a", "libopus", "-b:a", "128k"];
		case "mkv":
			if (ctx.isVideo) {
				return ["-c:v", "libx264", "-preset", "medium", "-c:a", "aac", "-b:a", "160k"];
			}
			return ["-vn", "-c:a", "aac", "-b:a", "160k"];
		case "mp4":
			if (ctx.isVideo) {
				return [
					"-c:v",
					"libx264",
					"-preset",
					"medium",
					"-movflags",
					"+faststart",
					"-c:a",
					"aac",
					"-b:a",
					"160k"
				];
			}
			return ["-vn", "-c:a", "aac", "-b:a", "160k"];
		default:
			throw error(400, `Unsupported target format: ${target}`);
	}
}

function ensureTarget(target: string | null): string {
	if (typeof target !== "string" || target.trim() === "") {
		throw error(400, "Missing target format.");
	}
	return target.toLowerCase();
}

function baseName(name: string | null): string {
	if (!name) return "";
	const idx = name.lastIndexOf(".");
	return idx > 0 ? name.slice(0, idx) : name;
}

function safeFileName(raw: string | null): string {
	if (!raw) return "upload.bin";
	let value = raw;
	try {
		value = decodeURIComponent(raw);
	} catch {
		value = raw;
	}
	const cleaned = value.split(/[/\\]/).pop() || "upload.bin";
	return cleaned.trim() || "upload.bin";
}

export const POST: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);
	const target = ensureTarget(url.searchParams.get("target"));

	const mime = MIME_BY_EXTENSION[target];
	if (!mime) {
		throw error(400, "Unsupported conversion target.");
	}

	const filename = safeFileName(request.headers.get("x-file-name"));
	const contentType = request.headers.get("content-type") ?? "";
	const arrayBuffer = await request.arrayBuffer();
	if (!arrayBuffer.byteLength) {
		throw error(400, "The uploaded file is empty.");
	}
	const buffer = Buffer.from(arrayBuffer);

	const context = detectMediaKind({ contentType, filename });
	if (!context.isAudio && !context.isVideo) {
		if (new Set(["mp4", "webm", "mkv", "gif"]).has(target)) {
			context.isVideo = true;
		} else {
			context.isAudio = true;
		}
	}

	const args = buildArgs(target, context);

	const result = await runConversion(buffer, {
		inputName: filename,
		outputExtension: target,
		args
	});

	const outputName = `${baseName(filename) || "converted"}.${target}`;

	return new Response(result.buffer, {
		headers: {
			"Content-Type": mime,
			"Content-Length": String(result.buffer.length),
			"Content-Disposition": `attachment; filename="${outputName}"`
		}
	});
};
