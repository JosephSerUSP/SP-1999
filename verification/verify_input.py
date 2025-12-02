
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Load the index file directly (no server needed for this simple setup if CORS isn't an issue, otherwise use http.server)
        # Using file protocol
        import os
        cwd = os.getcwd()
        page.goto(f'file://{cwd}/index.html')

        # Wait for initialization (system log)
        page.wait_for_selector('#ui-root')
        time.sleep(1) # Allow animations

        # Screenshot 1: Initial state
        page.screenshot(path='verification/initial.png')

        # Test Keyboard Navigation to Menu
        # Press Tab (mapped to MENU) to focus Tactics
        page.keyboard.press('Tab')
        time.sleep(0.5)
        page.screenshot(path='verification/menu_focus.png')

        # Navigate Down in Menu
        page.keyboard.press('ArrowDown')
        time.sleep(0.2)
        page.screenshot(path='verification/menu_nav.png')

        # Open Inventory (Second item usually? Wait, TACTICS has WAIT, ITEM, HR, SKILLS)
        # ITEM is second button. So ArrowDown once should be ITEM.
        page.keyboard.press('Enter')
        time.sleep(0.5)
        page.screenshot(path='verification/inventory_modal.png')

        # Navigate in Inventory
        page.keyboard.press('ArrowDown')
        time.sleep(0.2)
        page.screenshot(path='verification/inventory_nav.png')

        browser.close()

if __name__ == '__main__':
    run()
