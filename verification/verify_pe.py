import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load index.html
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Wait for initialization (SceneManager.init logs "System initialized.")
        # But wait, there is an intro cutscene immediately on Map Setup (Floor 1).
        # "Dec 24, 1997. Carnegie Hall."

        # Check for cutscene text
        page.wait_for_selector("#cutscene-overlay", state="visible")

        # Take a screenshot of the intro
        page.screenshot(path="verification/intro.png")
        print("Intro screenshot taken.")

        # Click through cutscene (3 clicks needed for 3 dialogs + log)
        # Dialog 1: NARRATOR
        page.click("#cutscene-overlay")
        page.wait_for_timeout(500)
        # Dialog 2: AYA
        page.click("#cutscene-overlay")
        page.wait_for_timeout(500)
        # Dialog 3: KYLE
        page.click("#cutscene-overlay")
        page.wait_for_timeout(500)
        # Dialog 4: Log "Mission: Pursuit" is automatic? No, cutscene queue.
        # Check logs

        # After cutscene ends, overlay should be hidden
        page.wait_for_selector("#cutscene-overlay", state="hidden")

        # Check Logs in UI
        # UI_Window content usually has logs? No, logs are in $gameSystem.logHistory but displayed where?
        # UIManager might have a log window.

        # Take a screenshot of gameplay
        page.screenshot(path="verification/gameplay.png")
        print("Gameplay screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
