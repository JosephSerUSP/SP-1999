
from playwright.sync_api import sync_playwright

def run():
    url = 'http://localhost:8080/index.html'

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Open the game
        print(f'Navigating to {url}')
        page.goto(url)

        # Check console logs
        page.on('console', lambda msg: print(f'CONSOLE: {msg.text}'))

        # Wait for initialization
        try:
            page.wait_for_selector('div:has-text("System initialized.")', timeout=10000)
            print('Game initialized successfully')
        except Exception as e:
            print(f'Initialization check failed: {e}')

        page.screenshot(path='verification/server_test.png')
        print('Screenshot saved')

        browser.close()

if __name__ == '__main__':
    run()
