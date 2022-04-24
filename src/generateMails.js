const { copyFile } = require('fs/promises');
const { readFile, logging, writeFile, printRecipients } = require("./libs/utils");


logging("Starting Mail generation");

(async () => {

	const templatesFile = await readFile("./data/templates.json");
	const templates = JSON.parse(templatesFile);

	const recipientsFile = await readFile("./data/recipients.json");
	const recipients = JSON.parse(recipientsFile);

	const newsFile = await readFile("./data/newsOfTheWeek.json");
	const news = JSON.parse(newsFile);

	templates.map(teamTemplate => {

		const currentRecipients = recipients.filter(recipient => {
			return teamTemplate.teamName[0] == recipient.teamName;
		});

		printRecipients(currentRecipients);

	})


})();