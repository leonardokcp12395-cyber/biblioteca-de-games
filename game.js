document.addEventListener('DOMContentLoaded', () => {
    const gameDetailContainer = document.getElementById('game-detail-container');
    const gameTitleHeader = document.getElementById('game-title-header');

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');

    if (!gameId) {
        gameDetailContainer.innerHTML = '<p>Erro: ID do jogo não fornecido. <a href="index.html">Voltar para a biblioteca</a>.</p>';
        return;
    }

    gameDetailContainer.innerHTML = '<div class="loader"></div>';

    fetch(`/api/games/${gameId}`)
        .then(response => response.ok ? response.json() : Promise.reject('Jogo não encontrado.'))
        .then(game => displayGameDetails(game))
        .catch(error => {
            console.error('Erro ao carregar detalhes do jogo:', error);
            gameDetailContainer.innerHTML = `<p>Erro ao carregar detalhes: ${error}</p>`;
        });

    const displayGameDetails = (game) => {
        gameTitleHeader.textContent = game.title;
        document.title = game.title;

        const averageRating = game.ratings.length > 0
            ? (game.ratings.reduce((acc, r) => acc + r.rating, 0) / game.ratings.length).toFixed(1)
            : "N/A";

        const galleryHTML = game.gameImages && game.gameImages.length > 0 ? `
            <div class="game-gallery">
                <h2>Galeria</h2>
                <div class="gallery-images">
                    ${game.gameImages.map(img => `<img src="${img}" alt="Imagem do jogo ${game.title}">`).join('')}
                </div>
            </div>` : '';

        gameDetailContainer.innerHTML = `
            <div class="game-detail-header" style="background-image: url('${game.coverImage}')">
                <div class="game-detail-header-content">
                    <p class="genre">${game.genre}</p>
                    <h1>${game.title}</h1>
                    <div class="rating-section">
                        <span class="average-rating">⭐ ${averageRating}</span>
                        <div class="star-rating" id="user-rating">
                            ${[...Array(5)].map((_, i) => `<span class="star" data-value="${i + 1}">☆</span>`).join('')}
                        </div>
                    </div>
                    <div class="game-detail-actions">
                        <a href="${game.downloadLink}" class="download-btn" target="_blank" rel="noopener noreferrer">Download</a>
                        <button id="favorite-btn" class="favorite-btn">❤</button>
                    </div>
                </div>
            </div>

            <div class="game-detail-main">
                <div class="left-column">
                    <div class="description-section">
                        <h2>Sobre este Jogo</h2>
                        <p>${game.description}</p>
                    </div>
                    ${galleryHTML}
                </div>
                <div class="right-column">
                    <div class="comments-and-ad-section">
                        <div class="comments-section">
                            <h2>Comentários</h2>
                            <div id="comments-list"></div>
                            <form id="comment-form">
                                <textarea id="comment-text" placeholder="Deixe seu comentário..." required></textarea>
                                <button type="submit">Enviar</button>
                            </form>
                        </div>
                        <div class="ad-container-sidebar">
                            <ins class="adsbygoogle"
                                 style="display:block"
                                 data-ad-client="ca-pub-9983236555901620"
                                 data-ad-slot="1927617389"
                                 data-ad-format="auto"
                                 data-full-width-responsive="true"></ins>
                            <script>
                                 (adsbygoogle = window.adsbygoogle || []).push({});
                            </script>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const commentsList = document.getElementById('comments-list');
        displayComments(game.comments || [], commentsList);

        document.getElementById('comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            handleCommentSubmit(gameId, commentsList);
        });

        setupRatingStars(gameId);
        setupFavoriteButton(gameId);
        setupLightbox();
    };

    const displayComments = (comments, container) => {
        if (comments.length === 0) {
            container.innerHTML = '<p>Ainda não há comentários. Seja o primeiro!</p>';
            return;
        }
        container.innerHTML = comments.map(comment => `
            <div class="comment">
                <p>${comment.text}</p>
                <p class="comment-date">${new Date(comment.date).toLocaleString('pt-BR')}</p>
            </div>`).join('');
    };

    const handleCommentSubmit = (gameId, commentsListContainer) => {
        const textArea = document.getElementById('comment-text');
        const text = textArea.value;
        const token = localStorage.getItem('firebaseIdToken');

        if (!token) {
            alert('Você precisa estar logado para comentar.');
            return;
        }
        if (!text) return;

        fetch(`/api/games/${gameId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ text })
        })
        .then(res => res.ok ? res.json() : Promise.reject('Falha ao enviar comentário.'))
        .then(newComment => {
            textArea.value = '';
            const currentContent = commentsListContainer.innerHTML;
            if (currentContent.includes('Ainda não há comentários')) {
                commentsListContainer.innerHTML = '';
            }
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `<p>${newComment.text}</p><p class="comment-date">${new Date(newComment.date).toLocaleString('pt-BR')}</p>`;
            commentsListContainer.appendChild(commentElement);
        })
        .catch(err => alert(err));
    };

    const setupRatingStars = (gameId) => {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.value, 10);
                handleRatingSubmit(gameId, rating);
            });
        });
    };

    const handleRatingSubmit = (gameId, rating) => {
        const token = localStorage.getItem('firebaseIdToken');
        if (!token) {
            alert('Você precisa estar logado para avaliar um jogo.');
            return;
        }

        fetch(`/api/games/${gameId}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ rating })
        })
        .then(res => res.ok ? res.json() : Promise.reject('Falha ao enviar avaliação.'))
        .then(data => {
            alert('Obrigado pela sua avaliação!');
            document.querySelector('.average-rating').textContent = `⭐ ${data.averageRating}`;
        })
        .catch(err => alert(err));
    };

    const setupFavoriteButton = (gameId) => {
        const favBtn = document.getElementById('favorite-btn');
        const token = localStorage.getItem('firebaseIdToken');

        if (!token) {
            favBtn.style.display = 'none';
            return;
        }

        fetch('/api/users/favorites/ids', { headers: { 'Authorization': `Bearer ${token}` }})
            .then(res => res.json())
            .then(data => {
                if (data.favorites.includes(gameId)) {
                    favBtn.classList.add('favorited');
                }
            });

        favBtn.addEventListener('click', () => {
            fetch(`/api/users/favorites/toggle/${gameId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => favBtn.classList.toggle('favorited', data.includes(gameId)))
            .catch(err => console.error("Erro ao favoritar:", err));
        });
    };

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

        const closeLightbox = () => lightbox.style.display = 'none';
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    };
});