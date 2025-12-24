// ============================================================================
// WINDOW: LOG
// ============================================================================

class Window_Log extends Window_Base {
    constructor(mmW) {
        // Position at Top Left (2%, 220px)
        // We override standard window shell creation to make it transparent
        // Moved down further to approx 220px to leave room for Help window
        super('log', { position: 'absolute', top: '64px', left: '2%', width: '30%', height: 'auto', zIndex: '10000' }, null);

        // Remove standard window classes and styling
        this.el.classList.remove('pe-window');
        this.el.style.border = 'none';
        this.el.style.background = 'transparent';
        this.el.style.boxShadow = 'none';
        this.el.style.pointerEvents = 'none'; // Click through
        this.el.style.overflow = 'visible';

        // Remove Header/Content structure
        this.el.innerHTML = '';

        // Create a custom container for lines
        this.container = document.createElement('div');
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.gap = '4px';
        this.container.style.width = '100%';
        this.container.style.alignItems = 'flex-start'; // Align lines to left
        this.el.appendChild(this.container);

        this.lines = []; // Array of { el, timeout }

        // Subscribe directly to log updates
        EventBus.on('log_updated', (payload) => this.addLog(payload));

        // Ensure visibility immediately
        this.show();
    }

    // Override default layout/refresh mechanism
    defineLayout() { return null; }
    refresh() { }

    show() {
        this.el.style.display = 'block';
        this.visible = true;
    }

    addLog(payload) {
        if (!payload) return;

        let text = "";
        let type = "system";

        if (typeof payload === 'string') {
            text = payload;
        } else {
            text = payload.text;
            type = payload.type || 'system';
        }

        const emojis = {
            system: '⚙️',
            combat: '⚔️',
            exploration: '🗺️',
            item: '📦',
            status: '✨',
            warning: '⚠️',
            growth: '⏫'
        };

        const emoji = emojis[type] || '⚙️';
        const fullText = `${emoji} ${text}`;

        const lineEl = document.createElement('div');
        lineEl.className = 'log-line';
        lineEl.textContent = fullText;

        // Add to container (Newest at top)
        this.container.prepend(lineEl);

        // Data object
        const lineObj = {
            el: lineEl,
            timeout: setTimeout(() => this.removeLog(lineObj), 5000) // Duration: 5s
        };

        // Add to start of array
        this.lines.unshift(lineObj);

        // Limit to 13 lines
        if (this.lines.length > 13) {
            const oldest = this.lines.pop();
            this.removeLog(oldest, true);
        }
    }

    removeLog(lineObj, immediate = false) {
        if (!lineObj.el.parentNode) return;

        clearTimeout(lineObj.timeout);

        if (immediate) {
             lineObj.el.remove();
        } else {
             lineObj.el.classList.add('log-line-exit');
             lineObj.el.addEventListener('animationend', () => {
                 if (lineObj.el.parentNode) lineObj.el.remove();
                 const idx = this.lines.indexOf(lineObj);
                 if (idx > -1) this.lines.splice(idx, 1);
             });
        }
    }
}
