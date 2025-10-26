document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.getElementById('nav-links');
    if (!navLinksContainer) return;

    // Como não há mais login de usuário, a navegação é sempre a mesma.
    // O link para o painel de admin não será exibido aqui para segurança.
    // O admin acessará sua página de login por uma URL direta.
    navLinksContainer.innerHTML = `
        <a href="index.html">Início</a>
        <!-- Outros links públicos podem ser adicionados aqui no futuro -->
    `;
});