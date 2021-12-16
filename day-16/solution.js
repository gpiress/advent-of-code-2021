const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');

const hexToBinary = new Map();
const binaryToHex = new Map();

const initConversionMaps = () => {
    hexToBinary.set('0', '0000');
    binaryToHex.set('0000', '0');

    hexToBinary.set('1', '0001');
    binaryToHex.set('0001', '1');

    hexToBinary.set('2', '0010');
    binaryToHex.set('0010', '2');

    hexToBinary.set('3', '0011');
    binaryToHex.set('0011', '3');

    hexToBinary.set('4', '0100');
    binaryToHex.set('0100', '4');

    hexToBinary.set('5', '0101');
    binaryToHex.set('0101', '5');

    hexToBinary.set('6', '0110');
    binaryToHex.set('0110', '6');

    hexToBinary.set('7', '0111');
    binaryToHex.set('0111', '7');

    hexToBinary.set('8', '1000');
    binaryToHex.set('1000', '8');

    hexToBinary.set('9', '1001');
    binaryToHex.set('1001', '9');

    hexToBinary.set('A', '1010');
    binaryToHex.set('1010', 'A');

    hexToBinary.set('B', '1011');
    binaryToHex.set('1011', 'B');

    hexToBinary.set('C', '1100');
    binaryToHex.set('1100', 'C');

    hexToBinary.set('D', '1101');
    binaryToHex.set('1101', 'D');

    hexToBinary.set('E', '1110');
    binaryToHex.set('1110', 'E');

    hexToBinary.set('F', '1111');
    binaryToHex.set('1111', 'F');
};

const convertPacketToBinary = packet => {
    //console.log({packet});
    return packet.split('').reduce((prev, curr) => {
        return prev + hexToBinary.get(curr);
    }, '');
};

const binaryToDecimal = binary => {
    if (binary.length === 0) {
        //console.error('Trying to converty empty string. This should not happen');
    }

    let value = 0;

    let exponent = 0;
    for (let i = binary.length - 1; i >= 0; i--) {
        if (binary[i] === '1') {
            value += (2**exponent);
        }
        exponent++;
    }

    return value;
};

const reduceInnerBlockValues = (blockTypeDecimal, innerBlockValues) => {
    if (blockTypeDecimal === 0) {
        console.log('SUM type block');
        return innerBlockValues.reduce((prev, curr) => prev + curr, 0);
    }

    if (blockTypeDecimal === 1) {
        console.log('PRODUCT type block');
        return innerBlockValues.reduce((prev, curr) => prev * curr, 1);
    }

    if (blockTypeDecimal === 2) {
        console.log('MIN type block');
        return innerBlockValues.reduce((prev, curr) => prev > curr ? curr : prev);
    }

    if (blockTypeDecimal === 3) {
        console.log('MAX type block');
        return innerBlockValues.reduce((prev, curr) => prev > curr ? prev : curr, 0);
    }

    if (blockTypeDecimal === 5) {
        console.log('GREATER THAN type block');
        return innerBlockValues[0] > innerBlockValues[1] ? 1 : 0;
    }

    if (blockTypeDecimal === 6) {
        console.log('LESSER THAN type block');
        return innerBlockValues[1] > innerBlockValues[0] ? 1 : 0;
    }

    if (blockTypeDecimal === 7) {
        console.log('EQUALS type block');
        return innerBlockValues[1] == innerBlockValues[0] ? 1 : 0;
    }
};

