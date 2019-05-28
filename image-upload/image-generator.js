"use strict"

const sharp = require('sharp');
const combineImage = require('combine-image');


/** 
*Decodes the name of a card from a regex string
*   @param {String} cardName Name of the file passed to function.
*   @returns {Array} An array of decoded cards.
 */
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
            // //console.log(`Found match, group ${groupIndex}: ${match}`);
            cardArray.push({ rank: match[0], type: match[2] })
        });
    }
    //console.log("IU generator : decoded card name")
    return cardArray;
}


/** 
* Decodes the name of a card from a regex string
* @param {number} rank number or string
* @param {number} type number or string
* @param {boolean} half indication of half card, default sets to false.
* @returns {Buffer}
 */
const cutCard = async (rank, type, half = false) => {
    const rankImage = `${__dirname}/card_4.png`;
    let cardWidth = 71;
    let cardHeight = 96;

    let cardWidth2 = cardWidth;

    if (half) {
        cardWidth2 = 24;
    }
    //console.log('IU cutCard : rank ' + rank + ' and type ' + type)
    let positionX = parseInt(rank);
    let positionY = parseInt(type);
    try {
        return sharp(rankImage)
            .extract({ left: (positionX * cardWidth), top: (positionY * cardHeight), width: cardWidth2, height: cardHeight })
            .toBuffer({ resolveWithObject: true })
        // .toFile("half.png");

    } catch (error) {
        //console.log(error);
    }
}


/** 
* Cuts out a number of cards base on the provided array.
* @param {Array} cards An array of deciphered cards with {rank,type}
* @returns {Buffer []} 
 */
const cutNCards = async (cards) => {
    let half;
    if (cards.length === 2) {
        //Two cards, need a half card.
        half = true;
    }

    let cardArray = [];
    for (const item of cards) {
        try {
            let card;
            if (half) {
                //console.log('Half card recorded')
                card = await cutCard(item.rank, item.type, true);
                half = false;   //only ever need 1 half card.
            } else {
                card = await cutCard(item.rank, item.type);
            }

            cardArray.push(card.data);
        } catch (err) {
            //console.log('IU-generator | error ', err);
        }
    }
    //console.log("IU generator | cards completed")
    //console.log("IU generator , data check  @ cutNcardds| size : ", cardArray.length);
    return cardArray;
}

/** 
* Combine N sheets of cards from an array of buffer
* @param {Buffer []} cards An array of deciphered cards with {rank,type}
* @param {function} cb callback function. Not my proudest choice...
* @returns {Buffer} A single buffer ready to be uploaded
 */
const combineNCards = async (cards, cb) => {
    let img = await combineImage(cards);
    //return img.getBuffer("image/png", cb);
    img.getBuffer("image/png", (err, res) => {
        // //console.log('The res', res)
        // //console.log('Finished returning buffer.');
        //console.log('The res---> ', res);
        return cb(res);
    });
    // img.write("output2.png", (err, res) => {
    //     return cb(res);
    // })
}


/** 
* Cuts and combines 3 - 5 cards
* @param {Buffer []} cards An array of deciphered cards with {rank,type}
* @param {function} cb callback function. Not my proudest choice...
* @returns {Buffer} A single buffer ready to be uploaded
 */
const drawNCards = async (cards, cb) => {
    const cardBufferArray = await cutNCards(cards);
    ////console.log("IU generator | cards drawn")
    //console.log("IU generator , data check @ drawNCards | ", cardBufferArray);
    combineNCards(cardBufferArray, (res) => {
        //console.log('Out of combine N cards,', res)
        cb(res);
    })
}

/** 
* Takes in a string, returns a buffer for the external API
* @param {Buffer []} cards An array of deciphered cards with {rank,type}
* @returns {Buffer} A single buffer ready to be uploaded
 */
const returnThisDamnImage = async (cards) => {
    return new Promise((resolve, reject) => {
        return drawNCards(cards, resolve);
        ////console.log(results);
    })
}

// Unblcok for testing
// returnThisDamnImage([
//     { rank: 0, type: 0 },
//     { rank: 10, type: 1 },
// ]).then((r) => {
//     //console.log('did we finally get it')
//     //console.log(r);
// })

module.exports = {
    decodeCardName,
    returnThisDamnImage
};
