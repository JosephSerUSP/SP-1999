
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 720})

        print("Loading game...")
        try:
            await page.goto("http://localhost:8080/index.html")
        except Exception as e:
            print(f"Error loading page: {e}")
            return

        try:
            await page.wait_for_selector("#app-container", timeout=5000)
        except:
            print("Timed out waiting for app-container")
            await page.screenshot(path="verification/timeout.png")
            return

        print("Dismissing cutscenes...")
        for i in range(10):
            await page.mouse.click(480, 270)
            await page.keyboard.press("Enter")
            await asyncio.sleep(0.1)

        print("Waiting for animations to finish (5s)...")
        await asyncio.sleep(5)

        # Check status before (Using try-catch in eval to be safe)
        print("Checking status before...")
        status = await page.evaluate("""() => {
            try {
                return {
                    focused: (typeof UI !== 'undefined' && UI.focusedWindow) ? UI.focusedWindow : 'undefined',
                    busy: (typeof $gameSystem !== 'undefined') ? $gameSystem.isBusy : 'undefined',
                    animating: (typeof Renderer !== 'undefined') ? Renderer.isAnimating : 'undefined'
                };
            } catch(e) { return { error: e.toString() }; }
        }""")
        print(f"Status before Tab: {status}")

        print("Pressing Tab...")
        await page.keyboard.press("Tab")
        await asyncio.sleep(1.0)

        # Check status after
        status_after = await page.evaluate("""() => {
             try {
                return {
                    focused: (typeof UI !== 'undefined' && UI.focusedWindow) ? UI.focusedWindow : 'undefined'
                };
            } catch(e) { return { error: e.toString() }; }
        }""")
        print(f"Status after Tab: {status_after}")

        # Check DOM
        focused_el = await page.query_selector(".focused")
        if focused_el:
            text = await focused_el.inner_text()
            print(f"SUCCESS: Found focused element: '{text}'")
        elif status_after.get('focused') == 'tactics':
            print("SUCCESS: Tactics menu focused (internal state verified).")
        else:
            print("FAILURE: Tactics menu NOT focused.")

        await page.screenshot(path="verification/verify_fix_result.png")
        print("Screenshot saved.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
