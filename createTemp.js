"use strict";

const fs = require("node:fs").promises;
const path = require("node:path");

async function getFiles (parentPath, extensions) {
    let filesPath = [];
    try {

        const files = await fs.readdir(parentPath);
        for (const file of files) {

            if (! extensions.includes(path.extname(file))) continue;

            const filePath = path.join(parentPath, file);
            filesPath = filesPath.concat(filePath);
        }
    } catch (err) {
        console.error("Error reading dir-templates: ", err.message);
    }
    return filesPath;
}

const templateProvider = async () => {
    try {
        const files = await getFiles('./templates/', '.js');
        await writeToBoilerplateFile(files);
    } catch (err) {
        console.error("Error getting files:", err.message);
    }
};



const writeToBoilerplateFile = async (files) => {
    let boilerplate = '"use strict";\n';
    let exportCode = "module.exports = {\n";
    for (const file of files) {
        try {


            const fileContent = await fs.readFile(file, 'utf8');
            boilerplate += fileContent + "\n";
            const name = path.basename(file);
            exportCode += `\t${name.split('.')[0]},\n`;

        } catch (err) {
            console.error(`Error reading file ${file}:`, err.message);
        }
    }
    exportCode += "};\n";
    boilerplate += exportCode;

    try {
        await fs.writeFile('./boilerplates.js', boilerplate);
        console.log("Successfully wrote boilerplates.js");
    } catch (err) {
        console.error("Error writing boilerplates.js:", err.message);
    }
};


(async () => {
    await templateProvider();
})();

