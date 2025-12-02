// ============================================================================
// UI CORE FRAMEWORK
// ============================================================================

/**
 * Base class for all UI elements.
 * Handles DOM element creation, prop updates, and event binding.
 */
class UIComponent {
    /**
     * @param {Object} props - Configuration and data for the component.
     */
    constructor(props = {}) {
        this.props = props;
        this.el = null;
        this.parent = null;
        this.id = props.id || null;
    }

    /**
     * creates the DOM element. Should be overridden by subclasses.
     * @returns {HTMLElement}
     */
    create() {
        return document.createElement('div');
    }

    /**
     * Mounts the component to a parent DOM element.
     * @param {HTMLElement} parentEl - The container element.
     */
    mount(parentEl) {
        this.el = this.create();
        if (this.id) this.el.id = this.id;
        this.applyProps();
        parentEl.appendChild(this.el);
        this.onMount();
    }

    /**
     * Called after the element is mounted to the DOM.
     */
    onMount() {}

    /**
     * Updates the component with new props.
     * @param {Object} newProps
     */
    update(newProps) {
        Object.assign(this.props, newProps);
        if (this.el) {
            this.applyProps();
        }
    }

    /**
     * Applies properties to the DOM element.
     * Subclasses should call super.applyProps() or handle common attributes.
     */
    applyProps() {
        if (!this.el) return;
        if (this.props.className) this.el.className = this.props.className;
        if (this.props.style) Object.assign(this.el.style, this.props.style);
        if (this.props.onClick) this.el.onclick = this.props.onClick;
        if (this.props.onMouseEnter) this.el.onmouseenter = this.props.onMouseEnter;
        if (this.props.onMouseLeave) this.el.onmouseleave = this.props.onMouseLeave;
    }

    /**
     * Removes the component from the DOM and cleans up.
     */
    destroy() {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.el = null;
    }
}

/**
 * A container component that manages child components and applies a layout strategy.
 */
class UIContainer extends UIComponent {
    constructor(props = {}) {
        super(props);
        this.children = [];
        this.layout = props.layout || null; // LayoutStrategy
    }

    create() {
        const div = document.createElement('div');
        // Containers usually don't have visual styles unless specified
        return div;
    }

    /**
     * Adds a child component to this container.
     * @param {UIComponent} component
     */
    add(component) {
        this.children.push(component);
        component.parent = this;
        if (this.el) {
            component.mount(this.el);
            this.refreshLayout();
        }
    }

    /**
     * Removes a child component.
     * @param {UIComponent} component
     */
    remove(component) {
        const idx = this.children.indexOf(component);
        if (idx > -1) {
            this.children.splice(idx, 1);
            component.destroy();
            component.parent = null;
            this.refreshLayout();
        }
    }

    /**
     * clears all children.
     */
    clear() {
        this.children.forEach(c => c.destroy());
        this.children = [];
    }

    onMount() {
        this.children.forEach(c => c.mount(this.el));
        this.refreshLayout();
    }

    refreshLayout() {
        if (this.layout && this.el) {
            this.layout.apply(this.el, this.children);
        }
    }

    update(props) {
        super.update(props);
        if (props.layout) {
            this.layout = props.layout;
            this.refreshLayout();
        }
    }
}

/**
 * Base class for all Windows.
 * Manages the "window" shell (header, content) and the root UIContainer.
 */
class Window_Base {
    /**
     * @param {string} id - HTML ID for the window.
     * @param {Object} rect - Position and size {top, left, width, height...}
     * @param {string} title - Window title.
     */
    constructor(id, rect, title) {
        this.id = id;
        this.rect = rect;
        this.title = title;
        this.visible = false;

        // The DOM shell
        this.el = null;
        this.contentEl = null;
        this.headerEl = null;

        // The Root Container
        this.root = new UIContainer({
            layout: null // To be defined by defineLayout
        });

        this.createWindowShell();
    }

    createWindowShell() {
        this.el = document.createElement('div');
        this.el.id = this.id;
        this.el.className = 'pe-window';
        Object.assign(this.el.style, this.rect);
        this.el.style.display = 'none'; // Start hidden

        if (this.title) {
            this.headerEl = document.createElement('div');
            this.headerEl.className = 'pe-header';
            this.headerEl.innerText = this.title;
            // Add close button if needed, but usually handled by modals
            this.el.appendChild(this.headerEl);
        }

        this.contentEl = document.createElement('div');
        this.contentEl.className = 'pe-content';
        this.el.appendChild(this.contentEl);

        document.getElementById('ui-root').appendChild(this.el);
    }

    /**
     * Defines the layout blueprint. Should be overridden.
     * @returns {Object} Blueprint object.
     */
    defineLayout() {
        return {
            type: 'container',
            layout: null,
            children: []
        };
    }

    /**
     * Rebuilds the UI based on the blueprint.
     */
    refresh() {
        // Clear existing children in root
        this.root.clear();

        // Use existing root container, but we need to mount it to contentEl if not already
        if (!this.root.el) {
            this.root.mount(this.contentEl);
            // Containers usually default to div, ensure it fills content
            this.root.el.style.width = '100%';
            this.root.el.style.height = '100%';
        }

        const blueprint = this.defineLayout();
        this.buildFromBlueprint(this.root, blueprint);
    }

    /**
     * Recursively builds components from a blueprint.
     * @param {UIContainer} parentContainer
     * @param {Object} def - The blueprint definition.
     */
    buildFromBlueprint(parentContainer, def) {
        if (!def) return;

        // Apply properties to the container itself if provided in root
        if (parentContainer === this.root) {
            if (def.layout) parentContainer.update({ layout: def.layout });
            // Root children
            if (def.children) {
                def.children.forEach(childDef => this.buildFromBlueprint(parentContainer, childDef));
            }
            return;
        }

        // Standard Component Creation
        let component;
        if (def.type === 'container') {
            component = new UIContainer(def.props || {});
            if (def.layout) component.update({ layout: def.layout });
            if (def.children) {
                def.children.forEach(childDef => this.buildFromBlueprint(component, childDef));
            }
        } else if (def.component) {
            // Instantiate component class
            const ComponentClass = def.component;
            component = new ComponentClass(def.props || {});
        }

        if (component) {
            parentContainer.add(component);
        }
    }

    show() {
        this.el.style.display = 'block';
        this.visible = true;
        this.refresh(); // Refresh on show to ensure up-to-date data
    }

    hide() {
        this.el.style.display = 'none';
        this.visible = false;
    }

    close() {
        this.hide();
        // Optional: Destroy DOM if we want to save memory/DOM nodes
        // But keeping them is fine for persistent windows.
        // For modals, we might want to destroy.
    }

    destroy() {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.root.destroy();
    }
}
