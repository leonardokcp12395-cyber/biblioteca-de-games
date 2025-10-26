const express = require('express');
const Request = require('../models/request.schema');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// --- ROTA PÚBLICA ---

// POST /api/requests - Cria uma nova solicitação de jogo
router.post('/', async (req, res) => {
    try {
        const { gameName } = req.body;
        if (!gameName) {
            return res.status(400).json({ message: 'O nome do jogo é obrigatório.' });
        }

        const newRequest = new Request({ gameName });
        await newRequest.save();

        res.status(201).json({ message: 'Solicitação recebida com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar a solicitação.' });
    }
});

// --- ROTAS DE ADMIN ---

// GET /api/requests - Obtém todas as solicitações pendentes
router.get('/', adminAuth, async (req, res) => {
    try {
        const requests = await Request.find({ status: 'pendente' }).sort({ requestedAt: 1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar solicitações.' });
    }
});

// DELETE /api/requests/:id - Exclui/processa uma solicitação
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const deletedRequest = await Request.findByIdAndDelete(req.params.id);
        if (!deletedRequest) {
            return res.status(404).json({ message: 'Solicitação não encontrada.' });
        }
        res.status(200).json({ message: 'Solicitação processada com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar a solicitação.' });
    }
});


module.exports = router;