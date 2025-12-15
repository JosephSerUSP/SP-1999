from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Set viewport to match app container
        page.set_viewport_size({"width": 960, "height": 540})

        try:
            print("Navigating to app...")
            page.goto("http://localhost:8000/index.html")

            # Wait for the Squadron window (Window_Party) to be visible
            print("Waiting for UI...")
            # Window_Party uses class .pe-window and title 'SQUADRON'
            # We can look for the text 'SQUADRON'
            page.wait_for_selector("text=SQUADRON", state="visible", timeout=10000)

            # Allow some time for animations (e.g. fade ins)
            page.wait_for_timeout(2000)

            # Screenshot main view
            print("Taking main screenshot...")
            page.screenshot(path="verification/ui_main.png")

            # Open Inventory
            # We can execute JS to trigger it
            print("Opening Inventory...")
            page.evaluate("$gameSystem.ui.showInventoryModal()")

            # Wait for inventory modal
            page.wait_for_selector("text=INVENTORY", state="visible")
            page.wait_for_timeout(1000)

            print("Taking inventory screenshot...")
            page.screenshot(path="verification/ui_inventory.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui()
