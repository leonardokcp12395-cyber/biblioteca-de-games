document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.getElementById('nav-links');
    if (!navLinksContainer) return;

    const token = localStorage.getItem('authToken');

    if (token) {
        // Usuário está logado
        navLinksContainer.innerHTML = `
            <a href="favorites.html">Meus Favoritos</a>
            <a href="admin.html">Painel Admin</a>
            <button id="logout-btn">Logout</button>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Você foi desconectado.');
            window.location.href = 'index.html';
        });

    } else {
        // Usuário não está logado
        navLinksContainer.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Registrar</a>
        `;
    }
});