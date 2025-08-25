"use strict";

const getTemplate = async (extensions, extension, fileName) => {
    if (extensions.includes(extension)) {
        const fn = getFunction(extension);
        return fn(fileName);
    }
    return;  
}

const functions = require('./boilerplates');
const getFunction  = (extension) => {
    const parts = extension.split('.');
    const fileType = parts[parts.length - 1];

    return functions[fileType];
}

module.exports = {getTemplate};
