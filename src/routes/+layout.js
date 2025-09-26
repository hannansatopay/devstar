import tools from "./tools.json";

// @ts-ignore
export async function load({ route, url }) {
  return {
    tools: tools,
    meta: getMeta(url),
  };
}

// @ts-ignore
function getMeta(url) {
  // Extract tool link from the URL
  const toolLink = url.pathname.replace("/", "");

  // Search through all categories for the tool with the matching link
  let tool = null;
  for (const category of tools.categories) {
    tool = category.tools.find(t => t.link.replace("/", "") === toolLink);
    if (tool) break;
  }

  // Return meta data if the tool is found
  if (tool) {
    return {
      title: tool.name,
      description: tool.description,
      contributors: tool.contributors,
    };
  }

  // Default meta if no tool found
  return {
    title: "",
    description: "",
    contributors: [],
  };
}
