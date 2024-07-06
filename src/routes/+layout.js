// Import tools data from tools.json
import tools from './tools.json';

// Load function to fetch data for layout
export async function load({ route, url }) {
    return {
        tools: tools,
        meta: getMeta(route, url)
    };
}

// Function to get metadata based on route
function getMeta(route, url) {
    // Extract the parent folder name considering (tools)
    const parentFolder = getParentFolder(route.id);

    if (parentFolder) {
        const tool = tools[parentFolder];

        if (tool) {
            return {
                title: tool.name,
                description: tool.description,
                contributors: tool.contributors
            };
        } else {
            return {
                title: "Tool Not Found",
                description: "This tool does not exist.",
                contributors: []
            };
        }
    }

    // Default metadata if route doesn't match parent folder
    return {
        title: "Default Title",
        description: "Default Description",
        contributors: []
    };
}

// Function to get parent folder name
function getParentFolder(routeId) {
    if (routeId) {
        // Split routeId by '/' and find the correct parent folder
        const parts = routeId.split('/');
        // Loop through parts to find the correct parent folder
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === "(tools)") {
                if (parts.length > i + 1) {
                    return parts[i + 1];
                }
            }
        }
    }
    return null;
}
