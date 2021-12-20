const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


class Beacon {
    constructor(x, y, z, overlapped=false) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.overlapped = overlapped;
    }

    equals(otherBeacon) {
        if (!(otherBeacon instanceof Beacon)) {
            return false;
        }

        return this.x === otherBeacon.x
            && this.y === otherBeacon.y
            && this.z === otherBeacon.z;
    }

    hash() {
        return `${this.x}:${this.y}:${this.z}`;
    }
}

const isXFlipped = rotation => {
    if (rotation >= 4 && rotation < 8) {
        return true;
    }

    if (rotation % 2 === 1) {
        return true;
    }

    return false;
};

const isYFlipped = rotation => {
    const rotationsYFlipped = [1,3,5,7,12,13,14,15,18,19,22,23];
    return rotationsYFlipped.indexOf(rotation) > -1;
};

const isZFlipped = rotation => {
    const rotationsZFlipped = [2,3,6,7,10,11,14,15,20,21,22,23];
    return rotationsZFlipped.indexOf(rotation) > -1;
}

const sumBeaconsDirectly = (beacon, otherBeacon) => {
    const x = beacon.x - otherBeacon.x;
    const y = beacon.y - otherBeacon.y;
    const z = beacon.z - otherBeacon.z;

    return { x, y, z };
};

const sumBeaconsNaive = (otherBeacon, beaconOffset) => {
    const x = otherBeacon.x + beaconOffset.x;
    const y = otherBeacon.y + beaconOffset.y;
    const z = otherBeacon.z + beaconOffset.z;

    return { x, y, z };
};

const sumBeaconsRelatively = (beacon, otherBeacon, beaconOffset) => {
    // This is to get relative distance from 0
    let x, y, z;
    
    // otherBeacon is already in relative distance from beacon
    // if beacon is to the right of 0 and otherBeacon is to the right of beacon
    // then otherBeacon is further away, need to add the distances
    if (beacon.x > 0 && otherBeacon.x > 0) {
        x = beacon.x + otherBeacon.x;
    } else if (beacon.x < 0 && otherBeacon.x < 0) {
        x = beacon.x + otherBeacon.x;
    } else {
        x = otherBeacon.x - beacon.x;
    }

    if (beacon.y > 0 && otherBeacon.y > 0) {
        y = beacon.y + otherBeacon.y;
    } else if (beacon.y < 0 && otherBeacon.y < 0) {
        y = beacon.y + otherBeacon.y;
    } else {
        y = otherBeacon.y - beacon.y;
    }

    if (beacon.z > 0 && otherBeacon.z > 0) {
        z = beacon.z + otherBeacon.z;
    } else if (beacon.z < 0 && otherBeacon.z < 0) {
        z = beacon.z + otherBeacon.z;
    } else {
        z = otherBeacon.z - beacon.z;
    }

    return { x, y, z };
};

class Scanner {
    constructor(number, beacons) {
        this.number = number;
        this.beacons = beacons;
        this.rotated = [...beacons];
        this.rotations = 0;
        this.position = { x: 0, y: 0, z: 0 };
        this.validRotations = [];
        for (let i = 1; i <= 24; i++) {
            this.validRotations.push(i);
        }
    }

    storeCurrentSetup() {
        this.beacons = [...this.rotated];
        this.rotations = 0;
    }

    isFullyRotated() {
        return this.rotations >= 24;
    }

    moveToRotation(rotation) {
        this.rotations = rotation;
        this.rotate();
    }

