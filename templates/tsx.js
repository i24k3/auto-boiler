
const tsx = (fileName) => {return `
const ${fileName} = () => {
    return (
        <>
        </>
    );
}

export default ${fileName};
`; }

