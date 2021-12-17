const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const isInTargetArea = (currentPosition, targetAreaDef) => {
    const { minX, maxX, minY, maxY } = targetAreaDef;
    const { x, y } = currentPosition;

    if (x >= minX && x <= maxX) {
        if (y >= minY && y <= maxY) {
            return true;
        }
    }

    return false;
};

const isItPastTargetArea = (currentPosition, currentVelocity, targetAreaDef) => {
    const { minX, maxX, minY, maxY } = targetAreaDef;
    const { x, y } = currentPosition;
    const { velX, velY } = currentVelocity;

    if (x > maxX && velX >= 0) {
        return true;
    }

    if (x < minX && velX <= 0) {
        return true;
    }

    if (y < minY && velY <= 0) {
        return true;
    }

    return false;
};

const computeNewPositionAndVelocity = (previousPosition, previousVelocity) => {
    const { x, y } = previousPosition;
    const { velX, velY } = previousVelocity;

    const newX = x + velX;
    const newY = y + velY;

    // Gravity makes vel y go down by 1 per step
    const newVelY = velY - 1;
    
    // Drag makes vel x go towards 0 by 1 unit
    let newVelX = velX;
    if (velX < 0) {
        newVelX++;
    } else if (velX > 0) {
        newVelX--;
    }

    const newPosition = { x: newX, y: newY };
    const newVelocity = { velX: newVelX, velY: newVelY };

    return {
        newPosition: newPosition,
        newVelocity: newVelocity,
    };
};

const testVelocity = (initialVelocity, targetAreaDef) => {
    const { velX, velY } = initialVelocity;
    let position = { x: 0, y: 0 };
    let velocity = { velX: velX, velY: velY };

    let done = false;
    let works = false;
    while (!done) {
        const { newPosition, newVelocity } = computeNewPositionAndVelocity(position, velocity);

        if (isInTargetArea(newPosition, targetAreaDef)) {
            done = true;
            works = true;
        }

        if (isItPastTargetArea(newPosition, newVelocity, targetAreaDef)) {
            done = true;
            works = false;
        }

        position = newPosition;
        velocity = newVelocity;

        //console.log({position});
        //console.log({velocity});
    }

    return works;
};

const findMaximumVerticalVelocityNaive = targetAreaDef => {
    let { minX, maxX, minY, maxY } = targetAreaDef;

    if (maxX < 0) {
        const temp = -minX;
        minX = -maxX;
        maxX = temp;
    }

    let maximumY = -11_000;
    let maximumX = undefined;

    let validAlternatives = 0;

    for (let x = 0; x <= maxX; x++) {
        for (let y = -10_000; y < 10_000; y++) {
            const velocity = { velX: x, velY: y };
            const isValid = testVelocity(velocity, { minX: minX, maxX: maxX, minY: minY, maxY: maxY });

            if (isValid) {
                validAlternatives++;
                console.log(`Found solution for x: ${x}, y: ${y}`);
            }

            if (isValid && y > maximumY) {
                maximumX = x;
                maximumY = y;

                // Don't need to test more values of y for the same x
                continue;
            }
        }
    }

    return {
        maximumX: maximumX,
        maximumY: maximumY,
        validAlternatives: validAlternatives,
    };
};

const highestVerticalPosition = verticalVelocity => {
    // It will keep going up until velocity = 0
    const n = verticalVelocity + 1;
    const a1 = verticalVelocity;
    const an = 0;
    const highestPoint = (n * (a1 + an)) / 2;

    return highestPoint;
};

const firstPart = (allReadings) => {
    
    const testTargetArea = {
        minX: 20, maxX: 30,
        minY: -10, maxY: -5
    };

    const inputTargetArea = {
        minX: 281, maxX: 311,
        minY: -74, maxY: -54,
    };

    //const { maximumX, maximumY } = findMaximumVerticalVelocityNaive(testTargetArea);
    const { maximumX, maximumY } = findMaximumVerticalVelocityNaive(inputTargetArea);
    const highestPoint = highestVerticalPosition(maximumY);

    console.group('first part');
    console.log({maximumX});
    console.log({maximumY});
    console.log({highestPoint});
    console.groupEnd();
};

const secondPart = (allReadings) => {
    const testTargetArea = {
        minX: 20, maxX: 30,
        minY: -10, maxY: -5
    };

    const inputTargetArea = {
        minX: 281, maxX: 311,
        minY: -74, maxY: -54,
    };

    const isValid = testVelocity({ velX: 30, velY: -5 }, testTargetArea);
    console.log({isValid});

    //const { validAlternatives } = findMaximumVerticalVelocityNaive(testTargetArea);
    const { validAlternatives } = findMaximumVerticalVelocityNaive(inputTargetArea);

    console.group('second part');
    console.log({validAlternatives});
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