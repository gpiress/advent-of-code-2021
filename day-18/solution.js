const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');

// A Pair object is something like
// pair:        { depth: 0, left: otherPair, right: 3, parent: null }
// otherPair:   { depth: 1, left: 1, right: 1, parent: pair }

class Value {
    constructor(value = null) {
        this.value = value;
    }
}

class Pair {
    constructor(depth, left, right, parent = null) {
        this.depth = depth;
        this.left = left;
        this.right = right;
        this.parent = parent;
    }

    equals(otherPair) {
        if (!(otherPair instanceof Pair)) {
            return false;
        }
        return this.depth === otherPair.depth
            && this.left === otherPair.left
            && this.right === otherPair.right
            && this.parent === otherPair.parent;
    }

    toString() {
        let pairString = '[';

        if (this.left instanceof Pair) {
            pairString += this.left.toString();
        } else {
            pairString += this.left.value;
        }

        pairString += ',';

        if (this.right instanceof Pair) {
            pairString += this.right.toString();
        } else {
            pairString += this.right.value;
        }

        pairString += ']';

        return pairString;
    }

    increaseDepth() {
        this.depth++;

        if (this.left instanceof Pair) {
            this.left.increaseDepth();
        }

        if (this.right instanceof Pair) {
            this.right.increaseDepth();
        }
    }

    magnitude() {
        let leftValue = 0;
        if (this.left instanceof Pair) {
            leftValue = this.left.magnitude();
        } else {
            leftValue = this.left.value;
        }

        let rightValue = 0;
        if (this.right instanceof Pair) {
            rightValue = this.right.magnitude();
        } else {
            rightValue = this.right.value;
        }

        return 3*leftValue + 2*rightValue;
    }

    shouldExplode() {
        return this.depth >= 4;
    }

    increaseLeftmostNumber(increaseBy) {
        let tempPair = this;
        while (!(tempPair.left instanceof Value)) {
            tempPair = tempPair.left;
        }

        tempPair.left = new Value(tempPair.left.value + increaseBy);
    }

    increaseRightmostNumber(increaseBy) {
        let tempPair = this;
        while (!(tempPair.right instanceof Value)) {
            tempPair = tempPair.right;
        }

        tempPair.right = new Value(tempPair.right.value + increaseBy);
    }

    explode() {
        if (!this.shouldExplode()) {
            console.log('This pair does not need exploding');
            return;
        }

        const leftValue = this.left;
        if (!(leftValue instanceof Value)) {
            console.error(`Trying to explode something without constant values :( ${leftValue}`);
        }

        const rightValue = this.right;
        if (!(rightValue instanceof Value)) {
            console.error(`Trying to explode something without constant values :( ${rightValue}`);
        }

        let tempPair = this.parent;
        
        if (this.equals(tempPair.left)) {
            // Find the leftmost right number
            if (tempPair.right instanceof Value) {
                tempPair.right = new Value(tempPair.right.value + rightValue.value);
            } else {
                tempPair.right.increaseLeftmostNumber(rightValue.value);
            }

            // Find the rightmost left number if it exists
            let tempPairParent = tempPair.parent;
            while (tempPairParent !== null) {
                if (tempPairParent.left instanceof Value) {
                    tempPairParent.left = new Value(tempPairParent.left.value + leftValue.value);
                    break;
                }

                if (tempPairParent.left.equals(tempPair)) {
                    tempPair = tempPair.parent;
                    tempPairParent = tempPair.parent;
                } else {
                    if (tempPairParent.left instanceof Value) {
                        tempPairParent.left = new Value(tempPairParent.left.value + leftValue.value);
                    } else {
                        tempPairParent.left.increaseRightmostNumber(leftValue.value);
                    }
                    break;
                }
            }

            // Need to change the parent child to 0
            this.parent.left = new Value(0);
        } else if (this.equals(tempPair.right)) {
            // Find the rightmost left number
            if (tempPair.left instanceof Value) {
                tempPair.left = new Value(tempPair.left.value + leftValue.value);
            } else {
                tempPair.left.increaseRightmostNumber(leftValue.value);
            }

            // Find the leftmost right number if it exists
            let tempPairParent = tempPair.parent;
            while (tempPairParent !== null) {
                if (tempPairParent.right instanceof Value) {
                    tempPairParent.right = new Value(tempPairParent.right.value + rightValue.value);
                    break;
                }

                if (tempPairParent.right.equals(tempPair)) {
                    tempPair = tempPair.parent;
                    tempPairParent = tempPair.parent;
                } else {
                    if (tempPairParent.right instanceof Value) {
                        tempPairParent.right = new Value(tempPairParent.right.value + rightValue.value);
                    } else {
                        tempPairParent.right.increaseLeftmostNumber(rightValue.value);
                    }
                    break;
                }
            }

            // Need to change the parent child to 0
            this.parent.right = new Value(0);
        } else {
            console.error("Could not figure out which child of parent the exploding node is :(");
        }
    }

