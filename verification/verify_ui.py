
from playwright.sync_api import sync_playwright
import time
import os

def check_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to game resolution
        context = browser.new_context(viewport={'width': 960, 'height': 540})
        page = context.new_page()

        # Load local file
        path = os.path.abspath('index.html')
        page.goto(f'file://{path}')

        # Wait for game to initialize (3 seconds wait after load)
        time.sleep(3)

        # Wait for intro cutscene or skip?
        # The intro cutscene takes about 5 seconds.
        # Let's wait 10 seconds to be safe.
        time.sleep(10)

        # Take screenshot
        page.screenshot(path='verification/ui_check.png')
        browser.close()

if __name__ == '__main__':
    check_ui()
