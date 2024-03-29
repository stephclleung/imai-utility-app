const express = require('express')
const app = express();

const uaRouter = require('./user-action/user-action-router');
const iuRouter = require('./image-upload/image-router');
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

app.get('/wakeup', (req, res) => {
    res.status(200).send({ message: "Server is up." });
})

app.get('/token', (req, res) => {
    const token = jwt.sign(user, IMAI)
})

//routers for the utils
app.use('/ua', uaRouter);
app.use('/iu', iuRouter);



app.put('/*', (req, res) => {
    res.status(400).end();
})


app.patch('/*', (req, res) => {
    res.status(400).end();
})


app.delete('/*', (req, res) => {
    res.status(400).end();
})


module.exports = app;

