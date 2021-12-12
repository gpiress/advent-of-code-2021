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

const findAllPaths = adjacencyMap => {
    // start from 'start'
    const startTos = adjacencyMap.get('start');

    let toVisit = startTos.map(cave => `start-${cave}`);

    let pathsFound = 0;
    while (toVisit.length > 0) {
        const currentPath = toVisit.pop();
        const cavesInPath = currentPath.split('-');
        const currentCave = cavesInPath[cavesInPath.length - 1];
        //console.log({toVisit});
        //console.log({currentPath});

        if (currentCave === 'end') {
            pathsFound++;
            continue;
        }

        const neighbours = adjacencyMap.get(currentCave) || [];
        
        const neighboursToVisit = neighbours
            .filter(neighbourCave => neighbourCave !== 'start') // never visit 'start' twice
            .filter(neighbourCave => {
                if (neighbourCave == neighbourCave.toLowerCase()) {
                    // only visit small caves once
                    if (cavesInPath.indexOf(neighbourCave) > -1) {
                        //console.log(`Found cave already visited: ${neighbourCave} -- ${currentPath}`);
                        return false;
                    }
                }
                return true;
            })
            .map(neighbourCave => `${currentPath}-${neighbourCave}`);

        // DFS
        toVisit = [...toVisit, ...neighboursToVisit];
    }

    return pathsFound;
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

const findAllPathsSecondPart = adjacencyMap => {
    let pathsFound = 0;

    let toVisit = [{ cave: 'start', visited: []}];
    while (toVisit.length > 0) {
        const { cave, visited } = toVisit.pop();

        //console.log({cave});
        //console.log({visited});

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

                const allVisited = [...visited, cave];
                const twiceSmallCave = hasVisitedSmallCaveTwice(allVisited);

                if (twiceSmallCave && visited.indexOf(neighbourCave) > -1) {
                    // Can't revisit more than one small cave
                    //console.log(`Cannot visit ${neighbourCave} because already got 2 small caves in ${allVisited}`);
                    return false;
                }

                return true;
            })
            .map(neighbourCave => {
                /*
                console.group('Adding cave to visit');
                console.log(`${visited}, current cave: ${cave}`);
                console.log(`will visit cave ${neighbourCave}`);
                console.groupEnd();
                */
                return { cave: neighbourCave, visited: [...visited, cave] };
            });

        toVisit = [...toVisit, ...neighboursToVisit];
    }

    return pathsFound;
};

const firstPart = (allReadings) => {
    const adjMap = constructInitialAdjacency(allReadings);

    const pathsFound = findAllPaths(adjMap);

    console.log({pathsFound});
};

const secondPart = (allReadings) => {
    const adjMap = constructInitialAdjacency(allReadings);

    const pathsFound = findAllPathsSecondPart(adjMap);

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