const parseBlock = binaryString => {
    let blocksVersionsSum = 0;

    let offset = 0;
    const versionBits = binaryString.substring(offset, offset + 3);
    const versionDecimal = binaryToDecimal(versionBits);
    blocksVersionsSum += versionDecimal;
    offset += 3;
    const typeBits = binaryString.substring(offset, offset + 3);
    const typeDecimal = binaryToDecimal(typeBits);
    offset += 3;

    console.group('NEW BLOCK');
    console.log({binaryString});
    console.log({ versionDecimal });
    console.log({ typeDecimal });

    if (typeBits === '100') {
        // Literal block

        console.group('LITERAL BLOCK');

        let blockLength = 6;
        let binaryValue = "";
        //console.log({offset});

        //console.group('PARSING DATA PAYLOAD');
        let isLiteralDone = false;
        while (!isLiteralDone) {
            isLiteralDone = binaryString[offset] === '0';
            const newDataBlock = binaryString.substring(offset, offset + 5);
            console.log({newDataBlock});
            binaryValue += binaryString.substring(offset + 1, offset + 5);
            offset += 5;
            blockLength += 5;
        }

        //console.groupEnd();
        //console.group('PARSING DATA PAYLOAD -- finished');

        console.log({offset});

        const binaryStringLeftToParse = binaryString.substring(offset);

        console.log({binaryValue});

        console.groupEnd();
        console.log('LITERAL BLOCK -- finished');
        console.groupEnd();
        console.log('NEW BLOCK -- finished');

        return {
            versionSum: blocksVersionsSum,
            blockValue: binaryToDecimal(binaryValue),
            leftToParse: binaryStringLeftToParse,
            blockLength: blockLength,
        };
        
    }
    
    if (binaryString[offset] === '0') {
        // Length based operator block
        console.group('LENGTH BASED OPERATOR BLOCK');
        
        offset++;
        const innerBlockLengthBits = binaryString.substring(offset, offset + 15);
        const innerBlockLength = binaryToDecimal(innerBlockLengthBits);
        offset += 15;
        const innerBlock = binaryString.substring(offset, offset + innerBlockLength);
        offset += innerBlockLength;

        console.log({innerBlockLength});

        let parsedInnerBlocksLength = 0;
        let innerBlockValues = [];
        let binaryStringLeftToParse = innerBlock;
        while (parsedInnerBlocksLength < innerBlockLength) {
            const { versionSum, blockValue, leftToParse, blockLength } = parseBlock(binaryStringLeftToParse);

            blocksVersionsSum += versionSum;
            innerBlockValues.push(blockValue);

            binaryStringLeftToParse = leftToParse;
            parsedInnerBlocksLength += blockLength;
        }

        binaryStringLeftToParse = binaryString.substring(offset);
        const blockValue = reduceInnerBlockValues(typeDecimal, innerBlockValues);

        console.groupEnd();
        console.log('LENGTH BASED OPERATOR BLOCK -- finished');
        console.groupEnd();
        console.log('NEW BLOCK -- finished');

        return {
            versionSum: blocksVersionsSum,
            blockValue: blockValue,
            leftToParse: binaryStringLeftToParse,
            blockLength: 3 + 3 + 1 + 15 + parsedInnerBlocksLength,
        };
    }

    // Count based operator block
    console.group('COUNT BASED OPERATOR BLOCK');

    offset++;
    const countBlockBits = binaryString.substring(offset, offset + 11);
    const innerBlocksCount = binaryToDecimal(countBlockBits);
    offset += 11;

    console.log({innerBlocksCount});

    let parsedBlocks = 0;
    let parsedInnerBlocksLength = 0;
    let innerBlockValues = [];
    let binaryStringLeftToParse = binaryString.substring(offset);
    while (parsedBlocks < innerBlocksCount) {
        const { versionSum, blockValue, leftToParse, blockLength } = parseBlock(binaryStringLeftToParse);

        blocksVersionsSum += versionSum;
        innerBlockValues.push(blockValue);

        binaryStringLeftToParse = leftToParse;
        parsedInnerBlocksLength += blockLength;

        parsedBlocks++;
    }

    const blockValue = reduceInnerBlockValues(typeDecimal, innerBlockValues);

    console.groupEnd();
    console.log('COUNT BASED OPERATOR BLOCK -- finished');
    console.groupEnd();
    console.log('NEW BLOCK -- finished');

    return {
        versionSum: blocksVersionsSum,
        blockValue: blockValue,
        leftToParse: binaryStringLeftToParse,
        blockLength: 3 + 3 + 1 + 11 + parsedInnerBlocksLength,
    };

};

const firstPart = (allReadings) => {
    initConversionMaps();

    const packetInBinary = convertPacketToBinary(allReadings[0]);
    console.log({packetInBinary});

    const { versionSum } = parseBlock(packetInBinary);

    console.group('first part');
    console.log({versionSum});
    console.groupEnd();
};

const secondPart = (allReadings) => {
    initConversionMaps();

    const packetInBinary = convertPacketToBinary(allReadings[0]);
    console.log({packetInBinary});

    const { blockValue } = parseBlock(packetInBinary);

    console.group('second part');
    console.log({blockValue});
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