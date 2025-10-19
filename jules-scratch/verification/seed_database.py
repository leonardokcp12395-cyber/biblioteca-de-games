import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    # Manipulador de diálogo genérico para aceitar todos os alertas
    page.on("dialog", lambda dialog: dialog.accept())

    try:
        # Registrar um novo usuário
        print("Registrando um usuário para popular o banco...")
        page.goto("http://localhost:3000/register.html")
        page.fill("#username", "ad_verifier_final")
        page.fill("#password", "password123")
        page.click("button[type='submit']")

        # O manipulador 'on' cuidará do alerta, então apenas esperamos pela navegação
        page.wait_for_url("**/login.html", timeout=10000)
        print("Usuário registrado.")

        # Fazer login
        print("Fazendo login...")
        page.fill("#username", "ad_verifier_final")
        page.fill("#password", "password123")
        page.click("button[type='submit']")
        page.wait_for_url("**/index.html", timeout=10000)
        print("Login bem-sucedido.")

        # Navegar para a página de admin e adicionar um jogo
        print("Adicionando um jogo de teste...")
        page.goto("http://localhost:3000/admin.html")
        page.fill('#title', "Ad Test Game")
        page.fill('#genre', "Verification")
        page.fill('#description', "Um jogo para testar anúncios.")
        page.fill('#downloadLink', "http://example.com/download")
        page.set_input_files('#coverImage', 'public/images/placeholder.png')
        page.click('#add-game-form button[type="submit"]')
        time.sleep(2) # Espera o jogo ser adicionado
        print("Jogo de teste adicionado com sucesso.")

    except Exception as e:
        print(f"Ocorreu um erro ao popular o banco de dados: {e}")
        page.screenshot(path="jules-scratch/verification/seed_error.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)