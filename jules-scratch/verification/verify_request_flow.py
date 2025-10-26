import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    # Manipulador de diálogo para aceitar todos os alertas
    page.on("dialog", lambda dialog: dialog.accept())

    try:
        # 1. Usuário solicita um jogo
        print("Usuário está solicitando um jogo...")
        page.goto("http://localhost:3000/index.html")
        page.click("#suggest-game-btn")

        requested_game = "Super Test Bros."
        page.fill("#game-name", requested_game)
        page.click("#suggest-form button[type='submit']")
        print(f"Jogo '{requested_game}' solicitado.")

        # Espera um pouco para garantir que a solicitação seja processada
        time.sleep(1)

        # 2. Admin faz login
        print("Admin está fazendo login...")
        page.goto("http://localhost:3000/admin-login.html")
        page.fill("#username", "admin")
        page.fill("#password", "supersecretpassword")
        page.click("#admin-login-form button[type='submit']")
        page.wait_for_url("**/admin.html", timeout=10000)
        print("Login de admin bem-sucedido.")

        # 3. Admin verifica a solicitação
        print("Verificando se a solicitação aparece no painel...")
        request_row = page.locator(f"//td[text()='{requested_game}']")
        expect(request_row).to_be_visible(timeout=10000)
        print("Solicitação encontrada no painel.")

        # 4. Admin processa a solicitação
        print("Processando a solicitação...")
        request_row.locator("xpath=..").locator(".approve-btn").click()
        time.sleep(1) # Espera a lista recarregar

        # Verifica se a solicitação desapareceu
        expect(request_row).not_to_be_visible()
        print("Solicitação processada com sucesso.")

        # 5. Admin adiciona um novo jogo (verificação final)
        print("Adicionando um novo jogo para teste final...")
        page.fill("#title", "Final Check Quest")
        page.fill("#genre", "Verification")
        page.fill("#description", "O teste final.")
        page.fill("#downloadLink", "http://example.com/final")
        page.set_input_files("#coverImage", "images/placeholder.png")
        page.click("#add-game-form button[type='submit']")

        expect(page.locator("//td[text()='Final Check Quest']")).to_be_visible(timeout=10000)
        print("Novo jogo adicionado com sucesso.")

        print("Verificação completa do fluxo de ponta a ponta bem-sucedida!")
        page.screenshot(path="jules-scratch/verification/request_flow_success.png")

    except Exception as e:
        print(f"Ocorreu um erro durante a verificação: {e}")
        page.screenshot(path="jules-scratch/verification/request_flow_error.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)