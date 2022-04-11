const fsLibrary = require('fs');

const cssSource = fsLibrary.createReadStream('./src/templates/reveal.js/PR.css');
const cssDestination = fsLibrary.createWriteStream('./output/PR.css');

cssDestination.pipe(cssSource);