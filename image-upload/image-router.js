const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const request = require('request');
const { decodeCardName, returnThisDamnImage, getUploadOptions } = require('./image-generator');
const ImageURL = require('./image-model');
const jwt = require('jsonwebtoken');
const sendMail = require('./contact');
router.use(bodyParser.json());
require('dotenv').config();


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
    try {
        const token = appReq.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.IMAI_UTIL_CAKE_SLICE);

        //Check the extra secret...
        if (decoded._id !== process.env.IMAI_UTIL_CAKE_PLATE) {
            console.log(decoded)
            return res.status(400).send();
        }

        console.log("Util App | Image Router | Confirmed token.....")
    } catch (error) {
        sendMail(error);
        return res.status(401).send()
    }

    //Check if the image already exists in database.
    try {
        console.log('Util App | Image Router | Recv card name -  ', appReq.body.cardName)

        const cardName = decodeCardName(appReq.body.cardName);
        const iURL = await ImageURL.findImageURLByName(appReq.body.cardName)

        if (iURL) {
            console.log('Util App | Image Router | Url is - ', iURL);
            return res.status(200).send({ message: "database", url: iURL });
        }

        if (!cardName || appReq.body.cards.length > 5 || appReq.body.cards.length < 2) {
            console.log("Util App | Image Router | Invalid image request. Terminating.")
            return res.status(400).send({ message: "Invalid file name" });
        }

        let data = await returnThisDamnImage(appReq.body.cards);
        let options = getUploadOptions(data);

        console.log("Util App | Image Router | Firing off a request to the external API...")
        request.post(options, async (error, response) => {
            if (error) console.log('Util App | Image Router | An error has occured | ', error);
            console.log(response.body);

            //After making it, get the url back and store it.
            if (!response.body.data.link) {
                return res.status(400).send({ message: "Could not complete request with external api." })
            }
            const img = new ImageURL({ imageName: appReq.body.cardName, imageUrl: response.body.data.link })
            await img.save();

            let warning;
            if (response.caseless.dict['x-post-rate-limit-remaining'] < 100) {
                console.log("Util App | Image Router | Warning | Less than 100 credits left from Imgur ...")
                warning = `!! warning : post limit dropping below 100! Currently at : ${response.caseless.dict['x-post-rate-limit-remaining']}`;
                return res.status(201).send({ message: "new", url: img.imageUrl, warning });
            }

            res.status(201).send({ message: "new", url: img.imageUrl });
        })
    } catch (error) {
        console.log('IU-Router | Error', error);
        res.status(500).send({ warning: "ERROR OCCURED, image was neither created nor retrieved!" });
    }
});

router.get(/^\/([0-9\_]+)$/, async (req, res) => {
    console.log(req.query.name)
    const iURL = await ImageURL.findImageURLByName(req.params.imageName);
    if (iURL) {
        res.status(200).send({ message: "Card in database!", url: iURL });
    }
    else {
        console.log(iURL);
        res.status(404).send({ message: 'not found' })
    }
});

router.get('/*', (req, res) => res.status(405).send())
router.patch('/*', (req, res) => res.status(405).send())
router.post('/*', (req, res) => res.status(405).send())
router.delete('/*', (req, res) => res.status(405).send())


module.exports = router;