const express = require('express');
const User = require('../models/user.schema');
const Game = require('../models/game.schema');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware para todas as rotas de favoritos
router.use(authMiddleware);

// GET /api/users/favorites/ids - Obter IDs dos jogos favoritos do usuário
router.get('/favorites/ids', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json({ favorites: user.favorites || [] });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar IDs de favoritos.', error });
    }
});

// GET /api/users/favorites - Obter os documentos completos dos jogos favoritos
router.get('/favorites', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar jogos favoritos.', error });
    }
});

// POST /api/users/favorites/toggle/:gameId - Adicionar/remover um jogo dos favoritos
router.post('/favorites/toggle/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Jogo não encontrado.' });
        }

        const favoriteIndex = user.favorites.indexOf(gameId);
        if (favoriteIndex > -1) {
            // Remove dos favoritos
            user.favorites.splice(favoriteIndex, 1);
        } else {
            // Adiciona aos favoritos
            user.favorites.push(gameId);
        }

        await user.save();
        res.status(200).json(user.favorites);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao alternar favorito.', error });
    }
});

module.exports = router;