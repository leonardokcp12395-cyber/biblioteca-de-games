const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Permite requisições de diferentes origens
app.use(express.json()); // Analisa o corpo das requisições como JSON
app.use(express.static(path.join(__dirname))); // Serve os arquivos estáticos do frontend

const GAMES_FILE = path.join(__dirname, 'games.json');

// --- Rotas da API ---

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

// Rota para adicionar um novo jogo
app.post('/api/games', (req, res) => {
    const newGame = {
        id: Date.now(),
        ...req.body
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


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});