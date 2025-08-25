"use strict";

const getTemplate = async (extensions, extension, fileName) => {
    if (!extensions.includes(extension)) return;  

    const fn = getFunction(extension);
    return fn(fileName);
}

const functions = require('./boilerplates');
const getFunction  = (extension) => {
    const parts = extension.split('.');
    const fileType = parts[parts.length - 1];

    return functions[fileType];
}

module.exports = {getTemplate};
