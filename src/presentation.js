const { copyFile } = require('fs/promises');
const { readFile, logging, writeFile } = require("./libs/utils");
const { presentationSnippet } = require('./templates/snippets/htmlSnippets');


(async () => {

	/**
	 * Copy of CSS source file into output folder
	 */

	copyFile("./src/templates/reveal.js/PR.css", "./output/PR.css")


	/**
	 * Getting useful information (JSON)
	 */

	logging('Here we start');

	const jsonNews = await readFile("./data/newsOfTheWeek.json");

	const news = await JSON.parse(jsonNews);

	const snippet = presentationSnippet;

	const slides = news.map(pieceOfNews => {
		return snippet.replace("PROJECT_HERE", pieceOfNews.project.join(" - "))
			.replace("TITLE_HERE", pieceOfNews.title)
			.replace("TEAM_LIST_HERE", pieceOfNews.teams.join(" / "))
			.replace("CONTENT_HERE", pieceOfNews.content.replace(/\n/g, '<br>'))
			.replace("SNAKE_HERE", pieceOfNews.snake === undefined ? "" : `<br>${pieceOfNews.snake.join("<br>")}`)
	})

	logging("Map has been made");

	const template = await readFile("./src/templates/reveal.js/templateReveal.html");

	result = template.replace("<!-- Content here -->", slides.join("\n"));

	writeFile("./output/presentation.html", result);

})();