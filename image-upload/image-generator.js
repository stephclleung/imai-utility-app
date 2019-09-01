"use strict"

const sharp = require('sharp');
const combineImage = require('combine-image');


/** 
*Decodes the name of a card from a regex string
*   @param {String} cardName Name of the file passed to function.
*   @returns {Array} An array of decoded cards.
* Note: 0-2_0-2 = A of Spades A of Spades
 */
const decodeCardName = (cardName) => {

    if (cardName.length < 3) {
        return null;
    }
    const regex = /(?<rank>[0-9]|([1][0-3]))-(?<type>[0-4])/mg;
    // [0-9]|([1][0-3])-[0-4] [\d]-[0-4]
    let m;
    let cardArray = [];
    while ((m = regex.exec(cardName)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        const { groups: { rank, type } } = m
        if (type > 3 || type < 0 || rank < 0 || type > 12) {
            return null; //error occured
        }
        cardArray.push({ rank, type })
    }


    //console.log("IU generator : decoded card name")
    return cardArray;
}


/** 
* Cuts a card out of a sheet of 52 cards (single) image
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

    let positionX = parseInt(rank);
    let positionY = parseInt(type);
    try {
        return sharp(rankImage)
            .extract({ left: (positionX * cardWidth), top: (positionY * cardHeight), width: cardWidth2, height: cardHeight })
            .toBuffer({ resolveWithObject: true })
        // .toFile("half.png");

    } catch (error) {
        console.log(error);
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
                card = await cutCard(item.rank, item.type, true);
                half = false;   //only ever need 1 half card.
            } else {
                card = await cutCard(item.rank, item.type);
            }

            cardArray.push(card.data);
        } catch (err) {
            console.log('IU-generator | cut cards | error ', err);
            throw new Error(err)
        }
    }
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
    img.getBuffer("image/png", (err, res) => {
        return cb(res);
    });
}


/** 
* Cuts and combines 3 - 5 cards
* @param {Buffer []} cards An array of deciphered cards with {rank,type}
* @param {function} cb callback function. Not my proudest choice...
* @returns {Buffer} A single buffer ready to be uploaded
 */
const drawNCards = async (cards, cb) => {
    try {
        const cardBufferArray = await cutNCards(cards);
        combineNCards(cardBufferArray, (res) => {
            cb(res);
        })
    } catch (error) {
        console.log('drawNCards.....', error);
        throw new Error(error);
    }

}

/** 
* Takes in a string, returns a buffer for the external API
* @param {Buffer []} cards An array of deciphered cards with {rank,type}
* @returns {Buffer} A single buffer ready to be uploaded
 */
const returnThisDamnImage = async (cards) => {
    return new Promise((resolve, reject) => {
        return drawNCards(cards, resolve, reject);
    })
}

const getUploadOptions = (data) => {
    return {
        url: 'https://api.imgur.com/3/image',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + process.env.IMGUR_ACCESS_TOKEN
        },
        body: {
            'image': data.toString('base64'),
            'type': 'base64'
        },
        json: true
    }
}

module.exports = {
    decodeCardName,
    returnThisDamnImage,
    getUploadOptions
};
