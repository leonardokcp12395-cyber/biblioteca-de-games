document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('#username').value;
            const password = registerForm.querySelector('#password').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }

                alert('Registro bem-sucedido! Agora você pode fazer login.');
                window.location.href = 'login.html';

            } catch (error) {
                alert(`Erro no registro: ${error.message}`);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('#username').value;
            const password = loginForm.querySelector('#password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }

                const { token } = await response.json();
                localStorage.setItem('authToken', token); // Salva o token

                alert('Login bem-sucedido!');
                window.location.href = 'index.html'; // Redireciona para a página principal

            } catch (error) {
                alert(`Erro no login: ${error.message}`);
            }
        });
    }
});