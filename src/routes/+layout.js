import tools from "./tools.json";

// @ts-ignore
export async function load({ route, url }) {
  return {
    tools: tools,
    meta: getMeta(route, url),
  };
}

// @ts-ignore
function getMeta(route, url) {
  if (route.id && route.id.includes("(tools)")) {
    // @ts-ignore
    let tool = tools[url.pathname.replace("/", "")];
    if (tool) {
      return {
        title: tool.name,
        description: tool.description,
        contributors: tool.contributors,
      };
    } else {
      return {
        title: "",
        description: "",
        contributors: [],
      };
    }
  }
  return 0;
}
