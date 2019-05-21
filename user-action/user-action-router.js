const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const UserAction = require('./user-action-model');
router.use(bodyParser.json());

//PUTs a new user into the database. Not using POST due to clashing with PHE.
router.put('/:target/action', async (req, res) => {
    let ua;
    let msg;
    try {
        ua = await UserAction.findUserByUserID(req.params.target);
        if (!ua) {
            ua = new UserAction({
                userID: req.params.target,
                action: req.body.action
            });
            msg = "Created";
        }
        else {
            ua.action = req.body.action;
            msg = "Updated";
        }

        await ua.save();
        res.status(201).send({
            userID: ua.userID,
            action: ua.action,
            messsage: msg
        })

    } catch (error) {
        res.status(500).send({ error })
        throw new Error(error);
    }
})

//POST request. Used by PHE exclusively.
router.post('/:target/bet', async (req, res) => {
    console.log(req.body);
    try {
        ua = await UserAction.findUserByUserID(req.params.target);
        if (!ua) {
            //Wrong user.
            return res.status(500).send();
        }

        let bet = ua.action.toString();
        console.log('!! - ' + ua.userID + 'has requested to bet ' + ua.action);

        if (!req.body.debug) {
            ua.action = 0;
            await ua.save();
            console.log("UA Router : Not debug, resetting after retrieving bet.");
        }

        res.status(200).send(bet);
    } catch (error) {
        console.log(error)
        res.status(500).send();
    }
})

//GET request | TODO : remove before production.
router.get('/test', async (req, res) => {
    const users = await UserAction.find({});
    res.send(users);
})

module.exports = router;