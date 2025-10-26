const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    gameName: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        default: 'pendente',
        enum: ['pendente', 'adicionado', 'rejeitado']
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;