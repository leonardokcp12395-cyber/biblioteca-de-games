const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Permite requisições de diferentes origens
app.use(express.json()); // Analisa o corpo das requisições como JSON
app.use(express.static(path.join(__dirname))); // Serve os arquivos estáticos do frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve a pasta de uploads

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Garante um nome de arquivo único adicionando um timestamp
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

const GAMES_FILE = path.join(__dirname, 'games.json');

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

// --- Rotas da API ---

app.use('/api/auth', authRoutes);

// Rota para obter todos os jogos
app.get('/api/games', (req, res) => {
    fs.readFile(GAMES_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao ler o arquivo de jogos.');
        }
        res.json(JSON.parse(data));
    });
});

// Rota para adicionar um comentário a um jogo
app.post('/api/games/:id/comments', (req, res) => {
    const gameId = parseInt(req.params.id, 10);
    const { text } = req.body;

    if (!text) {
        return res.status(400).send('O texto do comentário é obrigatório.');
    }

    fs.readFile(GAMES_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao ler o arquivo de jogos.');
        }

        let games = JSON.parse(data);
        const gameIndex = games.findIndex(g => g.id === gameId);

        if (gameIndex === -1) {
            return res.status(404).send('Jogo não encontrado.');
        }

        const newComment = {
            text: text,
            date: new Date().toISOString()
        };

        games[gameIndex].comments.push(newComment);

        fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao salvar o comentário.');
            }
            res.status(201).json(newComment);
        });
    });
});

// Rota para obter um único jogo por ID
app.get('/api/games/:id', (req, res) => {
    const gameId = parseInt(req.params.id, 10);
    fs.readFile(GAMES_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao ler o arquivo de jogos.');
        }

        const games = JSON.parse(data);
        const game = games.find(g => g.id === gameId);

        if (game) {
            res.json(game);
        } else {
            res.status(404).send('Jogo não encontrado.');
        }
    });
});

// Rota para adicionar um novo jogo com imagens
app.post('/api/games', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'gameImages', maxCount: 8 } // Permite até 8 imagens na galeria
]), (req, res) => {
    const { title, genre, description, downloadLink } = req.body;

    // Verifica se os arquivos foram enviados
    if (!req.files || !req.files.coverImage) {
        return res.status(400).send('A imagem de capa é obrigatória.');
    }

    const coverImagePath = req.files.coverImage[0].path;
    const gameImagesPaths = req.files.gameImages ? req.files.gameImages.map(file => file.path) : [];

    const newGame = {
        id: Date.now(),
        title,
        genre,
        description,
        downloadLink,
        coverImage: coverImagePath,
        gameImages: gameImagesPaths,
        comments: [], // Inicializa com uma lista de comentários vazia
        ratings: [] // Inicializa com uma lista de avaliações vazia
    };

    fs.readFile(GAMES_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao ler o arquivo de jogos.');
        }

        const games = JSON.parse(data);
        games.push(newGame);

        fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao salvar o novo jogo.');
            }
            res.status(201).json(newGame);
        });
    });
});

// Rota para avaliar um jogo
app.post('/api/games/:id/rate', authMiddleware, (req, res) => {
    const gameId = parseInt(req.params.id, 10);
    const { rating } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).send('A avaliação deve ser um número entre 1 e 5.');
    }

    let games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
    const gameIndex = games.findIndex(g => g.id === gameId);

    if (gameIndex === -1) {
        return res.status(404).send('Jogo não encontrado.');
    }

    const game = games[gameIndex];
    // Remove qualquer avaliação anterior do mesmo usuário
    const otherRatings = game.ratings.filter(r => r.userId !== userId);
    const newRating = { userId, rating };
    game.ratings = [...otherRatings, newRating];

    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));

    // Calcula a nova média de avaliação
    const totalRatings = game.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRatings / game.ratings.length;

    res.json({ averageRating: averageRating.toFixed(1) });
});

// Rota para excluir um jogo
app.delete('/api/games/:id', authMiddleware, (req, res) => {
    const gameId = parseInt(req.params.id, 10);

    let games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
    const updatedGames = games.filter(g => g.id !== gameId);

    if (games.length === updatedGames.length) {
        return res.status(404).send('Jogo não encontrado para exclusão.');
    }

    fs.writeFileSync(GAMES_FILE, JSON.stringify(updatedGames, null, 2));
    res.status(200).send('Jogo excluído com sucesso.');
});

// Rota para atualizar um jogo (apenas texto)
app.put('/api/games/:id', authMiddleware, (req, res) => {
    const gameId = parseInt(req.params.id, 10);
    const { title, genre, description, downloadLink } = req.body;

    let games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
    const gameIndex = games.findIndex(g => g.id === gameId);

    if (gameIndex === -1) {
        return res.status(404).send('Jogo não encontrado para atualização.');
    }

    // Atualiza os campos
    games[gameIndex].title = title;
    games[gameIndex].genre = genre;
    games[gameIndex].description = description;
    games[gameIndex].downloadLink = downloadLink;

    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
    res.status(200).json(games[gameIndex]);
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});