    rotate() {
        this.rotated = [...this.beacons];

        // X Y Z
        // X -Y -Z
        // X -Z Y
        // X Z -Y
        // -X Y -Z
        // -X -Y Z
        // -X Z Y
        // -X -Z -Y
        if (this.rotations < 8) {

            const shouldFlipX = this.rotations >= 4;
            const shouldFlipY = [1, 3, 5, 7].indexOf(this.rotations) > -1;
            const shouldFlipZ = [1, 2, 4, 7].indexOf(this.rotations) > -1;
            const shouldSwapYandZ = [2, 3, 6, 7].indexOf(this.rotations) > -1;;

            if (shouldFlipX) {
                this.rotated = this.rotated.map(beacon => new Beacon(-beacon.x, beacon.y, beacon.z));
            }

            if (shouldFlipY) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.x, -beacon.y, beacon.z));
            }

            if (shouldFlipZ) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.x, beacon.y, -beacon.z));
            }

            if (shouldSwapYandZ) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.x, beacon.z, beacon.y));
            }
        }


        // Y X -Z
        // Y -X Z
        // Y Z X
        // Y -Z -X
        // -Y X Z
        // -Y -X -Z
        // -Y -Z X
        // -Y Z -X
        if (this.rotations >= 8 && this.rotations < 16) {

            const shouldFlipY = this.rotations >= 12;
            const shouldFlipX = [1, 3, 5, 7].indexOf(this.rotations - 8) > -1;
            const shouldFlipZ = [0, 3, 5, 6].indexOf(this.rotations - 8) > -1;
            const shouldSwapXandZ = [2, 3, 6, 7].indexOf(this.rotations - 8) > -1;;

            if (shouldFlipX) {
                this.rotated = this.rotated.map(beacon => new Beacon(-beacon.x, beacon.y, beacon.z));
            }

            if (shouldFlipY) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.x, -beacon.y, beacon.z));
            }

            if (shouldFlipZ) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.x, beacon.y, -beacon.z));
            }

            if (shouldSwapXandZ) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.y, beacon.z, beacon.x));
            } else {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.y, beacon.x, beacon.z));
            }
        }


        // Z X Y
        // Z -X -Y
        // Z -Y X
        // Z Y -X
        // -Z X -Y
        // -Z -X Y
        // -Z Y X
        // -Z -Y -X
        if (this.rotations >= 16) {

            const shouldFlipZ = this.rotations >= 20;
            const shouldFlipX = [1, 3, 5, 7].indexOf(this.rotations - 16) > -1;
            const shouldFlipY = [1, 2, 4, 7].indexOf(this.rotations - 16) > -1;
            const shouldSwapXandY = [2, 3, 6, 7].indexOf(this.rotations - 16) > -1;;

            if (shouldFlipX) {
                this.rotated = this.rotated.map(beacon => new Beacon(-beacon.x, beacon.y, beacon.z));
            }

            if (shouldFlipY) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.x, -beacon.y, beacon.z));
            }

            if (shouldFlipZ) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.x, beacon.y, -beacon.z));
            }

            if (shouldSwapXandY) {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.z, beacon.y, beacon.x));
            } else {
                this.rotated = this.rotated.map(beacon => new Beacon(beacon.z, beacon.x, beacon.y));
            }
        }
        
        this.rotated = this.rotated.sort((beacon, otherBeacon) => beacon.x - otherBeacon.x);
        this.rotations++;
    }

    reset() {
        this.rotated = [...this.beacons];
        this.rotations = 0;
    }

    print() {
        console.log(`------ scanner ${this.number}, ${this.rotations} rotations, ${this.axis} axis ------`);
        for (let beacon of this.rotated) {
            console.log(`${beacon.x},${beacon.y},${beacon.z}`);
        }
        console.log('');
    }
};

const doScannersOverlap = (scanner, otherScanner) => {
    // Need to sort the beacons for both scanners
    let leftBeacons = [...scanner.rotated];
    let rightBeacons = [...otherScanner.rotated];

    let overlap = false;
    let overlappingLeftBeacons = [];
    let overlappingRightBeacons = [];

    let startingLeftBeacon;
    let startingRightBeacon;
    let startingLeftBeaconIndex = -1;
    let startingRightBeaconIndex = -1;

    // Checking for overlap is checking if the distance between beacons is the same
    for (let i = 0; i < leftBeacons.length; i++) {
        startingLeftBeacon = leftBeacons[i];
        let leftDistances = [];
        for (let j = 0; j < leftBeacons.length; j++) {
            const current = leftBeacons[j];
            leftDistances.push( { beacon: current, x: (current.x - startingLeftBeacon.x), y: (current.y - startingLeftBeacon.y), z: (current.z - startingLeftBeacon.z), index: j } );
        }

        //console.log({startingLeftBeacon});
        //console.group(`Checking all right beacons`);
        //console.log({leftDistances});

        for (let j = 0; j < rightBeacons.length; j++) {
            startingRightBeacon = rightBeacons[j];
            //console.log({startingRightBeacon});
            let rightDistances = [];
            
            for (let k = 0; k < rightBeacons.length; k++) {
                const current = rightBeacons[k];
                rightDistances.push( { beacon: current, x: (current.x - startingRightBeacon.x), y: (current.y - startingRightBeacon.y), z: (current.z - startingRightBeacon.z), index: k } );
            }

            //console.log({rightDistances});

            // How many distances are present in both
            overlappingRightBeacons = rightDistances
                .filter(distance => {
                    const { x, y, z } = distance;
                    const sameDistance = leftDistances.find(leftDistance => (leftDistance.x === x && leftDistance.y === y && leftDistance.z === z));

                    return sameDistance !== undefined;
                })
                .map(distance => distance.beacon);
            
            //console.log({overlappingRightBeacons});
            overlappingLeftBeacons = leftDistances
                .filter(distance => {
                    const { x, y, z } = distance;
                    const sameDistance = rightDistances.find(rightDistance => (rightDistance.x === x && rightDistance.y === y && rightDistance.z === z));

                    return sameDistance !== undefined;
                })
                .map(distance => distance.beacon);

            if (overlappingRightBeacons.length >= 12) {
                //console.log({overlappingLeftBeacons});
                //console.log(`Found overlapping scanners ${scanner.number} and ${otherScanner.number}`);
                //console.log({startingLeftBeacon});
                //console.log({leftDistances});
                //console.log({rightDistances});
                startingRightBeaconIndex = j;
                startingLeftBeaconIndex = i;
                overlap = true;
                break;
            }
        }
        //console.groupEnd();

        if (overlap) {
            break;
        }
    }


    return { 
        overlap, 
        overlappingLeftBeacons, 
        overlappingRightBeacons, 
        startingLeftBeacon,
        startingLeftBeaconIndex,
        startingRightBeacon,
        startingRightBeaconIndex
    };
};

