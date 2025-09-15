const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const usersPath = path.join(__dirname, '../data/users.json');

// Läs användare från fil
async function readUsers() {
    try {
        const data = await fs.readFile(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(usersPath, '[]');
            return [];
        }
        console.error('Fel vid läsning av users.json:', error);
        throw error;
    }
}

// Skriv användare till fil
async function writeUsers(users) {
    try {
        await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Fel vid skrivning till users.json:', error);
        throw error;
    }
}

// Hämta alla användare
router.get('/', async (req, res) => {
    try {
        const users = await readUsers();
        const sanitized = users.map(({ password, ...u }) => u);
        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: 'Kunde inte hämta användare' });
    }
});

// Hämta användare via ID
router.get('/:id', async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.params.id);
        if (!user) return res.status(404).json({ message: 'Användare hittades inte' });

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Fel vid hämtning av användare' });
    }
});

// Inloggning
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readUsers();
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Felaktiga inloggningsuppgifter' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Fel vid inloggning' });
    }
});

// Registrering
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, image } = req.body;
        const users = await readUsers();

        if (users.some(u => u.email === email)) {
            return res.status(400).json({ message: 'Användare finns redan' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            image: image || 'default_profile.svg',
            groups: []
        };

        users.push(newUser);
        await writeUsers(users);

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Fel vid skapande av användare' });
    }
});

// Autentisering middleware (exempel, byt ut mot din riktiga)
function authMiddleware(req, res, next) {
    // Här bör du verifiera JWT eller session
    // Exempel: req.user = { id: '...' }
    // Om ej autentiserad: return res.status(401).json({ message: 'Ej autentiserad' });
    next();
}

// Ändra lösenord
router.put('/:id/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === req.params.id);

        if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

        const user = users[userIndex];

        // Verifiera nuvarande lösenord
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.status(401).json({ message: 'Current password is incorrect' });

        // Hasha och spara nytt lösenord
        users[userIndex].password = await bcrypt.hash(newPassword, 10);
        await writeUsers(users);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password' });
    }
});

module.exports = router;
