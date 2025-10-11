import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toolsFolder = path.join(__dirname, "src", "routes", "(tools)");
const categoriesConfigPath = path.join(
    __dirname,
    "src",
    "lib",
    "data",
    "categories.json",
);
const toolsJsonFilePath = path.join(__dirname, "src", "routes", "tools.json");

const categoriesConfig = JSON.parse(
    fs.readFileSync(categoriesConfigPath, "utf-8"),
).categories;

function readMeta(slug) {
    const metaFilePath = path.join(toolsFolder, slug, "meta.json");

    if (!fs.existsSync(metaFilePath)) {
        throw new Error(`Missing meta.json for tool "${slug}"`);
    }

    try {
        return JSON.parse(fs.readFileSync(metaFilePath, "utf-8"));
    } catch (error) {
        throw new Error(`Unable to parse meta.json for tool "${slug}": ${error.message}`);
    }
}

function collectToolsByCategory() {
    const categoryMap = new Map();
    const knownCategories = new Set(categoriesConfig.map((category) => category.title));

    const entries = fs.readdirSync(toolsFolder, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith(".")) {
            continue;
        }

        const slug = entry.name;

        const metaFilePath = path.join(toolsFolder, slug, "meta.json");

        if (!fs.existsSync(metaFilePath)) {
            console.warn(`Skipping "${slug}" because meta.json is missing.`);
            continue;
        }

        const meta = readMeta(slug);

        if (!meta.categoryTitle) {
            throw new Error(`Missing "categoryTitle" in meta.json for tool "${slug}"`);
        }

        if (!knownCategories.has(meta.categoryTitle)) {
            console.warn(
                `Warning: category "${meta.categoryTitle}" (from "${slug}") is not defined in categories.json.`,
            );
        }

        const toolData = {
            name: meta.name,
            link: `/${slug}`,
            description: meta.description,
            contributors: meta.contributors ?? [],
        };

        if (!categoryMap.has(meta.categoryTitle)) {
            categoryMap.set(meta.categoryTitle, []);
        }

        categoryMap.get(meta.categoryTitle).push(toolData);
    }

    for (const tools of categoryMap.values()) {
        tools.sort((a, b) => a.name.localeCompare(b.name));
    }

    return categoryMap;
}

const categoryMap = collectToolsByCategory();
const toolsData = {
    categories: [
        ...categoriesConfig.map((category) => {
            const tools = categoryMap.get(category.title) ?? [];
            categoryMap.delete(category.title);

            return {
                title: category.title,
                details: category.details,
                tools,
            };
        }),
        ...Array.from(categoryMap.entries()).map(([title, tools]) => ({
            title,
            details: "",
            tools,
        })),
    ],
};

fs.writeFileSync(toolsJsonFilePath, JSON.stringify(toolsData, null, 4));

console.log("tools.json file has been created successfully!");
