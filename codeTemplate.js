"use strict";

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

const java = (fileName) => {return `
public class ${fileName}{
    public static void ${fileName.toLowerCase()}(String args[]) {

    }
}
`;}


module.exports = {
    js,
    ts,
    tsx,
    jsx,
    java,
};
