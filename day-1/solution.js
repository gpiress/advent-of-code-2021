const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const howManyTimesWindowDepthIncreases = (allReadings) => {
    let decreaseCount = 0;

    if (allReadings.length < 4) {
        return -1;
    }

    let previousReading = allReadings[0] + allReadings[1] + allReadings[2];
    
    for (let i = 1; i < (allReadings.length - 2); i++) {
        const currentReading = allReadings[i] + allReadings[i + 1] + allReadings[i + 2];

        if (currentReading > previousReading) {
            decreaseCount++;
        }
        previousReading = currentReading;
    }

    return decreaseCount;
}

const howManyTimesDepthIncreases = (allReadings) => {
    let decreaseCount = 0;
    let previousReading = allReadings[0];
    
    for (let i = 1; i < allReadings.length; i++) {
        const currentReading = allReadings[i];

        if (currentReading > previousReading) {
            decreaseCount++;
        }
        previousReading = currentReading;
    }

    return decreaseCount;
};

const firstPart = (allReadings) => {
    const decreases = howManyTimesDepthIncreases(allReadings);
    console.log(decreases);
};

const secondPart = (allReadings) => {
    const windowDecreases = howManyTimesWindowDepthIncreases(allReadings);
    console.log(windowDecreases);
}

// Input logic
let readings = [];
const processLine = line => {
    readings.push(+line);
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