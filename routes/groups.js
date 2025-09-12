const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const groupsPath = path.join(__dirname, '../data/groups.json');

// Helper function to read groups
async function readGroups() {
    const data = await fs.readFile(groupsPath, 'utf8');
    return JSON.parse(data);
}

// Get all groups
router.get('/', async (req, res) => {
    try {
        const groups = await readGroups();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error reading groups' });
    }
});

// Get groups for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const groups = await readGroups();
        const userGroups = groups.filter(group => 
            group.users.includes(parseInt(req.params.userId))
        );
        
        res.json(userGroups);
    } catch (error) {
        res.status(500).json({ message: 'Error reading groups' });
    }
});

module.exports = router;