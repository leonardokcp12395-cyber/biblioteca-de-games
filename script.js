document.addEventListener('DOMContentLoaded', () => {
    const gameListContainer = document.getElementById('game-list');
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');

    let allGames = []; // Armazena todos os jogos para evitar múltiplas chamadas de API

    // Função para carregar e exibir os jogos
    const loadGames = () => {
        fetch('/api/games') // Atualizado para usar a API
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro de rede ao carregar jogos da API.');
                }
                return response.json();
            })
            .then(games => {
                allGames = games;
                populateGenreFilter(games);
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
            gameListContainer.innerHTML = '<p>Nenhum jogo encontrado com os filtros atuais.</p>';
            return;
        }

        gameListContainer.innerHTML = '';
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            // Limita a descrição na página principal
            const shortDescription = game.description.length > 100
                ? game.description.substring(0, 100) + '...'
                : game.description;

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

    // Função para preencher o filtro de gênero dinamicamente
    const populateGenreFilter = (games) => {
        const genres = [...new Set(games.map(game => game.genre))]; // Pega gêneros únicos
        genres.sort().forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    };

    // Função para filtrar os jogos
    const filterGames = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;

        let filteredGames = allGames;

        // Filtra por termo de pesquisa
        if (searchTerm) {
            filteredGames = filteredGames.filter(game =>
                game.title.toLowerCase().includes(searchTerm)
            );
        }

        // Filtra por gênero
        if (selectedGenre) {
            filteredGames = filteredGames.filter(game =>
                game.genre === selectedGenre
            );
        }

        displayGames(filteredGames);
    };

    // Adiciona listeners de evento para os filtros
    searchInput.addEventListener('input', filterGames);
    genreFilter.addEventListener('change', filterGames);

    // Carrega os jogos quando a página é aberta
    loadGames();
});