const chalk = require('chalk');
const inquirer = require('inquirer');
const figlet = require('figlet');

const boardData = require('./episode-data/season-35/episode-1.json');

const { categories, clues } = boardData;

function beginGame() {
	const greeting = `${chalk.white('This is...')}\n` + figlet.textSync('JEOPARDY', {
		horizontalLayout: 'full'
	});
	console.log(greeting);

	promptCategorySelection();
}

function promptCategorySelection() {
	// reformat the categories with properties expected by inquirer
	const categoryInputs = categories.map(category => {
		return {
			name: category.name,
			value: category.id
		}
	});

	const questions = [{
		name: 'selectedCategoryId',
		type: 'list',
		choices: categoryInputs,
		message: 'Please select a category'
	}];	

	inquirer
		.prompt(questions)
		.then(handleCategoryPrompt)
		.catch(handleError);
}

function handleCategoryPrompt(answer) {
	const selectedId = answer.selectedCategoryId;
	const categoryClues = clues.filter(clue => clue.categoryId === selectedId);
	promptForDollarAmount(categoryClues);
}

function promptForDollarAmount(clues) {
	const availableAmounts = clues.map(clue => {
		return {
			name: `$${clue.value}`,
			value: clue.value
		}
	});

	const questions = [{
		name: 'selectedAmount',
		type: 'list',
		choices: availableAmounts,
		message: 'For how much money?'
	}];	

	inquirer
		.prompt(questions)
		.then(handleAmountSelection.bind(this, clues))
		.catch(handleError);
}

function handleAmountSelection(clues, answer) {
	const { selectedAmount } = answer;
	const selectedClue = clues.find(clue => clue.value === selectedAmount);
	promptQuestion(selectedClue);
}

function promptQuestion(clue) {
	const cluePrompt = {
		name: 'response',
		type: 'input',
		message: clue.clueText,
	};	

	inquirer
		.prompt(cluePrompt)
		.then(handleClueResponse.bind(this, clue))
		.catch(handleError);
}

function handleClueResponse(clue, answer) {
	if (responseIsCorrect(answer.response, clue.correctResponse)) {
		console.log('Correct!');
	} else {
		console.log('Incorrect :(');
	}

	console.log(`Correct response: ${clue.correctResponse}`);
	setTimeout(promptCategorySelection, 3000);
}

function responseIsCorrect(response, correctResponse) {
	// if the user's answer matches any part of the answer let's call it correct
	// if they want to guess "e" every time then they are terrible people and I don't care
	const responsePattern = new RegExp(response, 'i');
	return responsePattern.test(correctResponse);
}

function handleError(err) {
	console.log(chalk`{red Fatal internal error:}`);
	console.log(chalk`{red ${err}}`)
	console.log(chalk`{red exiting...}`);
	process.exit();
}


beginGame();
