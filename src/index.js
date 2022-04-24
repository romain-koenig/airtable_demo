require('dotenv').config();
const { logging, download, printRecipients } = require("./libs/utils");
const { writeFile } = require("./libs/utils");
const fsLibrary = require('fs');

const { articleWithTeam } = require("./templates/snippets/htmlSnippets");
const { articleWithoutTeam } = require("./templates/snippets/htmlSnippets");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.BASE_ID;

const NEWS_TABLE_ID = process.env.NEWS_TABLE_ID;
const NEWS_THIS_WEEK_VIEW = process.env.NEWS_THIS_WEEK_VIEW;

const TEAMS_TABLE_ID = process.env.TEAMS_TABLE_ID;
const TEAMS_VIEW = process.env.TEAMS_VIEW;

const RECIPIENTS_TABLE_ID = process.env.RECIPIENTS_TABLE_ID;
const RECIPIENTS_VIEW = process.env.RECIPIENTS_VIEW;

const TEMPLATES_MAIL_TABLE_ID = process.env.TEMPLATES_MAIL_TABLE_ID;
const TEMPLATES_MAIL_VIEW = process.env.TEMPLATES_MAIL_VIEW;
// REAL TREATMENT STARTS HERE

(async () => {

	logging("Get DATA from AIRTABLE");

	const rawNewsOfTheWeek = await getRawDataFromAirtable(NEWS_TABLE_ID, NEWS_THIS_WEEK_VIEW);
	const rawTeams = await getRawDataFromAirtable(TEAMS_TABLE_ID, TEAMS_VIEW);
	const rawRecipients = await getRawDataFromAirtable(RECIPIENTS_TABLE_ID, RECIPIENTS_VIEW);

	const rawTemplates = await getRawDataFromAirtable(TEMPLATES_MAIL_TABLE_ID, TEMPLATES_MAIL_VIEW);

	writeFile("./temp.json", JSON.stringify(rawTemplates));


	logging("Cleaning DATA");

	const cleanedNewsOfTheWeek = rawNewsOfTheWeek.map(news => {
		return {
			project: news.get('PROJECT_NAME'),
			title: news.get('Name'),
			content: news.get('Notes'),
			snake: news.get('SNAKE_A'),
			teams: news.get('Teams')
		};
	});

	writeFile("./data/newsOfTheWeek.json", JSON.stringify(cleanedNewsOfTheWeek));

	const cleanedTeams = rawTeams.map(team => {
		return {
			name: team.get('Name'),
			shortName: team.get('Nom Court')
		}
	}
	);
	writeFile("./data/teams.json", JSON.stringify(cleanedTeams));

	const cleanedRecipients = rawRecipients.map(recipient => {
		return {
			name: recipient.get('Name'),
			mail: recipient.get('mail'),
			teamName: recipient.get('TEAM_NAME'),
			teamShortName: recipient.get('TEAM_SHORT_NAME')
		}
	});

	writeFile("./data/recipients.json", JSON.stringify(cleanedRecipients));

	const cleanedTemplates = await rawTemplates.map(template => {
		return {
			id: template.get('ID'),
			template_link: template.get('TEMPLATE_LINK'),
			teamName: template.get('TEAM_NAME'),
			teamShortName: template.get('TEAM_SHORT_NAME'),
			printTeam: template.get('PRINT_TEAMS')
		}
	})

	writeFile("./data/templates.json", JSON.stringify(cleanedTemplates));

	cleanedTemplates.map(template => {

		const templateLink = template.template_link[0];

		logging(`Downloading from ${templateLink.url}`);
		logging(`Template : ${JSON.stringify(template)}`);

		download(templateLink.url, `./data/templates/${templateLink.filename}`)

	})


	//	logging(cleanedTeams);
	printRecipients(cleanedRecipients);

	const newsInMail = cleanedNewsOfTheWeek.map(news => printNewsMail(news, true));

	writeFile('./temp.html', newsInMail.join(""));

	const templateFile = "./src/templates/MailArchi.eml"
	fsLibrary.readFile(templateFile, (error, data) => {
		// In case of a error throw err exception. 
		if (error) {
			throw error;
		}
		else {
			const template = data.toString();

			let content = template.replace('<!-- Content here -->', newsInMail.join("\n")
			);

			content = content.replace("ARCHI_TO", cleanedRecipients.filter(recipient => { return recipient.team == "Architecture & Innovation" })
				.reduce((a, b) => a.concat(`=?UTF-8?Q?${b.name}?= <${b.mail}> ; `), ""));

			content = content.replace("ARCHI_CC", cleanedRecipients.filter(recipient => { return recipient.mail == "laurent.bel@pernod-ricard.com" })
				.reduce((a, b) => a.concat(`=?UTF-8?Q?${b.name}?= <${b.mail}> ; `), ""));

			const now = new Date(Date.now());
			content = content.replace("SEND_DATE", `${now.getDate()}/${now.getMonth()}/${now.getFullYear()}`);

			writeFile('./out.eml', content);
		}
	});

})();



function printNewsMail(news, isWithTeam) {

	const template = isWithTeam ? articleWithTeam : articleWithoutTeam;

	const bloc = template.replace("SUBJECT_TITLE", news.title)
		.replace("TEAMS_HERE", news.teams.join(" - "))
		.replace("DESCRIPTION_HERE", news.content)
		.replace("SNAKE_LINKS_HERE", news.snake)
		.replace(/\n/g, '<br/>');


	return bloc;
}

function getRawDataFromAirtable(table, view) {
	return new Promise((resolve, reject) => {

		var Airtable = require('airtable');
		var base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

		base(table).select({
			// Selecting the first 100 records in All News:
			maxRecords: 100,
			view: view
		}).eachPage(function page(records, fetchNextPage) {
			// This function (`page`) will get called for each page of records.

			resolve(records);

			fetchNextPage();

		}, function done(err) {
			if (err) { loggingError(err); return; }
		});

	});
}