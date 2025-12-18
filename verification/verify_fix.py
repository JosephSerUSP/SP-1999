
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 960, 'height': 540})
        page = context.new_page()

        # Load index.html directly from file
        import os
        cwd = os.getcwd()
        page.goto(f'file://{cwd}/index.html')

        # Wait for game to initialize
        page.wait_for_timeout(2000)

        # Take initial screenshot
        page.screenshot(path='verification/initial_fix.png')
        print('Initial screenshot taken')

        # Cycle actors to verify new mapping
        # We previously tested Q/E, let's assume those still work (since mapping array includes them)
        # We just want to ensure logic still holds.
        page.keyboard.press('e')
        page.wait_for_timeout(500)
        page.screenshot(path='verification/cycle_next_fix.png')

        browser.close()

if __name__ == '__main__':
    run()
