const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36";

type FetchResult =
	| { ok: true; data: { html: string; finalUrl: string; contentType: string; status: number } }
	| { ok: false; status: number; message: string };

type HeadResult =
	| { ok: true; data: { status: number; statusText: string; finalUrl: string; headers: Record<string, string> } }
	| { ok: false; status: number; message: string };

function validateUrl(target: string | null): { ok: true; url: URL } | { ok: false; status: number; message: string } {
	if (!target) {
		return { ok: false, status: 400, message: "Missing url parameter" };
	}

	try {
		const parsed = new URL(target);
		if (!["http:", "https:"].includes(parsed.protocol)) {
			return { ok: false, status: 400, message: "Only http and https protocols are supported" };
		}
		return { ok: true, url: parsed };
	} catch {
		return { ok: false, status: 400, message: "Invalid URL" };
	}
}

export async function fetchHtmlResource(target: string | null, fetchImpl: typeof fetch): Promise<FetchResult> {
	const validated = validateUrl(target);
	if (!validated.ok) {
		return validated;
	}

	try {
		const response = await fetchImpl(validated.url.toString(), {
			method: "GET",
			headers: {
				"User-Agent": USER_AGENT,
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			},
			redirect: "follow",
		});

		if (!response.ok) {
			return {
				ok: false,
				status: response.status,
				message: `Upstream request failed with status ${response.status}`,
			};
		}

		const html = await response.text();

		return {
			ok: true,
			data: {
				html,
				finalUrl: response.url ?? validated.url.toString(),
				contentType: response.headers.get("content-type") ?? "",
				status: response.status,
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return { ok: false, status: 502, message: `Failed to retrieve content: ${message}` };
	}
}

export async function headRequest(target: string | null, fetchImpl: typeof fetch): Promise<HeadResult> {
	const validated = validateUrl(target);
	if (!validated.ok) {
		return validated;
	}

	try {
		const response = await fetchImpl(validated.url.toString(), {
			method: "HEAD",
			headers: {
				"User-Agent": USER_AGENT,
				Accept: "*/*",
			},
			redirect: "follow",
		});

		const headers: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			headers[key] = value;
		});

		return {
			ok: true,
			data: {
				status: response.status,
				statusText: response.statusText ?? "",
				finalUrl: response.url ?? validated.url.toString(),
				headers,
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return { ok: false, status: 502, message: `Failed to inspect link: ${message}` };
	}
}
