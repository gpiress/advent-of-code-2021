const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');

let cubesOn = new Set();
const minBoundary = -50, maxBoundary = 50;

const hashCube = (x, y, z) => {
    // Make everything positive
    const actualX = x + Math.abs(minBoundary);
    const actualY = y + Math.abs(minBoundary);
    const actualZ = z + Math.abs(minBoundary);

    const xStr = actualX.toString().padStart(4, '0');
    const yStr = actualY.toString().padStart(4, '0');
    const zStr = actualZ.toString().padStart(4, '0');

    const hashStr = `9${xStr}${yStr}${zStr}`;

    /*
    console.log({x});
    console.log({y});
    console.log({z});

    console.log({hashStr});
    */

    if (actualX < 0 || actualY < 0 || actualZ < 0) {
        console.error("This should not have happened");
    }
    
    return +hashStr;
}

const turnOn = (minX, maxX, minY, maxY, minZ, maxZ) => {

    const actualMinX = minX < minBoundary ? minBoundary : minX;
    const actualMaxX = maxX > maxBoundary ? maxBoundary : maxX;

    const actualMinY = minY < minBoundary ? minBoundary : minY;
    const actualMaxY = maxY > maxBoundary ? maxBoundary : maxY;

    const actualMinZ = minZ < minBoundary ? minBoundary : minZ;
    const actualMaxZ = maxZ > maxBoundary ? minBoundary : maxZ;

    for (let x = actualMinX; x <= actualMaxX; x++) {
        for (let y = actualMinY; y <= actualMaxY; y++) {
            for (let z = actualMinZ; z <= actualMaxZ; z++) {
                const hash = hashCube(x, y, z);
                //console.log({hash});
                cubesOn.add(hash);
            }
        }
    }
};

const turnOff = (minX, maxX, minY, maxY, minZ, maxZ) => {
    if (cubesOn.size === 0) {
        return;
    }

    const actualMinX = minX < minBoundary ? minBoundary : minX;
    const actualMaxX = maxX > maxBoundary ? maxBoundary : maxX;

    const actualMinY = minY < minBoundary ? minBoundary : minY;
    const actualMaxY = maxY > maxBoundary ? maxBoundary : maxY;

    const actualMinZ = minZ < minBoundary ? minBoundary : minZ;
    const actualMaxZ = maxZ > maxBoundary ? minBoundary : maxZ;

    for (let x = actualMinX; x <= actualMaxX; x++) {
        for (let y = actualMinY; y <= actualMaxY; y++) {
            for (let z = actualMinZ; z <= actualMaxZ; z++) {
                const hash = hashCube(x, y, z);
                //console.log({hash});
                cubesOn.delete(hash);
            }
        }
    }
};

const runInstructions = allReadings => {
    for (const line of allReadings) {
        const [operation, limits] = line.split(' ');
        const [xLimits, yLimits, zLimits] = limits.split(',');
        const [minX, maxX] = xLimits.split('=')[1].split('..');
        const [minY, maxY] = yLimits.split('=')[1].split('..');
        const [minZ, maxZ] = zLimits.split('=')[1].split('..');

        if (operation === 'on') {
            turnOn(+minX, +maxX, +minY, +maxY, +minZ, +maxZ);
        } else {
            turnOff(+minX, +maxX, +minY, +maxY, +minZ, +maxZ);
        }

        const turnedOn = cubesOn.size;
        console.log({turnedOn});
    }

    return cubesOn.size;
};

const firstPart = allReadings => {


    console.group('first part');
    const turnedOn = runInstructions(allReadings);
    console.log({turnedOn});
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