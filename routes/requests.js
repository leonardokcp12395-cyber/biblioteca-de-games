const express = require('express');
const path = require('path');
const fs = require('fs');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const REQUESTS_FILE = path.join(__dirname, '..', 'requests.json');

// Função auxiliar para ler solicitações
const readRequests = (callback) => {
    fs.readFile(REQUESTS_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, []);
            }
            return callback(err);
        }
        try {
            const requests = JSON.parse(data);
            callback(null, requests);
        } catch (parseErr) {
            callback(parseErr);
        }
    });
};

// Função auxiliar para escrever solicitações
const writeRequests = (requests, callback) => {
    fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8', callback);
};


// --- ROTA PÚBLICA ---

// POST /api/requests
router.post('/', (req, res) => {
    readRequests((err, requests) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de solicitações.' });

        const { gameName } = req.body;
        if (!gameName) {
            return res.status(400).json({ message: 'O nome do jogo é obrigatório.' });
        }

        const newRequest = {
            id: Date.now(),
            gameName,
            requestedAt: new Date().toISOString()
        };

        requests.push(newRequest);

        writeRequests(requests, (writeErr) => {
            if (writeErr) return res.status(500).json({ message: 'Erro ao salvar a solicitação.' });
            res.status(201).json({ message: 'Solicitação recebida com sucesso!' });
        });
    });
});


// --- ROTAS DE ADMIN ---

// GET /api/requests
router.get('/', adminAuth, (req, res) => {
    readRequests((err, requests) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de solicitações.' });
        res.json(requests);
    });
});

// DELETE /api/requests/:id
router.delete('/:id', adminAuth, (req, res) => {
    readRequests((err, requests) => {
        if (err) return res.status(500).json({ message: 'Erro ao ler o arquivo de solicitações.' });

        const requestId = parseInt(req.params.id, 10);
        const updatedRequests = requests.filter(r => r.id !== requestId);

        if (requests.length === updatedRequests.length) {
            return res.status(404).json({ message: 'Solicitação não encontrada.' });
        }

        writeRequests(updatedRequests, (writeErr) => {
            if (writeErr) return res.status(500).json({ message: 'Erro ao processar a solicitação.' });
            res.status(200).json({ message: 'Solicitação processada com sucesso.' });
        });
    });
});

module.exports = router;