
from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        pwd = os.getcwd()
        page.goto(f"file://{pwd}/index.html")

        # Wait for #cmd to appear (it is created by Window_Tactics constructor)
        try:
            page.wait_for_selector("#cmd", timeout=5000)
        except:
             print("Timeout waiting for #cmd")
             page.screenshot(path="verification/error.png")
             return

        # 1. Default State
        page.screenshot(path="verification/1_default.png")

        # 2. Press Tab (MENU) -> Should Open Cmd
        page.keyboard.press("Tab")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/2_tab_pressed.png")

        browser.close()

if __name__ == "__main__":
    run()
