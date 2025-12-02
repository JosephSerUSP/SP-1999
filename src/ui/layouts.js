// ============================================================================
// UI LAYOUT STRATEGIES
// ============================================================================

/**
 * Base interface for Layout Strategies.
 */
class LayoutStrategy {
    /**
     * Applies the layout logic to the container and its children.
     * @param {HTMLElement} containerEl
     * @param {UIComponent[]} children
     */
    apply(containerEl, children) {}
}

/**
 * Absolute Layout.
 * Children are positioned absolutely using top/left/right/bottom props.
 */
class AbsoluteLayout extends LayoutStrategy {
    apply(containerEl, children) {
        containerEl.style.position = 'relative';
        containerEl.style.display = 'block'; // Or whatever default

        children.forEach(child => {
            if (child.el) {
                child.el.style.position = 'absolute';
                // Assuming child props contain positioning
                // The component itself should handle applying its style props,
                // but we enforce absolute here.
            }
        });
    }
}

/**
 * Flex Layout.
 * Uses CSS Flexbox.
 */
class FlexLayout extends LayoutStrategy {
    /**
     * @param {Object} options
     * @param {string} [options.direction='row'] - row or column
     * @param {string} [options.justify='flex-start']
     * @param {string} [options.align='stretch']
     * @param {number|string} [options.gap=0]
     * @param {boolean} [options.wrap=false]
     */
    constructor(options = {}) {
        super();
        this.options = options;
    }

    apply(containerEl, children) {
        containerEl.style.display = 'flex';
        containerEl.style.flexDirection = this.options.direction || 'row';
        containerEl.style.justifyContent = this.options.justify || 'flex-start';
        containerEl.style.alignItems = this.options.align || 'stretch';
        containerEl.style.gap = (typeof this.options.gap === 'number') ? `${this.options.gap}px` : (this.options.gap || '0');
        containerEl.style.flexWrap = this.options.wrap ? 'wrap' : 'nowrap';

        // Children generally flow naturally, but we can check for 'flex' prop on children
        children.forEach(child => {
            if (child.el && child.props.flex) {
                child.el.style.flex = child.props.flex;
            }
        });
    }
}

/**
 * Grid Layout.
 * Uses CSS Grid.
 */
class GridLayout extends LayoutStrategy {
    /**
     * @param {Object} options
     * @param {number|string} [options.columns] - Number of columns or template string (e.g. '1fr 1fr')
     * @param {number|string} [options.rows]
     * @param {number|string} [options.gap=0]
     */
    constructor(options = {}) {
        super();
        this.options = options;
    }

    apply(containerEl, children) {
        containerEl.style.display = 'grid';

        const cols = this.options.columns;
        if (typeof cols === 'number') {
            containerEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        } else if (typeof cols === 'string') {
            containerEl.style.gridTemplateColumns = cols;
        }

        const rows = this.options.rows;
        if (typeof rows === 'number') {
            containerEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        } else if (typeof rows === 'string') {
            containerEl.style.gridTemplateRows = rows;
        }

        containerEl.style.gap = (typeof this.options.gap === 'number') ? `${this.options.gap}px` : (this.options.gap || '0');
    }
}
