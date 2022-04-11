const fsLibrary = require('fs').promises;

const logging = content => console.log(content);
exports.logging = logging;

const loggingError = content => console.error(content);
exports.loggingError = loggingError;

const writeFile = (filePath, content) => {
	fsLibrary.writeFile(filePath, content, (error) => {
		// In case of a error throw err exception. 
		if (error)
			throw error;
	});
};
exports.writeFile = writeFile;

const readFile = async (filePath) => {
	const data = await fsLibrary.readFile(filePath, 'utf8');
	return data;
}
exports.readFile = readFile;
