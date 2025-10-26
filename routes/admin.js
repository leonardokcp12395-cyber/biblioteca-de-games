const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Rota de Login do Administrador
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verifica as credenciais com as variáveis de ambiente
    const isAdmin = username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;

    if (!isAdmin) {
        return res.status(401).json({ message: 'Credenciais de administrador inválidas.' });
    }

    // Se as credenciais estiverem corretas, gera um token JWT
    const payload = {
        user: {
            username: username,
            role: 'admin'
        }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Token de admin expira em 1 hora
        (err, token) => {
            if (err) throw err;
            res.json({ token });
        }
    );
});

module.exports = router;