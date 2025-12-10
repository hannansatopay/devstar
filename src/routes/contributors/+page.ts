type ContributorSummary = {
	name: string;
	githubId?: string;
};

import contributorsSource from "./contributors.json";

import type { PageLoad } from "./$types";

const contributorsRaw = contributorsSource as ContributorSummary[];

const normalizeContributor = (contributor: ContributorSummary) => {
	const name = contributor.name?.trim();
	const githubId = contributor.githubId?.trim();

	return {
		name: name && name.length > 0 ? name : githubId ?? "Unknown Contributor",
		githubId: githubId && githubId.length > 0 ? githubId : undefined,
	};
};

const normalizeSortValue = (value: string) =>
	(value ?? "").trim().toLowerCase();

const contributorsOrdered = contributorsRaw
	.map(normalizeContributor)
	.sort((a, b) => {
		const nameA = normalizeSortValue(a.name);
		const nameB = normalizeSortValue(b.name);
		if (nameA < nameB) return -1;
		if (nameA > nameB) return 1;
		return 0;
	});

export const load: PageLoad = async () => ({
	contributors: [...contributorsOrdered],
});
