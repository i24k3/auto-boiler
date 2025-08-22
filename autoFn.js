"use strict"

const fs = require('node:fs').promises;
const path = require('node:path');
const { watch } = require('node:fs/promises');
const { getTemplate } = require('./template');

async function getAllDirectoryFiles (parentPath, extensions) {
    let filesPath = [];
    try {
        const childrens = await fs.readdir(parentPath);
        for (const children of childrens) {
            const childrenPath = path.join(parentPath, children);

            const stats = await fs.stat(childrenPath);

            if (stats.isDirectory()) {
                const dirChildren = await getAllDirectoryFiles(childrenPath, extensions);
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

let flag = true;
async function getAllDirectories (rootDir) {
    let folders = [];
    if (flag) {
        folders.push(rootDir);
        flag = false;
    }
    try {
        const contents = await fs.readdir(rootDir);
        for (const item of contents) {
            const itemPath = path.join(rootDir, item);

            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
                folders.push(itemPath);
                const subDir = await getAllDirectories(itemPath);
                folders = folders.concat(subDir);
            }
        }
    } catch (err) {
        console.error("Error reading dir: ", err.message);
    }
    return folders;
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

async function autoFunction (dirPath, extensions) {
    const dirs = await getAllDirectoryFiles(dirPath, extensions);
    writeAllFiles(dirs);

    return;
}

const listenDirChanges = async (dirPath, extensions) => {
    const dirPaths = await getAllDirectories(dirPath); 
    const filePaths = await getAllDirectoryFiles(dirPath);

    const allPaths = [...dirPaths,...filePaths]

    allPaths.forEach(async (itemPath) => {
        try {
            const watcher = watch(itemPath);
            for await (const event of watcher) {
                console.log("delete file event: ", event.eventType);
                console.log("delete folder event: ", event.eventType);
                if (['change', 'rename'].includes(event.eventType)) autoFunction(itemPath, extensions);
            }
        } catch (err) {
            console.error(`Error watching ${itemPath}:`, err.message);
        }
    });
} 


(
    async () => {
        const configPath = path.join(__dirname, 'conf.json');
        try {
            const res = await fs.readFile(configPath, 'utf8');

            const json = await JSON.parse(res);
            const extensions = json.target;
            const dirPath = json.dir;

            autoFunction(dirPath, extensions); 
            await listenDirChanges(dirPath, extensions);
        } catch(err) {
            console.error(`init error: ${err.message}`);
        }
    }
)();

