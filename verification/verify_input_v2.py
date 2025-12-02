
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        import os
        cwd = os.getcwd()
        page.goto(f'file://{cwd}/index.html')

        page.wait_for_selector('#ui-root')
        time.sleep(2)

        # Dismiss Cutscene
        page.keyboard.press('Enter') # OK
        time.sleep(1)

        # Now we should be free.
        # Press Tab to focus Tactics (or Squadron, logic says 'cmd' first if neither focused)
        page.keyboard.press('Tab')
        time.sleep(0.5)
        page.screenshot(path='verification/step1_tab_focus.png')

        # Navigate down to ITEM
        page.keyboard.press('ArrowDown')
        time.sleep(0.5)
        page.screenshot(path='verification/step2_nav_down.png')

        # Select ITEM -> Open Inventory
        page.keyboard.press('Enter')
        time.sleep(0.5)
        page.screenshot(path='verification/step3_inventory.png')

        browser.close()

if __name__ == '__main__':
    run()
