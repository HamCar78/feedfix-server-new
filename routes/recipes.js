const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const recipesPath = path.join(__dirname, '../data/recipes.json');

// Läs recept från fil
async function readRecipes() {
    try {
        const data = await fs.readFile(recipesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(recipesPath, '[]');
            return [];
        }
        console.error('Fel vid läsning av recipes.json:', error);
        throw error;
    }
}

// Skriv recept till fil
async function writeRecipes(recipes) {
    try {
        await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2));
    } catch (error) {
        console.error('Fel vid skrivning till recipes.json:', error);
        throw error;
    }
}

// Hämta alla recept
router.get('/', async (req, res) => {
    try {
        const recipes = await readRecipes();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Kunde inte hämta recept' });
    }
});

// Sök recept
router.get('/search/:query', async (req, res) => {
    try {
        const recipes = await readRecipes();
        const query = req.params.query.toLowerCase();

        const filtered = recipes.filter(recipe =>
            recipe.name?.toLowerCase().includes(query) ||
            recipe.description?.toLowerCase().includes(query)
        );

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Kunde inte söka recept' });
    }
});

// Skapa nytt recept
router.post('/', async (req, res) => {
    try {
        const { name, description, ingredients, steps, image, time, people, rating, uploaderId } = req.body;

        if (!name || !ingredients || !steps) {
            return res.status(400).json({ message: 'Namn, ingredienser och steg krävs' });
        }

        const recipes = await readRecipes();

        const newRecipe = {
            id: uuidv4(),
            name: name.trim(),
            description: description?.trim() || '',
            time: time || '',
            people: people || 1,
            rating: rating || 5,
            image: image || 'default_recipe.jpg',
            ingredients,
            steps,
            uploaderId: uploaderId ?? null,
            createdAt: new Date().toISOString()
        };

        recipes.push(newRecipe);
        await writeRecipes(recipes);

        res.status(201).json(newRecipe);
    } catch (error) {
        console.error('Fel vid sparande av recept:', error);
        res.status(500).json({ message: 'Kunde inte spara recept' });
    }
});

// Ta bort ett recept (endast om rätt användare)
router.delete('/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const { userId } = req.body; // userId skickas från frontend

        const recipes = await readRecipes();
        const recipe = recipes.find(r => r.id === recipeId);

        if (!recipe) {
            return res.status(404).json({ message: 'Receptet hittades inte' });
        }

        if (recipe.uploaderId != userId) {
            return res.status(403).json({ message: 'Du får bara ta bort dina egna recept' });
        }

        const updatedRecipes = recipes.filter(r => r.id !== recipeId);
        await writeRecipes(updatedRecipes);

        res.json({ message: 'Recept borttaget' });
    } catch (error) {
        res.status(500).json({ message: 'Kunde inte ta bort recept' });
    }
});

module.exports = router;
