import re
import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    # Define um manipulador de alerta para aceitar todos os alertas
    page.on("dialog", lambda dialog: dialog.accept())

    try:
        # Step 1: Register and wait for the app's redirect to login
        print("Navigating to register page...")
        page.goto("http://localhost:3000/register.html")
        page.fill('input#username', "testuser_victory")
        page.fill('input#password', "password123")

        print("Submitting registration and waiting for redirect to login.html...")
        page.click('button[type="submit"]')
        page.wait_for_url("**/login.html", timeout=10000)
        print("Registration successful, redirected to login page.")

        # Step 2: Now on login page, fill form and wait for redirect to index
        print("Filling login form...")
        page.fill('input#username', "testuser_victory")
        page.fill('input#password', "password123")

        print("Submitting login and waiting for redirect to index.html...")
        page.click('button[type="submit"]')
        page.wait_for_url("**/index.html", timeout=10000)
        print("Login successful, redirected to homepage.")

        # Step 3: Now on homepage, navigate to Admin Page and verify the main heading
        print("Navigating to admin page...")
        page.goto("http://localhost:3000/admin.html")
        # CORRIGIDO: Verifica o H1, que é único e correto.
        expect(page.get_by_role("heading", name="Painel do Administrador")).to_be_visible()
        print("Admin page loaded successfully.")

        # Step 4: Add a new game
        print("Adding a new game...")
        page.fill('input[name="title"]', "The Grand Finale")
        page.fill('input[name="genre"]', "Acceptance Testing")
        page.fill('textarea[name="description"]', "The final test before victory.")
        page.fill('input[name="downloadLink"]', "http://example.com/download")
        page.set_input_files('input[name="coverImage"]', 'public/images/placeholder.png')
        page.click('#add-game-form button[type="submit"]')
        print("Add game form submitted.")
        time.sleep(2) # Wait for list to refresh

        # Step 5: Verify game is on the admin page
        print("Verifying game in admin list...")
        expect(page.locator("td:has-text('The Grand Finale')")).to_be_visible()
        print("Game found in admin list.")

        # Take screenshot of the admin page with the new game
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken.")

        # Step 6: Go back to admin and delete the game
        print("Deleting the game...")
        game_row = page.locator("tr", has=page.locator("td", has_text="The Grand Finale"))
        delete_button = game_row.locator("button.delete-btn")
        delete_button.click()
        print("Delete button clicked.")
        time.sleep(2)

        # Step 7: Verify the game is gone
        print("Verifying game is deleted...")
        expect(page.locator("td:has-text('The Grand Finale')")).not_to_be_visible()
        print("Game successfully deleted from admin list.")

        print("Verification script completed successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)