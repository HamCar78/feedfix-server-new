const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // <-- Nytt

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

// --- NYA ROUTES ---
// Hämta specifik användare
app.get('/api/users/:id', async (req, res) => {
  try {
    // Här skulle du hämta användardata från databasen
    // Detta är en placeholder
    res.json({ id: req.params.id, name: "User Name", email: "user@example.com" });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Uppdatera användare
app.put('/api/users/:id', upload.single('image'), async (req, res) => {
  try {
    // Här skulle du uppdatera användaren i databasen
    // Detta är en placeholder
    const updates = {
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio
    };
    
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Ändra lösenord
app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Här skulle du validera currentPassword och uppdatera till newPassword
    // Detta är en placeholder
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});
// --- SLUT NYA ROUTES ---

// Serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
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
