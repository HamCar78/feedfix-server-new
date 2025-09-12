const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const groupsPath = path.join(__dirname, '../data/groups.json');

// Läs grupper från fil
async function readGroups() {
    try {
        const data = await fs.readFile(groupsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(groupsPath, '[]');
            return [];
        }
        console.error('Fel vid läsning av groups.json:', error);
        throw error;
    }
}

// Hämta alla grupper
router.get('/', async (req, res) => {
    try {
        const groups = await readGroups();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Kunde inte hämta grupper' });
    }
});

// Hämta grupper för en specifik användare
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Ogiltigt användar-ID' });
        }

        const groups = await readGroups();
        const userGroups = groups.filter(group =>
            Array.isArray(group.users) && group.users.includes(userId)
        );

        res.json(userGroups);
    } catch (error) {
        console.error('Fel vid hämtning av användargrupper:', error);
        res.status(500).json({ message: 'Kunde inte hämta grupper för användare' });
    }
});

module.exports = router;
