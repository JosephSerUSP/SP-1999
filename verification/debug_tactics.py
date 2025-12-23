
from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        pwd = os.getcwd()
        page.goto(f"file://{pwd}/index.html")

        try:
            page.wait_for_selector("#cmd", timeout=5000)
        except:
             print("Timeout waiting for #cmd")
             return

        print("Focusing cmd via JS...")
        page.evaluate("window.$gameSystem.ui.focusWindow(\"cmd\")")
        page.wait_for_timeout(1000)

        classes = page.eval_on_selector("#cmd", "el => el.className")
        print(f"Focused Classes: {classes}")

        browser.close()

if __name__ == "__main__":
    run()
