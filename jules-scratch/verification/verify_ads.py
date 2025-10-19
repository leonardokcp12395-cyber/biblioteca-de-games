from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    # Captura e imprime mensagens do console
    page.on("console", lambda msg: print(f"CONSOLE BROWSER: {msg.text}"))

    try:
        # 1. Verificar a página inicial
        print("Navegando para a página inicial...")
        page.goto("http://localhost:3000/index.html")
        expect(page.locator(".game-card")).to_have_count(1, timeout=10000)
        print("Página inicial carregada. Tirando screenshot...")
        page.screenshot(path="jules-scratch/verification/ads_index.png")

        # 2. Verificar a página de detalhes do jogo
        print("Navegando para a página de detalhes do primeiro jogo...")
        page.locator(".game-card a").first.click()
        page.wait_for_url("**/game.html?id=*", timeout=10000)
        print("Navegação para a página de detalhes concluída.")

        # Espera um pouco para o conteúdo ser renderizado
        page.wait_for_timeout(2000)

        expect(page.locator(".game-detail-header")).to_be_visible(timeout=10000)
        print("Página de detalhes carregada. Tirando screenshot...")
        page.screenshot(path="jules-scratch/verification/ads_game_detail.png")

        print("Verificação com Playwright concluída com sucesso!")

    except Exception as e:
        print(f"Ocorreu um erro durante a verificação: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)