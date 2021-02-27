const winston = require('winston');
const lw = require('@google-cloud/logging-winston');

function createLogginWinston() {
    let configuration = {
        serviceContext: {
            // required to report logged errors to the Google Cloud Error Reporting console
            service: 'api-photosub'
        },
        prefix: 'api-photosub'
    };

    if (process.env.NODE_ENV === 'development') {
        configuration = {
            projectId: 'photosub',
            keyFilename: '../gcp/photosub-5c66182af76f.json',
            ...configuration
        }
    }
    
    const loggingWinston = new lw.LoggingWinston(configuration);

    return loggingWinston;
}


// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = winston.createLogger({
    level: 'info',
    transports: [ ]
});

const loggingWinston = createLogginWinston();

async function makeExpressLoggerMiddleware() {
    return await lw.express.makeMiddleware(logger, loggingWinston);
}

if (process.env.NODE_ENV === 'production') {
    // Add Stackdriver Logging
    logger.add(loggingWinston);
} else {
    logger.add(new winston.transports.Console());
}

module.exports = {
    logger,
    makeExpressLoggerMiddleware
};