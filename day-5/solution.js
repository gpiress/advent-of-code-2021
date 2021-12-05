const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const hashPosition = (x, y) => {
    return `${x}-${y}`;
};

const handleEntry = (row, linesPerPointMap, ignoreDiagonals) => {
    // Each row is like:
    // 833,114 -> 833,834
    // x1,y1 -> x2,y2

    const points = row.split(' -> ');
    const x1 = +points[0].split(',')[0];
    const y1 = +points[0].split(',')[1];

    const x2 = +points[1].split(',')[0];
    const y2 = +points[1].split(',')[1];

    // Maybe ignore diagonal lines
    if (x1 !== x2 && y1 !== y2 && ignoreDiagonals) {
        return;
    }

    // y changes
    if (x1 === x2) {
        const minY = y1 < y2 ? y1 : y2;
        const maxY = y1 < y2 ? y2 : y1;

        for (let i = minY; i <= maxY; i++) {
            const currentHash = hashPosition(x1, i);
            let lines = linesPerPointMap.get(currentHash) || 0;
            linesPerPointMap.set(currentHash, ++lines);
        }

        return;
    }

    // x changes
    if (y1 === y2) {
        const minX = x1 < x2 ? x1 : x2;
        const maxX = x1 < x2 ? x2 : x1;

        for (let i = minX; i <= maxX; i++) {
            const currentHash = hashPosition(i, y1);
            let lines = linesPerPointMap.get(currentHash) || 0;
            linesPerPointMap.set(currentHash, ++lines);
        }

        return;
    }

    // diagonals, 45 degree
    // 1,1 -> 3,3 represents the points [(1,1), (2,2), (3,3)]
    const diff = x1 - x2;
    const length = diff > 0 ? diff : -diff;

    for (let i = 0; i <= length; i++) {
        const tempX = x2 > x1 ? x1 + i : x1 - i;
        const tempY = y2 > y1 ? y1 + i : y1 - i;

        const currentHash = hashPosition(tempX, tempY);
        let lines = linesPerPointMap.get(currentHash) || 0;
        linesPerPointMap.set(currentHash, ++lines);
    }
};

const howManyPointsWithAtLeastTwoLines = mapToCheck => {
    let count = 0;
    for (const [key, value] of mapToCheck) {
        if (value >= 2) {
            count++;
        }
    }

    return count;
};

const firstPart = (allReadings) => {
    const linesPerPositionMap = new Map();

    allReadings.forEach(row => handleEntry(row, linesPerPositionMap, true));

    const overlappingPoints = howManyPointsWithAtLeastTwoLines(linesPerPositionMap);
    console.log({ overlappingPoints });
};

const secondPart = (allReadings) => {
    const linesPerPositionMap = new Map();

    allReadings.forEach(row => handleEntry(row, linesPerPositionMap, false));

    const overlappingPoints = howManyPointsWithAtLeastTwoLines(linesPerPositionMap);
    console.log({ overlappingPoints });
};

// Input logic
let readings = [];
const processLine = line => {
    readings.push(line);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./test.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', () => {
    firstPart(readings);
    secondPart(readings);
});