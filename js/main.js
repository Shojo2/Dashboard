// js/main.js
import { Dashboard } from './Dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM загружен, инициализация Dashboard...');

    const gridElement = document.getElementById('dashboard-grid');
    if (!gridElement) {
        console.error('❌ Не найден элемент #dashboard-grid');
        return;
    }

    const dashboard = new Dashboard('dashboard-grid');

    const btnAddPlayer = document.getElementById('add-player-btn');
    const btnAddMatch = document.getElementById('add-match-btn');
    const btnAddStats = document.getElementById('add-stats-btn');   // ← НОВОЕ

    if (btnAddPlayer) {
        btnAddPlayer.addEventListener('click', () => dashboard.addWidget('player'));
    }
    if (btnAddMatch) {
        btnAddMatch.addEventListener('click', () => dashboard.addWidget('match'));
    }
    if (btnAddStats) {                                              // ← НОВОЕ
        btnAddStats.addEventListener('click', () => dashboard.addWidget('stats'));
    }
});