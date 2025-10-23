import { json } from "@sveltejs/kit";
import tls from "tls";

function normalizeHost(input: string) {
	if (!input) {
		return null;
	}
	try {
		const parsed = new URL(input.includes("://") ? input : `https://${input}`);
		return parsed.hostname;
	} catch {
		return null;
	}
}

function fetchCertificate(host: string, port = 443): Promise<tls.DetailedPeerCertificate> {
	return new Promise((resolve, reject) => {
		const socket = tls.connect(
			{
				host,
				port,
				servername: host,
				timeout: 8000,
			},
			() => {
				const certificate = socket.getPeerCertificate(true);
				socket.end();
				if (!certificate || Object.keys(certificate).length === 0) {
					reject(new Error("No certificate information was returned by the server."));
					return;
				}
				resolve(certificate);
			},
		);

		socket.on("error", (error) => {
			reject(error);
		});

		socket.on("timeout", () => {
			socket.destroy();
			reject(new Error("Connection timed out while retrieving the certificate."));
		});
	});
}

export const GET = async ({ url }) => {
	const rawHost = url.searchParams.get("host");
	const host = normalizeHost(rawHost ?? "");
	if (!host) {
		return json({ error: "Provide a valid domain or URL." }, { status: 400 });
	}

	try {
		const certificate = await fetchCertificate(host);

		const validFrom = certificate.valid_from ? new Date(certificate.valid_from) : null;
		const validTo = certificate.valid_to ? new Date(certificate.valid_to) : null;
		const now = new Date();
		const daysRemaining =
			validTo && !Number.isNaN(validTo.getTime())
				? Math.round((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
				: null;

		return json({
			host,
			issuer: certificate.issuer,
			subject: certificate.subject,
			validFrom: validFrom?.toISOString() ?? null,
			validTo: validTo?.toISOString() ?? null,
			daysRemaining,
			isValid:
				validFrom && validTo
					? validFrom.getTime() <= now.getTime() && now.getTime() <= validTo.getTime()
					: null,
			altnames: certificate.subjectaltname
				? certificate.subjectaltname
						.replace(/^DNS:/g, "")
						.split(",")
						.map((value) => value.trim().replace(/^DNS:/, ""))
				: [],
			fingerprint: certificate.fingerprint,
			fingerprint256: certificate.fingerprint256,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unable to retrieve SSL details.";
		return json({ error: message }, { status: 502 });
	}
};
