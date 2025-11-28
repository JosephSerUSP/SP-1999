
from playwright.sync_api import sync_playwright
import os

def run():
    # Get absolute path to index.html
    cwd = os.getcwd()
    file_url = f'file://{cwd}/index.html'

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Open the game
        print(f'Navigating to {file_url}')
        page.goto(file_url)

        # Wait for game to initialize (log message)
        try:
            page.wait_for_selector('div:has-text("System initialized.")', timeout=5000)
            print('Game initialized successfully')
        except Exception as e:
            print(f'Initialization check failed: {e}')

        # Wait for visual elements
        # Check for canvas
        page.wait_for_selector('#game-canvas')

        # Check for party slot
        page.wait_for_selector('.party-slot')

        # Take screenshot of initial state
        page.screenshot(path='verification/initial_state.png')
        print('Screenshot saved to verification/initial_state.png')

        # Attempt to click WAIT button to simulate a turn
        wait_btn = page.get_by_text('WAIT')
        if wait_btn.is_visible():
            wait_btn.click()
            # Wait a bit for turn processing
            page.wait_for_timeout(1000)
            page.screenshot(path='verification/after_wait.png')
            print('Screenshot saved to verification/after_wait.png')

        browser.close()

if __name__ == '__main__':
    run()
