
from playwright.sync_api import sync_playwright

def verify_log_position():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Open the index.html file directly
        page.goto('file:///app/index.html')

        # Wait for the log to appear (it shows immediately in constructor)
        page.wait_for_selector('#log')

        # Evaluate the computed style of the log element
        log_top = page.evaluate("""
            () => {
                const el = document.getElementById('log');
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return {
                    top: style.top,
                    position: style.position,
                    rectTop: rect.top
                };
            }
        """)

        print(f'Log Position: {log_top}')

        # Take a screenshot
        page.screenshot(path='verification/log_position.png')

        browser.close()

if __name__ == '__main__':
    verify_log_position()
