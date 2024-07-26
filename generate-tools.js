import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the folder containing the tools
const toolsFolder = path.join(__dirname, 'src', 'routes', '(tools)');

// Initialize an empty object to hold the tools data
let toolsData = {};

// Read all subfolders within the tools folder
fs.readdirSync(toolsFolder).forEach(subfolder => {
    const subfolderPath = path.join(toolsFolder, subfolder);
    const metaFilePath = path.join(subfolderPath, 'meta.json');

    if (subfolder === '.blank') {
        return; // Skip the .blank folder
    }

    // Check if meta.json file exists in the subfolder
    if (fs.existsSync(metaFilePath)) {
        const metaContent = fs.readFileSync(metaFilePath, 'utf-8');
        const metaJson = JSON.parse(metaContent);

        // Add the tool data to the toolsData object
        toolsData[subfolder] = {
            name: metaJson.name,
            link: `/${subfolder}`,
            description: metaJson.description,
            contributors: metaJson.contributors
        };
    }
});

const toolsJsonFilePath = path.join(__dirname, 'src', 'routes', 'tools.json');

// Write the content to tools.json file 
fs.writeFileSync(toolsJsonFilePath, JSON.stringify(toolsData, null, 4));

console.log('tools.json file has been created successfully!');