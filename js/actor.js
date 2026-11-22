
/* Lab Life — isometric 3D district renderer.
   World coordinates are tiles. Rendering is 2.5D with extruded boxes and depth sorting. */
(function () {
  'use strict';
  const TW = 76, TH = 38;
  const OX = 480, OY = 82;
  const COLORS = {
    ink: '#1b1724', ink2: '#2b2633', paper: '#e9dfc8', cream: '#f7f1e1',
    teal: '#57b8a6', tealDark: '#2f7f78', gold: '#d4b04e', coral: '#e76f51', blue: '#6f8fd6'
  };

  function project(x, y, z) {
    return { x: OX + (x - y) * TW / 2, y: OY + (x + y) * TH / 2 - (z || 0) * TH * 1.5 };
  }
  function unproject(sx, sy) {
    const dx = (sx - OX) / (TW / 2);
    const dy = (sy - OY) / (TH / 2);
    return { x: (dx + dy) / 2, y: (dy - dx) / 2 };
  }
  function poly(c, pts, fill, stroke, lw) {
    if (!pts.length) return;
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); }
  }
  function tint(hex, t) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) + t)));
    const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) + t)));
    const b = Math.max(0, Math.min(255, Math.round((n & 255) + t)));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  const BASE = {
    w: 12, d: 9, indoor: true,
    floor: ['#9a8063', '#a78b6d'],
    wall: '#cfc7b8', wallSide: '#b8ae9c',
    spawn: { x: 6.2, y: 7.4, facing: 'up' }
  };

  const SCENES = {
    tech: Object.assign({}, BASE, {
      name: '科技处', indoor: true,
      props: [
        { type: 'counter', x: 4.1, y: 2.5, w: 5.3, d: 1.15, h: 1.1, color: '#8b6b4e', top: '#a98a68', solid: true, action: 'placeActivity', place: 'tech', label: '科技处窗口', id: 'tech-counter' },
        { type: 'board', x: 4.8, y: 0.35, w: 4.2, d: 0.16, h: 2.25, color: '#3a3030', top: '#e9dfc8', solid: true, action: 'placeActivity', place: 'tech', label: '项目指南板', id: 'tech-board' },
        { type: 'shelf', x: 10.2, y: 1.1, w: 1.2, d: 2.1, h: 2.4, color: '#4f5b58', top: '#6d7a71', solid: true },
        { type: 'desk', x: 1.2, y: 2.5, w: 1.8, d: 1.0, h: 0.85, color: '#8b6b4e', top: '#a98a68', solid: true },
        { type: 'rug', x: 4.6, y: 4.9, w: 3.7, d: 2.2, color: '#6f4a55' },
        { type: 'cabinet', x: 8.5, y: 1.0, w: 1.2, d: 1.1, h: 1.7, color: '#4f5b58', top: '#6d7a71', solid: true },
        { type: 'clock', x: 2.6, y: 0.18, w: 0.8, d: 0.1, h: 1.8, color: '#3a3030', top: '#e9dfc8' },
        { type: 'picture', x: 7.5, y: 0.18, w: 0.9, d: 0.1, h: 1.7, color: '#3a3030', top: '#b06a8a' },
        { type: 'plant', x: 1.2, y: 4.6, w: 0.8, d: 0.8, h: 1.0, color: '#6f543d', top: '#6fa66a', solid: true },
        { type: 'npc', x: 6.7, y: 2.0, w: 0.6, d: 0.6, h: 1.75, look: 'clerk', label: '窗口老师' }
      ]
    }),
    market: Object.assign({}, BASE, {
      name: '校外市场', indoor: false,
      props: [
        { type: 'stall', x: 1.5, y: 2.6, w: 3.0, d: 1.35, h: 1.35, color: '#b06a8a', top: '#e9dfc8', solid: true, action: 'placeActivity', place: 'market', label: '旧货摊', id: 'market-stall-a' },
        { type: 'stall', x: 7.4, y: 2.6, w: 3.0, d: 1.35, h: 1.35, color: '#57b8a6', top: '#e9dfc8', solid: true, action: 'placeActivity', place: 'market', label: '湖边货摊', id: 'market-stall-b' },
        { type: 'crate', x: 2.0, y: 5.4, w: 0.9, d: 0.9, h: 0.7, color: '#8b6b4e', top: '#a98a68', solid: true },
        { type: 'crate', x: 3.0, y: 5.4, w: 0.9, d: 0.9, h: 0.55, color: '#8b6b4e', top: '#a98a68', solid: true },
        { type: 'barrel', x: 9.8, y: 5.8, w: 0.7, d: 0.7, h: 0.8, color: '#6f543d', top: '#8b6b4e', solid: true },
        { type: 'tree', x: 0.6, y: 6.4, w: 1.2, d: 1.2, h: 2.0, color: '#5b4633', top: '#4f7f52', solid: true },
        { type: 'plant', x: 10.8, y: 5.0, w: 0.8, d: 0.8, h: 1.0, color: '#6f543d', top: '#6fa66a', solid: true },
        { type: 'npc', x: 6.0, y: 4.1, w: 0.6, d: 0.6, h: 1.7, look: 'vendor', label: '摊主' }
      ]
    }),
    delivery: Object.assign({}, BASE, {
      name: '外卖站', indoor: true,
      props: [
        { type: 'counter', x: 4.0, y: 2.4, w: 5.2, d: 1.0, h: 1.0, color: '#4e5258', top: '#777a7e', solid: true, action: 'placeActivity', place: 'delivery', label: '取餐窗口', id: 'delivery-counter' },
        { type: 'board', x: 4.7, y: 0.35, w: 4.0, d: 0.16, h: 2.1, color: '#2b2633', top: '#e9dfc8', solid: true, action: 'placeActivity', place: 'delivery', label: '外卖接单板', id: 'delivery-board' },
        { type: 'bike', x: 1.2, y: 3.0, w: 1.3, d: 0.7, h: 0.9, color: '#d8d2c4', top: '#777a7e', solid: true },
        { type: 'bike', x: 2.6, y: 3.0, w: 1.3, d: 0.7, h: 0.9, color: '#d8d2c4', top: '#777a7e', solid: true },
        { type: 'scooter', x: 9.0, y: 4.2, w: 1.2, d: 0.8, h: 1.0, color: '#b06a8a', top: '#d08aa8', solid: true },
        { type: 'crate', x: 9.0, y: 5.4, w: 0.9, d: 0.9, h: 0.7, color: '#a98a68', top: '#c0a17c', solid: true },
        { type: 'locker', x: 10.6, y: 1.2, w: 1.0, d: 1.2, h: 1.9, color: '#4e5258', top: '#777a7e', solid: true },
        { type: 'clock', x: 3.7, y: 0.18, w: 0.7, d: 0.1, h: 1.6, color: '#3a3030', top: '#e9dfc8' },
        { type: 'cone', x: 8.2, y: 6.8, w: 0.45, d: 0.45, h: 0.5, color: '#e08a5b', top: '#f4ead6' },
        { type: 'cone', x: 8.9, y: 6.8, w: 0.45, d: 0.45, h: 0.5, color: '#e08a5b', top: '#f4ead6' },
        { type: 'npc', x: 6.6, y: 1.7, w: 0.6, d: 0.6, h: 1.7, look: 'courier', label: '调度员' }
      ]
    }),
    lake: {
      w: 14, d: 10, indoor: false,
      floor: ['#6f8f62', '#799a6b'],
      wall: '#8fb6c9', wallSide: '#6d8a62',
      spawn: { x: 7.2, y: 8.2, facing: 'up' },
      water: { x: 0.6, y: 0.8, w: 12.8, h: 4.2 },
      props: [
        { type: 'dock', x: 5.4, y: 3.8, w: 4.1, d: 4.5, h: 0.18, color: '#6f543d', top: '#8b6b4e', solid: false },
        { type: 'boat', x: 2.2, y: 3.4, w: 2.2, d: 1.0, h: 0.55, color: '#8b6b4e', top: '#d8c7a8', solid: true },
        { type: 'shop', x: 9.2, y: 7.1, w: 2.7, d: 1.7, h: 2.0, color: '#4f5b58', top: '#c9bda3', solid: true, action: 'placeActivity', place: 'market', label: '湖边小店', id: 'lake-shop' },
        { type: 'fishing', x: 7.4, y: 5.4, w: 0.8, d: 0.8, h: 0.3, color: '#d4b04e', top: '#f2e4c8', solid: false, action: 'placeActivity', place: 'lake', label: '钓鱼点', id: 'lake-fish' },
        { type: 'reeds', x: 1.4, y: 5.2, w: 1.2, d: 0.7, h: 1.0, color: '#3f5a3a', top: '#6fa66a', solid: false },
        { type: 'reeds', x: 11.8, y: 4.9, w: 1.0, d: 0.7, h: 1.0, color: '#3f5a3a', top: '#6fa66a', solid: false },
        { type: 'tree', x: 12.0, y: 7.2, w: 1.1, d: 1.1, h: 2.2, color: '#5b4633', top: '#4f7f52', solid: true },
        { type: 'rock', x: 1.8, y: 7.8, w: 0.8, d: 0.7, h: 0.55, color: '#6d7a71', top: '#8b968a', solid: true },
        { type: 'bench', x: 2.2, y: 8.6, w: 1.8, d: 0.6, h: 0.45, color: '#6f543d', top: '#8b6b4e', solid: true },
        { type: 'lantern', x: 5.2, y: 6.9, w: 0.3, d: 0.3, h: 1.5, color: '#3a3030', top: '#d4b04e' },
        { type: 'npc', x: 10.4, y: 8.4, w: 0.6, d: 0.6, h: 1.65, look: 'angler', label: '钓鱼人' }
      ]
    }
  };

  function config(state) { return SCENES[state.scene] || null; }

  function isWater(cfg, x, y) {
    if (!cfg.water) return false;
    const w = cfg.water;
    if (x < w.x || x > w.x + w.w || y < w.y || y > w.y + w.h) return false;
    // the dock is a walkable bridge over the water
    if (x > 5.4 && x < 9.5 && y > 3.8) return false;
    return true;
  }

  function obstacles(state) {
    const cfg = config(state);
    if (!cfg) return [];
    return cfg.props.filter(p => p.solid).map(p => ({ x: p.x, y: p.y, w: p.w, h: p.d }));
  }

  function isWalkable(state, x, y) {
    const cfg = config(state);
    if (!cfg) return false;
    const r = 0.38;
    if (x < r + 0.2 || x > cfg.w - r - 0.2 || y < r + 0.2 || y > cfg.d - r - 0.2) return false;
    if (isWater(cfg, x, y) || isWater(cfg, x + r, y) || isWater(cfg, x - r, y) || isWater(cfg, x, y + r) || isWater(cfg, x, y - r)) return false;
    const obs = obstacles(state);
    for (let i = 0; i < obs.length; i++) {
      const o = obs[i];
      if (x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h) return false;
    }
    return true;
  }

  function findPath(state, sx, sy, tx, ty) {
    const cfg = config(state);
    if (!cfg) return null;
    const step = 0.25;
    const cols = Math.ceil(cfg.w / step), rows = Math.ceil(cfg.d / step);
    const cell = (v) => Math.max(1, Math.min((v / step) | 0, (v > 0 ? 1 : 0)));
    const cx0 = Math.max(1, Math.min(cols - 2, Math.floor(sx / step)));
    const cy0 = Math.max(1, Math.min(rows - 2, Math.floor(sy / step)));
    let gx = Math.max(1, Math.min(cols - 2, Math.floor(tx / step)));
    let gy = Math.max(1, Math.min(rows - 2, Math.floor(ty / step)));
    const center = (cx, cy) => ({ x: cx * step + step / 2, y: cy * step + step / 2 });
    if (!isWalkable(state, center(gx, gy).x, center(gx, gy).y)) {
      let best = null, bd = 1e9;
      for (let cy = 1; cy < rows - 1; cy++) for (let cx = 1; cx < cols - 1; cx++) {
        const p = center(cx, cy);
        if (!isWalkable(state, p.x, p.y)) continue;
        const d = Math.hypot(p.x - tx, p.y - ty);
        if (d < bd) { bd = d; best = { cx, cy }; }
      }
      if (!best) return null;
      gx = best.cx; gy = best.cy;
    }
    const idx = (cx, cy) => cy * cols + cx;
    const start = idx(cx0, cy0), goal = idx(gx, gy);
    const q = [start], seen = new Set([start]), prev = new Map();
    let found = false;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    while (q.length) {
      const cur = q.shift();
      const cx = cur % cols, cy = (cur / cols) | 0;
      if (cur === goal) { found = true; break; }
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 1 || ny < 1 || nx >= cols - 1 || ny >= rows - 1) continue;
        const p = center(nx, ny);
        if (!isWalkable(state, p.x, p.y)) continue;
        const ni = idx(nx, ny);
        if (seen.has(ni)) continue;
        seen.add(ni); prev.set(ni, cur); q.push(ni);
      }
    }
    if (!found) return null;
    const pts = [];
    let cur = goal;
    while (cur !== start) {
      const cx = cur % cols, cy = (cur / cols) | 0;
      pts.unshift(center(cx, cy));
      cur = prev.get(cur);
      if (cur == null) break;
    }
    pts.push(isWalkable(state, tx, ty) ? { x: tx, y: ty } : center(gx, gy));
    return pts;
  }

  function nearestWalkable(state, x, y) {
    if (isWalkable(state, x, y)) return { x, y };
    for (let r = 0.2; r <= 3; r += 0.2) {
      for (let a = 0; a < 20; a++) {
        const ang = a / 20 * Math.PI * 2;
        const nx = x + Math.cos(ang) * r, ny = y + Math.sin(ang) * r;
        if (isWalkable(state, nx, ny)) return { x: nx, y: ny };
      }
    }
    return null;
  }

  function approachPoint(state, obj, fromX, fromY) {
    const candidates = [
      { x: obj.ax, y: obj.ay },
      { x: obj.ax, y: obj.ay + 0.7 },
      { x: obj.ax - 0.8, y: obj.ay + 0.5 },
      { x: obj.ax + 0.8, y: obj.ay + 0.5 }
    ];
    let best = null, bd = 1e9;
    candidates.forEach(p => {
      if (!isWalkable(state, p.x, p.y)) return;
      const d = Math.hypot(p.x - fromX, p.y - fromY);
      if (d < bd) { bd = d; best = p; }
    });
    return best || nearestWalkable(state, obj.ax, obj.ay + 1);
  }

  function getInteractables(state) {
    const cfg = config(state);
    if (!cfg) return [];
    const list = [{ id: 'place-exit', label: '回到实验室', hint: '离开这里', action: 'leaveScene', x: 0.6, y: 8.4, w: 0.8, d: 0.8, ax: 1.0, ay: 8.4, radius: 1.6 }];
    cfg.props.forEach(p => {
      if (!p.action && p.type !== 'npc') return;
      list.push({
        id: p.id || p.type + '-' + p.x + '-' + p.y,
        label: p.label || p.type,
        hint: p.type === 'npc' ? '和对方聊聊' : '靠近交互',
        action: p.action || 'talkNpc',
        place: p.place,
        npc: p.type === 'npc' ? p : null,
        x: p.x, y: p.y, w: p.w, d: p.d,
        ax: p.x + p.w / 2, ay: p.y + p.d + 0.35,
        radius: 1.7
      });
    });
    return list;
  }

  function hitTest(state, wx, wy) {
    const list = getInteractables(state);
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i];
      if (Math.hypot(wx - o.ax, wy - o.ay) < (o.radius || 1.4) * 0.9) return o;
    }
    return null;
  }

  function drawBox(c, p, cfg) {
    const z = p.h || 0.8;
    const a = project(p.x, p.y, 0), b = project(p.x + p.w, p.y, 0), c1 = project(p.x + p.w, p.y + p.d, 0), d1 = project(p.x, p.y + p.d, 0);
    const at = project(p.x, p.y, z), bt = project(p.x + p.w, p.y, z), ct = project(p.x + p.w, p.y + p.d, z), dt = project(p.x, p.y + p.d, z);
    // shadow
    poly(c, [a, b, c1, d1], 'rgba(10,8,16,.18)');
    // side faces
    poly(c, [d1, c1, ct, dt], tint(p.color, -24));
    poly(c, [b, c1, ct, bt], tint(p.color, -10));
    // top
    poly(c, [at, bt, ct, dt], p.top || tint(p.color, 28), '#1b1724', 2);
    poly(c, [d1, c1, ct, dt], null, 'rgba(20,15,25,.55)', 1.5);
    poly(c, [b, c1, ct, bt], null, 'rgba(20,15,25,.45)', 1.5);
    // top highlight
    poly(c, [at, bt, ct, dt], null, 'rgba(255,240,210,.16)', 1);
  }

  function drawPlant(c, p) {
    const base = project(p.x + p.w / 2, p.y + p.d / 2, 0);
    poly(c, [project(p.x, p.y, 0), project(p.x + p.w, p.y, 0), project(p.x + p.w, p.y + p.d, 0), project(p.x, p.y + p.d, 0)], 'rgba(10,8,16,.16)');
    c.fillStyle = p.color; c.fillRect(base.x - 13, base.y - 26, 26, 26);
    c.fillStyle = p.top; c.fillRect(base.x - 10, base.y - 23, 20, 6);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = i % 2 ? '#6fa66a' : '#4f7f52';
      c.fillRect(base.x - 18 + (i * 9) % 27, base.y - 54 - (i % 3) * 10, 12, 18);
    }
  }

  function drawCharacter(c, x, y, state, npc, t) {
    const p = project(x, y, 0);
    const bob = Math.round(Math.sin(t * 2.2 + (npc ? 1.3 : 0)) * 1.2);
    const px = Math.round(p.x), py = Math.round(p.y) + bob;
    const look = state.look || {};
    const skin = npc ? (npc.look === 'vendor' ? '#b9825d' : '#d9a878') : (look.skin || '#e8b98c');
    const hair = npc ? '#3a2e2a' : (look.hair || '#241f25');
    const coat = npc ? (npc.look === 'clerk' ? '#ddd3c0' : npc.look === 'courier' ? '#4e5258' : '#d4b04e') : (look.coat || '#f8f2e2');
    const accent = npc ? '#5b8fb9' : (look.accent || '#57b8a6');
    const moving = !npc && state.player.moving;
    const stride = moving ? Math.round(Math.sin(t * 11) * 4) : 0;
    const facing = npc ? 'down' : (state.player.facing || 'down');
    const sideView = facing === 'left' || facing === 'right';
    // shadow
    c.fillStyle = 'rgba(10,8,16,.28)';
    c.beginPath(); c.ellipse(px, py + 3, 23, 8, 0, 0, Math.PI * 2); c.fill();
    // legs
    c.fillStyle = '#2a2734';
    c.fillRect(px - 12 + (stride > 0 ? 2 : 0), py - 18, 9, 20);
    c.fillRect(px + 3 + (stride < 0 ? 2 : 0), py - 18, 9, 20);
    c.fillStyle = '#17141d';
    c.fillRect(px - 14 + (stride > 0 ? 2 : 0), py - 2, 12, 5);
    c.fillRect(px + 3 + (stride < 0 ? 2 : 0), py - 2, 12, 5);
    // arms behind / beside coat
    c.fillStyle = '#1b1724'; c.fillRect(px - 23, py - 51, 9, 34); c.fillRect(px + 14, py - 51, 9, 34);
    c.fillStyle = coat; c.fillRect(px - 21, py - 49, 6, 30); c.fillRect(px + 15, py - 49, 6, 30);
    c.fillStyle = skin; c.fillRect(px - 21, py - 20, 6, 6); c.fillRect(px + 15, py - 20, 6, 6);
    // coat
    c.fillStyle = '#1b1724'; c.fillRect(px - 18, py - 55, 36, 40);
    c.fillStyle = coat; c.fillRect(px - 15, py - 52, 30, 36);
    c.fillStyle = tint(coat, -16); c.fillRect(px - 15, py - 22, 30, 6);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(px - 15, py - 52, 30, 3);
    // shirt / lanyard
    c.fillStyle = accent; c.fillRect(px - 6, py - 52, 12, 24);
    c.fillStyle = tint(accent, 30); c.fillRect(px - 3, py - 50, 4, 12);
    c.fillStyle = tint(coat, -22); c.fillRect(px - 12, py - 44, 6, 2);
    // head
    c.fillStyle = '#1b1724'; c.fillRect(px - 15, py - 84, 30, 32);
    c.fillStyle = skin; c.fillRect(px - 12, py - 81, 24, 27);
    c.fillStyle = tint(skin, 24); c.fillRect(px - 12, py - 81, 24, 4);
    c.fillStyle = 'rgba(100,60,40,.16)'; c.fillRect(px - 12, py - 57, 24, 2);
    // hair silhouette stays the same for every direction
    c.fillStyle = hair; c.fillRect(px - 16, py - 88, 32, 18);
    c.fillStyle = tint(hair, 22); c.fillRect(px - 12, py - 90, 20, 5);
    c.fillRect(px - 18, py - 74, 5, 16); c.fillRect(px + 13, py - 74, 5, 16);
    if (!npc && look.style === 'long') { c.fillRect(px - 18, py - 58, 5, 18); c.fillRect(px + 13, py - 58, 5, 18); }
    if (!npc && look.style === 'bun') { c.fillRect(px - 7, py - 96, 14, 9); c.fillStyle = tint(hair, 25); c.fillRect(px - 4, py - 94, 8, 3); }
    if (!npc && look.style === 'curly') { c.fillRect(px - 20, py - 86, 8, 8); c.fillRect(px + 12, py - 86, 8, 8); }
    // eyes / mouth (profile shifts them to the facing side)
    const eyeShift = sideView ? (facing === 'left' ? -5 : 5) : 0;
    c.fillStyle = '#1b1724'; c.fillRect(px - 9 + eyeShift, py - 69, 5, 4); c.fillRect(px + 4 + eyeShift, py - 69, 5, 4);
    c.fillStyle = '#fff6df'; c.fillRect(px - 9 + eyeShift, py - 69, 2, 2); c.fillRect(px + 4 + eyeShift, py - 69, 2, 2);
    if (!npc && look.glasses) {
      c.strokeStyle = '#1b1724'; c.lineWidth = 2;
      c.strokeRect(px - 11 + eyeShift, py - 71, 8, 7); c.strokeRect(px + 3 + eyeShift, py - 71, 8, 7);
    }
    c.fillStyle = 'rgba(120,70,50,.55)'; c.fillRect(px - 6 + eyeShift, py - 58, 12, 2);
    // badge
    c.fillStyle = '#f7f1e1'; c.fillRect(px + 9, py - 48, 7, 10);
    c.fillStyle = accent; c.fillRect(px + 11, py - 46, 3, 4);
    if (npc) {
      c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(px - 14, py - 47, 7, 3);
    }
  }

  function drawRug(c, p) {
    const pts = [
      project(p.x, p.y, 0.02), project(p.x + p.w, p.y, 0.02),
      project(p.x + p.w, p.y + p.d, 0.02), project(p.x, p.y + p.d, 0.02)
    ];
    poly(c, pts, p.color, '#2b2633', 2);
    const inner = [
      project(p.x + 0.25, p.y + 0.2, 0.03), project(p.x + p.w - 0.25, p.y + 0.2, 0.03),
      project(p.x + p.w - 0.25, p.y + p.d - 0.2, 0.03), project(p.x + 0.25, p.y + p.d - 0.2, 0.03)
    ];
    poly(c, inner, tint(p.color, 18), 'rgba(255,240,210,.25)', 1);
    const center = project(p.x + p.w / 2, p.y + p.d / 2, 0.04);
    c.strokeStyle = 'rgba(255,230,180,.4)'; c.lineWidth = 2;
    c.strokeRect(center.x - 18, center.y - 6, 36, 12);
  }

  function drawTree(c, p) {
    const base = project(p.x + p.w / 2, p.y + p.d / 2, 0);
    c.fillStyle = 'rgba(10,8,16,.2)'; c.beginPath(); c.ellipse(base.x, base.y + 2, 30, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = p.color; c.fillRect(base.x - 8, base.y - 64, 16, 64);
    c.fillStyle = tint(p.color, 18); c.fillRect(base.x - 6, base.y - 62, 5, 50);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = i % 2 ? p.top : tint(p.top, -14);
      c.beginPath(); c.arc(base.x - 24 + (i * 11) % 52, base.y - 64 - (i % 3) * 14, 17, 0, Math.PI * 2); c.fill();
    }
  }

  function drawWater(c, cfg, t) {
    const w = cfg.water;
    for (let y = Math.floor(w.y); y < w.y + w.h; y += 1) {
      for (let x = Math.floor(w.x); x < w.x + w.w; x += 1) {
        if (isWater(cfg, x + 0.5, y + 0.5) === false) continue;
        const p0 = project(x, y, 0), p1 = project(x + 1, y, 0), p2 = project(x + 1, y + 1, 0), p3 = project(x, y + 1, 0);
        poly(c, [p0, p1, p2, p3], (x + y) % 2 ? '#3b6f78' : '#40777f');
        const ph = Math.sin(t * 0.8 + x * 0.6 + y * 0.3);
        c.strokeStyle = 'rgba(205,235,225,.22)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(p0.x + 14 + ph * 5, p0.y + 12); c.lineTo(p2.x - 12 + ph * 5, p2.y - 10); c.stroke();
      }
    }
  }

  function draw(canvas, state, t, ui) {
    const cfg = config(state);
    if (!cfg) return null;
    if (canvas.width !== 960 || canvas.height !== 580) { canvas.width = 960; canvas.height = 580; }
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, 960, 580);
    // sky / backdrop
    const sky = c.createLinearGradient(0, 0, 0, 580);
    sky.addColorStop(0, cfg.indoor ? '#252b3a' : '#6f8ea6');
    sky.addColorStop(0.45, cfg.indoor ? '#3a3a48' : '#c6a37a');
    sky.addColorStop(1, cfg.indoor ? '#1b1724' : '#5b6b5a');
    c.fillStyle = sky; c.fillRect(0, 0, 960, 580);
    // distant panels for indoor
    if (cfg.indoor) {
      for (let i = 0; i < 8; i++) {
        c.fillStyle = i % 2 ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.025)';
        c.fillRect(0, 80 + i * 60, 960, 30);
      }
    }
    // floor tiles
    for (let y = 0; y < cfg.d; y++) {
      for (let x = 0; x < cfg.w; x++) {
        if (isWater(cfg, x + 0.5, y + 0.5)) continue;
        const pts = [project(x, y, 0), project(x + 1, y, 0), project(x + 1, y + 1, 0), project(x, y + 1, 0)];
        poly(c, pts, (x + y) % 2 ? cfg.floor[0] : cfg.floor[1], 'rgba(30,24,20,.16)', 1);
        // tile grain / planks
        const g = project(x + 0.5, y + 0.5, 0);
        c.fillStyle = (x * 7 + y * 11) % 5 === 0 ? 'rgba(255,240,210,.12)' : 'rgba(34,26,20,.09)';
        c.fillRect(g.x - 22, g.y - 4, 44, 2);
        c.fillRect(g.x - 14, g.y + 4, 28, 1);
        if ((x * 13 + y * 7) % 11 === 0) {
          c.fillStyle = 'rgba(30,20,18,.12)';
          c.beginPath(); c.ellipse(g.x + 6, g.y + 2, 9, 3, 0, 0, Math.PI * 2); c.fill();
        }
      }
    }
    // water
    if (cfg.water) drawWater(c, cfg, t);
    // back walls for indoor
    if (cfg.indoor) {
      const h = 3.2;
      const w0 = project(0, 0, 0), w1 = project(cfg.w, 0, 0), w2 = project(cfg.w, 0, h), w3 = project(0, 0, h);
      poly(c, [w0, w1, w2, w3], cfg.wall, '#1b1724', 2);
      poly(c, [w0, project(0, cfg.d, 0), project(0, cfg.d, h), w3], cfg.wallSide, '#1b1724', 2);
      // wall panels / windows
      for (let i = 0; i < 5; i++) {
        const a = project(0.8 + i * 2.1, 0, 1.0), b = project(0.8 + i * 2.1 + 1.4, 0, 1.0);
        const at = project(0.8 + i * 2.1, 0, 2.4), bt = project(0.8 + i * 2.1 + 1.4, 0, 2.4);
        poly(c, [a, b, bt, at], i % 2 ? '#5b6b7a' : '#415161', '#1b1724', 2);
        c.fillStyle = 'rgba(255,235,180,.18)'; c.fillRect(a.x + 4, a.y - 20, 30, 12);
        c.fillStyle = 'rgba(255,245,210,.3)';
        for (let k = 0; k < 5; k++) c.fillRect(a.x + 7 + k * 9, a.y - 28 + (k % 2) * 8, 2, 2);
      }
      // baseboards and wall trim
      const b0 = project(0, 0, 0.22), b1 = project(cfg.w, 0, 0.22);
      c.strokeStyle = 'rgba(240,230,205,.45)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(b0.x, b0.y); c.lineTo(b1.x, b1.y); c.stroke();
      const s0 = project(0, 0, 0.22), s1 = project(0, cfg.d, 0.22);
      c.beginPath(); c.moveTo(s0.x, s0.y); c.lineTo(s1.x, s1.y); c.stroke();
      // ceiling lamps and warm pools
      for (let i = 0; i < 4; i++) {
        const lp = project(1.5 + i * 2.7, 1.1, 3.0);
        c.fillStyle = '#e9dfc8'; c.fillRect(lp.x - 18, lp.y, 36, 5);
        const lg = c.createRadialGradient(lp.x, lp.y + 6, 2, lp.x, lp.y + 6, 64);
        lg.addColorStop(0, 'rgba(255,225,150,.18)'); lg.addColorStop(1, 'rgba(255,225,150,0)');
        c.fillStyle = lg; c.fillRect(lp.x - 64, lp.y - 50, 128, 128);
      }
    } else {
      // outdoor horizon / city silhouette
      for (let i = 0; i < 12; i++) {
        const h = 40 + (i * 31) % 80;
        c.fillStyle = 'rgba(30,42,58,.55)';
        c.fillRect(70 + i * 70, 190 - h, 50, h);
      }
    }
    // floor rugs are below every object
    cfg.props.filter(p => p.type === 'rug').forEach(p => drawRug(c, p));
    // depth-sorted props + player
    const drawables = cfg.props.filter(p => p.type !== 'rug').map(p => ({ p, key: p.x + p.y + (p.d || 0) / 2 }));
    drawables.push({ player: true, key: state.player.x + state.player.y });
    drawables.sort((a, b) => a.key - b.key);
    drawables.forEach(d => {
      if (d.player) {
        drawCharacter(c, state.player.x, state.player.y, state, null, t);
        return;
      }
      const p = d.p;
      if (p.type === 'npc') {
        drawCharacter(c, p.x + p.w / 2, p.y + p.d / 2, state, p, t);
      } else if (p.type === 'plant') {
        drawPlant(c, p);
      } else if (p.type === 'tree') {
        drawTree(c, p);
      } else if (p.type === 'reeds') {
        const b = project(p.x + p.w / 2, p.y + p.d / 2, 0);
        for (let i = 0; i < 10; i++) {
          c.fillStyle = i % 2 ? '#5e8a5e' : '#6fa66a';
          c.fillRect(b.x - 22 + (i * 7) % 40, b.y - 34 - (i % 5) * 9, 3, 36);
        }
      } else if (p.type === 'rock') {
        const b = project(p.x + p.w / 2, p.y + p.d / 2, 0);
        c.fillStyle = 'rgba(10,8,16,.18)'; c.beginPath(); c.ellipse(b.x, b.y + 2, 24, 8, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = p.color; c.beginPath(); c.moveTo(b.x - 24, b.y); c.lineTo(b.x - 14, b.y - 26); c.lineTo(b.x + 8, b.y - 32); c.lineTo(b.x + 24, b.y - 10); c.lineTo(b.x + 18, b.y); c.closePath(); c.fill();
        c.fillStyle = p.top; c.beginPath(); c.moveTo(b.x - 14, b.y - 26); c.lineTo(b.x + 8, b.y - 32); c.lineTo(b.x + 4, b.y - 20); c.closePath(); c.fill();
      } else if (p.type === 'bench') {
        drawBox(c, p, cfg);
        const b = project(p.x + p.w / 2, p.y + p.d / 2, p.h);
        c.fillStyle = tint(p.color, 18); c.fillRect(b.x - 40, b.y - 4, 80, 4);
        c.fillStyle = '#2b2633'; c.fillRect(b.x - 34, b.y, 5, 24); c.fillRect(b.x + 29, b.y, 5, 24);
      } else if (p.type === 'lantern') {
        const b = project(p.x + p.w / 2, p.y + p.d / 2, 0);
        c.fillStyle = '#3a3030'; c.fillRect(b.x - 3, b.y - 66, 6, 66);
        c.fillStyle = p.top; c.fillRect(b.x - 13, b.y - 78, 26, 14);
        const gl = c.createRadialGradient(b.x, b.y - 70, 5, b.x, b.y - 70, 70);
        gl.addColorStop(0, 'rgba(255,225,130,.35)'); gl.addColorStop(1, 'rgba(255,225,130,0)');
        c.fillStyle = gl; c.fillRect(b.x - 70, b.y - 140, 140, 140);
      } else if (p.type === 'cone') {
        const b = project(p.x + p.w / 2, p.y + p.d / 2, 0);
        c.fillStyle = '#e08a5b'; c.beginPath(); c.moveTo(b.x, b.y - 34); c.lineTo(b.x - 16, b.y); c.lineTo(b.x + 16, b.y); c.closePath(); c.fill();
        c.fillStyle = '#f4ead6'; c.fillRect(b.x - 8, b.y - 18, 16, 5);
      } else if (p.type === 'fishing') {
        const b = project(p.x + p.w / 2, p.y + p.d / 2, 0);
        c.fillStyle = 'rgba(212,176,78,.28)'; c.beginPath(); c.ellipse(b.x, b.y, 34, 15, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#d4b04e'; c.fillRect(b.x - 3, b.y - 30, 6, 34);
        c.fillStyle = '#f2e4c8'; c.fillRect(b.x - 12, b.y - 38, 24, 8);
      } else if (p.type === 'bike') {
        const b = project(p.x + p.w / 2, p.y + p.d / 2, 0);
        c.strokeStyle = '#d8d2c4'; c.lineWidth = 3;
        c.beginPath(); c.arc(b.x - 18, b.y - 8, 13, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(b.x + 18, b.y - 8, 13, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(b.x - 18, b.y - 8); c.lineTo(b.x, b.y - 30); c.lineTo(b.x + 18, b.y - 8); c.stroke();
      } else if (p.type === 'scooter') {
        drawBox(c, p, cfg);
        const b = project(p.x + p.w / 2, p.y + p.d / 2, 0);
        c.fillStyle = '#1b1724'; c.beginPath(); c.arc(b.x - 16, b.y, 9, 0, Math.PI * 2); c.arc(b.x + 16, b.y, 9, 0, Math.PI * 2); c.fill();
      } else {
        drawBox(c, p, cfg);
        if (p.type === 'board') {
          const b = project(p.x + p.w / 2, p.y + p.d / 2, p.h * 0.55);
          c.fillStyle = '#e9dfc8'; c.fillRect(b.x - 52, b.y - 24, 104, 40);
          c.fillStyle = '#5b4a36'; c.fillRect(b.x - 44, b.y - 18, 50, 5); c.fillRect(b.x - 44, b.y - 8, 40, 4);
          c.fillStyle = '#b06a8a'; c.fillRect(b.x + 8, b.y - 18, 34, 5);
        }
        if (p.type === 'cabinet' || p.type === 'locker') {
          const b = project(p.x + p.w / 2, p.y + p.d / 2, p.h * 0.5);
          c.fillStyle = 'rgba(20,16,22,.32)';
          c.fillRect(b.x - 22, b.y - 18, 44, 36);
          c.strokeStyle = 'rgba(240,235,215,.35)'; c.lineWidth = 2;
          c.strokeRect(b.x - 18, b.y - 14, 36, 28);
          c.fillStyle = '#d4b04e'; c.fillRect(b.x - 2, b.y - 4, 4, 4);
        }
        if (p.type === 'clock') {
          const b = project(p.x + p.w / 2, p.y + p.d / 2, p.h * 0.6);
          c.fillStyle = '#e9dfc8'; c.beginPath(); c.arc(b.x, b.y, 20, 0, Math.PI * 2); c.fill();
          c.strokeStyle = '#2b2633'; c.lineWidth = 3; c.stroke();
          c.fillStyle = '#2b2633'; c.fillRect(b.x - 1, b.y - 12, 3, 12); c.fillRect(b.x, b.y, 9, 3);
        }
        if (p.type === 'picture') {
          const b = project(p.x + p.w / 2, p.y + p.d / 2, p.h * 0.6);
          c.fillStyle = '#e9dfc8'; c.fillRect(b.x - 24, b.y - 28, 48, 44);
          c.strokeStyle = '#2b2633'; c.lineWidth = 3; c.strokeRect(b.x - 24, b.y - 28, 48, 44);
          c.fillStyle = p.top; c.fillRect(b.x - 16, b.y - 20, 32, 28);
        }
        if (p.type === 'barrel') {
          const b = project(p.x + p.w / 2, p.y + p.d / 2, p.h * 0.5);
          c.strokeStyle = '#2b2633'; c.lineWidth = 3;
          c.beginPath(); c.arc(b.x, b.y, 18, 0, Math.PI * 2); c.stroke();
          c.fillStyle = '#d4b04e'; c.fillRect(b.x - 18, b.y - 4, 36, 3);
        }
        if (p.type === 'stall' || p.type === 'shop') {
          const b = project(p.x + p.w / 2, p.y + p.d / 2, p.h * 0.55);
          c.fillStyle = 'rgba(27,23,36,.82)'; c.fillRect(b.x - 38, b.y - 9, 76, 18);
          c.fillStyle = '#f2e4c8'; c.font = '13px monospace'; c.textAlign = 'center';
          c.fillText(p.label || '', b.x, b.y + 4);
          c.textAlign = 'left';
        }
      }
    });
    // exit marker
    const exit = project(1.0, 8.4, 0);
    c.fillStyle = 'rgba(27,23,36,.78)';
    c.fillRect(exit.x - 24, exit.y - 54, 48, 58);
    c.strokeStyle = '#d4b04e'; c.lineWidth = 2; c.strokeRect(exit.x - 24, exit.y - 54, 48, 58);
    c.fillStyle = '#e9dfc8'; c.font = '13px monospace'; c.textAlign = 'center';
    c.fillText('EXIT', exit.x, exit.y - 22);
    c.textAlign = 'left';
    // fishing line and bobber in the isometric lake
    if (state.scene === 'lake' && ui && ui.fishing && (ui.fishing.phase === 'cast' || ui.fishing.phase === 'bite')) {
      const bob = project(7.8, 5.7, 0.1);
      const foot = project(state.player.x, state.player.y, 0);
      const sway = Math.sin(t * 2.2) * (ui.fishing.phase === 'bite' ? 7 : 2);
      c.strokeStyle = 'rgba(240,235,215,.7)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(foot.x + 20, foot.y - 54); c.quadraticCurveTo((foot.x + bob.x) / 2, bob.y - 40, bob.x + sway, bob.y); c.stroke();
      c.fillStyle = '#f2e4c8'; c.fillRect(bob.x - 5 + sway, bob.y - 4, 10, 8);
      c.fillStyle = '#b54a3a'; c.fillRect(bob.x - 3 + sway, bob.y + 4, 6, 3);
      c.strokeStyle = 'rgba(220,245,235,.35)';
      c.beginPath(); c.ellipse(bob.x + sway, bob.y + 7, 16, 5, 0, 0, Math.PI * 2); c.stroke();
    }
    // particles: indoor dust, outdoor pollen/leaves
    for (let i = 0; i < 22; i++) {
      const px = 80 + (i * 137 + Math.sin(t * 0.3 + i) * 18) % 800;
      const py = 90 + (i * 83 + Math.cos(t * 0.22 + i) * 14) % 380;
      c.fillStyle = cfg.indoor ? 'rgba(255,240,205,.16)' : 'rgba(230,245,190,.18)';
      c.fillRect(px, py, 2, 2);
    }
    // ambient vignette
    const vg = c.createRadialGradient(480, 300, 180, 480, 300, 640);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,8,16,.38)');
    c.fillStyle = vg; c.fillRect(0, 0, 960, 580);
    return null;
  }

  window.LabIso = {
    SCENES, project, unproject, draw, getInteractables, hitTest,
    bounds: function (state) { const cfg = config(state); return { minX: 0.62, maxX: (cfg ? cfg.w : 12) - 0.62, minY: 0.62, maxY: (cfg ? cfg.d : 9) - 0.62 }; },
    obstacles, isWalkable, findPath, nearestWalkable, approachPoint,
    screenToWorld: function (state, sx, sy) { return unproject(sx, sy); }
  };
})();

