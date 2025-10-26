const admin = require('../firebase-admin-config');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Acesso não autorizado: Token não fornecido ou mal formatado.');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Cria um objeto de usuário padronizado para ser usado nas rotas
        req.user = {
            id: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    } catch (error) {
        console.error('Erro ao verificar o token do Firebase:', error);
        return res.status(403).send('Acesso não autorizado: Token inválido ou expirado.');
    }
}

module.exports = authMiddleware;