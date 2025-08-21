const getTemplate= (extension, fileName) => {
    switch (extension) {

        case ".jsx":
            return jsx(fileName);

        case ".ts":
            return ts(fileName);

        case ".tsx":
            return tsx(fileName);

        default:
            return js(fileName);
    }
}


const js = (fileName) => { return `
"use strict";

function ${fileName} () {
    return ;
}

module.exports = { ${fileName} };
`; }

const ts = (fileName) => {return `
export const ${fileName} = () => {
    return ;
}`; }

const tsx = (fileName) => {return `
const ${fileName} = () => {
    return (
        <>
        </>
    );
}

export default ${fileName};
`; }

const jsx = (fileName) => {return`
"use strict"

export default function ${fileName}() {
    return (
        <>
        </>
    );
}`; }


module.exports = {getTemplate};

