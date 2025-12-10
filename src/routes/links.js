const express = require('express');
const router = express.Router();
const axios = require('axios'); // Used for making API calls to the Link Service

// The original database connection is now ONLY used for auth/sessions, 
// so we remove 'const pool = require('../database');' from here.
const { isLoggedIn } = require('../lib/auth');
const keys = require('../keys');

// Base URL for the Link Service, fetched from keys.js
const LINK_SERVICE_URL = keys.linkService.url; 

router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add');
});

// --- Link Creation (POST /add) ---
router.post('/add', isLoggedIn, async (req, res) => {
    const { Title, Url, Description } = req.body;
    
    // Package the data, including the User_id from the session, to send to the API
    const newLink = {
        User_id: req.user.id, 
        Title,
        Url,
        Description
    };

    try {
        // POST request to the Link Service API
        await axios.post(LINK_SERVICE_URL, newLink); 
        req.flash('success', 'Link saved successfully');
        res.redirect('/links');
    } catch (error) {
        // Handle API call failure
        console.error('API Error saving link:', error.message);
        req.flash('error', 'Failed to save link via microservice.');
        res.redirect('/links/add');
    }
});

// --- Link Listing (GET /) ---
router.get('/', isLoggedIn, async(req, res) => {
    try {
        // GET request to the Link Service API, passing the User_id in the URL
        const response = await axios.get(`${LINK_SERVICE_URL}/${req.user.id}`);
        const links = response.data; // The API returns the links array as JSON
        res.render('links/list', {links: links});
    } catch (error) {
        // Handle API call failure
        console.error('API Error fetching links:', error.message);
        req.flash('error', 'Failed to load links from microservice.');
        res.render('links/list', {links: []});
    }
});

// --- Link Deletion (GET /delete/:ID) ---
router.get('/delete/:ID', isLoggedIn, async(req, res) => {
    const { ID } = req.params;
    
    try {
        // DELETE request to the Link Service API
        await axios.delete(`${LINK_SERVICE_URL}/${ID}`);
        req.flash('success', 'Link removed successfully');
        res.redirect('/links');
    } catch (error) {
        console.error('API Error deleting link:', error.message);
        req.flash('error', 'Failed to remove link via microservice.');
        res.redirect('/links');
    }
});

router.get('/edit/:ID', isLoggedIn, async(req, res) => {
    const { ID } = req.params;
    // NOTE: For editing, you need a GET request here to fetch the link data from the API
    // The link service only handles getting ALL links, not a single one. 
    // You'd either need to add a GET /:ID route to the Link Service or filter the list you already get.
    // For simplicity, we'll assume the Link Service has a GET /:ID route now for single fetch.
    
    try {
        // Fetch a single link (requires GET /api/v1/links/:ID on the microservice)
        const response = await axios.get(`${LINK_SERVICE_URL}/${ID}`);
        const link = response.data[0] || response.data; // Assuming it returns a single object or array
        res.render('links/edit', {link: link});
    } catch (error) {
        console.error('API Error fetching single link:', error.message);
        req.flash('error', 'Failed to load link for editing.');
        res.redirect('/links');
    }
});

// --- Link Editing (POST /edit/:ID) ---
router.post('/edit/:ID', isLoggedIn, async(req, res) => {
    const { ID } = req.params;
    const { Title, Description, Url } = req.body;
    const editedLink = {
        Title,
        Description,
        Url
    };

    try {
        // PUT request to the Link Service API
        await axios.put(`${LINK_SERVICE_URL}/${ID}`, editedLink);
        req.flash('success', 'Link updated successfully');
        res.redirect('/links');
    } catch (error) {
        console.error('API Error updating link:', error.message);
        req.flash('error', 'Failed to update link via microservice.');
        res.redirect('/links');
    }
});

module.exports = router;
