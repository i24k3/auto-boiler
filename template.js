"use strict";

const fs = require('fs/promises');
const path = require('node:path');

const getTemplate = async (extension, fileName) => {
    const configPath = path.join(__dirname, 'conf.json');
    try {
        const res = await fs.readFile(configPath, 'utf8');
        const json = await JSON.parse(res);

        const extensions = json.target;
        if (!extensions.includes(extension)) throw new Error(`Extension ${extension} ins't supported`);
        
        const fn = getFunction(extension);
        return fn(fileName);

    } catch (err) {
        console.error("Error reading conf.json file: ",err);
        return " ";
    }
}


const functions = require('./codeTemplate');
const getFunction  = (extension) => {
    const fileType = extension.split('.')[1];
    return functions[fileType];
}

module.exports = {getTemplate};
