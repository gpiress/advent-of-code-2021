const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const findGammaAndEpsilonRates = allReadings => {
    // find most common bit in each position

    const totalNumberOfBits = allReadings[0].length;

    let howManyOnesPerPosition = [];
    for (let i = 0; i < totalNumberOfBits; i++) {
        howManyOnesPerPosition.push(0);
    }

    allReadings.forEach(binaryString => {
        for (let i = 0; i < binaryString.length; i++) {
            const bit = +binaryString[i];
            if (bit === 1) {
                howManyOnesPerPosition[i]++;
            }
        }
    });

    let gammaRate = 0;
    let epsilonRate = 0;

    const mostCommonLimit = Math.floor(allReadings.length / 2);
    for (let i = 0; i < totalNumberOfBits; i++) {
        const power = totalNumberOfBits - i - 1;

        // if 1 was the most common, change gamma
        if (howManyOnesPerPosition[i] > mostCommonLimit) {
            gammaRate += 2 ** power;
        } else {
            epsilonRate += 2**power;
        }
    }

    return {
        gamma: gammaRate,
        epsilon: epsilonRate
    };
};

const findOxygenAndCo2Ratings = allReadings => {
    const totalNumberOfBits = allReadings[0].length;

    const howManyOnesInPos = (array, position) => {
        return array
            .map(binaryString => +binaryString[position])
            .filter(bit => (bit === 1))
            .length;
    };

    let oxygenCandidates = [...allReadings];
    for (let i = 0; i < totalNumberOfBits; i++) {
        const amountOfOnes = howManyOnesInPos(oxygenCandidates, i);
        const isOneMostCommon = amountOfOnes >= (oxygenCandidates.length - amountOfOnes);

        if (isOneMostCommon) {
            // Only keep OXYGEN candidates that entry[i] === 1
            oxygenCandidates = oxygenCandidates.filter(reading => (+reading[i] === 1));
        } else {
            // Only keep OXYGEN candidates that entry[i] === 0
            oxygenCandidates = oxygenCandidates.filter(reading => (+reading[i] === 0));
        }

        if (oxygenCandidates.length === 1) {
            break;
        }
    }

    let co2Candidates = [...allReadings];
    for (let i = 0; i < totalNumberOfBits; i++) {
        const amountOfOnes = howManyOnesInPos(co2Candidates, i);
        const isOneMostCommon = amountOfOnes >= (co2Candidates.length - amountOfOnes);

        if (isOneMostCommon) {
            // Only keep CO2 candidates that entry[i] === 0
            co2Candidates = co2Candidates.filter(reading => (+reading[i] === 0));
        } else {
            // Only keep CO2 candidates that entry[i] === 1
            co2Candidates = co2Candidates.filter(reading => (+reading[i] === 1));
        }

        if (co2Candidates.length === 1) {
            break;
        }
    }

    let oxygenRating = 0;
    let co2Rating = 0;

    const oxygenRatingBinary = oxygenCandidates[0];
    console.log({ oxygenRatingBinary });
    const co2RatingBinary = co2Candidates[0];
    console.log({ co2RatingBinary });
    for (let i = 0; i < totalNumberOfBits; i++) {
        const currentPower = 2 ** (totalNumberOfBits - 1 - i);

        if (+oxygenRatingBinary[i] === 1) {
            oxygenRating += currentPower;
        }

        if (+co2RatingBinary[i] === 1) {
            co2Rating += currentPower;
        }
    }

    return {
        oxygen: oxygenRating,
        co2: co2Rating,
    };
};

const firstPart = (allReadings) => {
    const { gamma, epsilon } = findGammaAndEpsilonRates(allReadings);
    console.log({ gamma });
    console.log({ epsilon });

    console.log(gamma * epsilon);
};

const secondPart = (allReadings) => {
    const { oxygen, co2 } = findOxygenAndCo2Ratings(allReadings);
    console.log({ oxygen });
    console.log({ co2 });

    console.log(oxygen * co2);
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