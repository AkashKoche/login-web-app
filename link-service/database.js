const mysql = require('mysql');
const { promisify } = require('util');

// Configuration is now read from environment variables for Docker
const databaseConfig = {
    host: process.env.DB_HOST,       // Should be 'db' in Docker
    user: process.env.DB_USER,       // Should be 'root'
    password: process.env.DB_PASSWORD, // Should be 'root_password_secret'
    database: process.env.DB_DATABASE // Should be 'crud_links'
};

const pool = mysql.createPool(databaseConfig);

pool.getConnection((err, conn) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('DATABASE_CONNECTION_WAS_CLOSED');
        }
        if (err.code === 'ER_CON_COUNT_ERRORS') {
            console.error('DATABASE HAS TOO MANY CONNECTIONS');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('DATABASE CONNECTION WAS REFUSED');
        }
        return;
    }

    if (conn) conn.release();
    console.log('DB is Connected for Link Service');
    return;
});

/* Promisify Pool Queries */
pool.query = promisify(pool.query);

module.exports = pool;
