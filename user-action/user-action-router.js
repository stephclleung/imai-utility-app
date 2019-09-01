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
            code = 201;
        }
        else {
            ua.action = req.body.action;
            msg = "Updated";
            code = 200;
        }

        await ua.save();
        res.status(code).send({
            userID: ua.userID,
            action: ua.action || 0,
            message: msg
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
            throw new Error('Cannot find user.')
        }

        let bet = ua.action.toString();
        console.log('Util App | User Router  | ' + ua.userID + ' has requested to bet ' + ua.action + ' chips.');

        if (!req.body.debug) {
            ua.action = 0;
            await ua.save();
        }

        res.status(200).send(bet);
    } catch (error) {
        console.log(error)
        res.status(400).send();
    }
})

router.get('/*', (req, res) => res.status(405).send())
router.patch('/*', (req, res) => res.status(405).send())
router.post('/*', (req, res) => res.status(405).send())
router.delete('/*', (req, res) => res.status(405).send())

module.exports = router;