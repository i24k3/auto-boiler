"use strict";

const getTemplate = async (extensions, extension, fileName) => {
    if (!extensions.includes(extension)) throw new Error(`Extension ${extension} ins't supported`);

    const fn = getFunction(extension);
    return fn(fileName);

}


const functions = require('./codeTemplate');
const getFunction  = (extension) => {
    const fileType = extension.split('.')[1];
    return functions[fileType];
}

module.exports = {getTemplate};
