"use strict";

const jsx = (fileName) => {return`
"use strict"

export default function ${fileName}() {
    return (
        <>
        </>
    );
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



const ts = (fileName) => {return `
export const ${fileName} = () => {
    return ;
}`; }




const js = (fileName) => { 
    return `
"use strict";

function ${fileName} () {
    return ;
}

module.exports = { ${fileName} };
`; }



module.exports = {
	jsx,
	tsx,
	ts,
	js,
};
