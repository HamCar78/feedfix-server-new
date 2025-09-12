const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Print current directory for debugging
console.log('Current directory:', __dirname);

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

// Serve Login Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Try these endpoints:`);
    console.log(`- http://localhost:${PORT}/api/users`);
    console.log(`- http://localhost:${PORT}/api/recipes`);
    console.log(`- http://localhost:${PORT}/api/groups`);
});