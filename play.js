const boardData = require('./episode-data/season-35/episode-1.json');

console.log('Select a category!:');
const categoryNames = boardData.categories.map(category => category.name);

categoryNames.forEach(categoryName => {
	console.log(`- ${categoryName}`);
});
