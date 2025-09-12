const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const recipesPath = path.join(__dirname, '../data/recipes.json');

// Helper function to read recipes
async function readRecipes() {
    try {
        const data = await fs.readFile(recipesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(recipesPath, '[]');
            return [];
        }
        throw error;
    }
}

// GET all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await readRecipes();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Error reading recipes' });
    }
});

// GET recipes by search query
router.get('/search/:query', async (req, res) => {
    try {
        const recipes = await readRecipes();
        const query = req.params.query.toLowerCase();
        
        const filteredRecipes = recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(query) || 
            (recipe.description && recipe.description.toLowerCase().includes(query))
        );
        
        res.json(filteredRecipes);
    } catch (error) {
        res.status(500).json({ message: 'Error searching recipes' });
    }
});

// POST - Create new recipe
router.post('/', async (req, res) => {
    try {
        const recipes = await readRecipes();
        const newRecipe = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        recipes.push(newRecipe);
        await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2));
        res.status(201).json(newRecipe);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error saving recipe' });
    }
});

module.exports = router;