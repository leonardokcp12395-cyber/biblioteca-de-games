const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const GAMES_FILE = path.join(__dirname, '..', 'games.json');

// Função auxiliar para ler jogos
const readGames = (callback) => {
    fs.readFile(GAMES_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') { // Se o arquivo não existir, retorna um array vazio
                return callback(null, []);
            }
            return callback(err);
        }
        try {
            const games = JSON.parse(data);
            callback(null, games);
        } catch (parseErr) {
            callback(parseErr);
        }
    });
};

// Função auxiliar para escrever jogos
const writeGames = (games, callback) => {
    fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2), 'utf8', callback);
};

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

// GET /api/games
router.get('/', (req, res) => {
    readGames((err, games) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de jogos.' });

        const { search, genre } = req.query;
        let filteredGames = games;

        if (search) {
            filteredGames = filteredGames.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (genre) {
            filteredGames = filteredGames.filter(g => g.genre === genre);
        }

        res.json({ games: filteredGames }); // Simplificado para não ter paginação por enquanto
    });
});

// GET /api/games/:id
router.get('/:id', (req, res) => {
    readGames((err, games) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de jogos.' });
        const game = games.find(g => g.id === parseInt(req.params.id, 10));
        if (!game) return res.status(404).json({ message: 'Jogo não encontrado.' });
        res.json(game);
    });
});

// --- ROTAS PROTEGIDAS (ADMIN) ---

// POST /api/games
router.post('/', adminAuth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'gameImages', maxCount: 8 }]), (req, res) => {
    readGames((err, games) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de jogos.' });

        const { title, genre, description, downloadLink } = req.body;
        if (!req.files || !req.files.coverImage) {
            return res.status(400).send('A imagem de capa é obrigatória.');
        }

        const newGame = {
            id: Date.now(), // ID numérico
            title,
            genre,
            description,
            downloadLink,
            coverImage: path.join('uploads', req.files.coverImage[0].filename),
            gameImages: req.files.gameImages ? req.files.gameImages.map(f => path.join('uploads', f.filename)) : [],
        };

        games.push(newGame);

        writeGames(games, (writeErr) => {
            if (writeErr) return res.status(500).json({ message: 'Erro ao salvar o novo jogo.' });
            res.status(201).json(newGame);
        });
    });
});

// PUT /api/games/:id
router.put('/:id', adminAuth, (req, res) => {
    readGames((err, games) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de jogos.' });

        const gameId = parseInt(req.params.id, 10);
        const gameIndex = games.findIndex(g => g.id === gameId);
        if (gameIndex === -1) return res.status(404).json({ message: 'Jogo não encontrado.' });

        const { title, genre, description, downloadLink } = req.body;
        games[gameIndex] = { ...games[gameIndex], title, genre, description, downloadLink };

        writeGames(games, (writeErr) => {
            if (writeErr) return res.status(500).json({ message: 'Erro ao atualizar o jogo.' });
            res.json(games[gameIndex]);
        });
    });
});

// DELETE /api/games/:id
router.delete('/:id', adminAuth, (req, res) => {
    readGames((err, games) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de jogos.' });

        const gameId = parseInt(req.params.id, 10);
        const gameToDelete = games.find(g => g.id === gameId);
        if (!gameToDelete) return res.status(404).json({ message: 'Jogo não encontrado.' });

        // Exclui os arquivos de imagem
        if (gameToDelete.coverImage && fs.existsSync(gameToDelete.coverImage)) fs.unlinkSync(gameToDelete.coverImage);
        if (gameToDelete.gameImages) {
            gameToDelete.gameImages.forEach(imgPath => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            });
        }

        const updatedGames = games.filter(g => g.id !== gameId);

        writeGames(updatedGames, (writeErr) => {
            if (writeErr) return res.status(500).json({ message: 'Erro ao excluir o jogo.' });
            res.status(200).send('Jogo excluído com sucesso.');
        });
    });
});

module.exports = router;