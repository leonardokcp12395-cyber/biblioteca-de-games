document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const token = localStorage.getItem('authToken');

    const authLinks = document.createElement('div');
    authLinks.style.position = 'absolute';
    authLinks.style.top = '10px';
    authLinks.style.right = '20px';
    authLinks.style.display = 'flex';
    authLinks.style.gap = '10px';

    if (token) {
        // Usuário está logado
        authLinks.innerHTML = `
            <a href="favorites.html" style="color: white; text-decoration: none;">Meus Favoritos</a>
            <a href="admin.html" style="color: white; text-decoration: none;">Painel Admin</a>
            <button id="logout-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 1em;">Logout</button>
        `;
        header.appendChild(authLinks);

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Você foi desconectado.');
            window.location.href = 'index.html';
        });

    } else {
        // Usuário não está logado
        authLinks.innerHTML = `
            <a href="login.html" style="color: white; text-decoration: none;">Login</a>
            <a href="register.html" style="color: white; text-decoration: none;">Registrar</a>
        `;
        header.appendChild(authLinks);
    }
});