const testScannersWhileRotating = (scanner, otherScanner) => {
    //console.group(`Testing scanners ${scanner.number} and ${otherScanner.number} while rotating`);
    let overlap = false;
    let overlappingRightBeacons = [];
    let overlappingLeftBeacons = [];
    let startingLeftBeacon, startingLeftBeaconIndex, startingRightBeacon, startingRightBeaconIndex;

    let newValidRotationsScanner = new Set();
    let newValidRotationsOtherScanner = new Set();
    for (let i = 0; i < scanner.validRotations.length; i++) {
        const scannerRotation = scanner.validRotations[i];
        //console.log(`Using rotation ${scannerRotation} for scanner ${scanner.number}`);
        scanner.moveToRotation(scannerRotation);
   
        while(!otherScanner.isFullyRotated()) {
            otherScanner.rotate();
            //console.group(`Testing rotation ${otherScanner.rotations}`);
            const result = doScannersOverlap(scanner, otherScanner);

            if (result.overlap) {
                overlap = true;
                const otherRotation = otherScanner.rotations - 1; // Gotta subtract 1 due to my shitty code
                newValidRotationsOtherScanner.add(otherRotation);
                newValidRotationsScanner.add(scannerRotation);

                if (overlappingRightBeacons.length === 0) {
                    overlappingRightBeacons = result.overlappingRightBeacons;
                    startingRightBeacon = result.startingRightBeacon;
                    startingRightBeaconIndex = result.startingRightBeaconIndex;
                }
                
                if (overlappingLeftBeacons.length === 0) {
                    overlappingLeftBeacons = result.overlappingLeftBeacons;
                    startingLeftBeacon = result.startingLeftBeacon;
                    startingLeftBeaconIndex = result.startingLeftBeaconIndex;
                }

                //console.log(`Found overlapping scanners ${scanner.number} and ${otherScanner.number}. Rotation ${otherRotation}`);
                break;
            }
            //console.groupEnd();
        }
    }

    if (overlap) {
        scanner.validRotations = Array.from(newValidRotationsScanner);
        otherScanner.validRotations = Array.from(newValidRotationsOtherScanner);

        //console.log(`Valid rotations for scanner ${scanner.number} - ${scanner.validRotations}`);
        //console.log(`Valid rotations for scanner ${otherScanner.number} - ${otherScanner.validRotations}`);
    } else {
        otherScanner.reset();
    }

    //console.groupEnd();

    return { 
        overlap,
        overlappingLeftBeacons,
        overlappingRightBeacons,
        startingLeftBeacon, startingLeftBeaconIndex,
        startingRightBeacon, startingRightBeaconIndex
    };
}

