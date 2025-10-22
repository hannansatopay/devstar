import { json } from "@sveltejs/kit";
import { headRequest } from "$lib/server/httpProxy";

export const GET = async ({ url, fetch }) => {
	const result = await headRequest(url.searchParams.get("url"), fetch);
	if (!result.ok) {
		return json({ message: result.message }, { status: result.status });
	}
	return json(result.data);
};
