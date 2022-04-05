require('dotenv').config();
const { logging } = require("./libs/utils");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.BASE_ID;
const NEWS_TABLE_ID = process.env.NEWS_TABLE_ID;
const NEWS_THIS_WEEK_VIEW = process.env.NEWS_THIS_WEEK_VIEW;

// REAL TREATMENT STARTS HERE

(async () => {

	var Airtable = require('airtable');
	var base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

	base(NEWS_TABLE_ID).select({
		// Selecting the first 100 records in All News:
		maxRecords: 100,
		view: NEWS_THIS_WEEK_VIEW
	}).eachPage(function page(records, fetchNextPage) {
		// This function (`page`) will get called for each page of records.

		records.forEach(function (record) {
			logging(`Retrieved ${record.get('Name')}`);
			logging(JSON.stringify(record));
		});

		// To fetch the next page of records, call `fetchNextPage`.
		// If there are more records, `page` will get called again.
		// If there are no more records, `done` will get called.
		fetchNextPage();

	}, function done(err) {
		if (err) { loggingError(err); return; }
	});

})();
