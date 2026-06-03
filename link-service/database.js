const mysql = require('mysql2');
const { promisify } = require('util');

// Configuration is now read from environment variables for Docker
const databaseConfig = {
    host: process.env.DB_HOST,       // Should be 'db' in Docker
    user: process.env.DB_USER,       // Should be 'root'
    password: process.env.DB_PASSWORD, // Should be 'root_password_secret'
    database: process.env.DB_DATABASE, // Should be 'crud_links'
    port: 3306,
};

console.log(`Link Service DB Config: Host=${databaseConfig.host}, User=${databaseConfig.user}, Database=${databaseConfig.database}`);

const pool = mysql.createPool(databaseConfig);

pool.on('error', (err) => {
    console.error('MySQL Pool Error:', err.code, err.message);
    // You can handle or log critical pool errors here
});

const handleConnection = () => {
    pool.getConnection((err, conn) => {
        if (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('DATABASE_CONNECTION_WAS_CLOSED');
            } else if (err.code === 'ER_CON_COUNT_ERRORS') {
                console.error('DATABASE HAS TOO MANY CONNECTIONS');
            } else if (err.code === 'ECONNREFUSED') {
                console.log('DB connection refused. Retrying in 5 seconds...');
                // Retry connection after 5 seconds
                setTimeout(handleConnection, 5000); 
                return;
            }
            return;
        }

        if (conn) conn.release();
        console.log('✅ Link Service DB is Connected');
        return;
    });
};

handleConnection(); // Start the connection attempts

/* Promisify Pool Queries */
pool.query = promisify(pool.query);

module.exports = pool;
