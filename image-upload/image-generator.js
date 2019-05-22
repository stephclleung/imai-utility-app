"use strict"
const images = require("images");
const sharp = require('sharp');



//Card configs here
// const deckImage = `${__dirname}/card_4.png`;
// let cardWidth = 61;
// let cardHeight = 80;
// let cardWidth = 71;
// let cardHeight = 96;



//decodes the regex card name
const decodeCardName = (cardName) => {

    const regex = /[\d]-[0-4]/mg;
    let m;
    let cardArray = [];
    while ((m = regex.exec(cardName)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            // console.log(`Found match, group ${groupIndex}: ${match}`);
            cardArray.push({ deck: match[0], suit: match[2] })
        });
    }
    console.log("IU generator : decoded card name")
    return cardArray;
}


//Cuts out a card from a sheet of 52 cards.
const cutCard = async (deck, suit) => {
    const deckImage = `${__dirname}/card_4.png`;
    let cardWidth = 71;
    let cardHeight = 96;
    console.log('IU cutCard : deck ' + deck + ' and suit ' + suit)
    let positionX = parseInt(deck);
    let positionY = parseInt(suit);
    try {
        return sharp(deckImage)
            .extract({ left: (positionX * cardWidth), top: (positionY * cardHeight), width: cardWidth, height: cardHeight })
            //.extract({ left: (positionX * spacingW), top: (positionY * spacingH), width: cardWidth, height: cardHeight })
            .toBuffer({ resolveWithObject: true })

    } catch (error) {
        console.log(error);
    }
}

//Cuts N sheets of cards from the main sprite sheet.
//returns a buffer
const cutNCards = async (cards) => {
    let cardArray = [];
    for (const item of cards) {
        try {
            let { data, info } = await cutCard(item.deck, item.suit);
            cardArray.push(data);
        } catch (err) {
            console.log('IU-generator | error ', err);
        }
    }
    console.log("IU generator | cards completed")
    console.log("IU generator , data check  @ cutNcardds| ", cardArray);
    return cardArray;
}

//Combine N sheets of cards
const combineNCards = (cards) => {
    let cardWidth = 71;
    let baseImage = images(362, 99);
    let x = 0;
    console.log("IU generator | Created base image and ready to combine ....")
    for (const item of cards) {
        console.log('IU generator : baseImage ', baseImage);
        baseImage.draw(images(item), (x + 5), 0);
        x += cardWidth;
        console.log("IU generator | combining")
    }
    console.log("IU generator | cards combined")
    //return baseImage.save("output2.png");
    console.log("IU generator , data check  @ combineNCards| ", baseImage);
    return baseImage.encode('png');
}

//Cuts and combines 3 - 5 cards
const drawNCards = async (cards) => {
    const cardBufferArray = await cutNCards(cards);
    console.log("IU generator | cards drawn")
    console.log("IU generator , data check @ drawNCards | ", cardBufferArray);
    return combineNCards(cardBufferArray);
}

//Cuts and combine a pair of cards
const drawTwoCards = async (cards) => {
    const cardBufferArray = await cutNCards(cards);
    console.log("IU generator | 2 cards drawn")
    return images(92, 99)
        .draw(images(cardBufferArray[0]), 0, 0)
        .draw(images(cardBufferArray[1]), 20, 0)
        .encode('png');
    // .save("output3.png", {
    //     quality: 80
    // });
}


// Use to test: 

drawTwoCards([
    { deck: 5, suit: 2 },
    { deck: 7, suit: 3 }
]);
drawNCards([
    { deck: 5, suit: 0 },
    { deck: 10, suit: 1 },
    { deck: 10, suit: 2 },
    { deck: 10, suit: 3 },
    { deck: 1, suit: 0 }
]).then((x) => {
    console.log(x);
})

module.exports = {
    decodeCardName,
    drawTwoCards,
    drawNCards
};
