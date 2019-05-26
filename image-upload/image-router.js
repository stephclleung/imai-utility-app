const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const request = require('request');
const { decodeCardName, returnThisDamnImage } = require('./image-generator');
const ImageURL = require('./image-model');
const jwt = require('jsonwebtoken');


router.use(bodyParser.json());
require('dotenv').config();
router.get('/test', async (req, res) => {
    console.log('In test.....')
    try {
        const imgs = await ImageURL.find({});
        res.send(imgs);
    } catch (error) {
        console.log(error);
    }

})

/**
 *  Posts an image to the external API
 *  Careful on the limits...
 */
router.post('/image', async (appReq, res) => {

    /**
     * appReq.body = {
     *  cardName: String
     *  cards : [ array of cards ]
     * }
     */
    console.log(appReq.body);

    const token = appReq.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.IMAI_UTIL_CAKE_SLICE);

    //Check the extra secret...
    if (decoded._id !== process.env.IMAI_UTIL_CAKE_PLATE) {
        return res.status(400).send();
    }

    console.log("Confirmed jwt token.....")

    //Check if the image already exists in database.
    try {
        //const iURL = await ImageURL.findImageURLByName(appReq.body.name);
        console.log('!!!!! >>> CARD NAME ', appReq.body.cardName)
        const iURL = await ImageURL.findImageURLByName(appReq.body.cardName)
        console.log('!!!! >>>> IURL ', iURL);
        if (iURL) {
            console.log("IU Router : Already exists in database.")
            return res.status(200).send({ message: "database", url: iURL });
        }
        console.log("NO URL-------------------------");
        //let cards = decodeCardName(appReq.body.name);

        //if (cards.length > 5 || cards.length < 2) {
        if (appReq.body.cards.length > 5 || appReq.body.cards.length < 2) {
            return res.status(400).send({ message: "Invalid file name" });
        }

        let data = await returnThisDamnImage(appReq.body.cards);

        //console.log('data.bitmap.data' + data.bitmap.data + 'which is type ' + typeof data.bitmap.data)

        let options = {
            url: 'https://api.imgur.com/3/upload',
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

        console.log("IU Router : making a request...")
        request.post(options, async (error, response) => {
            if (error) console.log('Err', error);
            console.log(response.body);
            //console.log(response.caseless.dict['x-post-rate-limit-remaining']);

            //After making it, get the url back and store it.
            if (!response.body.data.link) {
                return res.status(400).send({ message: "Could not complete request with external api." })
            }
            const img = new ImageURL({ imageName: appReq.body.cardName, imageUrl: response.body.data.link })
            await img.save();

            let warning;
            if (response.caseless.dict['x-post-rate-limit-remaining'] < 100) {
                warning = `!! warning : post limit dropping below 100! Currently at : ${response.caseless.dict['x-post-rate-limit-remaining']}`;
                return res.status(201).send({ message: "new", url: img.imageUrl, warning });
            }

            res.status(201).send({ message: "new", url: img.imageUrl });
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({ warning: "ERROR OCCURED, image was neither created nor retrieved!" });
    }
});

router.get('/:imageName', async (req, res) => {
    console.log(req.query.name)
    //console.log(req.params.name)
    const iURL = await ImageURL.findImageURLByName(req.params.imageName);
    if (iURL) {
        res.status(200).send({ message: "Card in database!", url: iURL });
    }
    else {
        console.log(iURL);
    }
});



module.exports = router;