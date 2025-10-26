const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Acesso negado. Token de administrador não fornecido.');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verifica se o token pertence a um administrador
        if (decoded.user && decoded.user.role === 'admin') {
            req.user = decoded.user;
            next();
        } else {
            throw new Error('Permissões insuficientes.');
        }
    } catch (error) {
        res.status(403).send('Acesso negado. Token inválido ou expirado.');
    }
}

module.exports = adminAuth;