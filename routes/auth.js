const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../users.json');
const JWT_SECRET = 'your_super_secret_key'; // Em produção, use variáveis de ambiente!

// Função para ler usuários do arquivo
const readUsers = () => {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
};

// Função para escrever usuários no arquivo
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Rota de Registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Nome de usuário e senha são obrigatórios.');
    }

    const users = readUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).send('Nome de usuário já existe.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now(),
        username,
        password: hashedPassword,
        favorites: [] // Adiciona o campo de favoritos no registro
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).send('Usuário registrado com sucesso.');
});

// Rota de Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send('Credenciais inválidas.');
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;