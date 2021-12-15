const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');

const initMatrix = allReadings => {
    let matrix = [];

    for (let i = 0; i < allReadings.length; i++) {
        const numbers = allReadings[i].split('').map(number => +number);
        matrix.push(numbers);
    }

    return matrix;
};

const initMuchLargerMatrix = allReadings => {
    let matrix = [];
    
    const maxRow = (5 * allReadings.length) - 1;
    const maxCol = (5 * allReadings[0].length) - 1;

    for (let i = 0; i <= maxRow; i++) {
        const rowsIndex = i % allReadings.length;
        const toSumFromRow = Math.floor(i / allReadings.length);

        const numbers = allReadings[rowsIndex].split('').map(number => +number);

        let line = [];
        for (let j = 0; j <= maxCol; j++) {
            const numbersIndex = j % numbers.length;
            const toSum = Math.floor(j / numbers.length);

            let newValue = numbers[numbersIndex] + toSum + toSumFromRow;

            // 10 becomes 1, 11 becomes 2, ...
            while (newValue >= 10) {
                newValue -= 9;
            }

            line[j] = newValue;
        }

        matrix.push(line);
    }

    return matrix;
};

const hashPoint = (i, j) => i * 10_000_000 + j;

const hashAPoint = point => hashPoint(point.i, point.j);

const hasBeenVisited = (point, visitedSet) => {
    const { i, j } = point;
    const hashed = hashPoint(i, j);

    return visitedSet.has(hashed);
};

const isValid = (point, matrix) => {
    const lastRow = matrix.length - 1;
    const lastCol = matrix[0].length - 1;

    const { i, j } = point;

    if (i >= 0 && i <= lastRow) {
        if (j >= 0 && j <= lastCol) {
            return true;
        }
    }

    return false;
};

const getPointCost = (point, matrix) => {
    const { i, j } = point;

    return matrix[i][j];
};

const updateCostIfNeeded = (newPoint, newCost, allDistanceCostsMap) => {
    const newPointHash = hashAPoint(newPoint);
    if (!allDistanceCostsMap.has(newPointHash)) {
        allDistanceCostsMap.set(newPointHash, newCost);
        return newCost;
    }

    const previousCost = allDistanceCostsMap.get(newPointHash);

    const minCost = newCost < previousCost ? newCost : previousCost;
    allDistanceCostsMap.set(newPointHash, minCost);

    return minCost;
};

const findNextPoint = (toVisit, visitedSet, allDistanceCostsMap) => {
    const validCandidates = toVisit.filter(point => {
        const pointHash = hashAPoint(point);
        return !visitedSet.has(pointHash) && allDistanceCostsMap.has(pointHash);
    });

    let minPoint = undefined;
    let minCost = undefined;

    for (let point of validCandidates) {
        const pointHash = hashAPoint(point);

        const currentCost = allDistanceCostsMap.get(pointHash) || 9999999999;

        if (minCost === undefined || currentCost < minCost) {
            minPoint = point;
            minCost = currentCost;
        }
    }

    return minPoint;
};

const findAllPathsCost = matrix => {
    let visited = new Set();
    const allDistanceCosts = new Map();
    allDistanceCosts.set(hashPoint(0, 0), 0);

    const lastRow = matrix.length - 1;
    const lastCol = matrix[0].length - 1;
    const endPointHash = hashPoint(lastRow, lastCol);

    const start = { i: 0, j: 0 };
    let toVisit = [start];

    while (toVisit.length > 0) {
        const nextPoint = findNextPoint(toVisit, visited, allDistanceCosts);
        if (nextPoint === undefined) {
            // Something weird happened, no candidates
            console.error("No candidates. I don't think this should happen");
            break;
        }
        const { i, j } = nextPoint;

        const currentHash = hashPoint(i, j);
        const currentCost = allDistanceCosts.get(currentHash);

        //console.log({visited});
        //console.log(`Visiting node ${currentHash}`);

        // if this node has been visited before, bail out
        if (visited.has(currentHash)) {
            continue;
        }

        // Stop after finding the end
        if (currentHash === endPointHash) {
            break;
        }

        visited.add(currentHash);
        
        // check all neighbours not visited and calculate their tentative costs
        let newPoint = { i: i - 1, j: j };
        if (isValid(newPoint, matrix) && !hasBeenVisited(newPoint, visited)) {
            const newCost = currentCost + getPointCost(newPoint, matrix);
            updateCostIfNeeded(newPoint, newCost, allDistanceCosts);

            toVisit.push(newPoint);
        }

        newPoint = { i: i + 1, j: j };
        if (isValid(newPoint, matrix) && !hasBeenVisited(newPoint, visited)) {
            const newCost = currentCost + getPointCost(newPoint, matrix);
            updateCostIfNeeded(newPoint, newCost, allDistanceCosts);

            toVisit.push(newPoint);
        }

        newPoint = { i: i, j: j - 1 };
        if (isValid(newPoint, matrix) && !hasBeenVisited(newPoint, visited)) {
            const newCost = currentCost + getPointCost(newPoint, matrix);
            updateCostIfNeeded(newPoint, newCost, allDistanceCosts);

            toVisit.push(newPoint);
        }

        newPoint = { i: i, j: j + 1 };
        if (isValid(newPoint, matrix) && !hasBeenVisited(newPoint, visited)) {
            const newCost = currentCost + getPointCost(newPoint, matrix);
            updateCostIfNeeded(newPoint, newCost, allDistanceCosts);

            toVisit.push(newPoint);
        }
    }

    //console.log({allDistanceCosts});

    return allDistanceCosts.get(endPointHash);
};

const firstPart = (allReadings) => {
    const matrix = initMatrix(allReadings);
    const cheapestPath = findAllPathsCost(matrix);

    console.group('first part');
    console.log({cheapestPath});
    console.groupEnd();
};

const secondPart = (allReadings) => {
    const matrix = initMuchLargerMatrix(allReadings);
    const cheapestPath = findAllPathsCost(matrix);

    console.group('second part');
    console.log({cheapestPath});
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