const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Game = require('../models/game.schema');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// --- Configuração do Multer para Upload ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        // Garante que o diretório de uploads exista
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Falha ao criar o diretório de uploads:', err);
                return cb(err);
            }
            cb(null, uploadPath);
        });
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- Rotas de Jogos (CRUD) ---

// GET /api/games - Obter todos os jogos com paginação e filtros
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const { search, genre } = req.query;

        const query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' }; // Busca case-insensitive
        }
        if (genre) {
            query.genre = genre;
        }

        const games = await Game.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalGames = await Game.countDocuments(query);
        const totalPages = Math.ceil(totalGames / limit);

        res.json({
            games,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar jogos.', error });
    }
});

// GET /api/games/:id - Obter um jogo por ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).populate('comments.userId', 'username');
        if (!game) {
            return res.status(404).json({ message: 'Jogo não encontrado.' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar o jogo.', error });
    }
});

// POST /api/games - Adicionar um novo jogo (protegido)
router.post('/', authMiddleware, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'gameImages', maxCount: 8 }
]), async (req, res) => {
    try {
        const { title, genre, description, downloadLink } = req.body;
        if (!req.files || !req.files.coverImage) {
            return res.status(400).send('A imagem de capa é obrigatória.');
        }

        const newGame = new Game({
            title,
            genre,
            description,
            downloadLink,
            coverImage: req.files.coverImage[0].path,
            gameImages: req.files.gameImages ? req.files.gameImages.map(f => f.path) : [],
        });

        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar o jogo.', error });
    }
});

// PUT /api/games/:id - Atualizar um jogo (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, genre, description, downloadLink } = req.body;
        const updatedGame = await Game.findByIdAndUpdate(
            req.params.id,
            { title, genre, description, downloadLink },
            { new: true } // Retorna o documento atualizado
        );
        if (!updatedGame) {
            return res.status(404).json({ message: 'Jogo não encontrado.' });
        }
        res.json(updatedGame);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o jogo.', error });
    }
});

// DELETE /api/games/:id - Excluir um jogo (protegido)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) {
            return res.status(404).json({ message: 'Jogo não encontrado.' });
        }
        // Opcional: excluir arquivos de imagem do servidor
        if (fs.existsSync(deletedGame.coverImage)) fs.unlinkSync(deletedGame.coverImage);
        deletedGame.gameImages.forEach(imgPath => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });
        res.status(200).send('Jogo excluído com sucesso.');
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir o jogo.', error });
    }
});

// POST /api/games/:id/comments - Adicionar um comentário (protegido)
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Jogo não encontrado.' });
        }

        const newComment = {
            userId: req.user.id,
            username: req.user.username,
            text: req.body.text,
        };

        game.comments.push(newComment);
        await game.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar comentário.', error });
    }
});

// POST /api/games/:id/rate - Avaliar um jogo (protegido)
router.post('/:id/rate', authMiddleware, async (req, res) => {
    try {
        const { rating } = req.body;
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Jogo não encontrado.' });
        }

        const existingRatingIndex = game.ratings.findIndex(r => r.userId.toString() === req.user.id);

        if (existingRatingIndex > -1) {
            // Atualiza a avaliação existente
            game.ratings[existingRatingIndex].rating = rating;
        } else {
            // Adiciona nova avaliação
            game.ratings.push({ userId: req.user.id, rating });
        }

        await game.save(); // O pre-save hook recalculará a média
        res.json({ averageRating: game.averageRating.toFixed(1) });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao avaliar o jogo.', error });
    }
});

module.exports = router;