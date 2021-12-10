const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const isClosingChar = character => ')]}>'.indexOf(character) > -1;
const isOpeningChar = character => '([{<'.indexOf(character) > -1;

const matchClose = opening => {
    if (opening === '(') {
        return ')';
    }

    if (opening === '[') {
        return ']';
    }

    if (opening === '{') {
        return '}';
    }

    if (opening === '<') {
        return '>';
    }

    return false;
}

const doSymbolsMatch = (opening, closing) => {
    return closing === matchClose(opening);
}

const closingErrorValue = character => {
    if (character === ')') {
        return 3;
    }

    if (character === ']') {
        return 57;
    }

    if (character === '}') {
        return 1197;
    }

    if (character === '>') {
        return 25137;
    }
};

const completeSymbolValue = closing => {
    if (closing === ')') {
        return 1;
    }

    if (closing === ']') {
        return 2;
    }

    if (closing === '}') {
        return 3;
    }

    if (closing === '>') {
        return 4;
    }
};

const wrongLineValue = line => {
    // valid lines return 0
    const symbols = [];
    for (let symbol of line) {
        if (isOpeningChar(symbol)) {
            symbols.push(symbol);
            continue;
        }

        if (isClosingChar(symbol)) {
            const opening = symbols.pop();
            const correctlyCloses = doSymbolsMatch(opening, symbol);
            if (!correctlyCloses) {
                return closingErrorValue(symbol);
            }
        }
    }

    return 0;
};

const isLineCorrect = line => {

    const symbols = [];
    for (let symbol of line) {
        if (isOpeningChar(symbol)) {
            symbols.push(symbol);
            continue;
        }

        if (isClosingChar(symbol)) {
            const opening = symbols.pop();
            const correctlyCloses = doSymbolsMatch(opening, symbol);
            if (!correctlyCloses) {
                return false;
            }
        }
    }

    return true;
};

const isLineCorrupted = line => !isLineCorrect(line);

const completeLine = line => {
    const symbols = [];
    for (let symbol of line) {
        if (isOpeningChar(symbol)) {
            symbols.push(symbol);
            continue;
        }

        if (isClosingChar(symbol)) {
            symbols.pop();
        }
    }

    let value = 0;
    while (symbols.length > 0) {
        const opening = symbols.pop();
        const closing = matchClose(opening);
        value = value * 5 + completeSymbolValue(closing);
    }

    return value;
};

const firstPart = (allReadings) => {

    const syntaxErrorScoresSum = allReadings
        .filter(isLineCorrupted)
        .map(wrongLineValue)
        .reduce((prev, curr) => prev + curr, 0);

    console.log({syntaxErrorScoresSum});
};

const secondPart = (allReadings) => {

    let completionScores = allReadings
        .filter(isLineCorrect)
        .map(completeLine);
        

    completionScores.sort((a, b) => a - b);

    //console.log({completionScores});

    const middleIndex = Math.floor(completionScores.length / 2);
    console.log(completionScores[middleIndex]);
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