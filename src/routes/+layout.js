import { tools } from './tools.js';

// @ts-ignore
export async function load({route, url}) {
    return {
        tools: tools,
        meta: getMeta(route, url)
    };
}

// @ts-ignore
function getMeta(route, url) {
    if (route.id && route.id.includes("(tools)")) {
        // @ts-ignore
        let tool = tools[url.pathname.replace("/","")];
        return {
            title: tool.name,
            description: tool.description
        }
    }
    return 0;
}