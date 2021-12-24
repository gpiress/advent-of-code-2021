const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');

const variablesMap = new Map();

const initVariables = () => {
    variablesMap.set('w', 0);
    variablesMap.set('x', 0);
    variablesMap.set('y', 0);
    variablesMap.set('z', 0);
};

const input = (toStore, digit) => {
    variablesMap.set(toStore, +digit);
};

const add = (first, second) => {
    let value = variablesMap.get(first) || 0;

    let otherValue;
    if (typeof second === 'number') {
        otherValue = second;
    } else {
        otherValue = variablesMap.get(second) || 0;
    }
    value = value + otherValue;

    variablesMap.set(first, value);
};

const mul = (first, second) => {
    let value = variablesMap.get(first) || 0;

    let otherValue;
    if (typeof second === 'number') {
        otherValue = second;
    } else {
        otherValue = variablesMap.get(second) || 0;
    }
    value = value * otherValue;

    variablesMap.set(first, value);
};

const div = (first, second) => {
    let value = variablesMap.get(first) || 0;

    let otherValue;
    if (typeof second === 'number') {
        otherValue = second;
    } else {
        otherValue = variablesMap.get(second) || 0;
    }
    value = value / otherValue;
    value = Math.floor(value);

    variablesMap.set(first, value);
};

const mod = (first, second) => {
    let value = variablesMap.get(first) || 0;

    let otherValue;
    if (typeof second === 'number') {
        otherValue = second;
    } else {
        otherValue = variablesMap.get(second) || 0;
    }
    value = value % otherValue;

    variablesMap.set(first, value);
};

const equal = (first, second) => {
    let value = variablesMap.get(first) || 0;

    let otherValue;
    if (typeof second === 'number') {
        otherValue = second;
    } else {
        otherValue = variablesMap.get(second) || 0;
    }
    
    if (value === otherValue) {
        variablesMap.set(first, 1);
    } else {
        variablesMap.set(first, 0);
    }
};

const runInstructions = (instructions, monad) => {
    initVariables();

    const validLetters = "xyzw";
    let monadIndex = 0;
    
    for (const instruction of instructions) {
        const [op, a, b] = instruction.split(' ');

        if (op === 'inp') {
            input(a, monad[monadIndex]);
            monadIndex++;
            continue;
        }

        let secondOp = b;
        if (validLetters.indexOf(b) === -1) {
            // b is a number!
            secondOp = +secondOp;
        }

        if (op === 'add') {
            add(a, secondOp);
            continue;
        }

        if (op === 'mul') {
            mul(a, secondOp);
            continue;
        }

        if (op === 'div') {
            div(a, secondOp);
            continue;
        }

        if (op === 'mod') {
            mod(a, secondOp);
            continue;
        }

        if (op === 'eql') {
            equal(a, secondOp);
            continue;
        }

        console.error(`Operation not recognized: ${op}`);
    }

    return (variablesMap.get('z') === 0);
};

const findMonad = instructions => {

    let monad = 99_999_999_999_999;

    let done = false;
    let rounds = 0;
    while (!done) {
        //console.log(`Checking monad ${monad}`);
        done = runInstructions(instructions, monad);

        monad--;
        while (monad.toString().indexOf('0') > -1) {
            monad--;
        }

        if (monad < 11_111_111_111_111) {
            console.error('No monad found :sad:');
            done = true;
        }

        rounds++;

        if (rounds % 100_000 === 0) {
            console.log(`${rounds} different monads tried. Any second now`);
        }
    }

    return monad;
};

const firstPart = allReadings => {


    console.group('first part');
    const monad = findMonad(allReadings);
    console.log({monad});
    console.groupEnd();
};

const secondPart = allReadings => {

    
    console.group('second part');
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