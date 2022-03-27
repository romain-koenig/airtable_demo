require('dotenv').config();
const { logging } = require("./libs/utils");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;


// REAL TREATMENT STARTS HERE

(async () => {

	var Airtable = require('airtable');
	var base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base('app2mNi1K5e87VIF5');


	const newsOfTheWeek = await base('News').select(
		{
			view: "NewsThisWeek"
		}
	).all();


	newsOfTheWeek.forEach(news => {
		logging(`News in the working list : ${news.get('Name')}`);
	});

})();
