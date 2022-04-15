const fsLibrary = require('fs').promises;
const fs = require('fs');
const request = require('request');

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



const download = async (url, dest) => {

	/* Create an empty file where we can save data */
	const file = fs.createWriteStream(dest);

	/* Using Promises so that we can use the ASYNC AWAIT syntax */
	await new Promise((resolve, reject) => {
		request({
			/* Here you should specify the exact link to the file you are trying to download */
			uri: url,
			gzip: false,
		})
			.pipe(file)
			.on('finish', async () => {
				console.log(`The file is finished downloading.`);
				resolve();
			})
			.on('error', (error) => {
				reject(error);
			});
	})
		.catch((error) => {
			console.log(`Something happened: ${error}`);
		});
}
exports.download = download;


const printRecipients = (currentRecipients) => {
	logging(
		currentRecipients.map(recipient => {
			return `${recipient.mail} - ${recipient.name} - ${recipient.teamShortName}`;
		})
			.reduce((a, b) => a.concat(`${b}\n`), ""));
}
exports.printRecipients = printRecipients;