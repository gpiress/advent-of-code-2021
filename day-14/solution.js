const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const pairExpansionMap = new Map();
const twentyStepsPairExpansionMap = new Map();
const thirtyStepsPairExpansionMap = new Map();
const fortyStepsPairExpansionMap = new Map();

const parseInstructions = allReadings => {
    return allReadings
        .filter(line => line.indexOf('->') > -1)
        .map(line => line.trim())
        .map(instruction => {
            const instructionParts = instruction.split(' -> ');
            return {
                pair: instructionParts[0],
                toInsert: instructionParts[1]
            }
        })
        .reduce((aMap, currInstruction) => {
            aMap.set(currInstruction.pair, currInstruction.toInsert);
            return aMap;
        }, new Map());
};

const expandPair = (instructionsMap, pair, numberOfSteps, letterCountMap) => {
    if (!instructionsMap.has(pair)) {
        return;
    }

    if (numberOfSteps === 0) {
        return;
    }

    const toInsert = instructionsMap.get(pair);
     
    // Add new letter to count map
    const toInsertCount = letterCountMap.get(toInsert) || 0;
    letterCountMap.set(toInsert, toInsertCount + 1);

    expandPair(instructionsMap, `${pair[0]}${toInsert}`, numberOfSteps-1, letterCountMap);
    expandPair(instructionsMap, `${toInsert}${pair[1]}`, numberOfSteps-1, letterCountMap);
};

const expandPairRecursivelyTenByTen = (pair, numberOfSteps, instructionsMap, letterCountMap) => {
    if (!instructionsMap.has(pair)) {
        return;
    }

    if (numberOfSteps === 0) {
        return;
    }

    let expansionResult = undefined;
    if (pairExpansionMap.has(pair)) {
        expansionResult = pairExpansionMap.get(pair);
    } else {
        expansionResult = expandPairTenSteps(pair, instructionsMap);
    }

    for (const [key, value] of expansionResult.letterCountMap) {
        const previousLetterCount = letterCountMap.get(key) || 0;
        letterCountMap.set(key, previousLetterCount + value);
    }

    if (numberOfSteps === 10) {
        return;
    }

    expansionResult.pairs.forEach(pair => expandPairRecursivelyTenByTen(pair, numberOfSteps - 10, instructionsMap, letterCountMap));
};

const templateToPairs = template => {
    let pairs = [];
    let pair = "";
    template.trim().split('').forEach(letter => {
        pair += letter;

        if (pair.length === 2) {
            pairs.push(pair);
            pair = "" + letter;
        }
    });

    return pairs;
};

const expandPairTenSteps = (pair, instructionsMap) => {
    let letterCountMap = new Map();

    if (!instructionsMap.has(pair)) {
        pairExpansionMap.set(pair, { pairs: [pair], letterCountMap: letterCountMap });
        return { pairs: [pair], letterCountMap: letterCountMap };
    }

    if (pairExpansionMap.has(pair)) {
        return pairExpansionMap.get(pair);
    }

    let pairs = [pair];
    for (let i = 0; i < 10; i++) {
        let newPairs = [];
        for (let oldPair of pairs) {
            const toInsert = instructionsMap.get(oldPair) || '';
            if (toInsert === '') {
                newPairs.push(oldPair);
                continue;
            }

            newPairs.push(`${oldPair[0]}${toInsert}`);
            newPairs.push(`${toInsert}${oldPair[1]}`);
            
            // Add new letter to count map
            const toInsertCount = letterCountMap.get(toInsert) || 0;
            letterCountMap.set(toInsert, toInsertCount + 1);
        }

        pairs = newPairs;
    }

    pairExpansionMap.set(pair, { pairs: pairs, letterCountMap: letterCountMap });
    return {
        pairs: pairs,
        letterCountMap: letterCountMap,
    };
};

const expandPolymerTemplate = (instructionsMap, template, numberOfSteps) => {
    let letterCountMap = new Map();
    let pairs = [];
    let pair = "";
    template.trim().split('').forEach(letter => {
        pair += letter;

        if (pair.length === 2) {
            pairs.push(pair);
            pair = "" + letter;
        }

        let letterCount = letterCountMap.get(letter) || 0;
        letterCountMap.set(letter, letterCount + 1);
    });

    for (let i = 0; i < numberOfSteps; i++) {
        let newPairs = [];
        for (let oldPair of pairs) {
            const toInsert = instructionsMap.get(oldPair) || '';
            if (toInsert === '') {
                newPairs.push(oldPair);
                continue;
            }

            newPairs.push(`${oldPair[0]}${toInsert}`);
            newPairs.push(`${toInsert}${oldPair[1]}`);
            
            // Add new letter to count map
            const toInsertCount = letterCountMap.get(toInsert) || 0;
            letterCountMap.set(toInsert, toInsertCount + 1);
        }

        pairs = newPairs;
    }

    // Figure out most and least frequent letters
    let max = undefined, min = undefined;
    let maxLetter, minLetter;
    for (const [key, value] of letterCountMap) {

        if (max === undefined || value > max) {
            max = value;
            maxLetter = key;
        }

        if (min === undefined || value < min) {
            min = value;
            minLetter = key;
        }
    }

    return { pairs: pairs, max: max, maxLetter: maxLetter, min: min, minLetter: minLetter };
};

