require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Constrói um caminho absoluto para o schema a partir da raiz do projeto
const gameSchemaPath = path.resolve(__dirname, '../../models/game.schema.js');
const Game = require(gameSchemaPath);

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado ao MongoDB para popular o banco...');

        await Game.deleteMany({});
        console.log('Coleção de jogos limpa.');

        const testGame = new Game({
            title: "Path Resolved Game",
            genre: "Node.js Mysteries",
            description: "Um jogo inserido com a ajuda do módulo 'path'.",
            downloadLink: "http://example.com/path-download",
            coverImage: "images/placeholder.png",
        });

        await testGame.save();
        console.log('Jogo de teste inserido com sucesso!');

    } catch (error) {
        console.error('Erro ao popular o banco de dados diretamente:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Desconectado do MongoDB.');
    }
};

seedDatabase();