const jwt = require('jsonwebtoken');
const User = require('../models/user.schema');

module.exports = async function (req, res, next) {
    // Pega o token do header
    const token = req.header('x-auth-token');

    // Se não houver token
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

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