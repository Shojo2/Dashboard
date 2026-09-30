// js/components/StatsWidget.js
import { UIComponent } from './UIComponent.js';

export class StatsWidget extends UIComponent {
    constructor(config) {
        super(config);
        this.abortController = null;
    }

    render() {
        const wrapper = super.render();

        const content = document.createElement('div');
        content.className = 'widget-content stats-content';

        const info = document.createElement('div');
        info.className = 'stats-info';

        const kdP = document.createElement('p');
        kdP.innerHTML = '<strong>K/D:</strong> <span class="stats-kd">—</span>';

        const killsP = document.createElement('p');
        killsP.innerHTML = '<strong>Убийств:</strong> <span class="stats-kills">—</span>';

        const deathsP = document.createElement('p');
        deathsP.innerHTML = '<strong>Смертей:</strong> <span class="stats-deaths">—</span>';

        const weaponP = document.createElement('p');
        weaponP.innerHTML = '<strong>Любимое оружие:</strong> <span class="stats-weapon">—</span>';

        const winrateP = document.createElement('p');
        winrateP.innerHTML = '<strong>Шанс победы:</strong> <span class="stats-winrate">—</span>';

        info.append(kdP, killsP, deathsP, weaponP, winrateP);

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-refresh';
        refreshBtn.textContent = 'Обновить статистику';
        refreshBtn.type = 'button';

        content.append(info, refreshBtn);
        wrapper.appendChild(content);

        const kdEl = content.querySelector('.stats-kd');
        const killsEl = content.querySelector('.stats-kills');
        const deathsEl = content.querySelector('.stats-deaths');
        const weaponEl = content.querySelector('.stats-weapon');
        const winrateEl = content.querySelector('.stats-winrate');

        this.addEventListenerToElement(refreshBtn, 'click', () => {
            this.fetchStats(kdEl, killsEl, deathsEl, weaponEl, winrateEl, refreshBtn);
        });

        this.fetchStats(kdEl, killsEl, deathsEl, weaponEl, winrateEl, refreshBtn);

        return wrapper;
    }

async fetchStats(kdEl, killsEl, deathsEl, weaponEl, winrateEl, btn) {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    btn.disabled = true;
    kdEl.textContent = '—';
    killsEl.textContent = '—';
    deathsEl.textContent = '—';
    weaponEl.textContent = '—';
    winrateEl.textContent = '—';

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await fetch('data/stats.json', {
            signal: this.abortController.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const s = data.stats;

        // ✅ Имитация свежих данных: прибавляем случайное число к базовым
        const extraKills = Math.floor(Math.random() * 30);         // 0–29
        const extraDeaths = Math.floor(Math.random() * 15);        // 0–14
        const kills = s.kills + extraKills;
        const deaths = s.deaths + extraDeaths;

        // Небольшая вариация процента побед: ±3%
        const winRate = (s.winRate + (Math.random() * 6 - 3)).toFixed(1);

        // Случайное любимое оружие из списка weaponKills
        const weapons = Object.keys(s.weaponKills);
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];

        const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);

        kdEl.textContent = kd;
        killsEl.textContent = kills;
        deathsEl.textContent = deaths;
        weaponEl.textContent = weapon;
        winrateEl.textContent = `${winRate}%`;

        kdEl.classList.remove('kd-good', 'kd-bad');
        if (parseFloat(kd) >= 1.2) kdEl.classList.add('kd-good');
        else if (parseFloat(kd) < 1.0) kdEl.classList.add('kd-bad');

    } catch (error) {
        if (error.name === 'AbortError') return;
        kdEl.textContent = `Ошибка: ${error.message}`;
        console.error('❌ Stats fetch error:', error);
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