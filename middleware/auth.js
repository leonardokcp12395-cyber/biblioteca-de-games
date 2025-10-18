const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key'; // A mesma chave secreta usada em routes/auth.js

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (!token) {
        return res.status(401).send('Acesso negado. Nenhum token fornecido.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adiciona os dados do usuário (ex: { userId: 123 }) ao objeto da requisição
        next();
    } catch (ex) {
        res.status(400).send('Token inválido.');
    }
};

module.exports = authMiddleware;