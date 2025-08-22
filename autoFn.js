"use strict"

const fs = require('node:fs').promises;
const path = require('node:path');
const { getTemplate } = require('./template');

async function readAllDirs (parentPath, extensions) {
    let filesPath = [];
    try {
        const childrens = await fs.readdir(parentPath);
        for (const children of childrens) {
            const childrenPath = path.join(parentPath, children);

            const stats = await fs.stat(childrenPath);

            if (stats.isDirectory()) {
                const dirChildren = await readAllDirs(childrenPath, extensions);
                filesPath = filesPath.concat(dirChildren);
            } else if (stats.isFile()) {
                if (extensions.includes(path.extname(children))) filesPath.push(childrenPath);
            }
        }
    } catch (err) {
        console.error("Error reading dir: ", err.message);
    }
    return filesPath;
}

function writeAllFiles (filesPaths) {
    filesPaths.forEach(async (filePath)=> {

        const fileName = path.basename(filePath, path.extname(filePath));
        const extension = filePath.slice(filePath.lastIndexOf('.'));
        const code = await getTemplate(extension, fileName);

        try {
            const stats = await fs.stat(filePath);
            if (stats.size !== 0) return;

            fs.writeFile(filePath, code, err => {
                if(err) throw new Error (`Error writting Function body: ${file}`, err.message);
            })
            console.log("data written successfully");



        } catch (err) {
            console.error("error checking file: ", err);
        }
    });

    return;
}

async function autoFunction () {

    const res = await fs.readFile('./conf.json', 'utf8');
    const json = await JSON.parse(res);
    const extensions = json.target;
    const dirPath = json.dir;

    const dirs = await readAllDirs(dirPath, extensions);
    writeAllFiles(dirs);

    return;
}

autoFunction();

