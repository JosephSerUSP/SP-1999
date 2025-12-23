
from playwright.sync_api import sync_playwright
import os

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Open the index.html file using absolute path
        cwd = os.getcwd()
        page.goto(f'file://{cwd}/index.html')

        # Wait for the UI to load
        page.wait_for_selector('#ui-root', state='visible', timeout=5000)
        page.wait_for_selector('#game-view-container', state='visible', timeout=5000)

        # Take a screenshot
        page.screenshot(path='verification/ui_overhaul.png')
        browser.close()

if __name__ == '__main__':
    verify_ui()
