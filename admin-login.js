document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('#username').value;
            const password = loginForm.querySelector('#password').value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha no login');
                }

                const { token } = await response.json();
                localStorage.setItem('adminAuthToken', token); // Salva o token de admin

                alert('Login de administrador bem-sucedido!');
                window.location.href = 'admin.html'; // Redireciona para o painel principal

            } catch (error) {
                alert(`Erro no login: ${error.message}`);
            }
        });
    }
});