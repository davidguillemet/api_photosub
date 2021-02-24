const mysql = require('mysql');

let config = {
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS
}

if (process.env.NODE_ENV === 'production') {
    // Database Connection for Production, from App Engine
    config.socketPath = `${process.env.DB_SOCKET_PATH}/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
} else {
    // Database Connection for Development
    config.host = process.env.DB_HOST;

    const fs = require('fs');
    const pathToCertificates = __dirname + process.env.PATH_TO_CERTIFICATES;
    config.ssl = {
        ca: fs.readFileSync(pathToCertificates + 'server-ca.pem'),
        key: fs.readFileSync(pathToCertificates + 'client-key.pem'),
        cert: fs.readFileSync(pathToCertificates + 'client-cert.pem')
    }
}

let connection = mysql.createConnection(config);

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as thread id: ' + connection.threadId);
});

module.exports = connection;