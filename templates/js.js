
const js = (fileName) => { 
    return `
"use strict";

function ${fileName} () {
    return ;
}

module.exports = { ${fileName} };
`; }


