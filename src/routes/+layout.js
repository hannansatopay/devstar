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
    if (route.id.includes("(tools)")) {
        // @ts-ignore
        return tools[url.pathname.replace("/","")].meta
    }
    return 0;
}