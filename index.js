require('dotenv').config();
const { logging } = require("./libs/utils");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

// REAL TREATMENT STARTS HERE

(async () => {

	var Airtable = require('airtable');
	var base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base('app2mNi1K5e87VIF5');

	const newsOfTheWeek = await base('News')
		.select(
			{
				view: "NewsThisWeek"
			}
		)
		.all();

	const teams = await base('Équipes')
		.select()
		.all();

	await Promise.all(newsOfTheWeek.map(async (news) => {

		logging(`News in the working list : ${news.get('Name')}`);
		const project = news.get('Projects');

		const projectDetails = await base('Projects').find(project);
		logging(`Project for ${news.get('Name')} : ${projectDetails.get('Name')}`);
	}));



	teams.forEach(team => {
		logging(`Teams : ${team.get('Name')}`)
	});

})();
