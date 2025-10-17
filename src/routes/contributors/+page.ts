type ContributorSummary = {
	name: string;
	githubId?: string;
};

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

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

export const load: PageLoad = async () => {
	const contributors = contributorsRaw
		.map(normalizeContributor)
		.sort((a, b) => collator.compare(a.name, b.name));

	return {
		contributors,
	};
};
