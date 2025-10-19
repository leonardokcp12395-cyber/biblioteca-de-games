require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Conexão com o Banco de Dados ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB com sucesso.'))
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1); // Encerra o processo se não conseguir conectar
    });

// --- Modelos ---
const Game = require('./models/game.schema');
const User = require('./models/user.schema');

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Garante que o diretório de uploads exista
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// --- Rotas ---
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const favoriteRoutes = require('./routes/favorites');

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', favoriteRoutes);

// --- Rota de Teste ---
app.get('/api/health', (req, res) => {
    res.status(200).send('Servidor está funcionando e saudável.');
});

// --- Tratamento de Erros Global ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});