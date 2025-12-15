// ============================================================================
// UI COMPONENT LIBRARY
// ============================================================================

/**
 * Simple text label.
 */
class Label extends UIComponent {
    create() {
        const el = document.createElement('div');
        el.className = 'ui-label';
        return el;
    }

    applyProps() {
        super.applyProps();
        if (this.props.text !== undefined) this.el.innerText = this.props.text;
        if (this.props.html !== undefined) this.el.innerHTML = this.props.html;
        if (this.props.color) this.el.style.color = this.props.color;
        if (this.props.align) this.el.style.textAlign = this.props.align;
        if (this.props.fontSize) this.el.style.fontSize = typeof this.props.fontSize === 'number' ? this.props.fontSize + 'px' : this.props.fontSize;
        if (this.props.fontWeight) this.el.style.fontWeight = this.props.fontWeight;
        if (this.props.className) this.el.classList.add(...this.props.className.split(' '));
    }
}

/**
 * Interactive Button.
 */
class Button extends UIComponent {
    create() {
        const el = document.createElement('button'); // Or div if we want full custom style
        el.className = 'cmd-btn'; // Reuse existing class for consistency
        return el;
    }

    applyProps() {
        super.applyProps();
        if (this.props.label) {
            this.el.innerText = this.props.label;
            if (this.props.subLabel) {
                this.el.innerHTML = `<span>${this.props.label}</span><span style="font-size:10px; opacity:0.7; margin-left: 5px;">${this.props.subLabel}</span>`;
            }
        }
        if (this.props.disabled) {
            this.el.classList.add('disabled');
            this.el.disabled = true;
        } else {
            this.el.classList.remove('disabled');
            this.el.disabled = false;
        }
        if (this.props.className) {
            this.el.classList.add(...this.props.className.split(' '));
        }
    }
}

/**
 * Visual Gauge (Bar).
 */
class Gauge extends UIComponent {
    create() {
        const el = document.createElement('div');
        el.className = 'ui-gauge';
        // Inline styles for base sizing
        el.style.width = '100%';
        el.style.height = this.props.height || '4px';
        el.style.backgroundColor = 'rgba(0,0,0,0.5)';
        el.style.border = '1px solid rgba(255,255,255,0.1)';
        el.style.marginTop = '2px';
        el.style.position = 'relative';

        const fill = document.createElement('div');
        fill.className = 'ui-gauge-fill';
        fill.style.height = '100%';
        fill.style.width = '0%';
        fill.style.transition = 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        fill.style.boxShadow = '0 0 5px currentColor';
        el.appendChild(fill);

        this.fillEl = fill;
        return el;
    }

    applyProps() {
        super.applyProps();
        if (this.fillEl) {
            const pct = Math.max(0, Math.min(100, this.props.percent || 0));
            this.fillEl.style.width = `${pct}%`;
            // If color is a variable, we can't easily use currentColor for shadow unless we set it on color property
            // So we set background color explicitly
            const color = this.props.color || '#fff';
            this.fillEl.style.backgroundColor = color;
            this.fillEl.style.color = color; // For currentColor shadow
        }
    }
}

/**
 * Separator Line.
 */
class Separator extends UIComponent {
    create() {
        const el = document.createElement('div');
        el.style.height = '1px';
        el.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)';
        el.style.margin = '8px 0';
        return el;
    }
}

/**
 * A generic box with border/padding for grouping.
 */
class Box extends UIContainer {
    create() {
        const el = document.createElement('div');
        el.style.border = '1px solid #333';
        el.style.padding = '5px';
        el.style.background = 'rgba(0,0,0,0.2)';
        return el;
    }
}
