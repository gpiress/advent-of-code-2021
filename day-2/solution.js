const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const horizontalTimesDepth = instructions => {
    let horizontal = 0;
    let depth = 0;

    instructions.forEach(instruction => {
        const parts = instruction.split(' ');
        const delta = +parts[1];
        if (parts[0][0] === 'f') {
            horizontal += delta;
        } else if (parts[0][0] === 'u') {
            depth -= delta;
        } else {
            depth += delta;
        }
    });

    console.log(`horizontal: ${horizontal}, depth: ${depth}`);
    return horizontal * depth;
};

const horizontalTimesDepthWithAim = instructions => {
    let horizontal = 0;
    let depth = 0;
    let aim = 0;

    instructions.forEach(instruction => {
        const parts = instruction.split(' ');
        const delta = +parts[1];
        if (parts[0][0] === 'f') {
            horizontal += delta;
            depth += (aim * delta);
        } else if (parts[0][0] === 'u') {
            aim -= delta;
        } else {
            aim += delta;
        }
    });

    console.log(`horizontal: ${horizontal}, depth: ${depth}, aim: ${aim}`);
    return horizontal * depth;
};

const firstPart = (allReadings) => {
    const decreases = horizontalTimesDepth(allReadings);
    console.log(decreases);
};

const secondPart = (allReadings) => {
    const windowDecreases = horizontalTimesDepthWithAim(allReadings);
    console.log(windowDecreases);
}

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