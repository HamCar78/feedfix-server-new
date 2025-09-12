const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // ersätter body-parser
app.use(express.static(path.join(__dirname, 'public')));

// Logga inkommande requests (endast i utveckling)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        next();
    });
}

// Routes
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');

app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// Serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Proxy för översättning
app.post('/api/translate', async (req, res) => {
    const { q, source = "auto", target, format = "text" } = req.body;
    try {
        const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q, source, target, format })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

// 404-hantering
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Endpoints:`);
    console.log(`- /api/users`);
    console.log(`- /api/recipes`);
    console.log(`- /api/groups`);
});
