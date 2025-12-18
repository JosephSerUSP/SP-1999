
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
        page.screenshot(path='verification/initial.png')
        print('Initial screenshot taken')

        # Test 1: Cycle Actors (Q/E)
        # Check initial active actor (Aya, Yellow)
        # Press 'e' (Next) -> Kyle (Blue)
        page.keyboard.press('e')
        page.wait_for_timeout(500)
        page.screenshot(path='verification/cycle_next.png')
        print('Cycle Next screenshot taken')

        # Press 'q' (Prev) -> Aya (Yellow) - wrapping around depends on index
        # Aya (0) -> E (Next) -> Kyle (1) -> Q (Prev) -> Aya (0)
        page.keyboard.press('q')
        page.wait_for_timeout(500)
        page.screenshot(path='verification/cycle_prev.png')
        print('Cycle Prev screenshot taken')

        # Test 2: Movement and Stamina
        # Move RIGHT
        page.keyboard.press('ArrowRight')
        page.wait_for_timeout(500)

        # Check if stamina decreased in UI
        # We can't easily read canvas pixels for gauge, but we can screenshot UI
        page.screenshot(path='verification/movement.png')
        print('Movement screenshot taken')

        browser.close()

if __name__ == '__main__':
    run()
