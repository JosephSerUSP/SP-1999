
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
        page.screenshot(path='verification/initial_submit.png')
        print('Initial screenshot taken')

        # Move Right (Should trigger animation and pacing lock)
        page.keyboard.press('ArrowRight')
        # Wait a bit for animation
        page.wait_for_timeout(300)

        # Screenshot
        page.screenshot(path='verification/move_anim_submit.png')
        print('Animation screenshot taken')

        browser.close()

if __name__ == '__main__':
    run()
