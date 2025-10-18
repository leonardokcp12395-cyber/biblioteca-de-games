document.addEventListener('DOMContentLoaded', () => {
    const gameListContainer = document.getElementById('game-list');

    // Função para carregar e exibir os jogos
    const loadGames = () => {
        fetch('games.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro de rede ao carregar games.json');
                }
                return response.json();
            })
            .then(games => {
                displayGames(games);
            })
            .catch(error => {
                console.error('Erro ao carregar os jogos:', error);
                gameListContainer.innerHTML = '<p>Não foi possível carregar a lista de jogos. Tente novamente mais tarde.</p>';
            });
    };

    // Função para renderizar os jogos na página
    const displayGames = (games) => {
        if (!games || games.length === 0) {
            gameListContainer.innerHTML = '<p>Nenhum jogo disponível no momento.</p>';
            return;
        }

        // Limpa qualquer conteúdo existente
        gameListContainer.innerHTML = '';

        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            gameCard.innerHTML = `
                <h2>${game.title}</h2>
                <p class="genre">${game.genre}</p>
                <p>${game.description}</p>
                <a href="${game.downloadLink}" class="download-btn" target="_blank" rel="noopener noreferrer">Download</a>
            `;

            gameListContainer.appendChild(gameCard);
        });
    };

    // Carrega os jogos quando a página é aberta
    loadGames();
});