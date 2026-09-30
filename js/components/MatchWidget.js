// js/components/MatchWidget.js
import { UIComponent } from './UIComponent.js';

export class MatchWidget extends UIComponent {
    constructor(config) {
        super(config);
        this.abortController = null;
    }

    render() {
        const wrapper = super.render();

        const content = document.createElement('div');
        content.className = 'widget-content match-content';

        const list = document.createElement('ul');
        list.className = 'match-list';
        list.setAttribute('aria-live', 'polite');

        const loadingLi = document.createElement('li');
        loadingLi.textContent = 'Загрузка матчей...';
        list.appendChild(loadingLi);

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-refresh';
        refreshBtn.textContent = 'Обновить матчи';
        refreshBtn.type = 'button';

        content.append(list, refreshBtn);
        wrapper.appendChild(content);

        this.addEventListenerToElement(refreshBtn, 'click', () => this.fetchMatches(list, refreshBtn));

        this.fetchMatches(list, refreshBtn);

        return wrapper;
    }

async fetchMatches(listEl, btn) {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    btn.disabled = true;
    listEl.innerHTML = '';
    const loadingLi = document.createElement('li');
    loadingLi.textContent = 'Загрузка...';
    listEl.appendChild(loadingLi);

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await fetch('data/matches.json', {
            signal: this.abortController.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // ✅ Имитация новых матчей: перемешиваем список и меняем счёт
        const shuffled = [...data.matches].sort(() => Math.random() - 0.5);

        listEl.innerHTML = '';

        shuffled.forEach((match) => {
            const li = document.createElement('li');
            li.className = 'match-item';

            // Случайный счёт в разумных пределах
            const kills = match.kills + Math.floor(Math.random() * 10) - 5;
            const deaths = match.deaths + Math.floor(Math.random() * 6) - 3;

            const idSpan = document.createElement('span');
            idSpan.className = 'match-id';
            idSpan.textContent = `#${match.id} · ${match.map} · ${kills}/${deaths}`;

            const resultClass = match.result === 'Победа' ? 'win' : 'loss';

            const resultSpan = document.createElement('span');
            resultSpan.className = `match-result ${resultClass}`;
            resultSpan.textContent = match.result;

            li.append(idSpan, resultSpan);
            listEl.appendChild(li);
        });

    } catch (error) {
        if (error.name === 'AbortError') return;
        listEl.innerHTML = '';
        const errorLi = document.createElement('li');
        errorLi.className = 'error';
        errorLi.textContent = `Ошибка: ${error.message}`;
        listEl.appendChild(errorLi);
        console.error('❌ Match fetch error:', error);
    } finally {
        btn.disabled = false;
        this.abortController = null;
    }
}
    destroy() {
        if (this.abortController) this.abortController.abort();
        super.destroy();
    }
}