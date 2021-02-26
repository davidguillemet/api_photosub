require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');

// Build express app
const app = express();

// Get a connection pool for postgreSql
const pool = require('./database-postgres');

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// Get all locations
app.route('/locations')
.get(function(req, res, next) {
    pool.select().table('locations').then(data => {
        res.json(data);
    }).catch (err => {
        console.log(err);
        res.status(500)
        .send('Unable to load locations.')
        .end();
    });
});

// Get all regions
app.route('/regions')
.get(function(req, res, next) {
    pool.select().table('regions').then(data => {
        res.json(data);
    }).catch (err => {
        console.log(err);
        res.status(500)
        .send('Unable to load regions.')
        .end();
    });
});

// Insert a new image
app.route('/image')
.post(async function (req, res, next) {
    // {
    //     name: "DSC_6578.jpg",
    //     path: "/folder/folder/",
    //     title: "image title",
    //     description: "image description",
    //     tags: [ "tag1", "tag2", ...],
    //     caption: "image caption",
    //     captionTags: [ "tag1", "tag2", ...]
    // };
    const newImage = req.body;
    try {
        await pool('images').insert(newImage);
        res.status(200).send(`Successfully inserted image ${newImage.dir}/${newImage.name}`).end();
    } catch (err) {
        console.log(err);
        res.status(500).send(`Error while inserting image ${newImage.dir}/${newImage.name}`).end();
    }
});

app.get('/status', (req, res) => res.send('Working!'));

// Port 8080 for Google App Engine
app.listen(process.env.PORT);