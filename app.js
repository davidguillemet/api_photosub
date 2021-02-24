require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database');

app.route('/locations')
.get(function(req, res, next) {
    connection.query(
        "SELECT * FROM `locations`",
        function(error, results, fields) {
            if (error) throw error;
            res.json(results);
        }
    );
});

app.get('/status', (req, res) => res.send('Working!'));

// Port 8080 for Google App Engine
app.listen(process.env.PORT);