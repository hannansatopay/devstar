import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import ffmpegStatic from "ffmpeg-static";

const TMP_PREFIX = "devstar-ffmpeg-";
const AUDIO_EXTENSIONS = new Set([
	".aac",
	".flac",
	".m4a",
	".mp2",
	".mp3",
	".ogg",
	".opus",
	".wav",
	".wma"
]);
const VIDEO_EXTENSIONS = new Set([
	".3gp",
	".avi",
	".flv",
	".gif",
	".m2ts",
	".m4v",
	".mkv",
	".mov",
	".mp4",
	".mpeg",
	".mpg",
	".webm",
	".wmv"
]);

class FFmpegUnavailableError extends Error {
	constructor() {
		super(
			"ffmpeg binary was not found. Make sure the ffmpeg-static dependency is installed and supported on this platform."
		);
		this.name = "FFmpegUnavailableError";
	}
}

function assertFfmpegPath(): string {
	const ffmpegPath = typeof ffmpegStatic === "string" ? ffmpegStatic : null;
	if (!ffmpegPath) {
		throw new FFmpegUnavailableError();
	}
	return ffmpegPath;
}

async function withTempDirectory<T>(handler: (dir: string) => Promise<T>): Promise<T> {
	const directory = await mkdtemp(join(tmpdir(), TMP_PREFIX));
	try {
		return await handler(directory);
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
}

async function runFfmpeg(args: string[]): Promise<void> {
	const ffmpegPath = assertFfmpegPath();
	await new Promise<void>((resolve, reject) => {
		const process = spawn(ffmpegPath, args, {
			windowsHide: true,
			stdio: ["ignore", "ignore", "pipe"]
		});

		let stderr = "";

		process.stderr?.on("data", (chunk) => {
			stderr += chunk.toString();
		});

		process.on("error", (error) => reject(error));
		process.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				const message = stderr.trim() || `ffmpeg exited with code ${code}`;
				reject(new Error(message));
			}
		});
	});
}

function normaliseExtension(ext: string): string {
	if (!ext) return "";
	return ext.startsWith(".") ? ext : `.${ext}`;
}

function classifyByExtension(ext: string): { isAudio: boolean; isVideo: boolean } {
	const lower = ext.toLowerCase();
	if (!lower) return { isAudio: false, isVideo: false };
	return {
		isAudio: AUDIO_EXTENSIONS.has(lower),
		isVideo: VIDEO_EXTENSIONS.has(lower)
	};
}

export function detectMediaKind({
	contentType,
	filename
}: {
	contentType?: string | null;
	filename?: string | null;
}): { isAudio: boolean; isVideo: boolean } {
	const type = (contentType ?? "").toLowerCase();
	let isAudio = type.startsWith("audio/");
	let isVideo = type.startsWith("video/");

	if (!isAudio && !isVideo) {
		const ext = normaliseExtension(extname(filename ?? ""));
		if (ext) {
			const result = classifyByExtension(ext);
			isAudio = result.isAudio;
			isVideo = result.isVideo;
		}
	}

	return { isAudio, isVideo };
}

export async function runConversion(
	input: Buffer,
	options: {
		inputName: string;
		outputExtension: string;
		args: string[];
		preInputArgs?: string[];
	}
): Promise<{
	buffer: Buffer;
	outputExtension: string;
}> {
	const ext = normaliseExtension(extname(options.inputName)) || ".bin";
	const outputExt = normaliseExtension(options.outputExtension).slice(1) || "out";

	return withTempDirectory(async (dir) => {
		const inputPath = join(dir, `source-${randomBytes(4).toString("hex")}${ext}`);
		const outputPath = join(dir, `output-${randomBytes(4).toString("hex")}.${outputExt}`);

		await writeFile(inputPath, input);

		const ffmpegArgs = [
			"-y",
			...(options.preInputArgs ?? []),
			"-i",
			inputPath,
			...options.args,
			outputPath
		];
		await runFfmpeg(ffmpegArgs);

		const buffer = await readFile(outputPath);
		return {
			buffer,
			outputExtension: `.${outputExt}`
		};
	});
}
