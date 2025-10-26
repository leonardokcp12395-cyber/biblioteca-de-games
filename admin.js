document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminAuthToken');
    const onAdminPage = window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('edit-game.html');

    if (!token && onAdminPage) {
        window.location.href = 'login.html';
        return; // Stop script execution if not logged in
    }

    // --- Lógica para Adicionar, Editar, Listar e Excluir ---

    const addGameForm = document.getElementById('add-game-form');
    const editGameForm = document.getElementById('edit-game-form');
    const gamesListBody = document.getElementById('games-list-body');
    const requestsListBody = document.getElementById('requests-list-body');

    // Se estiver na página de admin, carrega a lista de jogos e solicitações
    if (gamesListBody) {
        loadGames();
        loadRequests();
    }

    // Se estiver na página de edição, carrega os dados do jogo
    if (editGameForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('id');
        if (gameId) {
            loadGameForEdit(gameId);
        }
    }

    // Listener para ADICIONAR jogo
    if (addGameForm) {
        addGameForm.addEventListener('submit', handleAddSubmit);
    }

    // Listener para EDITAR jogo
    if (editGameForm) {
        editGameForm.addEventListener('submit', handleEditSubmit);
    }

    // --- Funções ---

    async function loadGames() {
        gamesListBody.innerHTML = '<tr><td colspan="3"><div class="loader"></div></td></tr>'; // Mostra o loader na tabela
        try {
            const response = await fetch('/api/games');
            const result = await response.json();
            const games = result.games; // Acessa o array de jogos dentro do objeto de resposta
            gamesListBody.innerHTML = ''; // Limpa a tabela
            games.forEach(game => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${game.coverImage}" alt="Capa de ${game.title}"></td>
                    <td>${game.title}</td>
                    <td class="actions">
                        <a href="edit-game.html?id=${game._id}" class="edit-btn">Editar</a>
                        <button class="delete-btn" data-id="${game._id}">Excluir</button>
                    </td>
                `;
                gamesListBody.appendChild(row);
            });

            // Adiciona listeners para os botões de excluir
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const gameId = e.target.dataset.id;
                    handleDelete(gameId);
                });
            });
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
        }
    }

    async function loadGameForEdit(id) {
        try {
            const response = await fetch(`/api/games/${id}`);
            const game = await response.json();
            document.getElementById('gameId').value = game._id;
            document.getElementById('title').value = game.title;
            document.getElementById('genre').value = game.genre;
            document.getElementById('description').value = game.description;
            document.getElementById('downloadLink').value = game.downloadLink;
        } catch (error) {
            console.error('Erro ao carregar dados do jogo para edição:', error);
        }
    }

    async function handleAddSubmit(e) {
        e.preventDefault();

        const gameData = {
            title: addGameForm.querySelector('#title').value,
            genre: addGameForm.querySelector('#genre').value,
            description: addGameForm.querySelector('#description').value,
            downloadLink: addGameForm.querySelector('#downloadLink').value,
        };

        try {
            const response = await fetch('/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(gameData)
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Jogo adicionado com sucesso!');
            addGameForm.reset();
            setTimeout(loadGames, 500); // Adiciona um pequeno atraso antes de recarregar
        } catch (error) {
            alert(`Erro ao adicionar jogo: ${error.message}`);
        }
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        const gameId = document.getElementById('gameId').value;
        const gameData = {
            title: document.getElementById('title').value,
            genre: document.getElementById('genre').value,
            description: document.getElementById('description').value,
            downloadLink: document.getElementById('downloadLink').value
        };

        try {
            const response = await fetch(`/api/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(gameData)
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Jogo atualizado com sucesso!');
            window.location.href = 'admin.html';
        } catch (error) {
            alert(`Erro ao atualizar jogo: ${error.message}`);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch(`/api/games/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Jogo excluído com sucesso!');
            loadGames(); // Recarrega a lista
        } catch (error) {
            alert(`Erro ao excluir jogo: ${error.message}`);
        }
    }

    async function loadRequests() {
        if (!requestsListBody) return;
        requestsListBody.innerHTML = '<tr><td colspan="3"><div class="loader"></div></td></tr>';
        try {
            const response = await fetch('/api/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const requests = await response.json();
            requestsListBody.innerHTML = '';
            requests.forEach(request => {
                const row = document.createElement('tr');
                const requestDate = new Date(request.requestedAt).toLocaleDateString('pt-BR');
                row.innerHTML = `
                    <td>${request.gameName}</td>
                    <td>${requestDate}</td>
                    <td class="actions">
                        <button class="approve-btn" data-id="${request._id}">Adicionado</button>
                        <button class="reject-btn" data-id="${request._id}">Rejeitar</button>
                    </td>
                `;
                requestsListBody.appendChild(row);
            });

            document.querySelectorAll('.approve-btn, .reject-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const requestId = e.target.dataset.id;
                    handleRequestAction(requestId);
                });
            });
        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
            requestsListBody.innerHTML = '<tr><td colspan="3">Erro ao carregar solicitações.</td></tr>';
        }
    }

    async function handleRequestAction(id) {
        if (!confirm('Tem certeza que deseja processar esta solicitação?')) return;
        try {
            await fetch(`/api/requests/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Solicitação processada com sucesso!');
            loadRequests(); // Recarrega a lista de solicitações
        } catch (error) {
            alert(`Erro ao processar solicitação: ${error.message}`);
        }
    }
});