const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const setInitialPoints = allReadings => {
    // Only care about points
    const pointLines = allReadings
        .filter(line => line.length > 0)
        .filter(line => line.startsWith('fold') === false);


    const maxY = pointLines
        .map(pointDef => pointDef.split(',')[1])
        .map(yPos => +yPos)
        .reduce((prev, curr) => prev > curr ? prev : curr, 0);

    const maxX = pointLines
        .map(pointDef => pointDef.split(',')[0])
        .map(xPos => +xPos)
        .reduce((prev, curr) => prev > curr ? prev : curr, 0);

    let matrix = [];

    for (let i = 0; i <= maxY; i++) {
        matrix.push(new Array(maxX + 1).fill(0));
    }

    pointLines.forEach(pointDef => {
        const coords = pointDef.split(',');
        const col = +coords[0];
        const row = +coords[1];

        matrix[row][col] = 1;
    });

    return {
        matrix: matrix,
        maxRow: maxY,
        maxCol: maxX,
    };
};

const foldUp = (pointsMatrix, maxCol, maxRow, rowToFold) => {
    for (let i = rowToFold + 1; i <= maxRow; i++) {
        for (let j = 0; j <= maxCol; j++) {
            if (pointsMatrix[i][j] === 0) {
                continue;
            }

            const newRow = rowToFold - (i - rowToFold);
            pointsMatrix[newRow][j] = 1;
        }
    }

    const newMaxRow = rowToFold - 1;
    return {
        matrix: pointsMatrix,
        maxCol: maxCol,
        maxRow: newMaxRow,
    };
};

const foldLeft = (pointsMatrix, maxCol, maxRow, colToFold) => {
    for (let i = 0; i <= maxRow; i++) {
        for (let j = colToFold + 1; j <= maxCol; j++) {
            if (pointsMatrix[i][j] === 0) {
                continue;
            }

            const newCol = colToFold - (j - colToFold);
            pointsMatrix[i][newCol] = 1;
        }
    }

    const newMaxCol = colToFold - 1;
    return {
        matrix: pointsMatrix,
        maxCol: newMaxCol,
        maxRow: maxRow,
    };
};

const howManyMarkedDots = (pointsMatrix, maxRow, maxCol) => {
    let points = 0;
    for (let i = 0; i <= maxRow; i++) {
        for (let j = 0; j <= maxCol; j++) {
            if (pointsMatrix[i][j] === 1) {
                points++;
            }
        }
    }

    return points;
};

const runFolds = (allReadings, matrix, maxCol, maxRow, onlyFirst) => {
    // Only care about folds now
    let foldInstructions = allReadings
        .filter(line => line.length !== 0)
        .filter(line => line.startsWith('fold'));
    
    if (onlyFirst) {
        foldInstructions = [foldInstructions[0]];
    }

    let newMaxRow = maxRow, newMaxCol = maxCol;
    foldInstructions
        .map(instruction => instruction.split(' ')[2])
        .forEach(whereToFold => {
            console.log({whereToFold});

            const coord = whereToFold.split('=')[0];
            const value = +whereToFold.split('=')[1];

            if (coord === 'x') {
                let newSetup = foldLeft(matrix, newMaxCol, newMaxRow, value);
                newMaxRow = newSetup.maxRow;
                newMaxCol = newSetup.maxCol;
            } else {
                let newSetup = foldUp(matrix, newMaxCol, newMaxRow, value);
                newMaxRow = newSetup.maxRow;
                newMaxCol = newSetup.maxCol;
            }

            console.log({newMaxCol});
            console.log({newMaxRow});
        });
    
    return { matrix: matrix, maxCol: newMaxCol, maxRow: newMaxRow};
}

const printMatrix = (matrix, maxRow, maxCol) => {
    console.group('print matrix');
    for (let i = 0; i <= maxRow; i++) {
        let lineToPrint = '';
        for (let j = 0; j <= maxCol; j++) {
            if (matrix[i][j] === 0) {
                lineToPrint += ' ';
            } else {
                lineToPrint += '#';
            }
        }
        console.log(lineToPrint);
    }

    console.groupEnd();
}

const firstPart = (allReadings) => {
    const { matrix, maxCol, maxRow } = setInitialPoints(allReadings);

    const result = runFolds(allReadings, matrix, maxCol, maxRow, true);
    const markedPoints = howManyMarkedDots(result.matrix, result.maxRow, result.maxCol);

    console.group('first part');
    console.log({markedPoints});
    console.groupEnd();
};

const secondPart = (allReadings) => {
    const { matrix, maxCol, maxRow } = setInitialPoints(allReadings);

    const result = runFolds(allReadings, matrix, maxCol, maxRow, false);
    const markedPoints = howManyMarkedDots(result.matrix, result.maxRow, result.maxCol);

    console.group('second part');
    printMatrix(result.matrix, result.maxRow, result.maxCol);
    console.log({markedPoints});
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