const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const hasBoardWon = (board) => {
    const validLines = [...board.rows, ...board.cols];

    for (let line of validLines) {
        let complete = true;
        for (let element of line) {
            if (!board.markedNumbers.has(element)) {
                complete = false;
                break;
            }
        }

        if (complete) {
            // Board won
            return true;
        }
    }
    
    return false;
};

const runBingo = (boards, numbersToDraw) => {
    let markedNumbers = [];
    for (let number of numbersToDraw) {
        markedNumbers.push(number);

        for (let board of boards) {
            if (!board.done && board.unmarkedNumbers.has(number)) {
                // this was an unmarked number, need to check for win condition
                board.unmarkedNumbers.delete(number);
                board.markedNumbers.add(number);

                if (hasBoardWon(board)) {
                    let sumOfUnmarked = 0;
                    board.unmarkedNumbers.forEach(unmarked => sumOfUnmarked += unmarked);
                    board.score = number * sumOfUnmarked;
                    board.done = true;

                    console.log(`Board #${board.boardNumber} ended with score: ${board.score}`);
                }
            }
        }
    }
};

const adjustInitialSettings = allReadings => {
    const numbersToDraw = allReadings[0].split(',').map(input => +input);

    let boards = [];

    let currentBoard = [];
    let currentBoardNumber = 1;
    for (let i = 2; i <= allReadings.length; i++) {
        if (allReadings[i] == '' || i === allReadings.length) {

            let cols = [];
            for (let j = 0; j < currentBoard[0].length; j++) {
                cols.push( currentBoard.map(row => row[j]) );
            }
            boards.push({
                rows: [...currentBoard],
                cols: [...cols],
                boardNumber: currentBoardNumber,
                markedNumbers: new Set(),
                unmarkedNumbers: new Set(currentBoard.reduce((prev, curr) => prev.concat(curr), [])),
                score: 0,
                done: false,
            });

            currentBoardNumber++;
            currentBoard = [];

            continue;
        }

        const newRow = allReadings[i].split(' ').filter(numberStr => numberStr !== '').map(numberStr => numberStr.trim()).map(numberStr => +numberStr);
        currentBoard.push(newRow);
    }

    //console.log(JSON.stringify(boards, null, 2));

    return {
        numbersToDraw: numbersToDraw,
        boards: boards,
    };
};

const firstPart = (allReadings) => {
    const { numbersToDraw, boards } = adjustInitialSettings(allReadings);
    runBingo(boards, numbersToDraw);
};

const secondPart = (allReadings) => {
};

// Input logic
let readings = [];
const processLine = line => {
    readings.push(line);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', () => {
    firstPart(readings);
    secondPart(readings);
});