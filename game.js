document.addEventListener('DOMContentLoaded', () => {
    const gameDetailContainer = document.getElementById('game-detail-container');
    const gameTitleHeader = document.getElementById('game-title-header');

    // Pega o ID do jogo da URL
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');

    if (!gameId) {
        gameDetailContainer.innerHTML = '<p>Erro: ID do jogo não fornecido. <a href="index.html">Voltar para a biblioteca</a>.</p>';
        return;
    }

    // Mostra o loader enquanto busca os dados
    gameDetailContainer.innerHTML = '<div class="loader"></div>';

    // Busca os detalhes do jogo na API
    fetch(`/api/games/${gameId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Jogo não encontrado.');
            }
            return response.json();
        })
        .then(game => {
            displayGameDetails(game);
        })
        .catch(error => {
            console.error('Erro ao carregar detalhes do jogo:', error);
            gameDetailContainer.innerHTML = `<p>Erro ao carregar detalhes do jogo: ${error.message} <a href="index.html">Voltar para a biblioteca</a>.</p>`;
        });

    // Função para renderizar os detalhes do jogo na página
    const displayGameDetails = (game) => {
        gameTitleHeader.textContent = game.title; // Atualiza o título no cabeçalho

        // Cria a galeria de imagens
        let galleryHTML = '';
        if (game.gameImages && game.gameImages.length > 0) {
            galleryHTML = `
                <div class="game-gallery">
                    <h2>Galeria</h2>
                    <div class="gallery-images">
                        ${game.gameImages.map(img => `<img src="${img}" alt="Imagem do jogo ${game.title}">`).join('')}
                    </div>
                </div>
            `;
        }

        // Monta o HTML final para o container de detalhes
        const totalRatings = game.ratings.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = game.ratings.length > 0 ? (totalRatings / game.ratings.length).toFixed(1) : "N/A";

        gameDetailContainer.innerHTML = `
            <div class="game-header">
                <img src="${game.coverImage}" alt="Capa do jogo ${game.title}" class="cover">
                <div class="info">
                    <h1>${game.title}</h1>
                    <div class="rating-section">
                        <span class="average-rating">⭐ ${averageRating}</span>
                        <div class="star-rating" id="user-rating">
                            ${[...Array(5)].map((_, i) => `<span class="star" data-value="${i + 1}">☆</span>`).join('')}
                        </div>
                    </div>
                    <p class="genre">${game.genre}</p>
                    <p>${game.description}</p>
                    <a href="${game.downloadLink}" class="download-btn" target="_blank" rel="noopener noreferrer">Download</a>
                </div>
            </div>
            ${galleryHTML}
            <div class="comments-section">
                <h2>Comentários</h2>
                <div id="comments-list">
                    <!-- Comentários existentes serão inseridos aqui -->
                </div>
                <form id="comment-form">
                    <textarea id="comment-text" placeholder="Deixe seu comentário..." required></textarea>
                    <button type="submit">Enviar Comentário</button>
                </form>
            </div>
        `;

        // Preenche a lista de comentários e adiciona o listener do formulário
        const commentsList = document.getElementById('comments-list');
        displayComments(game.comments || [], commentsList);

        document.getElementById('comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            handleCommentSubmit(gameId, commentsList);
        });

        // Adiciona listeners para as estrelas de avaliação
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.value, 10);
                handleRatingSubmit(gameId, rating);
            });
        });

        // Adiciona listeners para o lightbox da galeria
        setupLightbox();
    };

    // Função para exibir os comentários
    const displayComments = (comments, container) => {
        if (comments.length === 0) {
            container.innerHTML = '<p>Ainda não há comentários. Seja o primeiro!</p>';
            return;
        }
        container.innerHTML = comments.map(comment => `
            <div class="comment">
                <p>${comment.text}</p>
                <p class="comment-date">${new Date(comment.date).toLocaleString('pt-BR')}</p>
            </div>
        `).join('');
    };

    // Função para lidar com o envio de um novo comentário
    // Função para lidar com o envio de uma nova avaliação
    const handleRatingSubmit = (gameId, rating) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Você precisa estar logado para avaliar um jogo.');
            return;
        }

        fetch(`/api/games/${gameId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating: rating })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao enviar avaliação.');
            }
            return response.json();
        })
        .then(data => {
            alert('Obrigado pela sua avaliação!');
            // Atualiza a média de avaliação na página
            document.querySelector('.average-rating').textContent = `⭐ ${data.averageRating}`;
        })
        .catch(error => {
            console.error('Erro ao avaliar:', error);
            alert(error.message);
        });
    };

    // Função para configurar o lightbox
    const setupLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = lightbox.querySelector('.close-btn');
        const galleryImages = document.querySelectorAll('.gallery-images img');

        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightbox.style.display = 'flex';
                lightboxImg.src = img.src;
            });
        });

        const closeLightbox = () => {
            lightbox.style.display = 'none';
        }

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            // Fecha se clicar fora da imagem
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    };

    const handleCommentSubmit = (gameId, commentsListContainer) => {
        const textArea = document.getElementById('comment-text');
        const text = textArea.value;

        fetch(`/api/games/${gameId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao enviar comentário.');
            }
            return response.json();
        })
        .then(newComment => {
            textArea.value = ''; // Limpa o campo de texto

            // Adiciona o novo comentário à lista sem recarregar a página
            const currentContent = commentsListContainer.innerHTML;
            if (currentContent.includes('Ainda não há comentários')) {
                commentsListContainer.innerHTML = ''; // Limpa a mensagem inicial
            }

            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <p>${newComment.text}</p>
                <p class="comment-date">${new Date(newComment.date).toLocaleString('pt-BR')}</p>
            `;
            commentsListContainer.appendChild(commentElement);
        })
        .catch(error => {
            console.error('Erro ao enviar comentário:', error);
            alert(error.message);
        });
    };
});