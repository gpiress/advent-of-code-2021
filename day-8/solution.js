const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const isEasyDigit = digit => {
    // 1
    if (digit.length === 2) {
        return true;
    }

    // 4
    if (digit.length === 4) {
        return true;
    }

    // 7
    if (digit.length === 3) {
        return true;
    }

    // 8
    if (digit.length === 7) {
        return true;
    }

    return false;
}

const firstPart = (allReadings) => {
    const easyDigits = allReadings
        .map(line => line.split(' | ')[1])
        .map(rightHand => rightHand.split(' '))
        .flat()
        .filter(digit => isEasyDigit(digit))
        .length;

    console.log({easyDigits});
};

const arraysDiff = (array, otherArray) => {
    return array.filter(element => {
        return otherArray.indexOf(element) === -1;
    }).concat(otherArray.filter(element => (array.indexOf(element) === -1)));
};

const arraysIntersection = (array, otherArray) => {
    return array.filter(element => (otherArray.indexOf(element) >= 0));
};

const secondPart = (allReadings) => {
    let digits = [];
    for (line of allReadings) {
        const leftHand = line.split(' | ')[0];
        const rightHand = line.split(' | ')[1];

        const allDigits = `${leftHand} ${rightHand}`.split(' ');
        const easyDigits = allDigits.filter(isEasyDigit);

        const digitsMap = new Map();

        easyDigits.forEach(digit => {
            if (digit.length === 2) {
                digitsMap.set(1, digit.split(''));
            } else if (digit.length === 4) {
                digitsMap.set(4, digit.split(''));
            } else if (digit.length === 3) {
                digitsMap.set(7, digit.split(''));
            } else if (digit.length === 7) {
                digitsMap.set(8, digit.split(''));
            }
        });

        for (let hardDigit of allDigits) {
            const hardSegments = hardDigit.split('');
            const oneSegments = digitsMap.get(1);
            const fourSegments = digitsMap.get(4);

            // Digits with 5 segments = [2, 3, 5]
            if (hardDigit.length === 5) {
                // 3 is the only with the '1' segments both active
                const intersection = arraysIntersection(hardSegments, oneSegments);
                if (intersection.length === 2) {
                    //console.log('Found 3');
                    //console.log(hardDigit);
                    digitsMap.set(3, hardDigit.split(''));
                    continue;
                }

                // If not 3, we can intersect with 4. 
                // If the intersection length is 2, the digit is 2
                // If the intersection length is 3, the digit is 5
                
                const intersectionWithFour = arraysIntersection(hardSegments, fourSegments);
                if (intersectionWithFour.length === 2) {
                    //console.log('Found 2');
                    //console.log(hardDigit);
                    digitsMap.set(2, hardDigit.split(''));
                    continue;
                } else if (intersectionWithFour.length === 3) {
                    //console.log('Found 5');
                    //console.log(hardDigit);
                    digitsMap.set(5, hardDigit.split(''));
                    continue;
                } else {
                    console.error("Something unexpected happened on a digit with 5 segments");
                }
            }

            // Digits with 6 segments = [0, 6, 9]
            if (hardDigit.length === 6) {
                // If the intersection with 1 has length 1, it's a 6
                const intersectionWithOne = arraysIntersection(hardSegments, oneSegments);

                if (intersectionWithOne.length === 1) {
                    //console.log('Found 6');
                    //console.log(hardDigit);
                    digitsMap.set(6, hardDigit.split(''));
                    continue;
                }

                // Else if intersection with 4 has length 4, it's a 9
                const intersectionWithFour = arraysIntersection(hardSegments, fourSegments);
                if (intersectionWithFour.length === 4) {
                    //console.log('Found 9');
                    //console.log(hardDigit);
                    digitsMap.set(9, hardDigit.split(''));
                    continue;
                } else if (intersectionWithFour.length === 3) {
                    //console.log('Found 0');
                    //console.log(hardDigit);
                    digitsMap.set(0, hardDigit.split(''));
                    continue;
                } else {
                    console.error("Something unexpected happened on a digit with 5 segments");
                }
            }
        }

        // Sum the right hand side
        const rightHandDigit = rightHand
            .split(' ')
            .map(digit => digit.split(''))
            .map(digitArray => {
                for (let [key, value] of digitsMap) {
                    const arrayDifference = arraysDiff(digitArray, value);
                    if (arrayDifference.length === 0) {
                        return key;
                    }
                }
            })
            .reduce((prev, curr) => prev + curr, '');


        //console.log({rightHandDigit});

        digits.push(+rightHandDigit)
    }

    const sum = digits.reduce((prev, curr) => prev + curr, 0);
    console.log({sum});
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