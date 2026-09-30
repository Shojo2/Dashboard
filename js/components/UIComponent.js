// js/components/UIComponent.js

export class UIComponent {
    constructor({ title, id }) {
        if (new.target === UIComponent) {
            throw new TypeError("Cannot construct UIComponent instances directly");
        }
        this.title = title;
        this.id = id;
        this.element = null;
        this.eventListeners = [];
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'widget';
        wrapper.id = this.id;
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', this.title);

        const header = document.createElement('div');
        header.className = 'widget-header';

        const titleEl = document.createElement('h3');
        titleEl.className = 'widget-title';
        titleEl.textContent = this.title;

        header.appendChild(titleEl);
        wrapper.appendChild(header);

        this.element = wrapper;
        return wrapper;
    }

    destroy() {
        this.removeAllEventListeners();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        console.log(`[Lifecycle] Widget ${this.id} destroyed.`);
    }

    addEventListenerToElement(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}