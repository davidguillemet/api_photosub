const Knex = require('knex');

// [START cloud_sql_postgres_knex_create_socket]
const createUnixSocketPool = config => {

    const connection = {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASS,
        database: process.env.POSTGRES_DATABASE,
    };

    if (process.env.NODE_ENV === 'development') {
        
        connection.host = process.env.POSTGRES_HOST;
        connection.port = process.env.POSTGRES_PORT;

        const fs = require('fs');
        const pathToCertificates = __dirname + process.env.PATH_TO_POSTGRES_CERTIFICATES;
        connection.ssl = {
            rejectUnauthorized: false,
            ca: fs.readFileSync(pathToCertificates + 'server-ca.pem'),
            key: fs.readFileSync(pathToCertificates + 'client-key.pem'),
            cert: fs.readFileSync(pathToCertificates + 'client-cert.pem')
        }
    } else {
        connection.host = `${process.env.DB_SOCKET_PATH}/${process.env.CLOUD_POSTGRES_CONNECTION_NAME}`;
    }
    
    // Establish a connection to the database
    return Knex({
      client: 'pg',
      connection: connection,
      // ... Specify additional properties here.
      ...config,
    });
  };
  // [END cloud_sql_postgres_knex_create_socket]
  
  // Initialize Knex, a Node.js SQL query builder library with built-in connection pooling.
const createPool = () => {
    // Configure which instance and what database user to connect with.
    // Remember - storing secrets in plaintext is potentially unsafe. Consider using
    // something like https://cloud.google.com/kms/ to help keep secrets secret.
    const config = {pool: {}};
  
    // [START cloud_sql_postgres_knex_limit]
    // 'max' limits the total number of concurrent connections this pool will keep. Ideal
    // values for this setting are highly variable on app design, infrastructure, and database.
    config.pool.max = 5;
    // 'min' is the minimum number of idle connections Knex maintains in the pool.
    // Additional connections will be established to meet this value unless the pool is full.
    config.pool.min = 5;
    // [END cloud_sql_postgres_knex_limit]
  
    // [START cloud_sql_postgres_knex_timeout]
    // 'acquireTimeoutMillis' is the number of milliseconds before a timeout occurs when acquiring a
    // connection from the pool. This is slightly different from connectionTimeout, because acquiring
    // a pool connection does not always involve making a new connection, and may include multiple retries.
    // when making a connection
    config.pool.acquireTimeoutMillis = 60000; // 60 seconds
    // 'createTimeoutMillis` is the maximum number of milliseconds to wait trying to establish an
    // initial connection before retrying.
    // After acquireTimeoutMillis has passed, a timeout exception will be thrown.
    config.createTimeoutMillis = 30000; // 30 seconds
    // 'idleTimeoutMillis' is the number of milliseconds a connection must sit idle in the pool
    // and not be checked out before it is automatically closed.
    config.idleTimeoutMillis = 600000; // 10 minutes
    // [END cloud_sql_postgres_knex_timeout]
  
    // [START cloud_sql_postgres_knex_backoff]
    // 'knex' uses a built-in retry strategy which does not implement backoff.
    // 'createRetryIntervalMillis' is how long to idle after failed connection creation before trying again
    config.createRetryIntervalMillis = 200; // 0.2 seconds
    // [END cloud_sql_postgres_knex_backoff]
  
    return createUnixSocketPool(config);
};

// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
const pool = createPool();

module.exports = pool;
  