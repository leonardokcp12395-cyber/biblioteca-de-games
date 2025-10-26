import time
import random
import string
from playwright.sync_api import sync_playwright

def random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    page.on("dialog", lambda dialog: dialog.accept())

    try:
        test_email = f"token_getter_{random_string()}@example.com"
        test_password = "password123"

        # Registrar
        page.goto("http://localhost:3000/register.html")
        page.fill("#email", test_email)
        page.fill("#password", test_password)
        page.click("button[type='submit']")
        page.wait_for_url("**/login.html")

        # Login
        page.fill("#email", test_email)
        page.fill("#password", test_password)
        page.click("button[type='submit']")
        page.wait_for_url("**/index.html")

        # Obter e imprimir o token
        token = page.evaluate("() => localStorage.getItem('firebaseIdToken')")
        print("--- INÍCIO DO TOKEN DO FIREBASE ---")
        print(token)
        print("--- FIM DO TOKEN DO FIREBASE ---")

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)