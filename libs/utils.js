const fsLibrary = require('fs');

const logging = content => console.log(content);
exports.logging = logging;

const loggingError = content => console.error(content);
exports.logging = loggingError;

const writeFile = (filePath, content) => {
	fsLibrary.writeFile(filePath, content, (error) => {
		// In case of a error throw err exception. 
		if (error)
			throw error;
	});
};
exports.writeFile = writeFile;