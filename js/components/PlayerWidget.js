// js/components/PlayerWidget.js
import { UIComponent } from './UIComponent.js';

export class PlayerWidget extends UIComponent {
    constructor(config) {
        super(config);
        this.abortController = null;
    }

    render() {
        const wrapper = super.render();

        const content = document.createElement('div');
        content.className = 'widget-content player-content';

        const info = document.createElement('div');
        info.className = 'player-info';

        const nameP = document.createElement('p');
        nameP.innerHTML = '<strong>Имя:</strong> <span class="player-name">Загрузка...</span>';

        const levelP = document.createElement('p');
        levelP.innerHTML = '<strong>Уровень:</strong> <span class="player-level">-</span>';

        const rankP = document.createElement('p');
        rankP.innerHTML = '<strong>Ранг:</strong> <span class="player-rank">-</span>';

        info.append(nameP, levelP, rankP);

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-refresh';
        refreshBtn.textContent = 'Обновить профиль';
        refreshBtn.type = 'button';

        content.append(info, refreshBtn);
        wrapper.appendChild(content);

        const nameEl = content.querySelector('.player-name');
        const levelEl = content.querySelector('.player-level');
        const rankEl = content.querySelector('.player-rank');

        this.addEventListenerToElement(refreshBtn, 'click', () => {
            this.fetchPlayerData(nameEl, levelEl, rankEl, refreshBtn);
        });

        this.fetchPlayerData(nameEl, levelEl, rankEl, refreshBtn);

        return wrapper;
    }

async fetchPlayerData(nameEl, levelEl, rankEl, btn) {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    btn.disabled = true;
    nameEl.textContent = 'Загрузка...';
    levelEl.textContent = '—';
    rankEl.textContent = '—';

    try {
        // Небольшая задержка, чтобы состояние "Загрузка..." было видно
        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await fetch('data/players.json', {
            signal: this.abortController.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // Выбираем случайного игрока из массива
        const player = data.results[Math.floor(Math.random() * data.results.length)];

        // ✅ Так как name — строка, используем напрямую
        nameEl.textContent = player.name;
        levelEl.textContent = player.level;
        rankEl.textContent = player.rank;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Player fetch aborted');
        } else {
            nameEl.textContent = `Ошибка: ${error.message}`;
            levelEl.textContent = '—';
            rankEl.textContent = '—';
            console.error('❌ Player fetch error:', error);
        }
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