const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

const usersPath = path.join(__dirname, '../data/users.json');

// Helper function to read users
async function readUsers() {
    try {
        const data = await fs.readFile(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(usersPath, '[]');
            return [];
        }
        throw error;
    }
}

// GET all users
router.get('/', async (req, res) => {
    try {
        console.log('Attempting to read users from:', usersPath); // Debug log
        const users = await readUsers();
        res.json(users);
    } catch (error) {
        console.error('Error reading users:', error); // Debug log
        res.status(500).json({ message: 'Error reading users' });
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === parseInt(req.params.id));
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error reading users' });
    }
});


// Helper function to write users
async function writeUsers(users) {
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Don't send password back
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, image } = req.body;
        const users = await readUsers();

        // Check if user exists
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 0,
            name,
            email,
            password: hashedPassword,
            image: image || 'default_profile.svg',
            groups: []
        };

        users.push(newUser);
        await writeUsers(users);

        // Don't send password back
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Existing routes remain the same...
module.exports = router;