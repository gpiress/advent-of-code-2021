const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const setInitialMatrix = allReadings => {
    let matrix = [];
    for (let i = 0; i < allReadings.length; i++) {
        const line = allReadings[i].split('');
        let lineNumbers = [];

        for (let j = 0; j < line.length; j++) {
            lineNumbers[j] = +line[j];
        }

        matrix.push(lineNumbers);
    }

    return matrix;
};

const addOneEnergy = (energyMatrix, i, j, visited) => {
    // If a position has flashed, it shouldn't increase energy any longer.
    if (visited.indexOf(`${i}--${j}`) > -1) {
        return false;
    }
    
    if (i >= 0 && i < energyMatrix.length) {
        if (j >= 0 && j < energyMatrix[i].length) {
            energyMatrix[i][j]++;

            if (energyMatrix[i][j] > 9) {
                return true;
            }
        }
    }

    return false;
};

const runOneStep = energyMatrix => {
    let flashes = 0;

    // Everything should add one
    for (let i = 0; i < energyMatrix.length; i++) {
        let row = energyMatrix[i];

        for (let j = 0; j < row.length; j++) {
            energyMatrix[i][j]++;
        }
    }

    // Check whatever is >9 then flash (and +1 all neighbors including diagonals)
    let visited = [];
    for (let i = 0; i < energyMatrix.length; i++) {
        let row = energyMatrix[i];

        for (let j = 0; j < row.length; j++) {
            const energy = energyMatrix[i][j];

            if (energy <= 9) {
                continue;
            }

            let toVisit = [`${i}--${j}`];

            while (toVisit.length !== 0) {
                let toCheck = toVisit.pop();

                if (visited.indexOf(toCheck) > -1) {
                    continue;
                }

                visited.push(toCheck);
                flashes++;

                let x = +toCheck.split('--')[0];
                let y = +toCheck.split('--')[1];

                energyMatrix[x][y] = 0;

                // add 1 to all neighbors
                if (addOneEnergy(energyMatrix, x-1, y, visited)) {
                    toVisit.push(`${x-1}--${y}`);
                }

                if (addOneEnergy(energyMatrix, x+1, y, visited)) {
                    toVisit.push(`${x+1}--${y}`);
                }

                if (addOneEnergy(energyMatrix, x, y-1, visited)) {
                    toVisit.push(`${x}--${y-1}`);
                }

                if (addOneEnergy(energyMatrix, x, y+1, visited)) {
                    toVisit.push(`${x}--${y+1}`);
                }

                if (addOneEnergy(energyMatrix, x-1, y-1, visited)) {
                    toVisit.push(`${x-1}--${y-1}`)
                }

                if (addOneEnergy(energyMatrix, x-1, y+1, visited)) {
                    toVisit.push(`${x-1}--${y+1}`)
                }

                if (addOneEnergy(energyMatrix, x+1, y+1, visited)) {
                    toVisit.push(`${x+1}--${y+1}`)
                }

                if (addOneEnergy(energyMatrix, x+1, y-1, visited)) {
                    toVisit.push(`${x+1}--${y-1}`);
                }

            }
        }
    }

    return flashes;
};

const firstPart = (allReadings) => {
    let matrix = setInitialMatrix(allReadings);

    let flashes = 0;
    for (let i = 0; i < 100; i++) {
        const stepFlashes = runOneStep(matrix);
        flashes += stepFlashes;
    }

    console.log({flashes});
};

const secondPart = (allReadings) => {
    let matrix = setInitialMatrix(allReadings);

    const allOctopus = matrix.length * matrix[0].length;

    let stepFlashes = 0;
    let step = 0;

    while (stepFlashes !== allOctopus) {
        stepFlashes = runOneStep(matrix);
        step++;
    };

    console.log({step});
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