const findOverlappingPairs = scanners => {
    console.group('Finding overlapping scanner pairs');
    let toVisit = scanners.map(scanner => scanner.number).sort((a, b) => a - b);
    let visited = new Set();

    scanners[0].validRotations = [0];
    let scannersWithOverlaps = [];
    let matchesFound = [];

    while (toVisit.length > 0) {
        let visitingScannerIndex = toVisit.shift();

        if (visited.has(visitingScannerIndex)) {
            continue;
        }

        visited.add(visitingScannerIndex);

        for (let j = 0; j < scanners.length; j++) {
            if (j === visitingScannerIndex) {
                continue; // Skip trying to compare the scanner with itself
            }

            if (visited.has(j)) {
                continue; // We figured this scanner out already, skip it
            }

            if (matchesFound.indexOf(j) > -1) {
                continue; // We already found a match for this one, skip
            }

            const leftScanner = scanners[visitingScannerIndex];
            const rightScanner = scanners[j];
            const { 
                overlap, 
                overlappingLeftBeacons, 
                overlappingRightBeacons,
                startingLeftBeacon,
                startingLeftBeaconIndex,
                startingRightBeacon,
                startingRightBeaconIndex 
            } = testScannersWhileRotating(leftScanner, rightScanner);

            if (overlap) {
                console.log(`Found pair between ${visitingScannerIndex} and ${j}`);
                
                //console.log({overlappingLeftBeacons});
                //console.log({overlappingRightBeacons});

                //console.log({startingLeftBeacon});
                //console.log({startingRightBeacon});

                const scannerPositionRelativeToLeftScanner = sumBeaconsDirectly(startingLeftBeacon, startingRightBeacon);
                //console.log(`Scanner ${rightScanner.number} is at position ${JSON.stringify(scannerPositionRelativeToLeftScanner)} in relation to scanner ${leftScanner.number}`);
                rightScanner.position = scannerPositionRelativeToLeftScanner;

                if (leftScanner.number !== 0) {
                    const positionRelatedToZero = sumBeaconsNaive(scannerPositionRelativeToLeftScanner, leftScanner.position);
                    //console.log(`Scanner ${rightScanner.number} is at position ${JSON.stringify(positionRelatedToZero)} in relation to scanner 0`);
                    rightScanner.position = positionRelatedToZero;
                }

                scannersWithOverlaps.push([visitingScannerIndex, j]);
                matchesFound.push(rightScanner.number);
            }
        }

        // I want to visit first the ones with the most restricted valid positions
        toVisit = toVisit
            .map(index => scanners[index])
            .sort((scanner, otherScanner) => scanner.validRotations.length - otherScanner.validRotations.length)
            .map(scanner => scanner.number);
        //console.log(`To visit: ${toVisit}`);
    }
    
    //console.log({scannersWithOverlaps});
    matchesFound.sort((a, b) => a - b);
    //console.log({matchesFound});

    console.groupEnd();
};

const highestManhattan = scanners => {
    let manhattanDistances = [];

    for (let i = 0; i < scanners.length; i++) {
        for (let j = i + 1; j < scanners.length; j++) {
            const distance = Math.abs((scanners[i].position.x - scanners[j].position.x))
                + Math.abs((scanners[i].position.y - scanners[j].position.y))
                + Math.abs((scanners[i].position.z - scanners[j].position.z));

            manhattanDistances.push(distance);
        }
    }

    return manhattanDistances.reduce((prev, curr) => prev > curr ? prev : curr, 0);
};

const uniqueBeacons = scanners => {
    const allBeacons = scanners
        .map(scanner => { return { position: scanner.position, beacons: scanner.rotated } })
        .map(simplerScanner => {
            const positions = simplerScanner.beacons.map(beacon => sumBeaconsNaive(beacon, simplerScanner.position));
            return positions;
        })
        .flat()
        .map(position => `${position.x}:${position.y}:${position.z}`);
    
    const uniqueBeacons = new Set();
    allBeacons.forEach(hash => uniqueBeacons.add(hash));

    return uniqueBeacons.size;
};

const parseScanners = allReadings => {
    let currentScanner = -1;
    let beacons = [];
    let scanners = [];

    for (let line of allReadings) {
        if (line.length === 0) {
            scanners.push(new Scanner(currentScanner, [...beacons]));
            continue;
        }
        if (line.startsWith('---')) {
            currentScanner++;
            beacons = [];
            continue;
        }

        const numberStrs = line.split(',').map(number => number.trim());
        beacons.push(new Beacon(+numberStrs[0], +numberStrs[1], +numberStrs[2]));
    }

    if (beacons.length > 0) {
        beacons = beacons.sort((beacon, otherBeacon) => beacon.x - otherBeacon.x);
        scanners.push(new Scanner(currentScanner, [...beacons]));
        beacons = [];
    }

    console.log(`Found ${scanners.length} scanners when parsing`);

    return scanners;
};

const firstPart = (allReadings) => {

    const scanners = parseScanners(allReadings);
    findOverlappingPairs(scanners);

    console.group('first part');
    const uniqueBeaconsCount = uniqueBeacons(scanners);
    console.log({uniqueBeaconsCount});
    console.groupEnd();
};

