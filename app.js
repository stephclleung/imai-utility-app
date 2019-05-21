const express = require('express')
const app = express();
const UserAction = require('./user-action/user-action-model');
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
}, (err) => {
    if (err) console.log('Error during connection : ', err);
});

app.use(express.json());

//PUT request
app.put('/:target/action', async (req, res) => {
    // console.log(req.params.target);
    // console.log(req.body);
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

//POST request
app.post('/:target/bet', async (req, res) => {
    console.log(req.body);
    try {
        ua = await UserAction.findUserByUserID(req.params.target);
        let bet = ua.action.toString();
        console.log('!! - ' + ua.userID + 'has requested to bet ' + ua.action);

        //ua.action = 0;
        await ua.save();

        // res.status(500).send({ error })
        res.status(200).send(bet);
    } catch (error) {
        console.log(error)
        res.status(500).send();
    }
})

//GET request
app.get('/test', async (req, res) => {
    const users = await UserAction.find({});
    res.send(users);
})

//Deny any other


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server up at ${PORT}`);
})

