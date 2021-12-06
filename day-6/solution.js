const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const fillInitialMap = allReadings => {
    const fishesPerCycle = new Map();

    allReadings[0].split(',').map(fishStr => +fishStr).forEach(fish => {
        let fishesForDay = fishesPerCycle.get(fish) || 0;
        fishesPerCycle.set(fish, ++fishesForDay);
    });

    return fishesPerCycle;
};

const passADay = fishesPerCycleMap => {
    const fishesReproducing = fishesPerCycleMap.get(0) || 0;

    for (let i = 1; i <= 8; i++) {
        let fishesInDay = fishesPerCycleMap.get(i) || 0;
        let newKey = i - 1;

        if (newKey === 6) {
            fishesInDay += fishesReproducing;
        }
        fishesPerCycleMap.set(newKey, fishesInDay);
    }

    fishesPerCycleMap.set(8, fishesReproducing);

    return fishesPerCycleMap;
};

const howManyFishes = fishesPerCycleMap => {
    let totalFishes = 0;

    for (let fishValue of fishesPerCycleMap.values()) {
        totalFishes += fishValue;
    }

    return totalFishes;
}

const firstPart = (allReadings) => {
    const fishesMap = fillInitialMap(allReadings);

    for (let i = 0; i < 80; i++) {
        passADay(fishesMap);
    }

    const totalFishes = howManyFishes(fishesMap);
    console.log({totalFishes});
};

const secondPart = (allReadings) => {
    const fishesMap = fillInitialMap(allReadings);

    for (let i = 0; i < 256; i++) {
        passADay(fishesMap);
    }

    const totalFishes = howManyFishes(fishesMap);
    console.log({totalFishes});
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