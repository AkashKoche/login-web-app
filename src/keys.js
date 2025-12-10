module.exports = {
    database: {
        // Configuration for the database (used for user auth/sessions)
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'crud_links',
    },
    // New: Configuration for the Link Microservice API
    linkService: {
        // This URL points to the Link Service container's internal network name and port
        url: process.env.LINK_SERVICE_URL || 'http://localhost:3001/api/v1/links'
    }
}
