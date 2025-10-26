const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Game = require('../models/game.schema');
const adminAuth = require('../middleware/adminAuth'); // Usa o novo middleware

const router = express.Router();

// Configuração do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, uploadPath);
        });
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- ROTAS PÚBLICAS ---

// GET /api/games - Obter todos os jogos
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const { search, genre } = req.query;
        const query = {};
        if (search) query.title = { $regex: search, $options: 'i' };
        if (genre) query.genre = genre;
        const games = await Game.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        const totalGames = await Game.countDocuments(query);
        const totalPages = Math.ceil(totalGames / limit);
        res.json({ games, totalPages, currentPage: page });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar jogos.', error });
    }
});

// GET /api/games/:id - Obter um jogo por ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: 'Jogo não encontrado.' });
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar o jogo.', error });
    }
});


// --- ROTAS PROTEGIDAS (ADMIN) ---

// POST /api/games - Adicionar um novo jogo
router.post('/', adminAuth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'gameImages', maxCount: 8 }]), async (req, res) => {
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
            coverImage: path.join('uploads', req.files.coverImage[0].filename),
            gameImages: req.files.gameImages ? req.files.gameImages.map(f => path.join('uploads', f.filename)) : [],
        });
        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar o jogo.', error: error.message });
    }
});

// PUT /api/games/:id - Atualizar um jogo
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { title, genre, description, downloadLink } = req.body;
        const updatedGame = await Game.findByIdAndUpdate(req.params.id, { title, genre, description, downloadLink }, { new: true });
        if (!updatedGame) return res.status(404).json({ message: 'Jogo não encontrado.' });
        res.json(updatedGame);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o jogo.', error: error.message });
    }
});

// DELETE /api/games/:id - Excluir um jogo
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) return res.status(404).json({ message: 'Jogo não encontrado.' });
        // Opcional: excluir arquivos de imagem do servidor
        if (deletedGame.coverImage && fs.existsSync(deletedGame.coverImage)) fs.unlinkSync(deletedGame.coverImage);
        if (deletedGame.gameImages) {
            deletedGame.gameImages.forEach(imgPath => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            });
        }
        res.status(200).send('Jogo excluído com sucesso.');
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir o jogo.', error });
    }
});

module.exports = router;