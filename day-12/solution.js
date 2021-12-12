const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const constructInitialAdjacency = allReadings => {
    let adjMap = new Map();

    allReadings
        .forEach(line => {
            const from = line.split('-')[0];
            const to = line.split('-')[1];

            let existingTosFrom = adjMap.get(from) || [];
            existingTosFrom.push(to);
            adjMap.set(from, existingTosFrom);

            let existingTosTo = adjMap.get(to) || [];
            existingTosTo.push(from);
            adjMap.set(to, existingTosTo);
        });

    return adjMap;
};

const hasVisitedSmallCaveTwice = visited => {
    const visitedSmallCaves = visited
        .filter(visitedCave => visitedCave !== 'start') // just to be extra careful
        .filter(visitedCave => visitedCave !== 'end') // just to be extra careful
        .filter(visitedCave => visitedCave == visitedCave.toLowerCase());

    const visitedSmallSet = new Set();

    for (let smallCave of visitedSmallCaves) {
        if (visitedSmallSet.has(smallCave)) {
            return true;
        }
        visitedSmallSet.add(smallCave);
    }

    return false;
};

const findAllPaths = (adjacencyMap, isSecondPart) => {
    let pathsFound = 0;

    let toVisit = [{ cave: 'start', visited: []}];
    while (toVisit.length > 0) {
        const { cave, visited } = toVisit.pop();

        if (cave === 'end') {
            pathsFound++;
            continue;
        }

        const neighbours = adjacencyMap.get(cave) || [];

        const neighboursToVisit = neighbours
            .filter(neighbourCave => neighbourCave !== 'start') // Never visit start twice
            .filter(neighbourCave => {
                if (neighbourCave != neighbourCave.toLowerCase()) {
                    return true;
                }

                if (!isSecondPart && visited.indexOf(neighbourCave) > -1) {
                    // In first part we can't revisit small caves at all
                    return false;
                }

                const allVisited = [...visited, cave];
                const twiceSmallCave = hasVisitedSmallCaveTwice(allVisited);

                if (twiceSmallCave && visited.indexOf(neighbourCave) > -1) {
                    // Can't revisit more than one small cave
                    return false;
                }

                return true;
            })
            .map(neighbourCave => {
                return { cave: neighbourCave, visited: [...visited, cave] };
            });

        toVisit = [...toVisit, ...neighboursToVisit];
    }

    return pathsFound;
};

const firstPart = (allReadings) => {
    const adjMap = constructInitialAdjacency(allReadings);

    const pathsFound = findAllPaths(adjMap, false);

    console.log({pathsFound});
};

const secondPart = (allReadings) => {
    const adjMap = constructInitialAdjacency(allReadings);

    const pathsFound = findAllPaths(adjMap, true);

    console.log({pathsFound});    
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