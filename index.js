require('dotenv').config();
const { logging } = require("./libs/utils");
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
// REAL TREATMENT STARTS HERE

(async () => {

	let rawNewsOfTheWeek = await getRawDataFromAirtable(NEWS_TABLE_ID, NEWS_THIS_WEEK_VIEW);

	// let rawTeams = await getRawDataFromAirtable(TEAMS_TABLE_ID, TEAMS_VIEW);
	let rawRecipients = await getRawDataFromAirtable(RECIPIENTS_TABLE_ID, RECIPIENTS_VIEW);

	logging(rawNewsOfTheWeek);

	logging("-------------------");

	const cleanedNewsOfTheWeek = rawNewsOfTheWeek.map(news => {
		return {
			title: news.get('Name'),
			content: news.get('Notes'),
			snake: news.get('SNAKE_A'),
			teams: news.get('Teams')
		};
	});

	// const cleanedTeams = rawTeams.map(team => {
	// 	return {
	// 		name: team.get('Name'),
	// 		shortName: team.get('Nom Court')
	// 	}
	// }
	// );

	const cleanedRecipients = rawRecipients.map(recipient => {
		return {
			name: recipient.get('Name'),
			mail: recipient.get('mail'),
			team: recipient.get('Team')
		}
	});
	logging(cleanedTeams);
	logging(cleanedRecipients.map(recipient => {
		return `${recipient.name} - ${recipient.mail} - ${recipient.team}`
	})
		.reduce((a, b) => a.concat(['\n', b])));

	const newsInMail = cleanedNewsOfTheWeek.map(news => printNewsMail(news, true));

	writeFile('./temp.html', newsInMail.join(""));

	const templateFile = "./templates/MailArchi.eml"
	fsLibrary.readFile(templateFile, (error, data) => {
		// In case of a error throw err exception. 
		if (error) {
			throw error;
		}
		else {
			const template = data.toString();

			const content = template.replace('<!-- Content here -->', newsInMail.join("\n")
			);

			writeFile('./out.eml', content);
		}
	});

})();



function printNewsMail(news, isWithTeam) {

	const template = isWithTeam ? articleWithTeam : articleWithoutTeam;

	const bloc = template.replace("SUBJECT_TITLE", news.title)
		.replace("TEAMS_HERE", news.teams.join(" - "))
		.replace("DESCRIPTION_HERE", news.content)
		.replace("SNAKE_LINKS_HERE", news.snake.join("<br>"))
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