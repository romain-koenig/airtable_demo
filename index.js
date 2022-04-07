require('dotenv').config();
const { logging } = require("./libs/utils");
const { writeFile } = require("./libs/utils");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.BASE_ID;
const NEWS_TABLE_ID = process.env.NEWS_TABLE_ID;
const NEWS_THIS_WEEK_VIEW = process.env.NEWS_THIS_WEEK_VIEW;

// REAL TREATMENT STARTS HERE

(async () => {

	logging(`Before GETDATA`);
	let rawNewsOfTheWeek = await getData();
	logging(`After GETDATA`);

	let cleanNewsOfTheWeek = [];


	let content = "";

	for (let index = 0; index < rawNewsOfTheWeek.length; index++) {
		logging(rawNewsOfTheWeek[index]);

		let news = {
			title: rawNewsOfTheWeek[index].get('Name'),
			content: rawNewsOfTheWeek[index].get('Notes'),
			snake: rawNewsOfTheWeek[index].get('SNAKE_A')
		};

		cleanNewsOfTheWeek.push(news);

		content = content.concat(JSON.stringify(news).concat('\n'));
	}


	writeFile('./temp.json', content)

})();


function getData(params) {
	return new Promise((resolve, reject) => {

		var Airtable = require('airtable');
		var base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

		base(NEWS_TABLE_ID).select({
			// Selecting the first 100 records in All News:
			maxRecords: 100,
			view: NEWS_THIS_WEEK_VIEW
		}).eachPage(function page(records, fetchNextPage) {
			// This function (`page`) will get called for each page of records.

			resolve(records);

			fetchNextPage();

		}, function done(err) {
			if (err) { loggingError(err); return; }
		});

	});
}