    shouldSplit() {
        if (this.left instanceof Value) {
            if (this.left.value >= 10) {
                return true;
            }
        }

        if (this.right instanceof Value) {
            if (this.right.value >= 10) {
                return true;
            }
        }

        return false;
    }

    split() {
        if (!this.shouldSplit()) {
            console.log('No split needed');
            return;
        }

        if (this.left instanceof Value) {
            if (this.left.value >= 10) {
                const newLeftValue = new Value(Math.floor(this.left.value / 2));
                const newRightValue = new Value(Math.ceil(this.left.value / 2));

                let newPair = new Pair(this.depth + 1, newLeftValue, newRightValue, this);
                this.left = newPair;

                // Only do 1 split per round in case we need to explode next round
                return;
            }
        }

        if (this.right instanceof Value) {
            if (this.right.value >= 10) {
                const newLeftValue = new Value(Math.floor(this.right.value / 2));
                const newRightValue = new Value(Math.ceil(this.right.value / 2));

                let newPair = new Pair(this.depth + 1, newLeftValue, newRightValue, this);
                this.right = newPair;

                // Only do 1 split per round in case we need to explode next round
                return;
            }
        }
    }
};

const parsePairs = input => {
    let rootPair = null;
    let pairsStack = [];

    let innerValue = '';

    for (let i = 0; i < input.length; i++) {
        //console.log(input.substring(0, i + 1));
        if (input[i] === '[') {
            // new pair

            if (rootPair === null) {
                rootPair = new Pair(0, null, null, null);
                pairsStack.push(rootPair);
            } else {
                let parentPair = pairsStack.pop();
                let depth = parentPair.depth + 1;

                let newPair = new Pair(depth, null, null, parentPair);
                if (parentPair.left === null) {
                    parentPair.left = newPair;
                } else {
                    parentPair.right = newPair;
                }

                pairsStack.push(parentPair);
                pairsStack.push(newPair);
            }

            innerValue = '';
        } else if (input[i] === ',') {
            // Check if there's a number in innerValue
            if (innerValue.length > 0) {
                let value = new Value(+innerValue);
                let pair = pairsStack.pop();

                if (pair.left === null) {
                    pair.left = value;
                } else {
                    console.error('Found a "," with stuff in innerValue but pair.left was already set. This should not happen.');
                    console.error({innerValue});
                    console.error(pair.toString());
                    console.error(pair.parent.toString());
                }

                pairsStack.push(pair);
                innerValue = '';
            }
        } else if (input[i] === ']') {
            // Pair end
            let pair = pairsStack.pop();

            // Check if there's a number in innerValue
            if (innerValue.length > 0) {
                const value = new Value(+innerValue);
                if (pair.right === null) {
                    pair.right = value;
                } else {
                    console.error('Found a "]" with stuff in innerValue but pair.right was already set. This should not happen.');
                    console.error({innerValue});
                    console.error(pair.toString());
                    console.error(pair.parent.toString());
                }
            }

            // Check if the pair seems alright
            if (pair.left === null || pair.right === null) {
                console.error('Pair ended but either left or right are not set. This should not happen.');
                console.error(pair.toString());
                console.error({pair});
            }

            // If current pair is the root, we are done
            if (pair.depth === 0) {
                break;
            }

            innerValue = '';
        } else {
            innerValue += input[i];
        }
    }

    return rootPair;
};

const combinePairs = (pair, otherPair) => {
    if (!(pair instanceof Pair)) {
        console.error("Trying to combine not a pair with a pair");
    }

    if (!(otherPair instanceof Pair)) {
        console.error("Trying to combine pair with not a pair");
    }

    pair.increaseDepth();
    otherPair.increaseDepth();

    let newPair = new Pair(0, pair, otherPair, null);
    pair.parent = newPair;
    otherPair.parent = newPair;

    return newPair;
};

const printAllPairs = rootPair => {
    console.log(rootPair.toString());
};

const parseAllPairs = allReadings => {
    return allReadings
        .filter(line => line.length > 0)
        .map(parsePairs);
}

