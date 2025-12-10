// Link Service's database.js
const mysql = require('mysql');
const { promisify } = require('util');

const database = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

const pool = mysql.createPool(database);
pool.getConnection((err, conn) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('DATABASE_CONNECTION_WAS_CLOSED');
        }
        if (err.code === 'ER_CON_COUNT_ERRORS') {
            console.log('DATABASE HAS TO MANY CONNECTIONS');
        }
        if (err.code === 'ECONNREFUSED') {
            console.log('DATABASE CONNECTION WAS REFUSED');
        }
    }

    if (conn) conn.release();
    console.log('DB is Connected');
    return;
});
pool.query = promisify(pool.query);
module.exports = pool;
