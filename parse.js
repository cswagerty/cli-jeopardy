const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');

function parseEpisodeHtml(episodeId) {
	// parse episode's HTML file from J!Archive and reformat into JSON data
	let boards = [];  // there will be two boards, for jeopardy and double jeopardy
	let jeopardyBoard = {
		roundName: 'jeopardy',
		categories: [],
		clues: []
	};

	fs.readFile(`./j-archive-data/season-35/${episodeId}.html`, (err, buf) => {
		const gameHtml = buf.toString();
		let categories = getCategories(gameHtml);
		// only use first 6 categories in jeopardy round
		categories.splice(categories.length / 2); 
		jeopardyBoard.categories = categories;
		// only add the first 6 categories
		let clues = getClues(gameHtml);
		jeopardyBoard.clues = getRoundClues(clues);
		exportToJsonFile(jeopardyBoard, episodeId);
	});
}

function getCategories(html) {
	const $ = cheerio.load(html);

	// Print out all of the category names
	const categoryEls = $('table tr td.category_name', 'table.round');
	let categories = [];

	categoryEls.each((i, el) => {
		categories[i] = {
			name: $(el).text(),
			id: i
		};
	});
	return categories;
}

function getClues(html) {
	const $ = cheerio.load(html);

	// Print out all of the category names
	const clueEls = $('div', '.clue')
	let clues = [];

	clueEls.each((i, el) => {
		$el = $(el);

		clues[i] = {
			clueText: getClueText($el),
			correctResponse: getClueCorrectResponse($el),
			id: i
		};
	});
	return clues;
}

function getClueText($el) {
	let str = $el.attr('onmouseout');
	// strip out inline js and escaped single quotes used only on website
	let question = str.replace(/^.*stuck',\s'/, '')
		.replace(/'\)/, '')
		.replace(/\\/g, '')
		.replace(/\\'/g, "'");
	// remove html tags
	return cheerio.load(question).text();
}

function getClueCorrectResponse($el) {
	let str = $el.attr('onmouseover');


	// strip out inline js and escaped single quotes used only on website
	let responseEls = str.replace(/^.*stuck',\s'/, '')
		.replace(/'\)$/, '')
		.replace(/\\'/g, "\'");
	const $ = cheerio.load(responseEls)
	return $('.correct_response').text();
}

function getRoundClues(clues) {
	// create array of clue objects with categoryIds and value amounts
	let roundClues = [ ...clues ];
	roundClues.splice(30);

	// assign a dollar value and categoryId to each clue

	return roundClues.map((clue, index) => {
		return {
			...clue,
			categoryId: getClueCategoryId(index),
			value: getClueValue(index)
		}
	});
}

function getClueCategoryId(index) {
	// index 0 -> 0
	// index 1 -> 1
	// index 6 -> 0
	// index 7 -> 1

	const NUMBER_OF_CATEGORIES = 6;
	return index % NUMBER_OF_CATEGORIES;
}

function getClueValue(index) {
	// index 0-5 -> $100
	// index 6-10 -> $200
	// etc.

	const NUMBER_OF_COLUMNS = 6;
	const clueColumn = Math.floor(index / NUMBER_OF_COLUMNS) + 1;
	return clueColumn * 100;
}

function exportToJsonFile(jeopardyBoard, episodeId) {
	const episodeNumber = episodeId - 7815;
	const fileName = `./episode-data/season-35/episode-${episodeNumber}.json`;
	const fileContents = JSON.stringify(jeopardyBoard)
	fs.writeFile(fileName, fileContents, err => {
		if (err) {
			console.error(err);
			return;
		}
		console.log(`${fileName} created!`)

	})
}

// user can pass in an episode id to parse into JSON
const episodeIdToParse = process.argv[2] | 7816
parseEpisodeHtml(episodeIdToParse);