const explodeIfNeeded = pair => {
    if (!(pair instanceof Pair)) {
        return false;
    }

    if (pair.shouldExplode()) {
        //console.group('EXPLODING');
        //console.log(`Exploding pair ${pair.toString()}`);
        pair.explode();
        //console.log('EXPLODING -- end');
        //console.groupEnd();
        return true;
    }

    let exploded = explodeIfNeeded(pair.left);

    if (!exploded) {
        exploded = explodeIfNeeded(pair.right);
    }

    return exploded;
};

const splitIfNeeded = pair => {
    if (!(pair instanceof Pair)) {
        return false;
    }

    if (pair.shouldSplit()) {
        //console.group('SPLITTING');
        //console.log(`SPLITTING pair ${pair.toString()}`);
        pair.split();
        //console.log('SPLITTING -- end');
        //console.groupEnd();
        return true;
    }

    let split = splitIfNeeded(pair.left);

    if (!split) {
        split = splitIfNeeded(pair.right);
    }

    return split;
};

const reduceTree = rootPair => {
    //console.group('REDUCING TREE');
    let done = false;
    while (!done) {
        //printAllPairs(rootPair);

        let tempPair = rootPair;
        let exploded = explodeIfNeeded(tempPair);

        let split = false;
        if (!exploded) {
            split = splitIfNeeded(tempPair);
        }

        // If no explosions or splits needed, then done
        done = !split && !exploded;
    }

    //console.log('REDUCING TREE -- finished');
    //console.groupEnd();

    return rootPair;
};

const highestMagnitude = pairNode => {

    if (pairNode.left instanceof Value && pairNode.right instanceof Value) {
        return pairNode.magnitude();
    }

    if (pairNode.left instanceof Value) {
        const currentMagnitude = pairNode.magnitude();
        const childHighestMagnitude = highestMagnitude(pairNode.right);

        return childHighestMagnitude > currentMagnitude ? childHighestMagnitude : currentMagnitude;
    }

    if (pairNode.right instanceof Value) {
        const currentMagnitude = pairNode.magnitude();
        const childHighestMagnitude = highestMagnitude(pairNode.left);

        return childHighestMagnitude > currentMagnitude ? childHighestMagnitude : currentMagnitude;
    }

    const currentMagnitude = pairNode.magnitude();
    const leftMagnitude = highestMagnitude(pairNode.left);
    const currentOrLeft = currentMagnitude > leftMagnitude ? currentMagnitude : leftMagnitude;

    const rightMagnitude = highestMagnitude(pairNode.right);
    const maxMagnitude = currentOrLeft > rightMagnitude ? currentOrLeft : rightMagnitude;


    return maxMagnitude;
};

const firstPart = (allReadings) => {

    const rootPairs = parseAllPairs(allReadings);
    //rootPairs.forEach(printAllPairs);

    let combinedPair = rootPairs[0];

    for (let i = 1; i < rootPairs.length; i++) {
        combinedPair = combinePairs(combinedPair, rootPairs[i]);

        // Check if we need to reduce the new tree
        combinedPair = reduceTree(combinedPair);
    }

    console.group('first part');
    printAllPairs(combinedPair);
    const magnitude = combinedPair.magnitude();
    console.log({magnitude});
    console.groupEnd();
};

const secondPart = (allReadings) => {

    let maxMagnitude = 0;
    
    for (let i = 0; i < allReadings.length; i++) {
        for (let j = i + 1; j < allReadings.length; j++) {
            console.group(`COMBINING ${i} AND ${j}`);

            let iTree = parsePairs(allReadings[i]);
            let jTree = parsePairs(allReadings[j]);

            const iPlusJPairRoot = combinePairs(iTree, jTree);
            const iJReduced = reduceTree(iPlusJPairRoot);

            console.log(`${i} + ${j}: ${iJReduced.toString()}`);

            iTree = parsePairs(allReadings[i]);
            jTree = parsePairs(allReadings[j]);

            const jPlusIPairRoot = combinePairs(jTree, iTree);
            const jIReduced = reduceTree(jPlusIPairRoot);

            console.log(`${j} + ${i}: ${jIReduced.toString()}`);

            const firstMag = highestMagnitude(iPlusJPairRoot);
            const secondMag = highestMagnitude(jPlusIPairRoot);

            const maxMag = firstMag > secondMag ? firstMag : secondMag;
            if (maxMag > maxMagnitude) {
                maxMagnitude = maxMag;
            }
            console.groupEnd();
        }
    }

    console.group('second part');
    console.log({maxMagnitude});
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