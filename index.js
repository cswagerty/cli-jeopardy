const cheerio = require('cheerio');
const fs = require('fs');

fs.readFile('./j-archive-data/season-35/7816.html', (err, buf) => {
	const gameHtml = buf.toString();
	const categories = getCategories(gameHtml);
	const clues = getClues(gameHtml);
});

function getCategories(html) {
	const $ = cheerio.load(html);

	// Print out all of the category names
	const categoryEls = $('table tr td.category_name', 'table.round');
	let categories = [];

	categoryEls.each((i, el) => {
		categories[i] = $(el).text();
	});
	return categories;
}

function getClues(html) {
	const $ = cheerio.load(html);

	// Print out all of the category names
	const clueEls = $('div', '.clue')
	let clues = [];

	clueEls.each((i, el) => {
		let str = $(el).attr('onmouseout');
		// strip out inline js and escaped single quotes used only on website
		let question = str.replace(/^.*stuck',\s'/, '').replace(/'\)/, '').replace(/\\/g, '');
		// remove html tags
		return cheerio.load(question).text();
	});
	return clues;
}
