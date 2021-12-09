const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const buildAdjacencyMatrix = allReadings => {
    let matrix = [];

    for (let i = 0; i < allReadings.length; i++) {
        const line = allReadings[i];
        const numbers = line.split('');

        matrix[i] = [];
        for (let number of numbers) {
            matrix[i].push(+number);
        }
    }

    return matrix;
};

const findLowPoints = adjacencyMatrix => {
    let lows = [];

    for (let i = 0; i < adjacencyMatrix.length; i++) {
        for (let j = 0; j < adjacencyMatrix[i].length; j++) {
            const current = adjacencyMatrix[i][j];

            // UP
            if (i > 0 && (current >= adjacencyMatrix[i-1][j]) ) {
                continue;
            }

            // DOWN
            if (i < (adjacencyMatrix.length - 1) && (current >= adjacencyMatrix[i+1][j]) ) {
                continue;
            }

            // LEFT
            if (j > 0 && (current >= adjacencyMatrix[i][j-1])) {
                continue;
            }

            // RIGHT
            if (j < (adjacencyMatrix[i].length - 1) && (current >= adjacencyMatrix[i][j+1])) {
                continue;
            }

            lows.push({ 
                i: i, 
                j: j,
                value: current
            });
        }
    }

    return lows;
};

const getAllBasinLikePoints = (adjacencyMatrix, currentChecking) => {
    let basinLikePoints = [];

    const { i, j, value } = currentChecking;

    // going up
    let k = i - 1;
    let comparison = value;
    while (k >= 0) {
        const newValue = adjacencyMatrix[k][j];
        if (newValue != 9 && newValue > comparison) {
            basinLikePoints.push({ i:k, j:j, value: newValue });
            comparison = newValue;
        } else {
            break;
        }
        k--;
    }

    // going down
    k = i + 1;
    comparison = value;
    while (k < adjacencyMatrix.length) {
        const newValue = adjacencyMatrix[k][j];
        if (newValue != 9 && newValue > comparison) {
            basinLikePoints.push({ i:k, j:j, value: newValue });
            comparison = newValue;
        } else {
            break;
        }
        k++;
    }

    // going left
    k = j - 1;
    comparison = value;
    while (k >= 0) {
        const newValue = adjacencyMatrix[i][k];
        if (newValue != 9 && newValue > comparison) {
            basinLikePoints.push({ i:i, j:k, value: newValue });
            comparison = newValue;
        } else {
            break;
        }
        k--;
    }

    // going right
    k = j + 1;
    comparison = value;
    while (k < adjacencyMatrix[i].length) {
        const newValue = adjacencyMatrix[i][k];
        if (newValue != 9 && newValue > comparison) {
            basinLikePoints.push({ i:i, j:k, value: newValue });
            comparison = newValue;
        } else {
            break;
        }
        k++;
    }

    return basinLikePoints;
}

const findBasins = (adjacencyMatrix, lowPoints) => {
    let basins = [];

    // Every low point will become a basin
    // We need the 3 largest basins

    for (let lowPoint of lowPoints) {
        let newBasin = [];
        let pointsToCheck = [lowPoint];

        let visitedPoints = [];

        while (pointsToCheck.length !== 0) {
            let currentChecking = pointsToCheck.pop();

            const hasBeenVisited = visitedPoints.filter(point => {
                return point.i === currentChecking.i 
                    && point.j === currentChecking.j 
                    && point.value === currentChecking.value;
            }).length > 0;
            if (hasBeenVisited) {
                continue;
            }

            visitedPoints.push(currentChecking);
            newBasin.push(currentChecking);

            const newPoints = getAllBasinLikePoints(adjacencyMatrix, currentChecking);

            pointsToCheck = pointsToCheck.concat(newPoints);
        }

        // Add the new basin if relevant
        // Check if the new basin is larger than the ones already there
        if (basins.length < 3) {
            basins.push(newBasin);
        } else {
            // The last one should be the smaller one
            const minBasinLength = basins[2].length;

            if (minBasinLength < newBasin.length) {
                // Need to remove the smaller basin and add the new one
                basins.pop();
                basins.push(newBasin);
            }
        }

        basins.sort((oneBasin, otherBasin) => {
            const firstLength = oneBasin.length;
            const secondLength = otherBasin.length;

            return secondLength - firstLength;
        });
    }

    return basins;
};

const firstPart = (allReadings) => {
    const adjMatrix = buildAdjacencyMatrix(allReadings);

    const lowPoints = findLowPoints(adjMatrix);

    console.log({lowPoints});

    const riskSum = lowPoints
        .map(point => point.value)
        .map(height => height + 1)
        .reduce((prev, curr) => prev + curr, 0);
    
    
    console.log({riskSum});
};

const secondPart = (allReadings) => {
    const adjMatrix = buildAdjacencyMatrix(allReadings);

    const lowPoints = findLowPoints(adjMatrix);

    const topBasins = findBasins(adjMatrix, lowPoints);

    const productLengths = topBasins
        .map(basin => basin.length)
        .reduce((prev, curr) => prev * curr, 1);

    console.log({productLengths});
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