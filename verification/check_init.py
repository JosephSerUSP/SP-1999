
from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on('console', lambda msg: print(f'CONSOLE: {msg.text}'))

        pwd = os.getcwd()
        page.goto(f'file://{pwd}/index.html')
        page.wait_for_timeout(2000)

        browser.close()

if __name__ == '__main__':
    run()
