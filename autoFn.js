"use strict"

const fs = require('node:fs').promises;
const path = require('node:path');
const { watch } = require('node:fs/promises');
const { getTemplate } = require('./template');
let directoryPaths = new Set(); 
let directoryFilePaths = new Set();

(
    async () => {

        const configPath = path.join(__dirname, 'conf.json');
        try {
            const res = await fs.readFile(configPath, 'utf8');
            const json = await JSON.parse(res);
            const { target:extensions, dir:dirPath } = json;

            directoryPaths = await getAllDirectories(dirPath); 
            directoryFilePaths = await getAllDirectoryFiles(dirPath, extensions);


            writeAllFiles(directoryFilePaths);

            await listenDirChanges(directoryPaths, directoryFilePaths, extensions);

        } catch(err) {
            console.error(`init error: ${err.message}`);
        }
    }
)();

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
        const extension = path.extname(filePath);
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

/*
const listenDirChanges = async (directoryPaths, directoryFilePaths, extensions) => {
    for (const dirPath of directoryPaths) {
        try {
            const watcher = watch(dirPath, {recursive: false});

            for await (const event of watcher) {
                const fullPath = path.join(dirPath, event.filename);
                try {
                    const stats = await fs.stat(fullPath);
                    if (stats.isDirectory()) {

                        directoryPaths.push(fullPath);
                        const subDirs = await getAllDirectories(fullPath);
                        directoryPaths.push(...subDirs);
                        listenDirChanges(directoryPaths);
                    } else if (stats.isFile()) {
 
                        directoryFilePaths.push(fullPath);
                        const childrenFiles = await getAllDirectoryFiles(fullPath, extensions);
                        directoryFilePaths.push(...childrenFiles);
                        if (stats.size === 0) writeAllFiles(directoryFilePaths);
                    }

                } catch (err) {
                 if (err.code !== 'ENOENT') {
                        console.error("Error handling event:", err.message);
                    }

                }

            }

        } catch (err) {
              console.error(`Error watching ${dirPath}:`, err.message);
        }
    }

} 

*/
