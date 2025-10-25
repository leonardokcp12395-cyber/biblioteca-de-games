const jwt = require('jsonwebtoken');
const User = require('../models/user.schema');

module.exports = async function (req, res, next) {
    // Pega o token do header 'Authorization' (ex: "Bearer TOKEN")
    const authHeader = req.header('Authorization');

    // Se não houver header ou não começar com "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token mal formatado ou ausente.' });
    }

    const token = authHeader.split(' ')[1]; // Extrai o token do "Bearer TOKEN"

    try {
        // Verifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adiciona o usuário do payload à requisição
        req.user = decoded.user;

        // Confirma que o usuário ainda existe no banco de dados
        const userExists = await User.findById(req.user.id);
        if (!userExists) {
            return res.status(401).json({ message: 'Token inválido - usuário não encontrado.' });
        }

        next(); // Passa para a próxima função de middleware/rota
    } catch (err) {
        res.status(401).json({ message: 'Token inválido.' });
    }
};