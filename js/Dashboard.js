// js/Dashboard.js
import { PlayerWidget } from './components/PlayerWidget.js';
import { MatchWidget } from './components/MatchWidget.js';
import { StatsWidget } from './components/StatsWidget.js';

export class Dashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error('Container not found');
        this.widgets = [];
        this.dragState = null;

        this.setupDragAndDrop();

        window.addEventListener('resize', () => this.clampAllWidgets());
    }

    /* ==========================================================
       ПЕРЕТАСКИВАНИЕ (за заголовок)
       ========================================================== */
    setupDragAndDrop() {
        this.container.addEventListener('mousedown', (e) => this.onDragStart(e));
        this.container.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: false });
    }

    onDragStart(e) {
        const header = e.target.closest('.widget-header');
        if (!header) return;
        if (e.target.closest('.widget-close-btn')) return;

        const widget = header.closest('.widget');
        if (!widget) return;

        const point = this.getPoint(e);
        const rect = widget.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        const offsetX = point.x - rect.left;
        const offsetY = point.y - rect.top;

        this.dragState = {
            widget,
            offsetX,
            offsetY,
            containerWidth: this.container.clientWidth,
            containerHeight: this.container.clientHeight,
            widgetWidth: rect.width,
            widgetHeight: rect.height
        };

        widget.classList.add('is-dragging');
        this.container.appendChild(widget);

        this.boundDragMove = (ev) => this.onDragMove(ev);
        this.boundDragEnd = (ev) => this.onDragEnd(ev);

        document.addEventListener('mousemove', this.boundDragMove);
        document.addEventListener('mouseup', this.boundDragEnd);
        document.addEventListener('touchmove', this.boundDragMove, { passive: false });
        document.addEventListener('touchend', this.boundDragEnd);

        e.preventDefault();
    }

    onDragMove(e) {
        if (!this.dragState) return;
        const point = this.getPoint(e);
        const s = this.dragState;
        const containerRect = this.container.getBoundingClientRect();

        let newLeft = point.x - s.offsetX - containerRect.left;
        let newTop = point.y - s.offsetY - containerRect.top;

        newLeft = Math.max(0, Math.min(newLeft, s.containerWidth - s.widgetWidth));
        newTop = Math.max(0, Math.min(newTop, s.containerHeight - s.widgetHeight));

        s.widget.style.left = `${newLeft}px`;
        s.widget.style.top = `${newTop}px`;

        e.preventDefault();
    }

    onDragEnd() {
        if (!this.dragState) return;
        this.dragState.widget.classList.remove('is-dragging');

        document.removeEventListener('mousemove', this.boundDragMove);
        document.removeEventListener('mouseup', this.boundDragEnd);
        document.removeEventListener('touchmove', this.boundDragMove);
        document.removeEventListener('touchend', this.boundDragEnd);

        this.dragState = null;
    }

    /* ==========================================================
       УТИЛИТЫ
       ========================================================== */
    getPoint(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    clampAllWidgets() {
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;

        this.widgets.forEach(widget => {
            if (!widget.element) return;
            const left = parseFloat(widget.element.style.left) || 0;
            const top = parseFloat(widget.element.style.top) || 0;
            const w = widget.element.offsetWidth;
            const h = widget.element.offsetHeight;

            const clampedLeft = Math.max(0, Math.min(left, containerWidth - w));
            const clampedTop = Math.max(0, Math.min(top, containerHeight - h));

            if (clampedLeft !== left) widget.element.style.left = `${clampedLeft}px`;
            if (clampedTop !== top) widget.element.style.top = `${clampedTop}px`;
        });
    }

    findFreePosition(width, height) {
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        const padding = 20;
        const step = 40;

        for (let top = padding; top + height < containerHeight; top += step) {
            for (let left = padding; left + width < containerWidth; left += step) {
                const overlaps = this.widgets.some(w => {
                    const wLeft = parseFloat(w.element?.style?.left);
                    const wTop = parseFloat(w.element?.style?.top);
                    if (isNaN(wLeft) || isNaN(wTop)) return false;

                    const wW = w.element.offsetWidth || 340;
                    const wH = w.element.offsetHeight || 260;

                    return !(
                        left + width + padding < wLeft ||
                        left > wLeft + wW + padding ||
                        top + height + padding < wTop ||
                        top > wTop + wH + padding
                    );
                });

                if (!overlaps) return { left, top };
            }
        }

        // Каскад, если места нет
        const offset = this.widgets.length * 40;
        return {
            left: Math.min(padding + offset, Math.max(padding, containerWidth - width - padding)),
            top: Math.min(padding + offset, Math.max(padding, containerHeight - height - padding))
        };
    }

    /* ==========================================================
       ДОБАВЛЕНИЕ / УДАЛЕНИЕ
       ========================================================== */
    addWidget(widgetType) {
        const id = `widget-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let widget = null;

        switch (widgetType) {
            case 'player':
                widget = new PlayerWidget({ title: 'Профиль игрока', id });
                break;
            case 'match':
                widget = new MatchWidget({ title: 'Последние матчи', id });
                break;
            case 'stats':                                              // ← НОВОЕ
                widget = new StatsWidget({ title: 'Статистика', id });
                break;
            default:
                console.error(`Unknown widget type: ${widgetType}`);
                return;
        }

        if (!widget) return;
        this.widgets.push(widget);
        const element = widget.render();

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.className = 'widget-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Закрыть виджет');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeWidget(widget.id);
        });

        const header = element.querySelector('.widget-header');
        if (header) header.appendChild(closeBtn);

        // Добавляем в контейнер
        this.container.appendChild(element);

        // Позиционируем
        const w = element.offsetWidth || 340;
        const h = element.offsetHeight || 260;
        const pos = this.findFreePosition(w, h);
        element.style.left = `${pos.left}px`;
        element.style.top = `${pos.top}px`;
    }

    removeWidget(widgetId) {
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index !== -1) {
            const widget = this.widgets[index];
            widget.destroy();
            this.widgets.splice(index, 1);
        }
    }
}