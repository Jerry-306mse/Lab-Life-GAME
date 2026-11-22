
/* Lab Life — small utilities shared by data, sim and UI. */
(function () {
  'use strict';

  const U = {};

  U.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  U.lerp = (a, b, t) => a + (b - a) * t;

  U.fmtMoney = function (n) {
    const v = Math.round(n);
    const sign = v < 0 ? '-' : '';
    return sign + '¥' + Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  U.fmtDelta = function (n) {
    if (n === 0) return '±0';
    return (n > 0 ? '+' : '') + U.fmtMoney(n);
  };

  U.fmtNum = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  U.esc = function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  U.pick = function (arr, rndFn) {
    if (!arr || !arr.length) return null;
    const r = (rndFn || U.rnd)();
    return arr[Math.min(arr.length - 1, Math.floor(r * arr.length))];
  };

  U.shuffle = function (arr, rndFn) {
    const a = arr.slice();
    const r = rndFn || U.rnd;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Deterministic RNG stored in state, so a save restores the same future rolls.
  U.rnd = function () {
    const s = window.Game && window.Game.state;
    if (!s || typeof s.rngState !== 'number') return Math.random();
    s.rngState = (Math.imul(1664525, s.rngState) + 1013904223) >>> 0;
    return s.rngState / 4294967296;
  };

  U.rand = function (a, b) {
    return a + U.rnd() * (b - a);
  };

  U.randInt = function (a, b) {
    return Math.floor(U.rand(a, b + 1));
  };

  U.chance = function (p) {
    return U.rnd() < p;
  };

  U.uid = function (prefix) {
    U._n = (U._n || 0) + 1;
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + U._n;
  };

  U.addLog = function (state, text, kind) {
    state.log.unshift({
      week: state.week,
      text: text,
      kind: kind || 'info'
    });
    if (state.log.length > 160) state.log.length = 160;
  };

  U.funds = function (state, delta, silent) {
    state.funds += Math.round(delta);
    if (!silent && delta !== 0) {
      U.addLog(state, (delta > 0 ? '经费 +' : '经费 -') + U.fmtMoney(Math.abs(delta)), delta > 0 ? 'money' : 'money_out');
    }
  };

  U.rep = function (state, delta, reason) {
    if (!delta) return;
    state.rep = Math.max(0, state.rep + delta);
    if (reason) U.addLog(state, reason + '：声望 ' + (delta > 0 ? '+' : '') + Math.round(delta), 'rep');
  };

  U.piStress = function (state, delta) {
    state.piStress = U.clamp(state.piStress + delta, 0, 100);
  };

  U.moraleAll = function (state, delta) {
    state.students.forEach(function (s) {
      if (s.status === 'active') s.morale = U.clamp(s.morale + delta, 0, 100);
    });
  };

  U.stressAll = function (state, delta) {
    state.students.forEach(function (s) {
      if (s.status === 'active') s.stress = U.clamp(s.stress + delta, 0, 100);
    });
  };

  U.fieldColor = function (field) {
    const map = {
      '生物': '#57b8a6',
      '计算': '#6f8fd6',
      '材料': '#e08a5b',
      '化学': '#c88ac8',
      '工程': '#d4b04e',
      '环境': '#7aa66a',
      '通用': '#9b8f80'
    };
    return map[field] || '#9b8f80';
  };

  U.season = function (month) {
    if (month >= 3 && month <= 5) return { key: 'spring', name: '春', color: '#7fb07a' };
    if (month >= 6 && month <= 8) return { key: 'summer', name: '夏', color: '#e3b94f' };
    if (month >= 9 && month <= 11) return { key: 'autumn', name: '秋', color: '#d57b4d' };
    return { key: 'winter', name: '冬', color: '#8fa7c4' };
  };

  U.dateOf = function (week) {
    const startMonth = 4;
    const monthIndex = (startMonth - 1 + Math.floor((week - 1) / 4)) % 12;
    const month = monthIndex + 1;
    const year = Math.floor((week - 1) / 48) + 1;
    return {
      year: year,
      month: month,
      weekOfMonth: ((week - 1) % 4) + 1,
      season: U.season(month)
    };
  };

  U.monthlyWeek = function (week) {
    return week % 4 === 0;
  };

  U.paperScore = function (p) {
    return p ? p.quality || 0 : 0;
  };

  U.RANK_MAX = 300000;
  U.RANK_SCALE = 1000;

  // Smooth world-rank curve: 0 分约第 30 万名，分数越高名次缓慢前移。
  U.rankInfo = function (score) {
    const s = Math.max(0, score || 0);
    const rank = 1 + Math.round((U.RANK_MAX - 1) * Math.exp(-s / U.RANK_SCALE));
    return U.clamp(rank, 1, U.RANK_MAX);
  };

  // 反函数：给定名次，估算该名次附近的分数。
  U.scoreForRank = function (rank) {
    const r = U.clamp(rank || U.RANK_MAX, 1, U.RANK_MAX);
    if (r <= 1) return 28000;
    return -U.RANK_SCALE * Math.log((r - 1) / (U.RANK_MAX - 1));
  };

  U.rankLabel = function (rank) {
    if (rank <= 10) return '世界前 10';
    if (rank <= 100) return '世界前 100';
    if (rank <= 1000) return '世界前 1000';
    if (rank <= 10000) return '世界前 1 万';
    if (rank <= 50000) return '世界前 5 万';
    if (rank <= 100000) return '世界前 10 万';
    if (rank <= 200000) return '世界前 20 万';
    return '世界前 30 万';
  };

  U.rankTier = function (rank) {
    if (rank <= 10) return 'legend';
    if (rank <= 100) return 'world';
    if (rank <= 1000) return 'elite';
    if (rank <= 10000) return 'rising';
    if (rank <= 50000) return 'known';
    return 'unknown';
  };

  U.deg = function (n) { return n * Math.PI / 180; };

  U.seededNoise = function (x, y, seed) {
    let n = Math.sin(x * 12.9898 + y * 78.233 + (seed || 0) * 37.719) * 43758.5453;
    return n - Math.floor(n);
  };

  U.roman = function (n) {
    const map = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return map[n - 1] || String(n);
  };

  window.LabUtil = U;
})();

