
from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        pwd = os.getcwd()
        page.goto(f'file://{pwd}/index.html')

        try:
            page.wait_for_selector('.cmd-btn', timeout=5000)
        except:
             print('Timeout waiting for .cmd-btn')
             return

        height = page.eval_on_selector('.cmd-btn', 'el => window.getComputedStyle(el).height')
        print(f'Button Height: {height}')

        browser.close()

if __name__ == '__main__':
    run()
