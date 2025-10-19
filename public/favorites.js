document.addEventListener('DOMContentLoaded', () => {
    const gameListContainer = document.getElementById('game-list');
    const token = localStorage.getItem('authToken');

    if (!token) {
        gameListContainer.innerHTML = '<p>Você precisa estar logado para ver seus favoritos. <a href="login.html">Faça login</a>.</p>';
        return;
    }

    gameListContainer.innerHTML = '<div class="loader"></div>';

    fetch('/api/users/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Não foi possível carregar os favoritos.');
        }
        return response.json();
    })
    .then(games => {
        displayGames(games);
    })
    .catch(error => {
        console.error('Erro ao carregar favoritos:', error);
        gameListContainer.innerHTML = `<p>${error.message}</p>`;
    });

    const displayGames = (games) => {
        if (games.length === 0) {
            gameListContainer.innerHTML = '<p>Você ainda não tem jogos favoritos. Encontre um e clique no coração!</p>';
            return;
        }

        gameListContainer.innerHTML = '';
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            const shortDescription = game.description.length > 100 ? game.description.substring(0, 100) + '...' : game.description;

            gameCard.innerHTML = `
                <a href="game.html?id=${game.id}">
                    <img src="${game.coverImage}" alt="Capa do jogo ${game.title}" class="cover-image">
                    <div class="game-card-content">
                        <h2>${game.title}</h2>
                        <p class="genre">${game.genre}</p>
                        <p>${shortDescription}</p>
                    </div>
                </a>
            `;
            gameListContainer.appendChild(gameCard);
        });
    };
});