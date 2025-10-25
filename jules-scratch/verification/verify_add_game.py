import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    # Aceita todos os alertas
    page.on("dialog", lambda dialog: dialog.accept())

    try:
        # Registrar
        print("Registrando usuário de teste...")
        page.goto("http://localhost:3000/register.html")
        page.wait_for_load_state('networkidle')
        page.fill("#username", "game_adder")
        page.fill("#password", "password123")
        page.click("button[type='submit']")
        page.wait_for_url("**/login.html", timeout=10000)
        print("Usuário registrado.")

        # Login
        print("Fazendo login...")
        page.wait_for_load_state('networkidle')
        page.fill("#username", "game_adder")
        page.fill("#password", "password123")
        page.click("button[type='submit']")
        page.wait_for_url("**/index.html", timeout=10000)
        print("Login bem-sucedido.")

        # Navegar para Admin e adicionar jogo
        print("Navegando para a página de admin...")
        page.goto("http://localhost:3000/admin.html")

        print("Preenchendo formulário de novo jogo...")
        game_title = "The Fetch Fixer"
        page.fill("#title", game_title)
        page.fill("#genre", "Debugging")
        page.fill("#description", "Um jogo sobre consertar requisições de rede.")
        page.fill("#downloadLink", "http://example.com/fixed")

        # O placeholder.png foi movido para a pasta images na raiz
        page.set_input_files("#coverImage", "images/placeholder.png")

        print("Enviando formulário...")
        page.click("#add-game-form button[type='submit']")

        # Esperar que o novo jogo apareça na lista da tabela
        print("Verificando se o jogo aparece na lista...")
        new_game_row = page.locator(f"//td[text()='{game_title}']")
        expect(new_game_row).to_be_visible(timeout=10000)

        print("Verificação bem-sucedida! O jogo foi adicionado.")
        page.screenshot(path="jules-scratch/verification/add_game_success.png")

    except Exception as e:
        print(f"Ocorreu um erro durante a verificação: {e}")
        page.screenshot(path="jules-scratch/verification/add_game_error.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)