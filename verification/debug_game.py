
from playwright.sync_api import sync_playwright
import os

def run():
    cwd = os.getcwd()
    file_url = f'file://{cwd}/index.html'

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Open the game
        print(f'Navigating to {file_url}')
        page.goto(file_url)

        # Check console logs
        page.on('console', lambda msg: print(f'CONSOLE: {msg.text}'))

        page.wait_for_timeout(5000)

        browser.close()

if __name__ == '__main__':
    run()
