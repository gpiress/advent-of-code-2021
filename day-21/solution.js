const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const parseInput = allReadings => {
    const initialPositions = allReadings
        .map(line => line.split(':')[1])
        .map(line => line.trim())
        .map(line => +line);

    return initialPositions;
};

const rollDice = previousMaxResult => {
    let rolls = [];
    
    for (let i = 0; i < 3; i++) {
        let roll = previousMaxResult + i + 1;
        if (roll > 100) {
            roll -= 100;
        }
        rolls.push(roll);
    }

    return rolls;
};

const play = initialPositions => {
    let playerScores = initialPositions.map(ignored => 0);
    let playerPositions = [...initialPositions];
    
    let previousMaxRoll = 0;
    let diceRolls = 0;

    let someoneWon = false;
    
    while (!someoneWon) {
        for (let i = 0; i < playerPositions.length; i++) {
            const rollValues = rollDice(previousMaxRoll);
            diceRolls += 3;
            previousMaxRoll = rollValues[2];

            const totalRoll = rollValues.reduce((a, b) => a + b, 0) % 10;
            
            playerPositions[i] += totalRoll;
            while (playerPositions[i] > 10) {
                playerPositions[i] -= 10;
            }
            playerScores[i] += playerPositions[i];

            //console.log(`Player ${i} moved to position ${playerPositions[i]} and with a roll of ${totalRoll}. New score: ${playerScores[i]}`);

            if (playerScores[i] >= 1000) {
                someoneWon = true;
                break;
            }
        }
    }

    // Need to return diceRolls * lowestScore
    const minScore = playerScores.reduce((a, b) => a < b ? a : b);
    console.log({minScore});
    console.log({diceRolls});
    return minScore * diceRolls;
};

const playDirac = initialPositions => {
    const initialPositionHash = initialPositions[0] * 100 + initialPositions[1];
    let positionsMap = new Map();
    positionsMap.set(initialPositionHash, [{ scoreOne: 0, scoreTwo: 0, count: 1 }]);

    let playerOneWins = 0;
    let playerTwoWins = 0;

    let dicePossibilities = new Map();
    dicePossibilities.set(3, 1);
    dicePossibilities.set(4, 3);
    dicePossibilities.set(5, 6);
    dicePossibilities.set(6, 7);
    dicePossibilities.set(7, 6);
    dicePossibilities.set(8, 3);
    dicePossibilities.set(9, 1);

    let rounds = 0;
    while (rounds <= 100) {
        let newPositionsMap = new Map();

        for (let [positionHash, scores] of positionsMap) {
            let positionOne = Math.floor(positionHash / 100);
            let positionTwo = Math.floor(positionHash % 100);

            for (let [posChange, universes] of dicePossibilities) {
                let newPositionOne = positionOne + posChange;
                newPositionOne = newPositionOne > 10 ? newPositionOne - 10 : newPositionOne;

                for (let [posTwoChange, posTwoUniverses] of dicePossibilities) {
                    let newPositionTwo = positionTwo + posTwoChange;
                    newPositionTwo = newPositionTwo > 10 ? newPositionTwo - 10 : newPositionTwo;

                    const universeMultiplier = universes * posTwoUniverses;
                    for (let score of scores) {
                        let { scoreOne, scoreTwo, count } = score;

                        const newScoreOne = scoreOne + newPositionOne;
                        const newScoreTwo = scoreTwo + newPositionTwo;
                        const newCount = count * universeMultiplier;

                        if (newScoreOne >= 21) {
                            // Player one wins, nothing else to do
                            // If player one wins, player 2 doesn't play, so less universes!
                            playerOneWins += (count * universes);
                            continue;
                        } else if (newScoreTwo >= 21) {
                            // Player two wins, nothing else to do
                            playerTwoWins += newCount;
                            continue;
                        }

                        const newScore = {
                            scoreOne: newScoreOne,
                            scoreTwo: newScoreTwo,
                            count: newCount,
                        };

                        const newPositionHash = newPositionOne * 100 + newPositionTwo;
                        let newScores = newPositionsMap.get(newPositionHash) || [];

                        let maybeSimilarScore = newScores.find(otherScore => otherScore.scoreOne === newScore.scoreOne && otherScore.scoreTwo === newScore.scoreTwo);
                        if (maybeSimilarScore !== undefined) {
                            maybeSimilarScore.count += newScore.count;
                        } else {
                            newScores.push(newScore);
                        }
                        newPositionsMap.set(newPositionHash, newScores);
                    }
                }
            }
        }

        if (newPositionsMap.size === 0) {
            break;
        }

        rounds++;
        console.log(`Finished round ${rounds}. Score: P1: ${playerOneWins}, P2: ${playerTwoWins} `);

        positionsMap = newPositionsMap;
    }

    // Everytime player one wins it is counted 7 times (dicePossibilities.length) 
    // due to the inner loop. Tried fixing it but ended up making things worse.
    playerOneWins /= 7;

    return { playerOneWins, playerTwoWins };
};

const firstPart = allReadings => {

    const initialPositions = parseInput(allReadings);

    console.group('first part');
    const result = play(initialPositions);
    console.log({result});
    console.groupEnd();
};

const secondPart = allReadings => {

    const initialPositions = parseInput(allReadings);
    
    console.group('second part');
    //const { playerOneWins, playerTwoWins } = playDiracNew(initialPositions);
    const { playerOneWins, playerTwoWins } = playDirac(initialPositions);
    console.log({playerOneWins});
    console.log({playerTwoWins});
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