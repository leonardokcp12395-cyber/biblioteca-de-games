document.addEventListener('DOMContentLoaded', () => {
    const gameListContainer = document.getElementById('game-list');
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const paginationControls = document.getElementById('pagination-controls');

    let currentPage = 1;
    let currentSearch = '';
    let currentGenre = '';

    // Função principal para buscar e renderizar jogos
    const loadGames = (page = 1) => {
        currentPage = page;
        currentSearch = searchInput.value;
        currentGenre = genreFilter.value;

        gameListContainer.innerHTML = '<div class="loader"></div>';

        const url = new URL('/api/games', window.location.origin);
        url.searchParams.append('page', currentPage);
        url.searchParams.append('limit', 12);
        if (currentSearch) url.searchParams.append('search', currentSearch);
        if (currentGenre) url.searchParams.append('genre', currentGenre);

        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayGames(data.games);
                renderPaginationControls(data.totalPages, data.currentPage);
            })
            .catch(error => {
                console.error('Erro ao carregar os jogos:', error);
                gameListContainer.innerHTML = '<p>Não foi possível carregar a lista de jogos.</p>';
            });
    };

    // Função para renderizar os cards de jogo
    const displayGames = (games) => {
        if (games.length === 0) {
            gameListContainer.innerHTML = '<p>Nenhum jogo encontrado com os filtros atuais.</p>';
            return;
        }

        gameListContainer.innerHTML = '';
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            const shortDescription = game.description.length > 100 ? game.description.substring(0, 100) + '...' : game.description;

            gameCard.innerHTML = `
                <a href="game.html?id=${game._id}">
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

    // Função para renderizar os controles de paginação
    const renderPaginationControls = (totalPages, page) => {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.disabled = page === 1;
        prevButton.addEventListener('click', () => loadGames(page - 1));
        paginationControls.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'page-number' + (i === page ? ' active' : '');
            pageButton.addEventListener('click', () => loadGames(i));
            paginationControls.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Próximo';
        nextButton.disabled = page === totalPages;
        nextButton.addEventListener('click', () => loadGames(page + 1));
        paginationControls.appendChild(nextButton);
    };

    // Função para preencher o filtro de gênero (agora pega todos os jogos para listar os gêneros)
    const populateGenreFilter = () => {
        fetch('/api/games?limit=1000') // Pega todos para listar os gêneros
            .then(res => res.json())
            .then(data => {
                const genres = [...new Set(data.games.map(game => game.genre))];
                genres.sort().forEach(genre => {
                    const option = document.createElement('option');
                    option.value = genre;
                    option.textContent = genre;
                    genreFilter.appendChild(option);
                });
            });
    }

    // Listeners para os filtros
    searchInput.addEventListener('input', () => loadGames(1));
    genreFilter.addEventListener('change', () => loadGames(1));

    // Carga inicial
    loadGames(1);
    populateGenreFilter();

    // --- Lógica do Modal de Sugestão ---
    const suggestModal = document.getElementById('suggest-modal');
    const suggestBtn = document.getElementById('suggest-game-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const suggestForm = document.getElementById('suggest-form');

    suggestBtn.onclick = () => {
        suggestModal.style.display = 'block';
    }
    closeModalBtn.onclick = () => {
        suggestModal.style.display = 'none';
    }
    window.onclick = (event) => {
        if (event.target == suggestModal) {
            suggestModal.style.display = 'none';
        }
    }

    suggestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const gameName = suggestForm.querySelector('#game-name').value;
        if (!gameName) return;

        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameName })
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar sugestão.');
            }

            alert('Obrigado pela sua sugestão! Vamos analisá-la em breve.');
            suggestModal.style.display = 'none';
            suggestForm.reset();

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });
});