const expandPolymerTemplateSecond = (instructionsMap, template, numberOfSteps) => {
    let letterCountMap = new Map();
    let pairs = [];
    let pair = "";
    template.trim().split('').forEach(letter => {
        pair += letter;

        if (pair.length === 2) {
            pairs.push(pair);
            pair = "" + letter;
        }

        let letterCount = letterCountMap.get(letter) || 0;
        letterCountMap.set(letter, letterCount + 1);
    });

    let pairCount = 0;
    for (let pair of pairs) {
        console.log(`Expanding pair ${pairCount+1} of ${pairs.length} pairs`);
        expandPair(instructionsMap, pair, numberOfSteps, letterCountMap);
        pairCount += 1;
    }

    // Figure out most and least frequent letters
    let max = undefined, min = undefined;
    let maxLetter, minLetter;
    for (const [key, value] of letterCountMap) {

        if (max === undefined || value > max) {
            max = value;
            maxLetter = key;
        }

        if (min === undefined || value < min) {
            min = value;
            minLetter = key;
        }
    }

    return { pairs: pairs, max: max, maxLetter: maxLetter, min: min, minLetter: minLetter };
};

const minMaxLetters = letterCountMap => {
    // Figure out most and least frequent letters
    let max = undefined, min = undefined;
    let maxLetter, minLetter;
    for (const [key, value] of letterCountMap) {

        if (max === undefined || value > max) {
            max = value;
            maxLetter = key;
        }

        if (min === undefined || value < min) {
            min = value;
            minLetter = key;
        }
    }

    return {
        min: min, minLetter: minLetter,
        max: max, maxLetter: maxLetter,
    };
};

const expandPolymerTemplateThird = (instructionsMap, template, numberOfSteps) => {
    let finalLettersCountMap = new Map();

    template.split('').forEach(letter => {
        const letterCount = finalLettersCountMap.get(letter) || 0;
        finalLettersCountMap.set(letter, letterCount + 1);
    });

    if (numberOfSteps % 10 !== 0) {
        console.error("Cant use this method if number of steps isnt multiple of 10");
        return;
    }

    const templatePairs = templateToPairs(template);
    templatePairs.forEach(pair => expandPairTenSteps(pair, instructionsMap));

    let pairCount = 0;
    for (let pair of templatePairs) {
        //console.log(`Expanding pair ${pairCount+1} of ${templatePairs.length} pairs`);
        expandPairRecursivelyTenByTen(pair, numberOfSteps, instructionsMap, finalLettersCountMap);
        pairCount += 1;
    }

    const { min, minLetter, max, maxLetter } = minMaxLetters(finalLettersCountMap);

    return { max: max, maxLetter: maxLetter, min: min, minLetter: minLetter };
};

const pairsToString = pairs => {
    let finalString = pairs[0];

    for (let i = 1; i < pairs.length; i++) {
        finalString += pairs[i][1];
    }

    return finalString;
};

const solveForDifferentSteps = (template, instructionsMap) => {
    let result;

    console.group('steps = 10');
    result =  expandPolymerTemplateThird(instructionsMap, template, 10);
    console.log(`Max: ${result.maxLetter} - ${result.max}`);
    console.log(`Min: ${result.minLetter} - ${result.min}`);
    let diff = result.max - result.min;
    console.log({diff});
    console.groupEnd();

    console.group('steps = 20');
    result =  expandPolymerTemplateThird(instructionsMap, template, 20);
    console.log(`Max: ${result.maxLetter} - ${result.max}`);
    console.log(`Min: ${result.minLetter} - ${result.min}`);
    diff = result.max - result.min;
    console.log({diff});
    console.groupEnd();

    console.group('steps = 30');
    result =  expandPolymerTemplateThird(instructionsMap, template, 30);
    console.log(`Max: ${result.maxLetter} - ${result.max}`);
    console.log(`Min: ${result.minLetter} - ${result.min}`);
    diff = result.max - result.min;
    console.log({diff});
    console.groupEnd();

    console.group('steps = 40');
    result =  expandPolymerTemplateThird(instructionsMap, template, 40);
    console.log(`Max: ${result.maxLetter} - ${result.max}`);
    console.log(`Min: ${result.minLetter} - ${result.min}`);
    diff = result.max - result.min;
    console.log({diff});
    console.groupEnd();
};

const firstPart = (allReadings) => {

    const template = allReadings[0];
    const instructionsMap = parseInstructions(allReadings);

    const { pairs, max, maxLetter, min, minLetter } = expandPolymerTemplate(instructionsMap, template, 10);
    //const finalString = pairsToString(pairs);

    console.group('first part');
    //console.log({finalString});
    console.log({maxLetter});
    console.log({max});
    console.log({minLetter});
    console.log({min});
    const diff = max - min;
    console.log({diff});
    console.groupEnd();
};

const secondPart = (allReadings) => {
    const template = allReadings[0];
    const instructionsMap = parseInstructions(allReadings);

    //const { max, maxLetter, min, minLetter } = expandPolymerTemplateSecond(instructionsMap, template, 30);
    /*
    const { max, maxLetter, min, minLetter } = expandPolymerTemplateThird(instructionsMap, template, 30);
    
    console.group('second part');
    console.log({maxLetter});
    console.log({max});
    console.log({minLetter});
    console.log({min});
    const diff = max - min;
    console.log({diff});
    console.groupEnd();
    */

    solveForDifferentSteps(template, instructionsMap);
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