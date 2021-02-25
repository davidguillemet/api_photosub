require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pool = require('./database-postgres');

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

app.get('/status', (req, res) => res.send('Working!'));

// Port 8080 for Google App Engine
app.listen(process.env.PORT);