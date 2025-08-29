# auto-boiler

Auto-generate boilerplate for new files.
> Made for lazy devs like me.

## Install
install from npm and save it as a dev dependency 
> After all its a dev dependency.

```sh
npm install auto-boiler --save-dev
```

## Usage
Add to your projects `package.json` file.

```json
"scripts": {
    "auto": "auto-boiler",
}
```

## Execution/Run
let the script run in background terminal. Supports `.js`, `.jsx`, `.tsx`, `.ts` out of the box.
> i recommend using `tmux`

```sh
npm run auto
```

## Config 
By default the auto-boiler watches over the `./src/` dir as root. But multiple
root folders/dirs can be included. Say we want to also set the `./test/` as sibling root folder/dir.
In the auto-boiler folder (inside `./node_modules/`) look for `conf.json`. 
> There include the folder path, which is in our case the `./test/`.

```json
{
    "_comment": "change things around according to your use case, have fun >_<",
    "listenRootDirs": ["./src", "./test"],
    "renameOverridesFileContent": true
}
```

## Custom Templates
Drop a file in the `./templates/` folder. Name it after the extension to target (python = py.js, java = java.js)
> only use javascript files. For writting config any other files will be skipped.

**Example** `py.js`:

```js
function py(fileName) {
    return`
def ${fileName}(): 
    """
    Brief description of the function
    
    Args:
        parameters: Description

    Returns: 
        Description of return value
    """

    pass
`;
}
```
Now any *.py file will get the same boilerplate automatically within the targeted root folder(s).

## Critical 
By default the `renameOverridesFileContent` is set to `true`. what it simply means is that if a file is renamed while the script is running.
If the new file extension template exists in the template folder it will override the data irrespective of the data it holds. 
> set to false if you tend to change file extension after writting a lot of code. Replaced by boilerplate code.

## Tech
Built only with node.js core modules (`fs`, `path`). No external dependencies.

## Inspiration
- Next.js: The whole "path-based routing" thing made me think. They are just reading the path and then putting it 
inside a router-script to move based on paths. 

- NeoVim: The way nvim (especilly lazy.nvim) just auto detects the new pluggin automatically when put a file in a drectory. Inspired 
the idea for using adding files to get template for new extensions.

- my lazieness: honestly, i didn't want to type the same boilerplate, i know there is emmet and stuff but i am so lazy that i don't even wanna
type the few characters again and again. This Project is the result.


