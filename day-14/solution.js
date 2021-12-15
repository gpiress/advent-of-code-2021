const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');

const instructionsMap = new Map();
let pairsCountMap = new Map();

const parseInstructions = allReadings => {
    allReadings
        .filter(line => line.indexOf(' -> ') > -1)
        .forEach(instruction => {
            const instructionParts = instruction.split(' -> ');
            instructionsMap.set(instructionParts[0].trim(), instructionParts[1].trim());
        });
};

const templateToPairs = template => {
    pairsCountMap = new Map();
    let pairs = [];

    let currPair = "";
    template.split('').forEach(letter => {
        currPair += letter;

        if (currPair.length === 2) {
            pairs.push(currPair);

            const prevPairCount = pairsCountMap.get(currPair) || 0;
            pairsCountMap.set(currPair, prevPairCount + 1);

            currPair = letter;
        }
    });

    return pairs;
};

const runSteps = numberOfSteps => {
    for (let i = 0; i < numberOfSteps; i++) {
        let newStepMap = new Map();

        for (const [key, value] of pairsCountMap) {
            // given a pair AA, with a rule AA -> B,
            // for each entry of pair AA, 2 new pairs form, [AB, BA]

            const toInsert = instructionsMap.get(key);

            const firstPair = `${key[0]}${toInsert}`;
            const maybeNewFirstCount = newStepMap.get(firstPair) || 0;
            newStepMap.set(firstPair, maybeNewFirstCount + value);

            const secondPair = `${toInsert}${key[1]}`;
            const maybeNewSecondCount = newStepMap.get(secondPair) || 0;
            newStepMap.set(secondPair, maybeNewSecondCount + value);
        }

        pairsCountMap = newStepMap;
    }
};

const figureOutMinAndMaxLetters = () => {
    const letterCountMap = new Map();

    let max = undefined, maxLetter = undefined;
    let min = undefined, minLetter = undefined;

    for (const [key, value] of pairsCountMap) {
        const first = key[0];
        const second = key[1];

        const prevFirstCount = letterCountMap.get(first) || 0;
        letterCountMap.set(first, prevFirstCount + value);

        const prevSecondCount = letterCountMap.get(second) || 0;
        letterCountMap.set(second, prevSecondCount + value);
    }

    for (const [key, value] of letterCountMap) {
        let candidate = Math.ceil(value / 2);

        if (min === undefined || candidate < min) {
            min = candidate;
            minLetter = key;
        }

        if (max === undefined || candidate > max) {
            max = candidate;
            maxLetter = key;
        }
    }

    return {
        max: max, maxLetter: maxLetter,
        min: min, minLetter: minLetter,
    };
};

const firstPart = (allReadings) => {
    const template = allReadings[0];
    parseInstructions(allReadings);
    templateToPairs(template);

    runSteps(10);
    const { max, maxLetter, min, minLetter } = figureOutMinAndMaxLetters();

    console.group('first part');
    console.log({max});
    console.log({maxLetter});
    console.log({min});
    console.log({minLetter});
    console.log(`Diff max - min: ${max - min}`);
    console.groupEnd();
};

const secondPart = (allReadings) => {
    const template = allReadings[0];

    parseInstructions(allReadings);
    templateToPairs(template);

    runSteps(40);
    const { max, maxLetter, min, minLetter } = figureOutMinAndMaxLetters();
    
    console.group('second part');
    console.log({max});
    console.log({maxLetter});
    console.log({min});
    console.log({minLetter});
    console.log(`Diff max - min: ${max - min}`);
    console.groupEnd();
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