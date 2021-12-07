const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const fillInitialMap = allReadings => {
    const line = allReadings[0];

    const allNumbers = line.split(',').map(numStr => +numStr);

    const crabsPerPosition = allNumbers.reduce((map, currNumber) => {
        let positionCount = map.get(currNumber) || 0;
        map.set(currNumber, ++positionCount);
        return map;
    }, new Map());

    return crabsPerPosition;
};

const fillInitialDistancesCost = () => {
    const fuelCostsPerDistance = new Map();

    fuelCostsPerDistance.set(0, 0);
    fuelCostsPerDistance.set(1, 1);
    fuelCostsPerDistance.set(2, 3);
    fuelCostsPerDistance.set(3, 6);

    for (let i = 4; i < 3000; i++) {
        let previousCost = fuelCostsPerDistance.get(i - 1);
        fuelCostsPerDistance.set(i, previousCost + i);
    }

    return fuelCostsPerDistance;
};

const costForPosition = (crabsPerPositionMap, position) => {
    let positionCost = 0;

    //console.log({crabsPerPositionMap});

    for (const [key, value] of crabsPerPositionMap) {
        let distance = (key - position);
        distance = distance < 0 ? -distance : distance;

        let costForPosition = distance * value;
        positionCost += costForPosition;
    }

    return positionCost;
};

const costForPositionSecondPart = (crabsPerPositionMap, position, fuelCostsPerDistanceMap) => {
    let positionCost = 0;

    //console.log({crabsPerPositionMap});

    for (const [key, value] of crabsPerPositionMap) {
        let distance = (key - position);
        distance = distance < 0 ? -distance : distance;

        let distanceCost = fuelCostsPerDistanceMap.get(distance);

        if (distanceCost === undefined) {
            console.error(`Undefined distance ${distance}!`);
            return -1;
        }

        let costForPosition = distanceCost * value;
        positionCost += costForPosition;
    }

    return positionCost;
};

const findBestPosition = crabsPerPositionMap => {
    const positions = Array.from(crabsPerPositionMap.keys());
    const maxPosition = positions.reduce((prev, curr) => prev > curr ? prev : curr, 0);

    let chosenPosition = 0;
    let positionCost = costForPosition(crabsPerPositionMap, 0);

    for (let i = 1; i <= maxPosition; i++) {
        let newPositionCost = costForPosition(crabsPerPositionMap, i);

        if (newPositionCost < positionCost) {
            positionCost = newPositionCost;
            chosenPosition = i;
        }

        // if it's growing, I think we can bail.
        if (newPositionCost > positionCost) {
            // We are increasing costs as we go right, stop.
            break;
        }
    }

    return {
        position: chosenPosition,
        cost: positionCost,
    };
};

const findBestPositionSecondPart = (crabsPerPositionMap, fuelCostMap) => {
    const positions = Array.from(crabsPerPositionMap.keys());
    const maxPosition = positions.reduce((prev, curr) => prev > curr ? prev : curr, 0);

    let chosenPosition = 0;
    let positionCost = costForPositionSecondPart(crabsPerPositionMap, 0, fuelCostMap);

    for (let i = 1; i <= maxPosition; i++) {
        let newPositionCost = costForPositionSecondPart(crabsPerPositionMap, i, fuelCostMap);

        if (newPositionCost < positionCost) {
            positionCost = newPositionCost;
            chosenPosition = i;
        }

        // if it's growing, I think we can bail.
        if (newPositionCost > positionCost) {
            // We are increasing costs as we go right, stop.
            break;
        }
    }

    return {
        position: chosenPosition,
        cost: positionCost,
    };
};

const firstPart = (allReadings) => {
    const crabsMap = fillInitialMap(allReadings);

    const { position, cost } = findBestPosition(crabsMap);

    console.log({position});
    console.log({cost});
};

const secondPart = (allReadings) => {
    const fuelMap = fillInitialDistancesCost();

    const crabsMap = fillInitialMap(allReadings);

    const { position, cost } = findBestPositionSecondPart(crabsMap, fuelMap);

    console.log("Second part");
    console.log({position});
    console.log({cost});
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