const secondPart = (allReadings) => {
    const scanners = parseScanners(allReadings);
    findOverlappingPairs(scanners);

    console.group('second part');
    const highestManhattanDist = highestManhattan(scanners);
    console.log({highestManhattanDist});
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


// Test shit
const computeAllValidRotations = () => {
    // This was a helper to help me figure out all valid 24 rotations, not used in the code path
    let validRotations = new Set();

    let sinMap = new Map();
    sinMap.set(90, 1);
    sinMap.set(270, -1);

    let cosMap = new Map();
    cosMap.set(0, 1);
    cosMap.set(180, -1);
    

    let startingVector = [1, 2, 3];
    let rotatedVector = [...startingVector];

    for (let x = 0; x < 4; x++) {
        rotatedVector = [...startingVector];

        const rotXSin = sinMap.get(90 * x) || 0;
        const rotXCos = cosMap.get(90 * x) || 0;

        let rotatedXVector = [];

        rotatedXVector[0] = (rotatedVector[0] + 0 + 0);
        rotatedXVector[1] = (0 + rotatedVector[1] * rotXCos + rotatedVector[2] * -rotXSin);
        rotatedXVector[2] = (0 + rotatedVector[1] * rotXSin + rotatedVector[2] * rotXCos);

        for (let y = 0; y < 4; y++) {
            const rotYSin = sinMap.get(90 * y) || 0;
            const rotYCos = cosMap.get(90 * y) || 0;

            let rotatedXAndYVector = [];

            rotatedXAndYVector[0] = (rotatedXVector[0] * rotYCos + 0 + rotatedXVector[2] * rotYSin);
            rotatedXAndYVector[1] = (0 + rotatedXVector[1] + 0);
            rotatedXAndYVector[2] = (rotatedXVector[0] * -rotYSin + 0 + rotatedXVector[2] * rotYCos);

            for (let z = 0; z < 4; z++) {
                let rotatedXYZVector = [];
                const sin = sinMap.get(90 * z) || 0;
                const cos = cosMap.get(90 * z) || 0;

                rotatedXYZVector[0] = (rotatedXAndYVector[0] * cos + rotatedXAndYVector[1] * -sin);
                rotatedXYZVector[1] = (rotatedXAndYVector[0] * sin + rotatedXAndYVector[1] * cos);
                rotatedXYZVector[2] = rotatedXAndYVector[2];

                const hash = rotatedXYZVector.join(':');
                validRotations.add(hash);
            }
        }
    }

    return validRotations;
};

const createTestScannerAndRotate = () => {

    const beacons = [
        new Beacon(-1, -1, 1),
        new Beacon(-2, -2, 2),
        new Beacon(-3, -3, 3),
        new Beacon(-2, -3, 1),
        new Beacon(5, 6, -4),
        new Beacon(8, 0, 7),
    ];

    const testScanner = new Scanner(0, beacons);
    while (!testScanner.isFullyRotated()) {
        testScanner.rotate();
        testScanner.print();
    }
};

const createScannersThatMatchSwappingAxis = () => {
    const leftBeacons = [
        new Beacon(0, 0, 0),
        new Beacon(2, 1, 3),
        new Beacon(4, 2, 6),
        new Beacon(6, 3, 9),
        new Beacon(8, 4, 12),

        new Beacon(1000, -200, 308), // This is a non-overlapping beacon

        new Beacon(10, 5, 15),
        new Beacon(12, 6, 18),
        new Beacon(14, 7, 21),
        new Beacon(16, 8, 24),
        new Beacon(18, 9, 27),
        new Beacon(20, 10, 30),

        new Beacon(-438, 317, 100), // This is a non-overlapping beacon

        new Beacon(22, 11, 33),
    ];
    const leftScanner = new Scanner(0, leftBeacons);

    const rightBeacons = [
        new Beacon(-30, -70, 10),
        new Beacon(-29, -67, 12),

        new Beacon(-23, -49, 24), // This is an unsorted beacon, to check if sorting works

        new Beacon(-28, -64, 14),
        new Beacon(-27, -61, 16),

        new Beacon(-355, 200, 308), // This is a non-overlapping beacon

        new Beacon(-26, -58, 18),
        new Beacon(-25, -55, 20),
        new Beacon(-24, -52, 22),
        
        new Beacon(-22, -46, 26),
        new Beacon(-21, -43, 28),

        new Beacon(755, -600, 100), // This is a non-overlapping beacon

        new Beacon(-20, -40, 30),
        new Beacon(-19, -37, 32),
    ];
    const rightScanner = new Scanner(1, rightBeacons);

    const scanners = [leftScanner, rightScanner];

    findOverlappingPairs(scanners);

    /*
    if (!overlap) {
        console.error('They were supposed to overlap!');
    }
    */

    uniqueBeacons(scanners);
};