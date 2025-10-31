require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// O banco de dados foi removido, a conexão não é mais necessária.

// Firebase foi removido.

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
const gameRoutes = require('./routes/games');
const adminRoutes = require('./routes/admin');
const requestRoutes = require('./routes/requests');

app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);

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