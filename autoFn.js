"use strict"

const fs = require('node:fs').promises;
const path = require('node:path');
const { watch } = require('node:fs/promises');
const { getTemplate } = require('./template');
let directoryPaths = new Set(); 
let directoryFilePaths = new Set();
let extensions =[];

(
    async () => {

        const configPath = path.join(__dirname, 'conf.json');
        try {
            const res = await fs.readFile(configPath, 'utf8');
            const json = await JSON.parse(res);
            const dirPath  = json.dir;
            extensions = json.target;

            directoryPaths = new Set(await getAllDirectories(dirPath)); 
            directoryFilePaths = new Set(await getAllDirectoryFiles(dirPath, extensions));

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

async function writeAllFiles (filesPaths, flag = false) {

        for (const filePath of filesPaths) {

        const fileName = path.basename(filePath, path.extname(filePath));
        const extension = path.extname(filePath);

        try {
            const stats = await fs.stat(filePath);
            if (!flag && stats.size !== 0) continue;

            const code = await getTemplate(extensions, extension, fileName);
            fs.writeFile(filePath, code, err => {
                if(err) throw new Error (`Error writting Function body: ${file}`, err.message);
            })
            console.log("data written successfully");

        } catch (err) {
            console.error("error checking file: ", err);
        }
    }

    return;
}

const listenDirChanges = async (directoryPaths, directoryFilePaths) => {
    for (const dirPath of directoryPaths) watchDirectory(dirPath);


    async function watchDirectory(dirPath) {
        try {
            const watcher = watch(dirPath, { recursive: false });

            for await (const event of watcher) {
                const fullPath = path.join(dirPath, event.filename);

                try {
                    const stats = await fs.stat(fullPath);

                    if (stats.isDirectory()) {
                        if (!directoryPaths.has(fullPath)) {
                            directoryPaths.add(fullPath);
                            await watchDirectory(fullPath);

                            const subDirs = await getAllDirectories(fullPath);
                            for (const subDir of subDirs) {
                                if (!directoryPaths.has(subDir)) {
                                    directoryPaths.add(subDir);
                                    await watchDirectory(subDir);
                                }
                            }
                        }
                    } else if (stats.isFile()) {
                        if (!directoryFilePaths.has(fullPath)) {
                            directoryFilePaths.add(fullPath);
                            writeAllFiles([fullPath]);
                        }
                        if (event.eventType === 'rename') {
                            writeAllFiles([fullPath], true);
                        }
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

