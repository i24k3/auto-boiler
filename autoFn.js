#!/usr/bin/env node
"use strict"

const fs = require('node:fs').promises;
const path = require('node:path');
const { watch } = require('node:fs/promises');
const { getTemplate } = require('./template');

let directoryPaths = new Set(); 
let directoryFilePaths = new Set();
let extensions =[];
let renameFlag = false;


require('./createTemp');
(
    async () => {
        const configPath = path.join(__dirname, 'conf.json');
        try {
            const res = await fs.readFile(configPath, 'utf8');
            const json = JSON.parse(res);
            const { 
                listenRootDirs: dirPaths,
                targetedFiles, 
                renameOverridesFileContent } = json;
            extensions = targetedFiles;
            renameFlag = renameOverridesFileContent;

            for (const dirPath of dirPaths) {
                directoryPaths.add(dirPath);
                const dirs = await getAllDirectories(dirPath);
                const files = await getAllDirectoryFiles(dirPath, extensions);

                dirs.forEach(dir => directoryPaths.add(dir));
                files.forEach(file => directoryFilePaths.add(file));
            }

            listenDirChanges(directoryPaths, directoryFilePaths);

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

async function getAllDirectories (rootDir) {
    let folders = [];
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
            if (typeof code !== 'string') {
                console.warn(`No template found for extension "${extension}". Skipping: ${filePath}`);
                continue;
            }
            fs.writeFile(filePath, code, err => {
                if(err) throw new Error (`Error writting Function body: ${file}`, err.message);
            })
            if (!flag) {
                console.log("data override Disabled: rename will NOT Override the file contents");
            } else {
                console.log("data override Enabled: rename WILL Override the file contents");
            }
            console.log("data written successfully");

        } catch (err) {
            console.error("error checking file: ", err);
        }
    }

    return;
}

let filesAlreadExistInDir = true;
const listenDirChanges = (directoryPaths, directoryFilePaths) => {
    if (filesAlreadExistInDir) {
        writeAllFiles(directoryFilePaths);
        filesAlreadExistInDir = false;
    }

    const watchDir = async (dpath) => {
        try {
            await fs.access(dpath);
        } catch (err) {
            console.warn(`failed to watch the specified path: ${dpath} `,err.message);
            return;
        }



        const watcher = watch(dpath);
        for await (const event of watcher) {

            const fullPath = path.join(dpath, event.filename);
            let stats;
            try {
                stats = await fs.stat(fullPath);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    // File was deleted or renamed
                    console.log(`Deleted or moved: ${event.filename}`);
                    directoryFilePaths.delete(fullPath);
                    continue;
                } else {
                    // Other unexpected error
                    console.error('Error accessing:', fullPath, err);
                    continue;
                }
            }

            if (stats.isDirectory()) {
                if (! directoryPaths.has(fullPath)) {
                    directoryPaths.add(fullPath);
                    watchDir(fullPath);
                    const dirs = await getAllDirectories(fullPath); 
                    for (const dir of dirs) {
                        if (!directoryPaths.has(dir)) {
                            directoryPaths.add(dir);
                            await watchDir(dir); 
                            console.log("nested dir added:", dir);
                        }
                    }
                    console.log("dir added: ", fullPath);
                }

            } else if (stats.isFile()) {
                if (! directoryFilePaths.has(fullPath)) {
                    directoryFilePaths.add(fullPath);
                    console.log("file added: ", fullPath);
                }

                if (event.eventType === 'rename') {
                    console.log("file renamed",event.filename);

                    writeAllFiles([fullPath], renameFlag);

                    const pathSeg = getPathSegments(fullPath);
                    for (const seg of pathSeg) {
                        if (!directoryPaths.has(seg)) {
                            directoryPaths.add(seg);
                            await watchDir(seg); 
                            console.log("dir Added: dir was created via a file", dir);
                        }
                    }

                }

            }
            writeAllFiles(directoryFilePaths);
        }
    }

    for (const dpath of directoryPaths) watchDir(dpath);
}

/*
const getPathSegments = (pathStr)  => {
    let pathSeg = [];
    const pathParts = pathStr.split('/');
    let dirPath = "";
    for (const part of pathParts) {
        dirPath += (!dirPath ? "": "/") + part;
        pathSeg.push("/" + dirPath);
    }
    return pathSeg;
}
*/

const getPathSegments = (filePath) => {
    const absFilePath = path.resolve(filePath); 
    const baseDir = __dirname; 
    const relPath = path.relative(baseDir, absFilePath); 

    const parts = relPath.split(path.sep).filter(Boolean); 
    const segments = [];

    for (let i = 0; i < parts.length - 1; i++) { 
        const segment = path.join(baseDir, ...parts.slice(0, i + 1));
        segments.push(segment);
    }

    return segments;
};


