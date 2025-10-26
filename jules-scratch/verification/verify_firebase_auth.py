import time
import random
import string
from playwright.sync_api import sync_playwright, expect

def random_string(length=10):
    """Gera uma string aleatória para o email para garantir que seja único."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    # Manipulador de diálogo para aceitar todos os alertas
    page.on("dialog", lambda dialog: dialog.accept())

    try:
        # Gera um email único para o teste
        test_email = f"testuser_{random_string()}@example.com"
        test_password = "password123"

        # 1. Registrar com Firebase
        print(f"Registrando novo usuário com email: {test_email}")
        page.goto("http://localhost:3000/register.html")
        page.fill("#email", test_email)
        page.fill("#password", test_password)
        page.click("button[type='submit']")
        page.wait_for_url("**/login.html", timeout=15000)
        print("Registro bem-sucedido, redirecionado para o login.")

        # 2. Login com Firebase
        print("Fazendo login com o novo usuário...")
        page.fill("#email", test_email)
        page.fill("#password", test_password)
        page.click("button[type='submit']")
        page.wait_for_url("**/index.html", timeout=15000)
        print("Login bem-sucedido, redirecionado para a página inicial.")

        # 3. Verificar se o token do Firebase foi salvo
        token = page.evaluate("() => localStorage.getItem('firebaseIdToken')")
        assert token is not None, "O token do Firebase não foi encontrado no localStorage."
        print("Token do Firebase encontrado no localStorage.")

        # 4. Adicionar um jogo
        print("Navegando para a página de administração...")
        page.goto("http://localhost:3000/admin.html")

        game_title = "Firebase Fortress"
        print(f"Adicionando o jogo: {game_title}")
        page.fill("#title", game_title)
        page.fill("#genre", "Authentication")
        page.fill("#description", "Um jogo protegido pela autenticação do Firebase.")
        page.fill("#downloadLink", "http://example.com/firebase-auth")
        # A etapa de upload de arquivo foi removida para o teste simplificado
        page.click("#add-game-form button[type='submit']")

        # 5. Verificar se o jogo aparece na lista
        print("Verificando se o jogo aparece na lista...")
        new_game_row = page.locator(f"//td[text()='{game_title}']")
        expect(new_game_row).to_be_visible(timeout=10000)

        print("Verificação de ponta a ponta com Firebase concluída com sucesso!")
        page.screenshot(path="jules-scratch/verification/firebase_success.png")

    except Exception as e:
        print(f"Ocorreu um erro durante a verificação com Firebase: {e}")
        page.screenshot(path="jules-scratch/verification/firebase_error.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)