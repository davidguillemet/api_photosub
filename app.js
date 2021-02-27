// loads environment variables from a .env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { logger, makeExpressLoggerMiddleware } = require('./logger');


// Get a connection pool for postgreSql
const pool = require('./database-postgres');

async function startExpressServer() {

    // DOC at https://googleapis.dev/nodejs/logging-winston/latest/
    // Create a middleware that will use the provided logger.
    // A Stackdriver Logging transport will be created automatically
    // and added onto the provided logger.
    const mw = await makeExpressLoggerMiddleware();

    // Build express app
    const app = express();

    app.use(mw);

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
            logger.error("Failed to load locations.", err);
            res.status(500)
            .send('Failed to load locations.')
            .end();
        });
    });

    // Get all regions
    app.route('/regions')
    .get(function(req, res, next) {
        pool.select().table('regions').then(data => {
            res.json(data);
        }).catch (err => {
            logger.error("Failed to load regions.", err);
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
        const fileFullPath = `${newImage.path}/${newImage.name}`;
        try {
            logger.info(`ìnserting new image ${fileFullPath}`);
            await pool('images').insert(newImage);
            res.status(200).send(`Successfully inserting image ${fileFullPath}.`).end();
        } catch (err) {
            logger.error(`Failed to insert image ${fileFullPath}.`, err);
            res.status(500).send(`Error while inserting image ${fileFullPath}.`).end();
        }
    })
    // Delete an image
    .delete(async function (req, res, next) {
        // {
        //     name: "DSC_6578.jpg",
        //     path: "/folder/folder/",
        // }
        const imgeToDelete = req.body;
        const fileFullPath = `${imgeToDelete.path}/${imgeToDelete.name}`;
        try {
            logger.info(`Deleting image ${fileFullPath}`);
            await pool('images').where({
                path: imgeToDelete.path,
                name: imgeToDelete.name
            }).delete();
            res.status(200).send(`Successfully deleting image ${fileFullPath}.`).end();
        } catch (err) {
            logger.error(`Failed to remove image ${fileFullPath}.`, err);
            res.status(500).send(`Error while deleting image ${fileFullPath}.`).end();
        }
    });

    app.get('/status', (req, res) => res.send('Working!'));

    // Port 8080 for Google App Engine
    app.listen(process.env.PORT);
};

startExpressServer();
