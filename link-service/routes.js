const express = require('express');
const router = express.Router();
const pool = require('./database');

// 1. API to list links for a specific user (GET /api/v1/links/:userId)
// The Web/Gateway Service passes the User_id from its session
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const links = await pool.query('SELECT * FROM links WHERE User_id = ?', [userId]);
        res.status(200).json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});

// 2. API to add a new link (POST /api/v1/links)
router.post('/', async (req, res) => {
    // User_id is expected to be passed in the request body from the Web/Gateway
    const { User_id, Title, Url, Description } = req.body;
    const newLink = { User_id, Title, Url, Description };

    try {
        const result = await pool.query('INSERT INTO links SET ?', [newLink]);
        res.status(201).json({ 
            message: 'Link saved successfully',
            id: result.insertId // Return the ID of the new link
        });
    } catch (error) {
        console.error('Error saving link:', error);
        res.status(500).json({ error: 'Failed to save link' });
    }
});

// 3. API to delete a link (DELETE /api/v1/links/:ID)
router.delete('/:ID', async (req, res) => {
    const { ID } = req.params;
    try {
        await pool.query('DELETE FROM links WHERE ID = ?', [ID]);
        res.status(200).json({ message: 'Link removed successfully' });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

// 4. API to update a link (PUT /api/v1/links/:ID)
router.put('/:ID', async (req, res) => {
    const { ID } = req.params;
    const { Title, Description, Url } = req.body;
    const editedLink = { Title, Description, Url };
    
    try {
        await pool.query('UPDATE links SET ? WHERE ID = ?', [editedLink, ID]);
        res.status(200).json({ message: 'Link updated successfully' });
    } catch (error) {
        console.error('Error updating link:', error);
        res.status(500).json({ error: 'Failed to update link' });
    }
});

module.exports = router;
