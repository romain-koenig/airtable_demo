const { copyFile } = require('fs/promises');
const { readFile, logging, writeFile, printRecipients } = require("./libs/utils");


logging("Starting Mail generation");

(async () => {

	const templatesFile = await readFile("./data/templates.json");
	const templates = JSON.parse(templatesFile);


	const recipientsFile = await readFile("./data/recipients.json");
	const recipients = JSON.parse(recipientsFile);

	logging(`Template file : ${templates}`);

	templates.map(template => {

		const currentRecipients = recipients.filter(recipient => {
			logging(`Comparing ${template.teamName[0]} and ${recipient.teamName} : ${template.teamName[0] == recipient.teamName}`)
			return template.teamName[0] == recipient.teamName;
		});


		// logging(`All recipients : ${JSON.stringify(recipients)}`);
		logging(`Current (filtered) recipients : ${JSON.stringify(currentRecipients)}`);
		// logging(`Templates : ${JSON.stringify(template)}`);


		printRecipients(currentRecipients);

	})


})();