const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const request = require('request');
const {
    decodeCardName,
    drawTwoCards,
    drawNCards
} = require('./image-generator');
const ImageURL = require('./image-model');
const jwt = require('jsonwebtoken');


router.use(bodyParser.json());

require('dotenv').config();


router.get('/test', async (req, res) => {
    const imgs = await ImageURL.find({});
    res.send(imgs);
})


router.post('/image', async (appReq, res) => {

    const token = appReq.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.IMAI_UTIL_CAKE_SLICE);

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
        let data;
        if (cards.length === 2) {
            console.log("IU Router : 2 cards");
            data = await drawTwoCards(cards);
        } else {
            console.log(`IU Router : ${cards.length} cards`);
            data = await drawNCards(cards);
        }


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
            console.log(response.caseless.dict['x-post-rate-limit-remaining']);

            //After making it, get the url back and store it.
            const img = new ImageURL({ imageName: appReq.body.name, imageUrl: response.body.data.link })
            await img.save();

            let warning;
            if (response.caseless.dict['x-post-rate-limit-remaining'] < 100) {
                warning = "warning : post limit dropping below 100!";
                return res.status(201).send({ message: "new", url: img.imageUrl, warning });
            }

            res.status(201).send({ message: "new", url: img.imageUrl });
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({ warning: "ERROR OCCURED, image was neither created nor retrieved!" });
    }
});

//debug only
router.delete('/:imageID', async (req, res) => {
    try {
        const del = await ImageURL.findByIdAndDelete(req.params.imageID);
        res.status(204).send();
    } catch (error) {
        console.log(error);
    }

})

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