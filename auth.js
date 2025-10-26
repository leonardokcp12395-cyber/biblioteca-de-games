import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    // --- Lógica de Registro com Firebase ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerForm.querySelector('#email').value;
            const password = registerForm.querySelector('#password').value;

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                alert('Registro bem-sucedido! Agora você pode fazer login.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error("Erro no registro com Firebase:", error);
                alert(`Erro no registro: ${error.message}`);
            }
        });
    }

    // --- Lógica de Login com Firebase ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('#email').value;
            const password = loginForm.querySelector('#password').value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Pega o token de ID do Firebase
                const idToken = await user.getIdToken();

                // Salva o token no localStorage para usar em requisições ao nosso backend
                localStorage.setItem('firebaseIdToken', idToken);

                alert('Login bem-sucedido!');
                window.location.href = 'index.html';

            } catch (error) {
                console.error("Erro no login com Firebase:", error);
                alert(`Erro no login: ${error.message}`);
            }
        });
    }
});