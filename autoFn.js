"use strict"

const fs = require('node:fs').promises;
const path = require('node:path');

const targetExtensions = ['.jsx','.tsx', '.ts', '.js'];


async function readAllDirs (parentPath, extensions=targetExtensions) {
    let filesPath = [];
    try {
        const childrens = await fs.readdir(parentPath);
        for (const children of childrens) {
            const childrenPath = path.join(parentPath, children);

            const stats = await fs.stat(childrenPath);

            if (stats.isDirectory()) {
                const dirChildren = await readAllDirs(childrenPath);
                filesPath = filesPath.concat(dirChildren);
            } else if (stats.isFile()) {
                if (extensions.includes(path.extname(children))) filesPath.push(childrenPath);
            }
        }
    } catch (err) {
        console.error("Error reading dir", err.message);
    }
    return filesPath;
}

function writeAllFiles (filesPaths) {
    const strictMode = '"use strict"\n';
    filesPaths.forEach(filePath => {
        const fileName = path.basename(filePath, path.extname(filePath));

let fnBody = `
export function ${fileName}() {

    return (
        <>
        </>
    );
}
`;

        if (path.extname(filePath) === ".jsx" || path.extname(filePath) === '.js') fnBody = strictMode + fnBody;

        fs.writeFile(filePath, fnBody, err => {
            if(err) throw new Error (`Error writting Function body: ${file}`, err.message);
        })
        console.log("data written successfully");
    });

    return;
}

async function autoFunction (dirPath) {
    const dirs = await readAllDirs(dirPath);
    writeAllFiles(dirs);
    return;
}
autoFunction('./src');

