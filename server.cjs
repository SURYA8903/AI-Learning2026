const fs = require('fs');
const path = require('path');
const Module = module.constructor;

const filename = path.join(__dirname, 'server.js');
const source = fs.readFileSync(filename, 'utf8');
const loadedModule = new Module(filename, module);

loadedModule.filename = filename;
loadedModule.paths = Module._nodeModulePaths(path.dirname(filename));
loadedModule._compile(source, filename);
