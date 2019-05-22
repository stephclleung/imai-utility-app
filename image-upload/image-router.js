const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const request = require('request');
const { decodeCardName, returnThisDamnImage } = require('./image-generator');
const ImageURL = require('./image-model');
const jwt = require('jsonwebtoken');


router.use(bodyParser.json());
require('dotenv').config();


/**
 *  Posts an image to the external API
 *  Careful on the limits...
 */
router.post('/image', async (appReq, res) => {

    const token = appReq.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.IMAI_UTIL_CAKE_SLICE);

    //Check the extra secret...
    if (decoded._id !== process.env.IMAI_UTIL_CAKE_PLATE) {
        return res.status(400).send();
    }

    console.log("Confirmed jwt token.....")

    //Check if the image already exists in database.
    try {
        const iURL = await ImageURL.findImageURLByName(appReq.body.name);
        if (iURL) {
            console.log("IU Router : Already exists in database.")
            return res.status(200).send({ message: "database", url: iURL });
        }

        let cards = decodeCardName(appReq.body.name);

        if (cards.length > 5 || cards.length < 2) {
            return res.status(400).send({ message: "Invalid file name" });
        }

        let data = await returnThisDamnImage(cards);

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
            const img = new ImageURL({ imageName: appReq.body.name, imageUrl: response.body.data.link })
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



module.exports = router;