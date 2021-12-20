const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');


const parseInput = allReadings => {
    const imageEnhancer = allReadings[0];

    let inputImage = [];
    for (let i = 2; i < allReadings.length; i++) {
        inputImage.push(allReadings[i]);
    }

    return { imageEnhancer, inputImage };
};

const binaryToDecimal = binary => {
    if (binary.length === 0) {
        console.error('Trying to converty empty string. This should not happen');
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

const buildLargeImage = imageInput => {
    const inputRows = imageInput.length;
    const inputCols = imageInput[0].length;

    const deltaRow = 200;
    const deltaCol = 200;

    const largeRows = inputRows + deltaRow * 2;
    const largeCols = inputCols + deltaCol * 2;

    const initialRow = deltaRow;
    const finalRow = deltaRow + inputRows;
    const initialCol = deltaCol;
    const finalCol = deltaCol + inputCols;

    let largeImage = [];
    for (let i = 0; i < largeRows; i++) {
        let row = [];
        for (let j = 0; j < largeCols; j++) {
            row[j] = '.';

            const originalCol = j - deltaCol;
            const originalRow = i - deltaRow;

            if (originalRow >= 0 && originalRow < imageInput.length) {
                if (originalCol >= 0 && originalCol < imageInput[0].length) {
                    row[j] = imageInput[originalRow][originalCol];
                }
            }
        }
        largeImage.push(row);
    }

    return { largeImage, initialRow, initialCol, finalRow, finalCol };
};

const duplicateImage = imageInput => {
    let duplicated = [];

    for (let i = 0; i < imageInput.length; i++) {
        let row = [];
        for (let j = 0; j < imageInput[i].length; j++) {
            row[j] = imageInput[i][j];
        }
        duplicated[i] = row;
    }

    return duplicated;
};

const buildRow = (inputRow, j) => {
    if (inputRow === undefined) {
        return '---';
    }

    if (j < 2 || j > inputRow.length - 2) {
        return '---';
    }

    //console.log(`Input row: ${inputRow}, j: ${j}`);

    let row = '';

    if (j <= 0) {
        while (j <= 0) {
            row += '0';
            j++;
        }

        while (row.length < 3) {
            const digit = inputRow[j - 1] === '#' ? '1' : '0';
            row += digit;
            j++;
        }

        return row;
    }

    if (j >= inputRow.length - 1) {
        while (j >= inputRow.length - 1) {
            row += '0';
            j--;
        }

        while (row.length < 3) {
            const digit = inputRow[j + 1] === '#' ? '1' : '0';
            row = digit + row;
            j--;
        }

        return row;
    }

    const leftDigit = inputRow[j - 1] === '#' ? '1' : '0';
    const centerDigit = inputRow[j] === '#' ? '1' : '0';
    const rightDigit = inputRow[j + 1] === '#' ? '1' : '0';

    row = `${leftDigit}${centerDigit}${rightDigit}`;
    return row;
};

const buildSquare = (inputImage, i, j) => {
    let rows = [
        buildRow(inputImage[i - 1], j),
        buildRow(inputImage[i], j),
        buildRow(inputImage[i + 1], j),
    ];

    return rows;
};

const enhance = (inputImage, enhancer, previousFirstRow, previousFirstCol, previousLastRow, previousLastCol) => {
    // Every output pixel is based on a 3x3 square centered on the corresponding input pixel
    let outputImage = duplicateImage(inputImage);

    let firstRow = previousFirstRow - 2;
    let firstCol = previousFirstCol - 2;
    let lastRow = previousLastRow + 2;
    let lastCol = previousLastCol + 2;
    
    for (let i = firstRow; i <= lastRow; i++) {
        for (let j = firstCol; j <= lastCol; j++) {
            // Building output image [i, j]

            let square = buildSquare(inputImage, i, j);
            const binaryString = square.join('');

            if (binaryString.indexOf('-') > -1) {
                console.error(`This should not have happened`);
                return;
                //outputImage[i][j] = inputImage[i][j] === '#' ? '.' : '#';
                //continue;
            }

            //console.group(`Figuring out output position [${i}, ${j}]`);
            const enhancerIndex = binaryToDecimal(binaryString);
            const newCharacter = enhancer[enhancerIndex];
            outputImage[i][j] = newCharacter;

            /*
            if (newCharacter === '#') {
                console.log({binaryString});
                console.log(`Position [${i}, ${j}] is lit`);
            }
            */
            //console.log({newCharacter});
            
            //console.groupEnd();
        }
    }

    // Workaround to flip stuff when needed
    for (let i = 0; i < inputImage.length; i++) {
        if (i >= firstRow && i <= lastRow) {
            for (let j = 0; j < firstCol; j++) {
                const newCharacter = inputImage[i][j] === '.' ? enhancer[0] : enhancer[511];
                outputImage[i][j] = newCharacter;
            }

            for (let j = lastCol + 1; j < inputImage[i].length; j++) {
                const newCharacter = inputImage[i][j] === '.' ? enhancer[0] : enhancer[511];
                outputImage[i][j] = newCharacter;
            }
        } else {
            for (let j = 0; j < inputImage[i].length; j++) {
                const newCharacter = inputImage[i][j] === '.' ? enhancer[0] : enhancer[511];
                outputImage[i][j] = newCharacter;
            }
        }
    }

    return { enhancedImage: outputImage, firstCol, firstRow, lastCol, lastRow };
};

const printImage = image => {
    image.map(line => line.join(' ')).forEach((line, index) => { console.log(`${index.toString().padStart(3, '0')} --   ${line}`) });
};

const howManyLit = image => {
    return image
        .map(line => line.filter(char => char === '#'))
        .map(hashLines => hashLines.length)
        .reduce((prev, curr) => prev + curr, 0);
};

const firstPart = allReadings => {

    const { imageEnhancer, inputImage } = parseInput(allReadings);
    let { largeImage, initialRow, initialCol, finalRow, finalCol } = buildLargeImage(inputImage);
    //printImage(largeImage);

    const { enhancedImage, firstCol, firstRow, lastCol, lastRow } = enhance(largeImage, imageEnhancer, initialRow, initialCol, finalRow, finalCol);
    //printImage(enhancedImage);

    const twiceOptimized = enhance(enhancedImage, imageEnhancer, firstRow, firstCol, lastRow, lastCol).enhancedImage;
    const litPixels = howManyLit(twiceOptimized);

    console.group('first part');
    //printImage(twiceOptimized);
    console.log({litPixels});
    console.groupEnd();
};

const secondPart = allReadings => {

    const { imageEnhancer, inputImage } = parseInput(allReadings);
    let { largeImage, initialRow, initialCol, finalRow, finalCol } = buildLargeImage(inputImage);
    //printImage(largeImage);

    for (let i = 0; i < 50; i++) {
        enhancementResult = enhance(largeImage, imageEnhancer, initialRow, initialCol, finalRow, finalCol);
        largeImage = enhancementResult.enhancedImage;
        initialRow = enhancementResult.firstRow;
        finalRow = enhancementResult.lastRow;
        initialCol = enhancementResult.firstCol;
        finalCol = enhancementResult.lastCol;

        //printImage(largeImage);
    }

    const litPixels = howManyLit(largeImage);

    console.group('second part');
    //printImage(largeImage);
    console.log({litPixels});
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