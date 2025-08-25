"use strict";

const js = (fileName) => { 
    return `
"use strict";

function ${fileName} () {
    return ;
}

module.exports = { ${fileName} };
`; }




const jsx = (fileName) => {return`
"use strict"

export default function ${fileName}() {
    return (
        <>
        </>
    );
}`; }




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


module.exports = {
	js,
	jsx,
	ts,
	tsx,
};
