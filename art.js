
/* Lab Life — interface, panels, dialogue and screen flow. */
(function () {
  'use strict';
  const U = window.LabUtil;
  const D = window.LAB_DATA;
  const G = window.Game;
  const A = window.LabArt;
  const AU = window.LabAudio;

  const $ = function (sel, root) { return (root || document).querySelector(sel); };

  window.LabUI = window.LabUI || {};
  window.LabUI.lang = 'zh';
  try { window.LabUI.lang = localStorage.getItem('lablife_lang') || 'zh'; } catch (e) {}
  const LANG_EN = {
    '实验室人生': 'Lab Life', '新的旅程': 'New Journey', '继续经营': 'Continue', '设置': 'Settings',
    '制作名单': 'Credits', '游戏说明': 'How to Play', '返回标题': 'Title',
    '日期': 'DATE', '经费': 'FUNDS', '声望 / 排名': 'REPUTATION / RANK', '行动力': 'ACTION POINTS',
    '压力': 'STRESS', '当前项目': 'CURRENT PROJECT', '本周行动': 'ACTIONS', '团队成员': 'TEAM',
    '推进一周': 'END WEEK', '研究': 'Research', '团队': 'Team', '论文': 'Papers', '基金': 'Grants',
    '设备': 'Equipment', '日志': 'Log',
    '做实验': 'Experiment', '分析数据': 'Analyze', '写论文': 'Write', '改论文': 'Revise',
    '指导学生': 'Mentor', '学术社交': 'Network', '写基金': 'Grant', '休息': 'Rest', '横向咨询': 'Consult',
    '投稿': 'Submit', '改投': 'Transfer', '返修': 'Revise', '补维度': 'Improve', '委派': 'Delegate',
    '继续写作': 'Write', '润色': 'Polish', '催稿': 'Nudge', '查看': 'View', '使用': 'Use',
    '购买': 'Buy', '维修': 'Repair', '出售': 'Sell', '关闭': 'Close', '取消': 'Cancel',
    '确定': 'Confirm', '保存': 'Save', '完成': 'Done', '返回实验室': 'Back to Lab',
    '选择期刊': 'Choose Journal', '投稿选项': 'Submission Options', '论文流水线': 'Paper Pipeline',
    '在研经费': 'Active Funding', '资金周转': 'Cash Flow', '学术借贷': 'Academic Loan',
    '本轮窗口': 'Current Calls', '申请策略': 'Strategy', '不可申请': 'Not Eligible',
    '免版面费': 'No APC', '审稿': 'Review', '在研': 'Active', '固定': 'Fixed',
    '当前负债': 'Outstanding', '本周利息': 'Weekly Interest', '信用额度': 'Credit Limit',
    '全部还清': 'Repay All', '当前没有负债': 'No debt',
    '设备与平台': 'Equipment', '固定仪器': 'Fixed Instruments', '已安装': 'Installed',
    '设备商店': 'Equipment Shop', '实验室扩建': 'Lab Upgrade', '研究方向': 'Research Directions',
    '实验室成员': 'Lab Members', '候选人': 'Candidates', '学生委派': 'Student Delegation',
    '不消耗 PI 行动力': 'No PI Action Points', '代为实验': 'Run Experiment', '代为分析': 'Analyze Data',
    '代为写作': 'Draft Paper', '代为返修': 'Revise Paper', '代为查文献': 'Literature Review',
    '中文': '中文', 'English': 'English',
    '背景音乐': 'Music', '音效': 'Sound', '全屏': 'Fullscreen', '存档': 'Save',
    '重新开始': 'Restart', '切换全屏': 'Toggle Fullscreen', '导出存档': 'Export Save',
    '删除存档并重开': 'Delete & Restart', '语言 / Language': 'Language',
    '实验室成员': 'Lab Members', '候选人': 'Candidates', '在研与返修': 'In Review & Revision',
    '日志与排名': 'Log & Ranking',
    '城市': 'City', 'RB 城市': 'RB City', '科技处': 'Research Office',
    '校外市场': 'Off-campus Market', '外卖站': 'Delivery Hub', '有名湖': 'Famous Lake',
    '返回城市': 'Back to City', '回到实验室': 'Back to Lab', '已开放': 'Open',
    '钓鱼': 'Fishing', '科研': 'Research', '感情': 'Relationship', '事业': 'Career'
  };

  function applyLanguage(root) {
    if (UI.lang !== 'en' || !root) return;
    document.documentElement.lang = 'en';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const raw = node.nodeValue || '';
      const trimmed = raw.trim();
      if (!trimmed || !LANG_EN[trimmed]) return;
      const lead = raw.match(/^\s*/)[0];
      const trail = raw.match(/\s*$/)[0];
      node.nodeValue = lead + LANG_EN[trimmed] + trail;
    });
  }
  window.LabUI.applyLanguage = applyLanguage;

  window.LabUI.setLang = function (lang) {
    UI.lang = lang === 'en' ? 'en' : 'zh';
    try { localStorage.setItem('lablife_lang', UI.lang); } catch (e) {}
    document.documentElement.lang = UI.lang === 'en' ? 'en' : 'zh-CN';
    if (UI.modalOpen) UI.closeModal(true);
    if (UI.mode === 'game' && G.state) { UI.renderAll(); refreshPanel(); }
    else if (UI.mode === 'intro') renderIntro();
    else UI.showTitle();
    if (UI.lang === 'en') UI.toast('English UI enabled', 'Core interface is translated; story and management text remain Chinese in this build.', 'good', 'book');
  };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  const UI = window.LabUI = {
    lang: (window.LabUI && window.LabUI.lang) || 'zh',
    mode: 'title',
    introSlide: 0,
    introProject: null,
    panelType: null,
    modalOpen: false,
    modalType: null,
    location: null,
    lookDraft: null,
    hovered: null,
    lastReport: null,
    advancing: false,
    ending: null,
    settingsFrom: 'title',
    firstWeek: false,
    toastCount: 0,
    fpsTime: 0,
    keys: {},
    lastTs: 0,
    nearby: null,
    walkTarget: null,
    walkPath: null,
    pendingInteract: null,
    playerSpeed: 62
  };

  UI.applyLanguage = applyLanguage;
  UI.setLang = function (lang) {
    UI.lang = lang === 'en' ? 'en' : 'zh';
    try { localStorage.setItem('lablife_lang', UI.lang); } catch (e) {}
    document.documentElement.lang = UI.lang === 'en' ? 'en' : 'zh-CN';
    if (UI.modalOpen) UI.closeModal(true);
    if (UI.mode === 'game' && G.state) { UI.renderAll(); refreshPanel(); }
    else if (UI.mode === 'intro') renderIntro();
    else UI.showTitle();
    if (UI.lang === 'en') UI.toast('English UI enabled', 'Core interface is translated; story and management text remain Chinese in this build.', 'good', 'book');
  };

  /* =========================================================
     SMALL RENDER HELPERS
     ========================================================= */

  function tag(text, cls) {
    return '<span class="tag ' + (cls || '') + '">' + U.esc(text) + '</span>';
  }

  function bar(value, cls, max) {
    const pct = U.clamp((value / (max || 100)) * 100, 0, 100);
    return '<div class="bar ' + (cls || '') + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>';
  }

  function statLine(label, value, cls, max) {
    return '<div class="stat-line"><span>' + U.esc(label) + '</span>' + bar(value, cls, max) +
      '<span class="num">' + Math.round(value) + '</span></div>';
  }

  function portraitImg(st, size) {
    return '<img src="' + A.portraitForStudent(st) + '" width="' + (size || 42) + '" height="' + (size || 42) + '" alt="">';
  }

  function speakerPortrait(key, state) {
    return '<img src="' + A.portrait(key, 96, state) + '" alt="">';
  }

  function icon(name, theme) {
    return '<img src="' + A.icon(name, theme || 'dark') + '" alt="">';
  }

  function itemSummary(item) {
    const cat = { research: '科研', relationship: '感情', career: '事业', fishing: '钓鱼' }[item.category] || '杂物';
    const e = item.effect || {};
    const parts = [];
    if (e.data) parts.push('数据+' + e.data);
    if (e.insight) parts.push('洞察+' + e.insight);
    if (e.quality) parts.push('质量+' + e.quality);
    if (e.morale) parts.push('士气+' + e.morale);
    if (e.stress) parts.push('压力' + e.stress);
    if (e.affinity) parts.push('默契+' + e.affinity);
    if (e.rep) parts.push('声望+' + e.rep);
    if (e.clues) parts.push('线索+' + e.clues);
    if (e.rod) parts.push('鱼竿+' + e.rod);
    if (e.bait) parts.push('饵料+' + e.bait);
    if (e.condition) parts.push('设备+' + e.condition);
    return '<div class="use-line"><b>' + cat + '</b><span>' + (parts.join(' · ') || '特殊效果') + '</span></div>';
  }

  function useSummary(def) {
    if (!def || !def.use) return '<span class="tiny-text">被动设备</span>';
    const u = def.use;
    const parts = [];
    if (u.data) parts.push('数据+' + u.data);
    if (u.insight) parts.push('洞察+' + u.insight);
    if (u.quality) parts.push('质量+' + u.quality);
    if (u.clarity) parts.push('表达+' + u.clarity);
    if (u.progress) parts.push('进度+' + u.progress);
    if (u.rigor) parts.push('严谨+' + u.rigor);
    if (u.novelty) parts.push('新颖+' + u.novelty);
    if (u.morale) parts.push('士气+' + u.morale);
    if (u.stress) parts.push('压力' + u.stress);
    return '<div class="use-line"><b>' + U.esc(u.label) + '</b><span>' + (parts.join(' · ') || '特殊效果') + (u.cost ? ' · ¥' + U.fmtNum(u.cost) : '') + '</span></div>';
  }

  function publishedCount(p) {
    if (!p || !G.state) return 0;
    return G.state.papers.filter(x => x.projectId === p.defId && x.status === 'published').length;
  }

  function stageName(p) {
    if (!p) return '—';
    const published = publishedCount(p);
    if (published >= p.maxPapers) return '方向完成';
    if (p.papers >= p.maxPapers) return '论文满载';
    if (published >= 3) return '成果期';
    if (published >= 1) return '攻关期';
    if (p.insight >= 30) return '可成文';
    if (p.data >= 70) return '攻关期';
    if (p.data >= 25) return '预实验';
    return '探索期';
  }

  function dimensionTags(p, journal) {
    if (!p || !p.dimensions) return '';
    const req = journal && journal.dimReq ? journal.dimReq : null;
    return '<div class="dim-row">' + D.DIMENSIONS.map(d => {
      const value = Math.round(p.dimensions[d.id] || 0);
      const need = req ? Math.round(req[d.id] || 0) : 0;
      const low = req && value < need;
      const demand = p.demands && p.demands[d.id] ? Math.ceil(p.demands[d.id]) : 0;
      return '<span class="dim-chip ' + (low ? 'low' : '') + '" title="' + U.esc(d.name + ' ' + value + (req ? ' / 要求 ' + need : '') + (demand ? ' · 还差 ' + demand : '')) + '">' +
        d.short + ' ' + value + (low ? '<em>-' + (need - value) + '</em>' : '') + (demand ? '<b>+' + demand + '</b>' : '') + '</span>';
    }).join('') + '</div>';
  }

  function demandLine(p) {
    const missing = G.missingDemands(p);
    if (!missing.length) return '';
    return '<div class="demand-line">审稿要求：' + missing.map(k => {
      const d = D.DIMENSIONS.find(x => x.id === k);
      return '<span class="demand-chip">' + U.esc(d ? d.name : k) + ' 还需 +' + Math.ceil(p.demands[k]) + '</span>';
    }).join('') + '</div>';
  }

  function paperStatusName(s) {
    return ({
      draft: '写作中', ready: '可投稿', review: '审稿中', revision: '返修中',
      published: '已发表', rejected: '被拒'
    })[s] || s;
  }

  function paperStatusClass(s) {
    return s || 'draft';
  }

  function projectById(id) {
    return G.state.projects.find(p => p.defId === id) || null;
  }

  function projectDef(id) {
    return D.PROJECTS.find(p => p.id === id) || null;
  }

  function currentPaper() {
    const s = G.state;
    if (!s) return null;
    let p = G.ui.selectedPaperId ? s.papers.find(x => x.id === G.ui.selectedPaperId) : null;
    if (!p) p = s.papers.find(x => ['draft', 'ready', 'revision', 'review'].includes(x.status)) || null;
    return p;
  }

  function availableGrants() {
    const s = G.state;
    return D.GRANTS.map(def => {
      const win = G.grantWindow(def, s.week);
      const met = G.grantMet(def, s);
      const can = G.canApplyGrant(def.id, s);
      return { def, win, met, can, chance: G.grantChance(def, s), score: G.proposalScore(def, s) };
    });
  }

  function countReadyPapers() {
    return G.state.papers.filter(p => p.status === 'ready' || p.status === 'revision').length;
  }

  function countOpenGrants() {
    return availableGrants().filter(g => g.win.open && g.met).length;
  }

  /* =========================================================
     TOAST / MODAL
     ========================================================= */

  UI.toast = function (title, lines, tone, iconName) {
    const layer = $('#toast-layer');
    if (!layer) return;
    const div = document.createElement('div');
    div.className = 'toast ' + (tone || 'good');
    const arr = Array.isArray(lines) ? lines : (lines ? [lines] : []);
    div.innerHTML =
      '<div class="t-icon">' + icon(iconName || (tone === 'bad' || tone === 'warn' ? 'x' : 'check')) + '</div>' +
      '<div><div class="t-title">' + U.esc(title) + '</div>' +
      (arr.length ? '<div class="t-lines">' + arr.map(U.esc).join('<br>') + '</div>' : '') + '</div>';
    layer.appendChild(div);
    UI.toastCount++;
    setTimeout(() => {
      div.classList.add('out');
      setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 220);
    }, 3200);
    while (layer.children.length > 2) layer.removeChild(layer.firstChild);
  };

  function openModal(html, opts) {
    opts = opts || {};
    const layer = $('#modal-layer');
    layer.innerHTML = html;
    layer.classList.remove('hidden');
    UI.modalOpen = true;
    UI.modalType = opts.type || 'modal';
    UI.modalCloseable = opts.closeable !== false;
    UI.keys = {};
    UI.walkTarget = null;
    UI.walkPath = null;
    UI.pendingInteract = null;
    updatePrompt(null);
    applyLanguage(layer);
  }

  UI.closeModal = function (silent) {
    const layer = $('#modal-layer');
    if (!layer) return;
    layer.classList.add('hidden');
    layer.innerHTML = '';
    UI.modalOpen = false;
    UI.modalType = null;
    UI.panelType = null;
    UI.location = null;
    if (!silent && AU) AU.play('close');
  };

  function modalShell(title, sub, body, opts) {
    opts = opts || {};
    return '<div class="modal ' + (opts.size || '') + '">' +
      '<div class="modal-head"><div class="modal-title"><h2>' + U.esc(title) + '</h2>' +
      (sub ? '<span class="sub">' + U.esc(sub) + '</span>' : '') + '</div>' +
      '<button class="modal-close" data-act="closeModal" aria-label="关闭">×</button></div>' +
      body + '</div>';
  }

  function confirmModal(title, text, yesLabel, yesAct, noLabel) {
    openModal('<div class="small-modal"><h3>' + U.esc(title) + '</h3><p>' + U.esc(text) + '</p>' +
      '<div class="row"><button class="btn" data-act="closeModal">' + U.esc(noLabel || '取消') + '</button>' +
      '<button class="btn primary" data-act="' + yesAct + '">' + U.esc(yesLabel || '确定') + '</button></div></div>',
      { type: 'small', closeable: true });
  }
  UI.confirmModal = confirmModal;

  function floatText(text, color) {
    const layer = $('#float-layer');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.left = (46 + Math.random() * 12) + '%';
    el.style.top = (38 + Math.random() * 10) + '%';
    if (color) el.style.color = color;
    layer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
  }
  UI.floatText = floatText;

  /* =========================================================
     TITLE / INTRO
     ========================================================= */

  UI.showTitle = function () {
    UI.mode = 'title';
    UI.ending = null;
    $('#title-screen').classList.remove('hidden');
    $('#intro-screen').classList.add('hidden');
    $('#game-screen').classList.add('hidden');
    $('#modal-layer').classList.add('hidden');
    UI.modalOpen = false;
    UI.closeModal(true);
    const cont = $('#btn-continue');
    if (cont) {
      cont.disabled = !G.hasSave();
      const meta = G.meta();
      cont.innerHTML = meta
        ? '继续经营 <span class="key">' + U.esc(meta.labName || '实验室') + ' · 第' + meta.week + '周</span>'
        : '继续经营 <span class="key">LOAD</span>';
    }
    updateSoundButton();
    applyLanguage($('#title-screen'));
  };

  UI.startIntro = function () {
    UI.mode = 'intro';
    UI.introSlide = 0;
    UI.introProject = null;
    UI.lookDraft = UI.lookDraft || defaultLook();
    $('#title-screen').classList.add('hidden');
    $('#game-screen').classList.add('hidden');
    $('#intro-screen').classList.remove('hidden');
    AU.resume();
    renderIntro();
  };

  const INTRO = [
    {
      chapter: 'CHAPTER 00 · 失败者',
      title: '三年，一纸「未通过」',
      text: '北岭大学，聘期考核现场。\n\n你花了三年，建了一间小小的实验室，带了两届学生，发了三篇不咸不淡的论文。评审委员会说：\n\n“研究方向不够聚焦，标志性成果不足。”\n\n你走出会议室时，走廊尽头的窗户正下着雨。'
    },
    {
      chapter: 'CHAPTER 01 · 一座新城',
      title: 'RB 城市实验中心',
      text: '电话是马亚楠打来的。她是你读博时的师姐，现在是 RB 城市实验中心主任。\n\n“我这儿还有半间空实验室，几台二手仪器，还有一个看起来很牛逼的交叉学科方向。”\n\n“你来不来？”\n\n你看了看银行卡余额，又看了看窗外的雨。'
    },
    {
      chapter: 'CHAPTER 02 · 一把钥匙',
      title: '二十万，和一间空房间',
      text: 'RB 实验中心 3 楼。房间比想象中小，墙皮有一点起翘，窗外能看到整座城市。\n\n马亚楠把钥匙放在你手心，又递来一份文件：\n\n“RB 青年学者启动基金，二十万，三年。设备、试剂、学生，都从这里出。”\n\n“三年后，我想看到一个能靠自己站住的实验室。”',
      extra: '三年 · 144 周 · 从 0 开始'
    },
    {
      chapter: 'CHAPTER 03 · 方向',
      title: '把第一个赌注，放在哪里',
      text: '白板是空的。三个方向都有人做过，但都还没有被做完。\n\n选一个作为实验室的第一个赌注。你可以在之后扩建实验室，开启更多方向。'
    }
  ];

  function defaultLook() {
    return { style: 'short', hair: '#241f25', skin: '#e8b98c', coat: '#f8f2e2', accent: '#57b8a6', glasses: true };
  }

  UI.openCustomize = function (from) {
    UI.customizeFrom = from || UI.mode;
    const s = G.state;
    if (!UI.lookDraft) UI.lookDraft = Object.assign(defaultLook(), (s && s.look) || {});
    const look = UI.lookDraft;
    const styles = D.LOOK_OPTIONS.styles;
    const styleNames = { short: '短发', bob: '波波头', bun: '丸子头', curly: '卷发', long: '长发', fringe: '刘海', undercut: '铲青', braid: '侧编发' };
    const swatches = (field, colors) => '<div class="look-swatches">' + colors.map(c =>
      '<button class="look-swatch ' + (look[field] === c ? 'on' : '') + '" style="background:' + c + '" data-act="look" data-field="' + field + '" data-value="' + c + '" aria-label="' + c + '"></button>').join('') + '</div>';
    const body = '<div class="modal-body"><div class="look-layout">' +
      '<div class="look-preview"><img src="' + A.portrait(look, 128, { look: look }) + '" width="128" height="128" alt=""></div>' +
      '<div class="look-form">' +
      '<div class="look-group"><div class="section-title">发型</div><div class="look-chip-row">' + styles.map(st =>
        '<button class="look-chip ' + (look.style === st ? 'on' : '') + '" data-act="look" data-field="style" data-value="' + st + '">' + styleNames[st] + '</button>').join('') + '</div></div>' +
      '<div class="look-group"><div class="section-title">发色</div>' + swatches('hair', D.LOOK_OPTIONS.hairColors) + '</div>' +
      '<div class="look-group"><div class="section-title">肤色</div>' + swatches('skin', D.LOOK_OPTIONS.skins) + '</div>' +
      '<div class="look-group"><div class="section-title">白大褂</div>' + swatches('coat', D.LOOK_OPTIONS.coats) + '</div>' +
      '<div class="look-group"><div class="section-title">内搭 / 挂绳</div>' + swatches('accent', D.LOOK_OPTIONS.accents) + '</div>' +
      '<div class="look-group"><div class="section-title">配件</div><div class="look-chip-row">' +
      '<button class="look-chip ' + (look.glasses ? 'on' : '') + '" data-act="look" data-field="glasses" data-value="' + (look.glasses ? '0' : '1') + '">眼镜：' + (look.glasses ? '开' : '关') + '</button>' +
      '</div></div></div></div></div>' +
      '<div class="modal-foot"><button class="btn" data-act="closeModal">取消</button>' +
      '<button class="btn primary" data-act="lookDone">' + (UI.customizeFrom === 'intro' ? '使用这个形象' : '保存外观') + '</button></div>';
    openModal(modalShell('角色定制', 'CHARACTER CREATOR', body, { size: '' }), { type: 'customize', closeable: true });
  };

  UI.setLookField = function (field, value) {
    UI.lookDraft = UI.lookDraft || defaultLook();
    if (field === 'glasses') UI.lookDraft.glasses = value === '1';
    else UI.lookDraft[field] = value;
    if (G.state && UI.customizeFrom !== 'intro') {
      G.state.look = Object.assign({}, UI.lookDraft);
      G.save();
    }
    UI.openCustomize(UI.customizeFrom);
  };

  function renderIntro() {
    const s = INTRO[UI.introSlide];
    $('#intro-chapter').textContent = s.chapter;
    $('#intro-title').textContent = s.title;
    $('#intro-text').textContent = UI.introSlide === 3 ? '三个方向都有人做过，但都还没有被做完。\n选一个作为实验室的第一个赌注。之后扩建实验室，还能开启更多方向。' : s.text;
    $('#intro-text').style.minHeight = UI.introSlide === 3 ? '64px' : '';
    const extra = $('#intro-extra');
    if (UI.introSlide === 3) {
      const name = UI.playerNameDraft || '林知远';
      extra.innerHTML =
        '<div class="project-choice">' +
        D.PROJECTS.map(p =>
          '<button class="project-choice-card' + (UI.introProject === p.id ? ' selected' : '') + '" data-act="chooseProject" data-id="' + p.id + '">' +
          '<span class="pcc-stripe" style="background:' + p.color + '"></span>' +
          '<h4>' + U.esc(p.name) + ' <span class="tag" style="background:' + p.color + '22">' + U.esc(p.field) + '</span></h4>' +
          '<p>' + U.esc(p.tagline) + '</p>' +
          '<div class="pcc-meta">' + p.tags.map(t => '<span class="pcc-tag">' + U.esc(t) + '</span>').join('') +
          '<span class="pcc-tag">难度 ' + U.esc(p.difficulty) + '</span></div></button>'
        ).join('') + '</div>' +
        '<div class="intro-name-row"><span class="tiny-text">PI 姓名</span>' +
        '<input id="intro-player-name" maxlength="12" value="' + U.esc(name) + '" spellcheck="false">' +
        '<button class="btn small" data-act="customize">角色外观</button></div>';
      const input = $('#intro-player-name');
      if (input) {
        input.addEventListener('input', function () { UI.playerNameDraft = this.value; });
      }
    } else {
      extra.innerHTML = s.extra ? '<div class="tag gold">' + U.esc(s.extra) + '</div>' : '';
    }
    $('#intro-next').textContent = UI.introSlide === 3 ? '开始三年 →' : '继续 →';
    $('#intro-skip').style.display = UI.introSlide === 3 ? 'none' : '';
    $('#intro-dots').innerHTML = INTRO.map((_, i) => '<i class="' + (i === UI.introSlide ? 'on' : '') + '"></i>').join('');
    const art = $('#intro-canvas');
    if (art) A.drawIntro(art, UI.introSlide, performance.now() / 1000);
    applyLanguage($('#intro-screen'));
  }

  UI.nextIntro = function () {
    if (UI.introSlide < 3) {
      UI.introSlide++;
      renderIntro();
      AU.play('page');
      return;
    }
    if (!UI.introProject) {
      UI.toast('还没有选择方向', '先选一个研究赌注，再开始这三年。', 'warn');
      AU.play('warn');
      return;
    }
    const nameInput = $('#intro-player-name');
    const playerName = (nameInput && nameInput.value.trim()) || '林知远';
    G.newGame(UI.introProject, { playerName: playerName, labName: playerName + '实验室', look: UI.lookDraft });
    UI.mode = 'game';
    UI.firstWeek = true;
    $('#intro-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
    UI.renderAll();
    AU.play('great');
    setTimeout(() => UI.showFirstWeek(), 300);
  };

  UI.showFirstWeek = function () {
    if (!UI.firstWeek) return;
    UI.firstWeek = false;
    UI.toast('欢迎来到 RB 实验中心', 'WASD / 方向键移动 · 靠近仪器按 E 交互 · 点击地面走过去', 'good', 'door');
    setTimeout(() => {
      UI.toast('这间实验室还没有人', '先去「团队」招第一名学生；右侧可以安排本周行动。', 'warn', 'users');
    }, 1800);
  };

  /* =========================================================
     MAIN RENDER
     ========================================================= */

  UI.renderAll = function () {
    if (!G.state) return;
    renderHUD();
    renderProjectCard();
    renderActions();
    renderTeamMini();
    renderDock();
    renderSceneTop();
    renderHint();
    updateSoundButton();
    applyLanguage($('#game-screen'));
  };

  function renderHUD() {
    const s = G.state;
    const date = U.dateOf(s.week);
    $('#hud-lab-name').textContent = s.labName || '实验室';
    $('#hud-date').textContent = 'Y' + date.year + ' · ' + date.month + '月 第' + date.weekOfMonth + '周';
    $('#hud-money').textContent = U.fmtMoney(s.funds);
    $('#hud-money-cell').classList.toggle('low', s.funds < 20000);
    const rank = G.rank(s);
    $('#hud-rep').textContent = Math.round(s.rep) + ' · ' + (rank >= U.RANK_MAX ? '未入榜' : '#' + U.fmtNum(rank));
    const apRow = $('#ap-row');
    const max = G.maxAp(s);
    let html = '';
    for (let i = 0; i < max; i++) {
      html += '<span class="ap-pip ' + (i < s.ap ? 'full' : 'empty') + '"></span>';
    }
    html += '<span class="ap-num">' + s.ap + '/' + max + '</span>';
    apRow.innerHTML = html;
    const stress = Math.round(s.piStress);
    const sb = $('#stress-bar');
    sb.querySelector('i').style.width = stress + '%';
    sb.classList.toggle('mid', stress >= 55 && stress < 78);
    sb.classList.toggle('high', stress >= 78);
    $('#stress-txt').textContent = stress + '%';
  }

  function renderProjectCard() {
    const s = G.state;
    const p = G.currentProject(s);
    const el = $('#project-card');
    if (!p) {
      el.innerHTML = '<div class="side-head"><span>当前项目</span><span class="mini">NO PROJECT</span></div>' +
        '<div class="card-body tiny-text">还没有在研项目。点击白板或「研究」选择一个方向。</div>';
      return;
    }
    const def = projectDef(p.defId);
    const team = s.students.filter(x => x.status === 'active' && x.projectId === p.defId);
    el.innerHTML =
      '<div class="project-stripe" style="background:' + def.color + '"></div>' +
      '<div class="side-head"><span>当前项目</span><span class="mini">' + U.esc(stageName(p)) + '</span></div>' +
      '<div class="project-main">' +
      '<div class="project-top"><div><div class="project-name">' + U.esc(p.name) + '</div>' +
      '<div class="project-full">' + U.esc(p.full) + '</div></div>' +
      '<div class="project-stage" style="background:' + def.accent + '">' + U.esc(stageName(p)) + '</div></div>' +
      '<div class="stat-bars">' +
      statLine('数据', p.data, 'teal', 100) +
      statLine('洞察', p.insight, 'blue', 100) +
      statLine('质量', p.quality, 'gold', 100) +
      '</div>' +
      '<div class="project-team">' + team.slice(0, 5).map(st => '<img class="mini-avatar" src="' + A.portraitForStudent(st) + '" alt="">').join('') +
      '<span class="txt">' + team.length + ' 人 · 设备加成 +' + Math.round(G.equipBonus(p, s)) + '</span></div>' +
      (publishedCount(p) >= p.maxPapers ? '<button class="btn small gold" style="width:100%;margin-top:5px" data-act="openPanel" data-id="research">方向已完结 · 开启新方向 →</button>' : '') +
      '</div>';
  }

  function renderActions() {
    const s = G.state;
    const p = G.currentProject(s);
    const paper = currentPaper();
    const grid = $('#action-grid');
    grid.innerHTML = G.ACTIONS.map(a => {
      const can = G.canDo(a.id, s);
      let hint = a.hint;
      if (a.id === 'analyze' && p) hint = p.data >= 15 ? '转化 15 数据' : '需 15 数据（' + Math.floor(p.data) + '）';
      if (a.id === 'write' && p) hint = p.insight >= 30 ? '消耗 30 洞察' : '需 30 洞察（' + Math.floor(p.insight) + '）';
      if (a.id === 'revise' && paper) hint = paper.status === 'revision' ? '完成返修' : paper.status === 'ready' ? '润色论文' : '推进草稿';
      if (a.id === 'mentor' && s.students.length) {
        const st = s.students.find(x => x.uid === G.ui.selectedStudentId) || G.activeStudents(s)[0];
        if (st) hint = '指导 ' + st.name;
      }
      if (a.id === 'consult') hint = s.week < s.cooldowns.consult ? '冷却中' : '一次快钱';
      return '<button class="action-btn tone-' + a.tone + '" data-act="doAction" data-id="' + a.id + '"' +
        (can.ok ? '' : ' disabled title="' + U.esc(can.reason) + '"') + '>' +
        '<span class="a-icon">' + icon(a.icon) + '</span>' +
        '<span class="a-copy"><span class="a-name">' + U.esc(a.name) + '</span><span class="a-hint">' + U.esc(hint) + '</span></span>' +
        (a.ap ? '<span class="ap-cost">' + a.ap + 'AP</span>' : '<span class="ap-cost">OPEN</span>') +
        '</button>';
    }).join('');

    let tip;
    if (!p) tip = '先打开「研究」选择一个方向。';
    else if (publishedCount(p) >= p.maxPapers) tip = '这个方向的故事写完了。去「研究」开启第二个方向（需实验室 3 级）。';
    else if (p.papers >= p.maxPapers) tip = '论文额度已满，先等在审结果。拒稿会释放名额。';
    else if (s.ap <= 0) tip = '行动力用完了。推进一周，或去实验室里喝杯咖啡。';
    else if (p.insight >= 30) tip = '洞察够了。花 2 点行动力写一篇新论文。';
    else if (p.data >= 15) tip = '数据够了，分析可以把它们变成洞察。';
    else tip = '做实验积累数据，分析数据产生洞察，洞察用来写论文。';
    $('#action-tip').textContent = tip;
    const countdown = $('#week-countdown');
    countdown.textContent = '距考核 ' + Math.max(0, 144 - s.week) + ' 周';
    const adv = $('#btn-advance');
    adv.innerHTML = '推进一周 <span class="sub">END WEEK · SPACE</span>' +
      (s.ap > 0 ? '<span class="unused">' + s.ap + ' AP LEFT</span>' : '');
    adv.disabled = false;
  }

  function renderTeamMini() {
    const s = G.state;
    const el = $('#team-block');
    const list = s.students.filter(x => x.status === 'active' || x.status === 'burnout');
    if (!list.length) {
      el.innerHTML = '<div class="side-head"><span>团队成员</span><span class="mini">EMPTY</span></div>' +
        '<div class="team-empty">还没有成员。去「团队」招募第一名学生。</div>';
      return;
    }
    el.innerHTML = '<div class="side-head"><span>团队成员</span><span class="mini">' + list.length + '/' + G.LAB_LEVELS[s.labLevel].cap + '</span></div>' +
      '<div class="team-mini-row">' + list.map(st =>
        '<button class="team-chip" data-act="openStudent" data-id="' + st.uid + '" title="' + U.esc(st.name + ' · 压力 ' + Math.round(st.stress)) + '">' +
        '<img src="' + A.portraitForStudent(st) + '" alt="">' +
        '<span class="tc-name">' + U.esc(st.name) + '</span>' +
        '<span class="tc-stress"><i style="height:' + Math.round(st.stress) + '%"></i></span></button>'
      ).join('') + '</div>';
  }

  function renderDock() {
    const s = G.state;
    const ready = countReadyPapers();
    const grants = countOpenGrants();
    const bp = $('#badge-papers');
    const bg = $('#badge-grants');
    bp.textContent = ready;
    bp.classList.toggle('hidden', ready <= 0);
    bg.textContent = grants;
    bg.classList.toggle('hidden', grants <= 0);
  }

  function renderSceneTop() {
    const s = G.state;
    const date = U.dateOf(s.week);
    const p = G.currentProject(s);
    const weather = { spring: '小雨', summer: '晴', autumn: '落叶', winter: '初雪' }[date.season.key];
    if (s.scene && s.scene !== 'lab') {
      const loc = D.LOCATIONS.find(x => x.id === s.scene) || { name: 'RB 城市', code: 'CITY' };
      $('#scene-topline').innerHTML =
        '<span class="scene-chip" style="border-color:#57b8a6">RB · CITY</span>' +
        '<span class="scene-chip"><span class="dot" style="background:' + date.season.color + '"></span>' + date.season.name + ' · ' + weather + '</span>' +
        '<span class="scene-chip" style="border-color:' + (loc.color || '#57b8a6') + '">' + U.esc(loc.name) + ' · ' + U.esc(loc.code || '') + '</span>' +
        '<span class="scene-chip">E 交互 · 门口返回实验室</span>';
      return;
    }
    $('#scene-topline').innerHTML =
      '<span class="scene-chip" style="border-color:#57b8a6">RB · 3F</span>' +
      '<span class="scene-chip"><span class="dot" style="background:' + date.season.color + '"></span>' + date.season.name + ' · ' + weather + '</span>' +
      '<span class="scene-chip">LAB LV.' + s.labLevel + ' · ' + U.esc(G.LAB_LEVELS[s.labLevel].name) + '</span>' +
      (p ? '<span class="scene-chip" style="border-color:' + projectDef(p.defId).color + '">' + U.esc(p.name) + ' · ' + U.esc(stageName(p)) + '</span>' : '');
  }

  function renderHint() {
    const s = G.state;
    const undone = D.OBJECTIVES.find(o => !s.completedObjectives.includes(o.id));
    let text;
    if (s.funds < 50000) text = '<b>经费预警：</b>账上不足 ¥50,000。去「基金」申请，或做一次横向咨询。';
    else if (s.piStress >= 80) text = '<b>状态预警：</b>压力过高会减少每周行动力。记得休息。';
    else if (undone) text = '<b>下一个目标：</b>' + U.esc(undone.title) + ' — ' + U.esc(undone.desc);
    else text = '<b>提示：</b>' + U.esc(D.TIPS[s.week % D.TIPS.length]);
    $('#hint-left').innerHTML = text;
  }

  /* =========================================================
     ACTION HANDLERS
     ========================================================= */

  function afterResult(res, opts) {
    opts = opts || {};
    if (!res || !res.ok) {
      UI.toast('没法这么做', res && res.message ? res.message : '再试一次。', 'warn');
      AU.play('warn');
      return;
    }
    if (res.open) {
      openPanel(res.open);
      return;
    }
    if (res.title) {
      UI.toast(res.title, res.lines, res.tone || 'good',
        res.tone === 'great' ? 'star' : res.action === 'experiment' ? 'flask' : res.action === 'write' ? 'paper' : 'check');
    }
    if (res.tone === 'great') AU.play('great');
    else if (res.tone === 'warn' || res.tone === 'bad') AU.play('warn');
    else AU.play('success');
    floatText(res.title || '完成');
    UI.renderAll();
    if (opts.openPanel) openPanel(opts.openPanel);
  }

  UI.doAction = function (id) {
    if (!G.state) return;
    if (id === 'revise' && !currentPaper()) {
      UI.toast('没有可修改的论文', '先写一篇论文，或打开论文页选择一篇。', 'warn');
      return;
    }
    if (id === 'revise') {
      const p = currentPaper();
      if (p) G.ui.selectedPaperId = p.id;
    }
    if (id === 'mentor' && !G.ui.selectedStudentId) {
      const st = G.activeStudents(G.state)[0];
      if (st) G.ui.selectedStudentId = st.uid;
    }
    const res = G.doAction(id);
    if (res && res.open) {
      openPanel(res.open);
      return;
    }
    afterResult(res, { openPanel: id === 'write' ? 'papers' : null });
  };

  UI.advance = function () {
    const s = G.state;
    if (!s || UI.advancing) return;
    if (s.ended) {
      UI.showEnding(s.ending || s.ended);
      return;
    }
    if (s.ap > 0) {
      confirmModal('还剩 ' + s.ap + ' 点行动力',
        '现在结束本周，未使用的行动力会作废。\n确定要把这一周过完吗？',
        '结束本周', 'advanceConfirm', '再想想');
      return;
    }
    UI.runWeek();
  };

  UI.runWeek = function () {
    if (!G.state || UI.advancing) return;
    UI.advancing = true;
    if (UI.modalOpen) UI.closeModal(true);
    const res = G.advanceWeek();
    UI.advancing = false;
    if (!res.ok) {
      UI.toast('无法推进', res.message || '出了点问题。', 'bad');
      return;
    }
    AU.play('week');
    UI.renderAll();
    UI.showWeekReport(res.report);
  };

  /* =========================================================
     WEEK REPORT / EVENT
     ========================================================= */

  function reportSection(title, lines) {
    if (!lines || !lines.length) return '';
    return '<div class="report-section"><h4>' + U.esc(title) + '</h4><div class="report-lines">' +
      lines.map(l => '<div class="line">' + U.esc(l) + '</div>').join('') + '</div></div>';
  }

  UI.showWeekReport = function (report) {
    UI.lastReport = report;
    const delta = (report.moneyEnd || 0) - (report.moneyStart || 0);
    const decisions = (report.decisions || []).map(d => {
      if (d.type === 'accept') {
        return '<div class="decision-banner" style="background:#d9ede5"><h4>论文接收 · ' + U.esc(d.journal.name) + '</h4>' +
          '<p>《' + U.esc(d.paper.title) + '》<br>声望 +' + d.repGain + ' · 论文奖金 ' + U.fmtMoney(d.award) + '</p></div>';
      }
      if (d.type === 'minor' || d.type === 'major') {
        return '<div class="decision-banner"><h4>' + (d.type === 'minor' ? '小修' : '大修') + ' · ' + U.esc(d.journal.name) + '</h4>' +
          '<p>《' + U.esc(d.paper.title) + '》<br>去「论文」完成返修，然后重新投稿。</p></div>';
      }
      if (d.type === 'reject') {
        return '<div class="decision-banner" style="background:#ecc7c1"><h4>拒稿 · ' + U.esc(d.journal.name) + '</h4>' +
          '<p>《' + U.esc(d.paper.title) + '》<br>换一本期刊，或者把它放一放。</p></div>';
      }
      if (d.type === 'grantWon') {
        return '<div class="decision-banner" style="background:#f6e6bd"><h4>基金获批 · ' + U.esc(d.grant.name) + '</h4>' +
          '<p>+' + U.fmtMoney(d.grant.amount) + '。这笔钱能让你多撑一阵子。</p></div>';
      }
      if (d.type === 'grantLost') {
        return '<div class="decision-banner" style="background:#ecc7c1"><h4>基金未中 · ' + U.esc(d.grant.name) + '</h4>' +
          '<p>评审意见：创新性尚可，研究基础仍需加强。下一轮再来。</p></div>';
      }
      return '';
    }).join('');

    const body = '<div class="modal-body report-body">' +
      '<h3 class="report-title">第 ' + report.week + ' 周 · 周报</h3>' +
      '<div class="report-sub">Y' + report.date.year + ' · ' + report.date.month + '月 第' + report.date.weekOfMonth + '周 · ' + report.date.season.name + '</div>' +
      (decisions ? '<div class="mt10">' + decisions + '</div>' : '') +
      '<div class="row wrap mt10">' +
      tag('基金 ' + U.fmtMoney(G.state.funds), G.state.funds < 20000 ? 'coral' : 'gold') +
      tag('声望 ' + Math.round(G.state.rep), 'teal') +
      tag('论文 ' + G.state.stats.papers, 'blue') +
      tag('士气 ' + Math.round(G.avgMorale(G.state)), 'green') +
      '</div>' +
      reportSection('本周操作', report.actions) +
      reportSection('研究进展', report.research) +
      reportSection('团队', report.team) +
      reportSection('论文与基金', (report.papers || []).concat(report.grants || [])) +
      reportSection('财务', (report.money || []).concat([
        '本周结余变化：' + (delta >= 0 ? '+' : '') + U.fmtMoney(delta) + '（期末 ' + U.fmtMoney(report.moneyEnd || 0) + '）'
      ])) +
      reportSection('其他', report.lines) +
      '</div>' +
      '<div class="modal-foot"><button class="btn primary" data-act="reportContinue">继续 →</button></div>';

    openModal(modalShell('周报', 'WEEK ' + report.week + ' / 144', body, { size: '' }), { type: 'report', closeable: true });
  };

  UI.reportContinue = function () {
    const s = G.state;
    const report = UI.lastReport;
    UI.closeModal(true);
    if (report && report.ended) {
      UI.showEnding(report.ended);
      return;
    }
    if (s && s.ended) {
      UI.showEnding(s.ending || s.ended);
      return;
    }
    if (s && s.pendingEvent) {
      UI.showEvent();
      return;
    }
    UI.renderAll();
    UI.toast('新的一周', '行动力已恢复。', 'good');
  };

  function eventSpeaker(ev) {
    if (ev.speaker === 'student') {
      const list = G.activeStudents(G.state).slice().sort((a, b) => b.stress - a.stress);
      const st = list[0];
      if (st) return { name: st.name, title: '实验室成员', portrait: A.portraitForStudent(st) };
      return { name: '学生', title: '实验室成员', portrait: A.portrait('player') };
    }
    const sp = D.SPEAKERS[ev.speaker] || D.SPEAKERS.player;
    return {
      name: sp.name,
      title: sp.title,
      portrait: A.portrait(ev.speaker, 96, G.state)
    };
  }

  UI.showEvent = function () {
    const s = G.state;
    const ev = s && s.pendingEvent;
    if (!ev) return;
    const sp = eventSpeaker(ev);
    const text = G.eventText(ev, s);
    const choices = ev.choices.map((ch, i) => {
      let ok = true;
      try { ok = !ch.condition || ch.condition(s); } catch (e) { ok = false; }
      return '<button class="event-choice" data-act="eventChoice" data-index="' + i + '"' + (ok ? '' : ' disabled') + '>' +
        '<div class="ec-label">' + U.esc(ch.label) + '</div>' +
        '<div class="ec-hint">' + U.esc(ch.hint || (ok ? '' : '条件不足')) + '</div></button>';
    }).join('');
    const body = '<div class="event-head"><span>' + (ev.story ? '剧情事件' : '突发事件') + '</span>' +
      '<span class="tag">' + U.esc(ev.title) + '</span></div>' +
      '<div class="event-main"><div class="event-portrait"><img src="' + sp.portrait + '" alt=""></div>' +
      '<div><div class="event-speaker">' + U.esc(sp.name) + ' · ' + U.esc(sp.title) + '</div>' +
      '<div class="event-text">' + U.esc(text).replace(/\n/g, '<br>') + '</div></div></div>' +
      '<div class="event-choices">' + choices + '</div>';
    openModal('<div class="event-modal">' + body + '</div>', { type: 'event', closeable: false });
  };

  UI.eventChoice = function (index) {
    const res = G.resolveEvent(index);
    if (!res.ok) {
      UI.toast('无法选择', res.message || '条件不足。', 'warn');
      return;
    }
    AU.play('page');
    const lines = (res.lines || []).map(l => '<div class="line">' + U.esc(l) + '</div>').join('');
    const body = '<div class="event-head"><span>结果</span><span class="tag">' + U.esc(res.event.title) + '</span></div>' +
      '<div class="event-result">' + lines + '</div>' +
      '<div class="modal-foot"><button class="btn primary" data-act="eventContinue">继续 →</button></div>';
    openModal('<div class="event-modal">' + body + '</div>', { type: 'eventResult', closeable: false });
    UI.renderAll();
  };

  UI.eventContinue = function () {
    UI.closeModal(true);
    if (G.state && G.state.ended) {
      UI.showEnding(G.state.ending || G.state.ended);
      return;
    }
    UI.renderAll();
  };

  /* =========================================================
     PANELS
     ========================================================= */

  const PANEL_TABS = [
    { id: 'research', label: '研究', icon: 'flask' },
    { id: 'team', label: '团队', icon: 'users' },
    { id: 'papers', label: '论文', icon: 'paper' },
    { id: 'grants', label: '基金', icon: 'coin' },
    { id: 'equipment', label: '设备', icon: 'wrench' },
    { id: 'log', label: '日志', icon: 'book' }
  ];

  function openPanel(type) {
    if (!G.state) return;
    UI.panelType = type;
    const titles = { research: '研究', team: '团队', papers: '论文', grants: '基金', equipment: '设备', log: '日志与排名' };
    const body = '<div class="modal-tabs">' + PANEL_TABS.map(t =>
      '<button class="modal-tab ' + (t.id === type ? 'on' : '') + '" data-act="panelTab" data-id="' + t.id + '">' + t.label + '</button>'
    ).join('') + '</div>' +
      '<div class="modal-body" id="panel-content">' + panelContent(type) + '</div>';
    openModal(modalShell(titles[type], 'LAB NOTEBOOK', body), { type: 'panel', closeable: true });
    AU.play('open');
  }
  UI.openPanel = openPanel;

  function refreshPanel() {
    if (!UI.modalOpen || !UI.panelType) return;
    const el = $('#panel-content');
    if (!el) return;
    const scroll = el.scrollTop;
    el.innerHTML = panelContent(UI.panelType);
    el.scrollTop = scroll;
    $$('.modal-tab').forEach(t => t.classList.toggle('on', t.dataset.id === UI.panelType));
    const titles = { research: '研究', team: '团队', papers: '论文', grants: '基金', equipment: '设备', log: '日志与排名' };
    const h = $('.modal-title h2');
    if (h) h.textContent = titles[UI.panelType] || '';
    applyLanguage($('#modal-layer'));
  }
  UI.refreshPanel = refreshPanel;

  function panelContent(type) {
    if (type === 'research') return researchPanel();
    if (type === 'team') return teamPanel();
    if (type === 'papers') return papersPanel();
    if (type === 'grants') return grantsPanel();
    if (type === 'equipment') return equipmentPanel();
    if (type === 'log') return logPanel();
    return '';
  }

  /* ---------------- research ---------------- */

  function researchPanel() {
    const s = G.state;
    const active = s.projects.filter(p => p.status === 'active');
    const selected = projectById(G.ui.selectedProjectId) || active[0] || s.projects[0];
    const def = projectDef(selected.defId);
    const team = s.students.filter(x => x.uid && x.status === 'active' && x.projectId === selected.defId);
    const isActive = selected.status === 'active';
    const canUnlock = s.labLevel >= 3;
    const selectedPublished = publishedCount(selected);

    const cards = s.projects.map(p => {
      const pd = projectDef(p.defId);
      const on = p.defId === selected.defId;
      return '<button class="card" style="width:100%;text-align:left;border-left:7px solid ' + pd.color + ';' + (on ? 'outline:2px solid #1b1724;' : '') + '" data-act="selectProject" data-id="' + p.defId + '">' +
        '<div class="card-body" style="padding:7px 8px">' +
        '<div class="row between"><strong style="font-size:14px">' + U.esc(p.name) + '</strong>' +
        '<span class="tag ' + (p.status === 'active' ? 'teal' : 'gray') + '">' + (p.status === 'active' ? stageName(p) : '未开启') + '</span></div>' +
        '<div class="tiny-text">' + U.esc(p.full) + '</div>' +
        (p.status === 'active' ? '<div class="stat-bars" style="margin-top:5px">' + statLine('数据', p.data, 'teal', 100) + statLine('洞察', p.insight, 'blue', 100) + '</div>' : '<div class="tiny-text mt6">' + (s.labLevel >= 3 ? '点击查看并开启' : '实验室 3 级后可开启') + '</div>') +
        '</div></button>';
    }).join('');

    const milestones = def.milestones.map((m, i) => {
      const done = i < selectedPublished;
      const cur = i === selectedPublished && isActive;
      return '<div class="milestone ' + (done ? 'done' : cur ? 'current' : '') + '"><span class="m-dot"></span>' +
        '<span>' + U.esc(m) + '</span>' + (done ? '<span class="tag teal" style="margin-left:auto">已发表</span>' : cur ? '<span class="tag gold" style="margin-left:auto">进行中</span>' : '') + '</div>';
    }).join('');

    const detail = '<div class="project-hero" style="border-left-color:' + def.color + '">' +
      '<div class="row between"><h3>' + U.esc(selected.name) + '</h3>' + tag(isActive ? stageName(selected) : '未开启', isActive ? 'teal' : 'gray') + '</div>' +
      '<div class="full">' + U.esc(selected.full) + ' · ' + U.esc(selected.field) + '</div>' +
      '<p>' + U.esc(def.desc) + '</p>' +
      '<div class="row wrap mt6">' + def.tags.map(t => tag(t, 'gray')).join('') + '</div></div>' +
      '<div class="card"><div class="card-head"><span>研究状态</span><span class="right">' + selectedPublished + ' / ' + selected.maxPapers + ' PUBLISHED</span></div>' +
      '<div class="card-body">' +
      '<div class="stat-bars">' + statLine('数据', selected.data, 'teal', 100) + statLine('洞察', selected.insight, 'blue', 100) + statLine('质量', selected.quality, 'gold', 100) + statLine('新颖度', selected.novelty, 'coral', 100) + '</div>' +
      '<div class="kv mt6"><span class="k">设备契合加成</span><span class="v">+' + Math.round(G.equipBonus(selected, s)) + '</span></div>' +
      '<div class="kv"><span class="k">参与成员</span><span class="v">' + team.length + ' 人</span></div>' +
      '<div class="divider"></div>' +
      '<div class="row wrap">' +
      (isActive ? '<button class="btn primary" data-act="doAction" data-id="experiment">做实验</button>' +
        '<button class="btn" data-act="doAction" data-id="analyze"' + (selected.data >= 15 ? '' : ' disabled') + '>分析数据</button>' +
        '<button class="btn gold" data-act="doAction" data-id="write"' + (selected.insight >= 30 && selected.papers < selected.maxPapers ? '' : ' disabled') + '>写论文 (2AP)</button>' : '') +
      '</div></div></div>' +
      '<div class="card"><div class="card-head"><span>里程碑</span><span class="right">ROADMAP</span></div><div class="card-body milestone-list">' + milestones + '</div></div>' +
      '<div class="card"><div class="card-head"><span>成员分工</span><span class="right">ASSIGNMENT</span></div><div class="card-body">' +
      (team.length ? team.map(st => '<div class="row between" style="padding:3px 0;border-bottom:1px dashed rgba(80,60,40,.2)">' +
        '<span class="row"><img class="mini-avatar" src="' + A.portraitForStudent(st) + '"> ' + U.esc(st.name) + ' <span class="tiny-text">' + U.esc(G.FOCI[st.focus] ? G.FOCI[st.focus].name : '') + '</span></span>' +
        '<span class="tiny-text">技能 ' + Math.round(st.skill) + ' · 压力 ' + Math.round(st.stress) + '</span></div>').join('')
        : '<div class="tiny-text">还没有成员。去「团队」招募并分配到这个方向。</div>') +
      '</div></div>';

    const unlockCard = !isActive ? '<div class="card"><div class="card-head"><span>开启方向</span><span class="right">NEW DIRECTION</span></div>' +
      '<div class="card-body"><div class="tiny-text mb6">消耗 ¥30,000 前期经费，将「' + U.esc(selected.full) + '」加入在研方向。</div>' +
      '<button class="btn primary" data-act="activateProject" data-id="' + selected.defId + '"' + (canUnlock ? '' : ' disabled') + '>' +
      (canUnlock ? '开启方向' : '需要实验室 3 级') + '</button></div></div>' : '';

    const exhausted = active.length > 0 && active.every(p => publishedCount(p) >= p.maxPapers);
    const banner = exhausted
      ? '<div class="decision-banner" style="background:#f6e6bd"><h4>这个方向已经写完了</h4><p>' +
        (s.labLevel >= 3 ? '选择一个未开启的方向，投入 ¥30,000 启动经费，让实验室继续向前。' : '实验室升到 3 级后，可以同时推进第二个方向。先去「设备」页看看扩建条件。') +
        '</p></div>'
      : '';
    return '<div class="panel-grid"><div>' +
      '<div class="section-title">研究方向</div>' + banner + cards +
      '</div><div>' + detail + unlockCard + '</div></div>';
  }

  /* ---------------- team ---------------- */

  function studentCard(st) {
    const s = G.state;
    const activeProjects = s.projects.filter(p => p.status === 'active');
    const projectOpts = '<option value="">未分配</option>' + activeProjects.map(p =>
      '<option value="' + p.defId + '"' + (st.projectId === p.defId ? ' selected' : '') + '>' + U.esc(p.name) + '</option>').join('');
    const focusOpts = Object.keys(G.FOCI).map(k =>
      '<option value="' + k + '"' + (st.focus === k ? ' selected' : '') + '>' + U.esc(G.FOCI[k].name) + '</option>').join('');
    return '<div class="student-card ' + (st.status === 'burnout' ? 'burnout' : '') + '">' +
      '<div class="sc-top"><div class="sc-portrait">' + portraitImg(st) + '</div><div class="grow">' +
      '<div class="row between"><div class="sc-name">' + U.esc(st.name) + '</div>' + tag(st.role, st.role === '博后' ? 'pink' : st.role === '博士生' ? 'blue' : 'teal') + '</div>' +
      '<div class="sc-role">' + U.esc(st.field) + ' · 技能 ' + Math.round(st.skill) + ' · 默契 ' + Math.round(st.affinity || 0) + ' · Lv.' + (st.level || 1) + '</div></div></div>' +
      '<div class="sc-bio">' + U.esc(st.quote || st.bio || '') + '</div>' +
      '<div class="sc-stats">' +
      '<div class="sc-stat"><span>技能</span>' + bar(st.skill, 'teal', 100) + '<span class="num">' + Math.round(st.skill) + '</span></div>' +
      '<div class="sc-stat"><span>压力</span>' + bar(st.stress, st.stress > 75 ? 'coral' : 'gold', 100) + '<span class="num">' + Math.round(st.stress) + '</span></div>' +
      '<div class="sc-stat"><span>士气</span>' + bar(st.morale, st.morale < 35 ? 'coral' : 'green', 100) + '<span class="num">' + Math.round(st.morale) + '</span></div>' +
      '</div>' +
      (st.status === 'burnout' ? '<div class="tiny-text mt6" style="color:#a04a3a">职业倦怠，还剩 ' + (st.burnoutWeeks || 0) + ' 周恢复。</div>' :
        '<div class="sc-bottom"><select data-change="project" data-id="' + st.uid + '" title="分配项目">' + projectOpts + '</select>' +
        '<select data-change="focus" data-id="' + st.uid + '" title="本周任务">' + focusOpts + '</select>' +
        '<button class="btn tiny primary" data-act="delegate" data-id="' + st.uid + '"' + (st.lastTaskWeek === s.week ? ' disabled' : '') + '>' + (st.lastTaskWeek === s.week ? '本周已委派' : '委派') + '</button>' +
        '<button class="btn tiny" data-act="mentor" data-id="' + st.uid + '">指导</button>' +
        '<button class="btn tiny danger" data-act="fire" data-id="' + st.uid + '">解雇</button></div>') +
      '</div>';
  }

  function teamPanel() {
    const s = G.state;
    const list = s.students.filter(x => x.status !== 'left');
    const left = s.students.filter(x => x.status === 'left');
    const cap = G.LAB_LEVELS[s.labLevel].cap;
    const avg = G.avgMorale(s);
    const applicants = s.applicants.map(app => {
      const cost = app.salary + 2000;
      return '<div class="applicant-card">' +
        '<div class="ap-portrait">' + portraitImg(app, 54) + '</div>' +
        '<div><h4>' + U.esc(app.name) + ' <span class="tag ' + (app.role === '博后' ? 'pink' : 'teal') + '">' + U.esc(app.role) + '</span></h4>' +
        '<div class="meta">' + U.esc(app.field) + ' · 月薪 ' + U.fmtMoney(app.salary) + ' · 入职成本 ' + U.fmtMoney(cost) + '</div>' +
        '<div class="quote">“' + U.esc(app.quote) + '”</div>' +
        '<div class="ap-stats">技能 ' + Math.round(app.skill) + ' · 天赋 ' + Math.round(app.talent) + ' · 勤奋 ' + Math.round(app.diligence) + ' · 创意 ' + Math.round(app.creativity) + ' · 抗压 ' + Math.round(app.resilience) + '</div></div>' +
        '<button class="btn small primary" data-act="hire" data-id="' + app.uid + '">发 offer</button></div>';
    }).join('');

    return '<div class="row between mb10"><div class="section-title" style="margin:0">实验室成员</div>' +
      '<div class="row"><span class="tag">' + list.length + '/' + cap + ' 工位</span>' + tag('平均士气 ' + Math.round(avg), 'green') +
      '<button class="btn small" data-act="teamActivity">团建 ¥10k</button>' +
      '<button class="btn small" data-act="refreshApplicants">刷新候选人 (1AP)</button></div></div>' +
      '<div class="team-grid">' + (list.length ? list.map(studentCard).join('') : '<div class="card" style="padding:16px;grid-column:1/-1"><div class="tiny-text">还没有成员。从下面的候选人里挑一个，或者先升级实验室。</div></div>') + '</div>' +
      '<div class="section-title mt10">候选人</div>' +
      '<div class="tiny-text mb6">招聘会消耗入职成本（一个月工资 + ¥2,000）。实验室声望越高，候选人越好。</div>' +
      (applicants || '<div class="tiny-text">暂时没有候选人。点击「刷新候选人」。</div>') +
      (left.length ? '<div class="section-title mt10">离开的人</div>' + left.map(st => '<div class="row between" style="padding:3px 0;opacity:.6"><span>' + U.esc(st.name) + ' · ' + U.esc(st.role) + '</span><span class="tiny-text">已离开</span></div>').join('') : '');
  }

  function showDelegate(uid, paperId) {
    const s = G.state;
    const st = s.students.find(x => x.uid === uid && x.status === 'active');
    if (!st) { UI.toast('无法委派', '这名学生当前不可用。', 'warn'); return; }
    const project = G.currentProject(s);
    const paper = paperId ? s.papers.find(p => p.id === paperId) : currentPaper();
    const used = st.lastTaskWeek === s.week;
    const tasks = [
      { id: 'experiment', name: '代为实验', desc: '消耗少量试剂，按技能增加项目数据与论文数据维度。' },
      { id: 'analyze', name: '代为分析', desc: '把数据变成洞察，并提升严谨性维度。' },
      { id: 'write', name: '代为写作', desc: paper ? '推进《' + paper.title + '》的进度与表达。' : '当前没有草稿，只能转化为洞察。' },
      { id: 'revise', name: '代为返修', desc: '按审稿意见补维度，减少一项维度缺口。' },
      { id: 'literature', name: '代为查文献', desc: '补新颖性与表达，适合改投前重讲故事。' }
    ];
    const body = '<div class="modal-body">' +
      '<div class="row between mb10"><div><div class="section-title" style="margin:0">委派任务</div>' +
      '<div class="tiny-text">' + U.esc(st.name) + ' · 技能 ' + Math.round(st.skill) + ' · 压力 ' + Math.round(st.stress) + '</div></div>' +
      tag(used ? '本周已委派' : '0 AP', used ? 'gray' : 'teal') + '</div>' +
      '<div class="decision-banner" style="background:#e7f0e9"><h4>不消耗 PI 行动力</h4><p>每名学生每周只能承担一次委派任务。学生技能、士气与压力会影响产出。</p></div>' +
      '<div class="delegate-grid">' + tasks.map(t => {
        const disabled = used || st.stress >= 92 || (t.id === 'write' && !paper) || (t.id === 'revise' && !paper);
        return '<button class="delegate-card" data-act="delegateDo" data-uid="' + st.uid + '" data-task="' + t.id + '" data-paper="' + (paper ? paper.id : '') + '"' + (disabled ? ' disabled' : '') + '>' +
          '<h4>' + t.name + '</h4><p>' + U.esc(t.desc) + '</p><span class="tag ' + (disabled ? 'gray' : 'teal') + '">' + (disabled ? '不可用' : '0 AP') + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="modal-foot"><button class="btn" data-act="closeModal">取消</button></div>';
    openModal(modalShell('学生委派', 'DELEGATION', body, { size: 'narrow' }), { type: 'delegate', closeable: true });
  }
  UI.showDelegate = showDelegate;

  /* ---------------- papers ---------------- */

  function paperRow(p) {
    const j = p.journalId ? G.journalDef(p.journalId) : null;
    const proj = projectDef(p.projectId);
    let actions = '';
    if (p.status === 'draft') {
      actions = '<button class="btn tiny primary" data-act="revisePaper" data-id="' + p.id + '">继续写作</button>' +
        '<button class="btn tiny" data-act="delegatePaper" data-id="' + p.id + '">委派</button>';
    } else if (p.status === 'ready') {
      actions = '<button class="btn tiny gold" data-act="openJournal" data-id="' + p.id + '">投稿</button>' +
        '<button class="btn tiny" data-act="revisePaper" data-id="' + p.id + '">润色</button>' +
        '<button class="btn tiny" data-act="delegatePaper" data-id="' + p.id + '">委派</button>';
    } else if (p.status === 'review') {
      const left = Math.max(1, p.reviewAt - G.state.week);
      actions = '<button class="btn tiny" data-act="urgePaper" data-id="' + p.id + '">催稿 (1AP)</button>' +
        '<span class="tiny-text">约 ' + left + ' 周</span>';
    } else if (p.status === 'revision') {
      actions = '<button class="btn tiny primary" data-act="revisePaper" data-id="' + p.id + '">返修</button>' +
        '<button class="btn tiny" data-act="delegatePaper" data-id="' + p.id + '">委派</button>' +
        '<span class="tiny-text">还需 ' + (p.revisionNeeded || 1) + ' 轮</span>';
    } else if (p.status === 'rejected') {
      const missing = G.missingDemands(p);
      actions = '<button class="btn tiny ' + (missing.length ? 'primary' : '') + '" data-act="revisePaper" data-id="' + p.id + '">补维度</button>' +
        '<button class="btn tiny" data-act="openJournal" data-id="' + p.id + '">改投</button>' +
        '<button class="btn tiny" data-act="delegatePaper" data-id="' + p.id + '">委派</button>';
    }
    return '<div class="paper-row"><div>' +
      '<div class="paper-title">' + U.esc(p.title) + '</div>' +
      '<div class="paper-meta"><span class="paper-status ' + paperStatusClass(p.status) + '">' + paperStatusName(p.status) + '</span>' +
      (j ? U.esc(j.name) + ' · IF ' + j.if : '尚未选择期刊') +
      ' · 质量 ' + Math.round(p.quality) + ' · ' + U.esc(proj ? proj.name : '') +
      (p.status === 'published' ? ' · 引用 ' + p.citations : '') + '</div>' +
      dimensionTags(p, j) + demandLine(p) +
      (p.status === 'draft' || p.status === 'revision' ? '<div class="bar gold mt6" style="height:6px"><i style="width:' + Math.round(p.progress) + '%"></i></div>' : '') +
      '</div><div class="paper-actions">' + actions + '</div></div>';
  }

  function papersPanel() {
    const s = G.state;
    const groups = [
      { key: ['draft', 'ready'], label: '写作与待投', empty: '还没有草稿。攒够 30 洞察后点「写论文」。' },
      { key: ['review', 'revision'], label: '在审与返修', empty: '没有在审的论文。投稿后要等几周。' },
      { key: ['published'], label: '已发表', empty: '还没有论文发表。第一篇总是最难的。' },
      { key: ['rejected'], label: '被拒 / 待处理', empty: '' }
    ];
    return '<div class="row between mb10"><div><div class="section-title" style="margin:0">论文流水线</div>' +
      '<div class="tiny-text">维度：新颖性 / 严谨性 / 数据完整度 / 表达清晰度 · 角标为当前值，红色为该刊缺口</div></div>' +
      '<div class="row">' + tag('发表 ' + s.stats.papers, 'teal') + tag('顶刊 ' + s.stats.topPapers, 'gold') + tag('引用 ' + s.citations, 'blue') + '</div></div>' +
      groups.map(g => {
        const list = s.papers.filter(p => g.key.includes(p.status));
        if (!list.length && !g.empty) return '';
        return '<div class="card"><div class="card-head"><span>' + g.label + '</span><span class="right">' + list.length + '</span></div>' +
          '<div class="card-body">' + (list.length ? '<div class="paper-list">' + list.map(paperRow).join('') + '</div>' : '<div class="tiny-text">' + g.empty + '</div>') + '</div></div>';
      }).join('');
  }

  function showJournalPicker(paperId) {
    const s = G.state;
    const p = s.papers.find(x => x.id === paperId);
    if (!p) return;
    const unlocked = s.journalUnlocks || D.INITIAL_JOURNALS;
    const seriesOrder = ['transactions', 'science', 'nature', 'declaration', 'rb'];
    const groups = seriesOrder.map(key => {
      const list = D.JOURNALS.filter(j => !j.legacy && j.series === key && unlocked.includes(j.id));
      if (!list.length) return '';
      return '<div class="journal-series"><div class="series-head" style="border-left-color:' + D.JOURNAL_SERIES[key].color + '">' +
        '<span>' + U.esc(D.JOURNAL_SERIES[key].name) + '</span><span class="tiny-text">' + U.esc(D.JOURNAL_SERIES[key].en) + '</span></div>' +
        '<div class="journal-grid">' + list.map(j => {
          const chance = G.paperAcceptChance(p, j.id, s);
          const can = s.funds >= j.apc;
          const missing = G.missingDemands(p);
          const same = p.lastRejectedJournal === j.id || p.journalId === j.id;
          const blocked = same && missing.length > 0;
          return '<button class="journal-card' + (blocked ? ' blocked' : '') + '" data-act="submitJournal" data-paper="' + p.id + '" data-journal="' + j.id + '"' + (can && !blocked ? '' : ' disabled') + '>' +
            '<div class="journal-accept">' + Math.round(chance * 100) + '%</div>' +
            '<h4>' + U.esc(j.name) + '</h4>' +
            '<div class="j-if">IF ' + j.if.toFixed(1) + ' · 门槛 ' + j.threshold + ' · 声望 +' + j.rep + '</div>' +
            '<div class="desc">' + U.esc(j.desc) + '</div>' +
            '<div class="journal-req">要求 ' + D.DIMENSIONS.map(d => d.short + (j.dimReq[d.id] || 0)).join(' · ') + '</div>' +
            dimensionTags(p, j) +
            (blocked ? '<div class="demand-line">先补维度才能再投这本</div>' : '') +
            '<div class="row between"><span class="tiny-text">审稿 ' + j.review[0] + '–' + j.review[1] + ' 周</span>' +
            '<span class="tiny-text">' + (j.apc ? '版面费 ' + U.fmtMoney(j.apc) : '免版面费') + '</span></div>' +
            '</button>';
        }).join('') + '</div></div>';
    }).join('');
    const lockedNames = D.JOURNALS.filter(j => !j.legacy && !unlocked.includes(j.id)).map(j => j.name);
    const body = '<div class="modal-body"><div class="row between mb10"><div>' +
      '<div class="section-title" style="margin:0">选择期刊</div><div class="tiny-text">《' + U.esc(p.title) + '》 · 质量 ' + Math.round(p.quality) + ' · 已解锁 ' + unlocked.filter(id => !(G.journalDef(id) || {}).legacy).length + '/' + D.JOURNALS.filter(j => !j.legacy).length + '</div></div>' +
      '<div class="tiny-text">转投按新期刊的维度标准重新评审，旧意见不继承。</div></div>' +
      groups +
      (lockedNames.length ? '<div class="locked-journals tiny-text">继续投稿可解锁：' + lockedNames.slice(0, 5).map(U.esc).join(' · ') + '</div>' : '') +
      '</div><div class="modal-foot"><button class="btn" data-act="openPanel" data-id="papers">返回论文</button></div>';
    openModal(modalShell('投稿', 'SUBMIT', body, { size: '' }), { type: 'journal', closeable: true });
  }
  UI.showJournalPicker = showJournalPicker;

  /* ---------------- grants ---------------- */

  function grantsPanel() {
    const s = G.state;
    const list = availableGrants();
    const active = s.activeGrants || [];
    const pending = s.applications.filter(a => a.status === 'pending');
    const cards = list.map(g => {
      const d = g.def;
      const req = [];
      if (d.req.papers) req.push('<span class="req-chip ' + (s.stats.papers >= d.req.papers ? 'ok' : 'no') + '">论文 ' + s.stats.papers + '/' + d.req.papers + '</span>');
      if (d.req.top) req.push('<span class="req-chip ' + (s.stats.topPapers >= d.req.top ? 'ok' : 'no') + '">顶刊 ' + s.stats.topPapers + '/' + d.req.top + '</span>');
      if (d.req.rep) req.push('<span class="req-chip ' + (s.rep >= d.req.rep ? 'ok' : 'no') + '">声望 ' + Math.round(s.rep) + '/' + d.req.rep + '</span>');
      if (!req.length) req.push('<span class="req-chip ok">无硬性门槛</span>');
      return '<div class="grant-card ' + (g.win.open && g.met ? 'open' : 'locked') + '" style="border-left-color:' + d.color + '">' +
        '<div class="grant-top"><div><h4>' + U.esc(d.name) + '</h4><div class="tiny-text">' + U.esc(d.desc) + '</div></div>' +
        '<div class="grant-amount">' + U.fmtMoney(d.amount) + '</div></div>' +
        '<div class="grant-req">' + req.join('') + '</div>' +
        '<div class="row between mt6"><span class="tiny-text">' +
        (g.win.open ? '本轮开放至第 ' + g.win.deadline + ' 周' : (g.win.next ? '第 ' + g.win.next + ' 周开放' : '本轮已截止')) +
        ' · 自评 ' + g.score + ' 分 · 命中率约 ' + Math.round(g.chance * 100) + '%</span>' +
        '<button class="btn small ' + (g.can.ok ? 'primary' : '') + '" data-act="applyGrant" data-id="' + d.id + '"' + (g.can.ok ? '' : ' disabled title="' + U.esc(g.can.reason) + '"') + '>' +
        (g.can.ok ? '写本子 (2AP)' : '不可申请') + '</button></div>' +
        '</div>';
    }).join('');

    const activeRows = active.map(a => '<div class="row between" style="padding:5px 0;border-bottom:1px dashed rgba(80,60,40,.25)">' +
      '<div><strong style="font-size:12px">' + U.esc(a.name || (G.grantDef(a.defId) || {}).name || '在研项目') + '</strong>' +
      '<div class="tiny-text">' + (a.startWeek ? '第 ' + a.startWeek + ' 周起' : '') + ' · ' + U.fmtMoney(a.amount || 0) + '</div></div>' +
      '<span class="tag teal">在研</span></div>').join('');

    const loan = s.loan || { balance: 0, rate: D.LOAN.rate };
    const loanInterest = Math.ceil((loan.balance || 0) * (loan.rate || D.LOAN.rate));
    const loanCard = '<div class="card loan-card"><div class="card-head"><span>学术借贷</span><span class="right">' + Math.round((loan.rate || D.LOAN.rate) * 100) + '% / WEEK</span></div>' +
      '<div class="card-body">' +
      '<div class="row between"><span class="tiny-text">当前负债</span><strong class="' + (loan.balance > 0 ? 'coral-text' : '') + '">' + U.fmtMoney(loan.balance || 0) + '</strong></div>' +
      '<div class="row between"><span class="tiny-text">本周利息</span><span>' + (loan.balance > 0 ? '+' + U.fmtMoney(loanInterest) : '—') + '</span></div>' +
      '<div class="row between"><span class="tiny-text">信用额度</span><span>' + U.fmtMoney(G.loanLimit(s)) + '</span></div>' +
      '<div class="tiny-text mt6">周利率 2%，利息每周滚入本金。借来的钱不是经费，是要还的。</div>' +
      '<div class="loan-actions">' + D.LOAN.options.map(amount => '<button class="btn tiny" data-act="borrow" data-amount="' + amount + '">借 ' + U.fmtMoney(amount) + '</button>').join('') + '</div>' +
      '<div class="loan-actions">' +
      (loan.balance > 0 ? '<button class="btn tiny" data-act="repay" data-amount="10000">还 ¥10k</button>' +
        '<button class="btn tiny" data-act="repay" data-amount="50000">还 ¥50k</button>' +
        '<button class="btn tiny primary" data-act="repay" data-amount="all">全部还清</button>' : '<span class="tiny-text">目前没有负债。</span>') +
      '</div></div></div>';

    return '<div class="panel-grid equal"><div>' +
      '<div class="section-title">在研经费</div>' +
      '<div class="card"><div class="card-body">' + (activeRows || '<div class="tiny-text">只有青年启动基金。</div>') +
      (pending.length ? '<div class="divider"></div><div class="tiny-text">评审中：' + pending.map(a => {
        const d = G.grantDef(a.defId); return U.esc(d ? d.name : a.defId) + '（约第 ' + a.decisionWeek + ' 周出结果）';
      }).join('；') + '</div>' : '') +
      '</div></div>' +
      '<div class="section-title">资金周转</div>' + loanCard +
      '<div class="card"><div class="card-head"><span>申请策略</span><span class="right">TIPS</span></div><div class="card-body tiny-text">' +
      '基金评审看三件事：研究基础（论文/顶刊）、本子质量（声望/写作）、以及一点运气。<br><br>' +
      '企业横向命中率高、到账快，但声望收益低；人才基金难，但能让你真正换一层楼。<br><br>' +
      '本子提交后需要 4–12 周出结果。不要在截止周才想起来。' +
      '</div></div>' +
      '</div><div>' +
      '<div class="section-title">本轮窗口</div>' + cards +
      '</div></div>';
  }

  /* ---------------- equipment ---------------- */

  function equipmentPanel() {
    const s = G.state;
    const cap = G.LAB_LEVELS[s.labLevel].equip;
    const cur = G.currentProject(s);
    const slots = [];
    for (let i = 0; i < cap; i++) {
      slots.push('<div class="slot-box ' + (s.equipment[i] ? 'filled' : '') + '" title="' + U.esc(s.equipment[i] ? (G.equipDef(s.equipment[i]) || {}).name || '' : '空设备位') + '">' + (i + 1) + '</div>');
    }
    const owned = s.equipment.map(e => {
      const d = G.equipDef(e);
      if (!d) return '';
      const repair = Math.round(2000 + (100 - e.condition) / 100 * d.price * 0.18);
      const fit = cur && d.tags.some(t => cur.tags.includes(t));
      const used = s.equipmentUsed && s.equipmentUsed[e.uid] === s.week;
      const canUse = d.use && cur && !used && s.ap >= 1 && s.funds >= (d.use.cost || 0);
      return '<div class="equip-card"><div class="equip-icon"><img src="' + A.equipThumb(d, 40) + '" alt=""></div>' +
        '<div><div class="row between"><h4>' + U.esc(d.name) + '</h4>' + tag('T' + d.tier, fit ? 'teal' : 'gray') + '</div>' +
        '<div class="e-meta">' + d.tags.join(' / ') + ' · 维护 ' + U.fmtMoney(d.upkeep) + '/月</div>' +
        '<div class="e-desc">' + U.esc(d.desc) + '</div>' +
        useSummary(d) +
        '<div class="row mt6"><div class="grow"><div class="tiny-text">状态 ' + Math.round(e.condition) + '%</div>' + bar(e.condition, e.condition < 35 ? 'coral' : 'teal', 100) + '</div></div>' +
        '<div class="e-actions">' +
        (d.use ? '<button class="btn tiny primary" data-act="useEquip" data-id="' + e.uid + '"' + (canUse ? '' : ' disabled title="' + (used ? '本周已使用' : '需要行动力与在研项目') + '"') + '>' +
          (used ? '本周已用' : U.esc(d.use.label) + ' (1AP)') + '</button>' : '') +
        '<button class="btn tiny" data-act="repairEquip" data-id="' + e.uid + '">维修 ' + U.fmtMoney(repair) + '</button>' +
        '<button class="btn tiny danger" data-act="sellEquip" data-id="' + e.uid + '">出售</button></div>' +
        '</div></div>';
    }).join('');

    const shop = D.EQUIPMENT.filter(d => !s.equipment.some(e => e.defId === d.id)).map(d => {
      const fit = cur && d.tags.some(t => cur.tags.includes(t));
      return '<div class="equip-card"><div class="equip-icon"><img src="' + A.equipThumb(d, 40) + '" alt=""></div>' +
        '<div><div class="row between"><h4>' + U.esc(d.name) + '</h4>' + tag('T' + d.tier, fit ? 'teal' : 'gray') + '</div>' +
        '<div class="e-meta">' + d.tags.join(' / ') + ' · ' + U.fmtMoney(d.price) + '</div>' +
        '<div class="e-desc">' + U.esc(d.desc) + '</div>' +
        useSummary(d) +
        '<div class="e-actions"><button class="btn tiny primary" data-act="buyEquip" data-id="' + d.id + '"' + (s.funds >= d.price && s.equipment.length < cap ? '' : ' disabled') + '>购买</button>' +
        (fit ? '<span class="tag teal">契合当前项目</span>' : '') + '</div></div></div>';
    }).join('');

    const next = G.LAB_LEVELS[s.labLevel + 1];
    const up = next ? '<div class="card"><div class="card-head"><span>实验室扩建</span><span class="right">LAB UPGRADE</span></div>' +
      '<div class="card-body"><div class="row between"><div><strong>' + U.esc(next.name) + '</strong><div class="tiny-text">' + U.esc(next.desc) + '</div></div><span class="tag gold">' + U.fmtMoney(next.cost) + '</span></div>' +
      '<div class="row wrap mt6">' +
      '<span class="req-chip ' + (s.rep >= next.req.rep ? 'ok' : 'no') + '">声望 ' + Math.round(s.rep) + '/' + next.req.rep + '</span>' +
      '<span class="req-chip ' + (s.stats.papers >= next.req.papers ? 'ok' : 'no') + '">论文 ' + s.stats.papers + '/' + next.req.papers + '</span>' +
      (next.req.top ? '<span class="req-chip ' + (s.stats.topPapers >= next.req.top ? 'ok' : 'no') + '">顶刊 ' + s.stats.topPapers + '/' + next.req.top + '</span>' : '') +
      '<span class="req-chip">工位 ' + next.cap + ' · 设备位 ' + next.equip + ' · AP ' + next.ap + '</span></div>' +
      '<button class="btn small primary mt6" data-act="upgradeLab">扩建实验室</button></div></div>' : '<div class="card"><div class="card-body tiny-text">已经是最高等级。你拥有了一整层楼。</div></div>';

    return '<div class="row between mb10"><div class="section-title" style="margin:0">设备与平台</div><div class="row">' +
      tag(s.equipment.length + '/' + cap + ' 设备位', 'teal') + tag('月维护 ' + U.fmtMoney(s.equipment.reduce((a, e) => a + (G.equipDef(e) ? G.equipDef(e).upkeep : 0), 0)), 'gold') + '</div></div>' +
      '<div class="slot-row">' + slots.join('') + '<span class="tiny-text" style="align-self:center">设备按顺序安装。实验室升级增加设备位。</span></div>' +
      '<div class="section-title">固定仪器</div><div class="equip-grid">' +
      (D.FIXTURES || []).map(f => {
        const used = s.equipmentUsed && s.equipmentUsed[f.id] === s.week;
        return '<div class="equip-card"><div class="equip-icon"><img src="' + A.icon(({ glovebox: 'chip', fumehood: 'flask', microscope: 'microscope', pipette: 'flask', balance: 'chart', computer: 'paper', bench: 'flask' })[f.id] || 'flask') + '" style="width:30px;height:30px" alt=""></div>' +
          '<div><div class="row between"><h4>' + U.esc(f.name) + '</h4>' + tag('固定', 'teal') + '</div>' +
          '<div class="e-meta">' + f.tags.join(' / ') + ' · 不占设备位</div>' +
          '<div class="e-desc">' + U.esc(f.desc) + '</div>' +
          useSummary(f) +
          '<div class="e-actions"><button class="btn tiny" data-act="openFixture" data-id="' + f.id + '">查看</button>' +
          '<button class="btn tiny primary" data-act="useEquip" data-id="' + f.id + '"' + (used ? ' disabled' : '') + '>' + (used ? '本周已用' : '使用 (1AP)') + '</button></div></div></div>';
      }).join('') +
      '</div>' +
      '<div class="section-title">已安装</div><div class="equip-grid">' + (owned || '<div class="tiny-text">没有设备。</div>') + '</div>' +
      '<div class="section-title mt10">设备商店</div><div class="equip-grid">' + shop + '</div>' +
      '<div class="section-title mt10">扩建</div>' + up;
  }

  /* ---------------- log ---------------- */

  function logPanel() {
    const s = G.state;
    const score = G.score(s);
    const rank = G.rank(s);
    const objectives = D.OBJECTIVES.map(o => {
      const done = s.completedObjectives.includes(o.id);
      return '<div class="objective-item ' + (done ? 'done' : '') + '"><span class="o-check"></span>' +
        '<div><div>' + U.esc(o.title) + '</div><div class="o-desc">' + U.esc(o.desc) + '</div></div>' +
        '<span class="tag ' + (done ? 'teal' : 'gray') + '">' + (done ? '完成' : '进行中') + '</span></div>';
    }).join('');

    const rows = G.leaderboard(s);
    let lastRank = 0;
    const lb = rows.map(l => {
      const sep = lastRank && l.rank - lastRank > 1 ? '<div class="tiny-text center" style="padding:2px 0">···</div>' : '';
      lastRank = l.rank;
      return sep + '<div class="lb-row ' + (l.player ? 'player' : '') + '">' +
        '<span class="rank">#' + U.fmtNum(l.rank) + '</span><span class="name">' + U.esc(l.name) + '<span class="city">' + U.esc(l.city) + '</span></span>' +
        '<span class="score">' + U.fmtNum(l.score) + '</span></div>';
    }).join('');

    const logs = s.log.slice(0, 30).map(l => '<div class="log-item kind-' + U.esc(l.kind || 'info') + '"><span class="w">W' + l.week + '</span><span>' + U.esc(l.text) + '</span></div>').join('');

    return '<div class="panel-grid equal"><div>' +
      '<div class="section-title">三年目标</div>' +
      '<div class="card"><div class="card-body"><div class="row between"><div><strong style="font-size:16px">世界顶级科研团队</strong>' +
      '<div class="tiny-text">第 144 周结算。进入世界前 10，且发表 ≥4 篇论文（含 ≥2 篇顶刊）为真结局。</div></div><div class="center"><div class="mono" style="font-size:22px;color:#2f7f78">#' + U.fmtNum(rank) + '</div><div class="tiny-text">当前排名</div></div></div>' +
      '<div class="divider"></div><div class="row between"><span class="tiny-text">综合分</span><span class="mono">' + U.fmtNum(score) + '</span></div>' +
      '<div class="tiny-text mt6">分数来自：声望 ' + Math.round(s.rep) + ' · 引用 ' + s.citations + ' · 论文 ' + s.stats.papers + '（顶刊 ' + s.stats.topPapers + '） · 竞争经费 ' + U.fmtMoney(s.stats.grantMoney) + '</div>' +
      '</div></div>' +
      '<div class="section-title">目标</div><div class="objective-list">' + objectives + '</div>' +
      '</div><div>' +
      '<div class="section-title">世界排名</div><div class="card"><div class="card-body"><div class="leaderboard">' + lb + '</div>' +
      '<div class="tiny-text mt6">名次按综合分平滑估算；周围实验室会按你的名次随机生成。前 10 名之外只显示附近名次。</div></div></div>' +
      '<div class="section-title">实验室日志</div><div class="card"><div class="card-body"><div class="log-list">' + (logs || '<div class="tiny-text">还没有记录。</div>') + '</div></div></div>' +
      '</div></div>';
  }

  /* ---------------- student profile ---------------- */

  function showStudentProfile(uid) {
    const s = G.state;
    const st = s.students.find(x => x.uid === uid);
    if (!st) return;
    G.ui.selectedStudentId = uid;
    const activeProjects = s.projects.filter(p => p.status === 'active');
    const projectOpts = '<option value="">未分配</option>' + activeProjects.map(p => '<option value="' + p.defId + '"' + (st.projectId === p.defId ? ' selected' : '') + '>' + U.esc(p.name) + '</option>').join('');
    const focusOpts = Object.keys(G.FOCI).map(k => '<option value="' + k + '"' + (st.focus === k ? ' selected' : '') + '>' + U.esc(G.FOCI[k].name) + '</option>').join('');
    const body = '<div class="modal-body"><div class="row" style="align-items:flex-start;gap:12px">' +
      '<div class="sc-portrait" style="width:86px;height:86px;flex:0 0 86px">' + portraitImg(st, 86) + '</div>' +
      '<div class="grow"><div class="row between"><h3 style="margin:0;font-size:22px">' + U.esc(st.name) + '</h3>' + tag(st.role, 'teal') + '</div>' +
      '<div class="tiny-text">' + U.esc(st.field) + ' · 技能 ' + Math.round(st.skill) + ' / 潜力 ' + st.potential + ' · Lv.' + (st.level || 1) + '</div>' +
      '<div class="tiny-text mt6">“' + U.esc(st.quote) + '”</div></div></div>' +
      '<div class="divider"></div><div class="stat-bars">' +
      statLine('技能', st.skill, 'teal') + statLine('压力', st.stress, 'coral') + statLine('士气', st.morale, 'green') +
      statLine('默契', st.affinity || 0, 'pink') + statLine('天赋', st.talent, 'blue') + statLine('勤奋', st.diligence, 'gold') + statLine('创意', st.creativity, 'pink') +
      '</div><div class="tiny-text mt6" style="line-height:1.7">' + U.esc(st.bio) + '</div>' +
      '<div class="divider"></div><div class="row wrap"><span class="tiny-text">项目</span><select data-change="project" data-id="' + st.uid + '">' + projectOpts + '</select>' +
      '<span class="tiny-text">任务</span><select data-change="focus" data-id="' + st.uid + '">' + focusOpts + '</select>' +
      '<button class="btn small primary" data-act="mentor" data-id="' + st.uid + '">指导 (1AP)</button></div>' +
      '<div class="tiny-text mt6">月薪 ' + U.fmtMoney(st.salary) + ' · 入职第 ' + st.joinedWeek + ' 周 · 累计 ' + st.weeksInLab + ' 周</div>' +
      '</div><div class="modal-foot"><button class="btn" data-act="closeModal">关闭</button>' +
      '<button class="btn primary" data-act="openPanel" data-id="team">去团队页</button></div>';
    openModal(modalShell(st.name, 'TEAM MEMBER', body, { size: 'narrow' }), { type: 'student', closeable: true });
  }
  UI.showStudentProfile = showStudentProfile;

  /* =========================================================
     SETTINGS / HELP / ENDING
     ========================================================= */

  UI.openSettings = function (from) {
    UI.settingsFrom = from || UI.mode;
    const body = '<div class="modal-body">' +
      '<div class="settings-row"><span>语言 / Language</span><div class="row">' +
      '<button class="btn small ' + (UI.lang !== 'en' ? 'primary' : '') + '" data-act="setLang" data-lang="zh">中文</button>' +
      '<button class="btn small ' + (UI.lang === 'en' ? 'primary' : '') + '" data-act="setLang" data-lang="en">English</button></div></div>' +
      '<div class="settings-row"><span>角色外观</span><button class="btn small" data-act="customize">重新定制</button></div>' +
      '<div class="settings-row"><span>背景音乐</span><button class="switch ' + (AU.isMusicOn() ? 'on' : '') + '" data-act="toggleMusic" aria-label="音乐"></button></div>' +
      '<div class="settings-row"><span>音效</span><button class="switch ' + (AU.isSfxOn() ? 'on' : '') + '" data-act="toggleSfx" aria-label="音效"></button></div>' +
      '<div class="settings-row"><span>全屏</span><button class="btn small" data-act="fullscreen">切换全屏</button></div>' +
      '<div class="settings-row"><span>存档</span><div class="row"><button class="btn small" data-act="save">保存</button><button class="btn small" data-act="exportSave">导出存档</button></div></div>' +
      '<div class="settings-row"><span>重新开始</span><button class="btn small danger" data-act="resetConfirm">删除存档并重开</button></div>' +
      '<div class="tiny-text mt10">Lab Life · Web Edition 1.5 · 自动保存已开启。关闭页面不会丢失本周进度。' +
      (UI.lang === 'en' ? '<br>English UI is in beta; story and management text remain Chinese for now.' : '') + '</div>' +
      '</div><div class="modal-foot"><button class="btn primary" data-act="closeModal">完成</button></div>';
    openModal(modalShell('设置', 'OPTIONS', body, { size: 'narrow' }), { type: 'settings', closeable: true });
  };

  UI.openHelp = function () {
    const body = '<div class="modal-body">' +
      '<div class="section-title">怎么玩</div>' +
      '<div class="tiny-text" style="font-size:11px;line-height:1.9">' +
      '你是一位独立 PI，要在 <b>144 周（三年）</b> 内把实验室带进世界前列。<br><br>' +
      '<b>每周 6 点行动力</b>：做实验、分析数据、写论文、指导学生、社交、写基金、休息。用完或想结束时点「推进一周」。<br><br>' +
      '<b>研究循环</b>：实验 → 数据 → 分析 → 洞察 → 写论文 → 投稿 → 返修/发表。设备和学生决定速度与质量。<br><br>' +
      '<b>文章维度</b>：新颖性、严谨性、数据完整度、表达清晰度。审稿同时看质量和维度；返修/拒稿后会要求补足特定维度，同刊再投前必须达标。转投按新期刊标准重新评审，不继承旧意见。<br><br>' +
      '<b>投稿系列</b>：学报、科学、自然、声明、RB 五大系列。每次投稿都会解锁新的投稿选项；RB 系列影响因子最高、最难中。<br><br>' +
      '<b>设备功能</b>：每台固定仪器和已购设备都有自己的主动功能，每周一次、消耗 1 AP；设备状态和方向契合度会影响产出。被动加成仍然生效。<br><br>' +
      '<b>学生委派</b>：在「团队」里把实验、分析、写作、返修或查文献交给学生，每周每人一次、不消耗 PI 行动力，产出取决于学生技能与压力。<br><br>' +
      '<b>学术借贷</b>：在「基金」页借款，周利率 2%，利息每周滚入本金；可随时部分或全部还款。<br><br>' +
      '<b>钱</b>：每月发工资、交房租和设备维护。基金是主要收入来源。账上连续两个月为负，实验室会关闭。<br><br>' +
      '<b>人</b>：学生有压力与士气。压力过高会倦怠，士气过低会离开。指导、团建、咖啡和猫都有用。' +
      '</div>' +
      '<div class="divider"></div><div class="section-title">快捷键</div>' +
      '<div class="kv"><span class="k">WASD / 方向键</span><span class="v">在实验室里走动</span></div>' +
      '<div class="kv"><span class="k">E</span><span class="v">靠近仪器 / 人时交互</span></div>' +
      '<div class="kv"><span class="k">鼠标</span><span class="v">点击地面走过去，点击物件自动靠近</span></div>' +
      '<div class="kv"><span class="k">空格</span><span class="v">推进一周</span></div>' +
      '<div class="kv"><span class="k">B</span><span class="v">打开背包 / 送礼</span></div>' +
      '<div class="kv"><span class="k">1 – 6</span><span class="v">打开对应页面</span></div>' +
      '<div class="kv"><span class="k">ESC</span><span class="v">关闭页面</span></div>' +
      '<div class="divider"></div><div class="tiny-text">提示：不要把所有学生都堆在同一个项目上。设备契合度、学生领域和任务类型都会影响产出。</div>' +
      '</div><div class="modal-foot"><button class="btn primary" data-act="closeModal">知道了</button></div>';
    openModal(modalShell('帮助', 'HOW TO PLAY', body, { size: 'narrow' }), { type: 'help', closeable: true });
  };

  UI.openCredits = function () {
    const body = '<div class="modal-body center">' +
      '<div style="font-family:var(--font-en);font-size:30px;color:var(--teal-dark);letter-spacing:2px">LAB LIFE</div>' +
      '<div class="tiny-text mt6">实验室人生 · Web Edition 1.5</div>' +
      '<div class="divider"></div><div class="tiny-text" style="line-height:2">' +
      '策划 / 程序 / 像素美术 / 音效<br><b>DeepSeek Harness · Lab Life Team</b><br><br>' +
      '灵感来自所有在有限经费里<br>仍然认真做研究的人。<br><br>' +
      '本作全部像素画面与音效由代码实时生成。<br>没有一只实验室猫在制作过程中受到伤害。' +
      '</div></div><div class="modal-foot"><button class="btn primary" data-act="closeModal">关闭</button></div>';
    openModal(modalShell('制作名单', 'CREDITS', body, { size: 'narrow' }), { type: 'credits', closeable: true });
  };

  UI.showEnding = function (ending) {
    if (!ending) return;
    UI.mode = 'ending';
    UI.ending = ending;
    const s = G.state;
    const stats = ending.stats || s.stats;
    const body = '<div class="ending-screen"><div class="ending-inner">' +
      '<div class="ending-grade">GRADE ' + U.esc(ending.grade) + ' · RANK #' + ending.rank + '</div>' +
      '<h1 class="ending-title">' + U.esc(ending.title) + '</h1>' +
      '<div class="ending-sub">' + U.esc(ending.subtitle) + '</div>' +
      '<div class="ending-text">' + U.esc(ending.text) + '</div>' +
      '<div class="ending-stats">' +
      '<div class="ending-stat"><div class="k">PAPERS</div><div class="v">' + stats.papers + '</div></div>' +
      '<div class="ending-stat"><div class="k">TOP PAPERS</div><div class="v">' + stats.topPapers + '</div></div>' +
      '<div class="ending-stat"><div class="k">CITATIONS</div><div class="v">' + ending.citations + '</div></div>' +
      '<div class="ending-stat"><div class="k">REPUTATION</div><div class="v">' + ending.rep + '</div></div>' +
      '<div class="ending-stat"><div class="k">GRANTS</div><div class="v">' + stats.grants + '</div></div>' +
      '<div class="ending-stat"><div class="k">FUNDING</div><div class="v">' + U.fmtMoney(stats.grantMoney) + '</div></div>' +
      '<div class="ending-stat"><div class="k">TEAM</div><div class="v">' + s.students.filter(x => x.status === 'active').length + '</div></div>' +
      '<div class="ending-stat"><div class="k">INTEGRITY</div><div class="v">' + Math.round(s.integrity) + '</div></div>' +
      '</div>' +
      '<div class="ending-actions"><button class="btn primary" data-act="endingRestart">再来一次</button>' +
      '<button class="btn" data-act="endingTitle">回到标题</button></div>' +
      '</div></div>';
    const layer = $('#modal-layer');
    layer.innerHTML = body;
    layer.classList.remove('hidden');
    UI.modalOpen = true;
    UI.modalType = 'ending';
    AU.play(ending.grade === 'S' || ending.grade === 'A' ? 'great' : ending.grade === 'F' ? 'bad' : 'success');
  };

  /* =========================================================
     SCENE INTERACTION / KEYBOARD
     ========================================================= */

  function canvasPoint(canvas, e) {
    const state = G.state || { scene: 'lab' };
    const size = A.sceneSize(state);
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / size.w, rect.height / size.h);
    const ox = (rect.width - size.w * scale) / 2;
    const oy = (rect.height - size.h * scale) / 2;
    const sx = (e.clientX - rect.left - ox) / scale;
    const sy = (e.clientY - rect.top - oy) / scale;
    if (state.scene && state.scene !== 'lab' && window.LabIso) return window.LabIso.screenToWorld(state, sx, sy);
    return { x: sx, y: sy };
  }

  function updatePrompt(obj) {
    const el = $('#interact-prompt');
    if (!el) return;
    if (!obj || UI.modalOpen || UI.mode !== 'game') {
      el.classList.add('hidden');
      return;
    }
    $('#interact-prompt-text').textContent = obj.label + (obj.action === 'expansion' ? '（未解锁）' : '');
    el.classList.remove('hidden');
  }

  function nearestInteractable() {
    if (!G.state) return null;
    const p = G.state.player;
    if (!p) return null;
    const list = A.getInteractables(G.state, A.lastLayout);
    let best = null;
    let bestD = 1e9;
    list.forEach(o => {
      const d = Math.hypot(o.ax - p.x, o.ay - p.y);
      if (d <= (o.radius || 30) && d < bestD) {
        best = o;
        bestD = d;
      }
    });
    return best;
  }

  UI.updateNearby = function () {
    if (!G.state || UI.modalOpen || UI.mode !== 'game') {
      UI.nearby = null;
      updatePrompt(null);
      return;
    }
    const near = nearestInteractable();
    UI.nearby = near;
    updatePrompt(near);
  };

  UI.interact = function (obj) {
    if (!obj || !G.state) return;
    AU.play('click');
    if (obj.action === 'expansion') {
      UI.toast('扩建预留区', '实验室升到 2 级后开放。去「设备」看看扩建条件。', 'warn', 'lock');
      return;
    }
    if (obj.action === 'door') { UI.showHallway(); return; }
    if (obj.action === 'leaveScene') { UI.leaveScene(); return; }
    if (obj.action === 'placeActivity') {
      if (obj.id === 'lake-fish') { UI.openFishing(); return; }
      UI.showLocation(obj.place);
      return;
    }
    if (obj.action === 'talkNpc') {
      const lines = {
        clerk: ['窗口老师推了推眼镜：“项目书放这里，下周再来问。”', '“年轻人，预算不要写得太满。”'],
        vendor: ['摊主压低声音：“这根鱼竿，上一个主人钓到过很大的东西。”', '“买不买？不买别挡着别人。”'],
        courier: ['调度员头也不抬：“接单板在那边。跑得快，钱就多。”'],
        angler: ['老钓客看着湖面：“鱼会记得来过的人。”', '“先买竿，再谈技术。”']
      };
      const key = obj.npc && obj.npc.look ? obj.npc.look : 'clerk';
      UI.toast(obj.label || 'NPC', (lines[key] || lines.clerk)[Math.floor(Math.random() * (lines[key] || lines.clerk).length)], 'good', 'users');
      return;
    }
    if (obj.action === 'student') { showStudentProfile(obj.uid); return; }
    if (obj.action === 'coffee') { afterResult(G.coffee()); return; }
    if (obj.action === 'pet') { afterResult(G.pet()); return; }
    if (obj.action === 'plant') {
      UI.toast('琴叶榕', '你给它浇了点水。它看起来并不感激。', 'good', 'leaf');
      return;
    }
    if (obj.kind === 'fixture') { UI.showFixture(obj.fixture); return; }
    if (obj.kind === 'equipment') { UI.showEquipment(obj.uid); return; }
    if (obj.panel) { openPanel(obj.panel); return; }
  };

  UI.showFixture = function (id) {
    const f = (D.FIXTURES || []).find(x => x.id === id);
    if (!f) return;
    const state = G.state;
    const project = G.currentProject(state);
    const bonus = project ? (f.tags.some(t => project.tags.includes(t)) ? f.tier * 1.7 : f.tags.includes('通用') ? f.tier * 0.8 : 0) : 0;
    const panel = f.panel || 'research';
    const canUse = G.equipmentUseAvailable(f.id, state);
    const body = '<div class="modal-body">' +
      '<div class="row" style="align-items:flex-start;gap:10px">' +
      '<div class="event-portrait" style="width:76px;height:76px;flex:0 0 76px;display:flex;align-items:center;justify-content:center"><img src="' + A.icon(({ glovebox: 'chip', fumehood: 'flask', microscope: 'microscope', pipette: 'flask', balance: 'chart', computer: 'paper', bench: 'flask' })[f.id] || 'flask', 'dark') + '" style="width:48px;height:48px" alt=""></div>' +
      '<div class="grow"><div class="row between"><h3 style="margin:0;font-size:21px">' + U.esc(f.name) + '</h3>' + tag('固定仪器', 'teal') + '</div>' +
      '<div class="tiny-text mt6">' + U.esc(f.desc) + '</div>' +
      '<div class="row wrap mt6">' + f.tags.map(t => tag(t, 'gray')).join('') + '<span class="tag gold">设备契合 +' + bonus.toFixed(1) + '</span></div></div></div>' +
      '<div class="divider"></div>' +
      (f.use ? '<div class="use-line big"><b>' + U.esc(f.use.label) + '</b><span>' + U.esc(f.use.desc) + '</span></div>' : '') +
      '<div class="tiny-text">固定仪器不占设备位。每周每台仪器只能主动使用一次；使用会消耗 1 AP。</div>' +
      '</div><div class="modal-foot">' +
      '<button class="btn" data-act="closeModal">关闭</button>' +
      '<button class="btn primary" data-act="useEquip" data-id="' + f.id + '"' + (canUse.ok ? '' : ' disabled title="' + U.esc(canUse.reason || '') + '"') + '>' + (f.use ? U.esc(f.use.label) + ' (1AP)' : '使用') + '</button>' +
      '<button class="btn" data-act="fixtureUse" data-id="' + f.id + '" data-use="panel">打开' + (panel === 'papers' ? '论文' : '研究') + '</button>' +
      '</div>';
    openModal(modalShell(f.name, 'FIXED INSTRUMENT', body, { size: 'narrow' }), { type: 'fixture', closeable: true });
  };

  UI.showEquipment = function (uid) {
    const s = G.state;
    const ent = s.equipment.find(e => e.uid === uid);
    const d = ent ? G.equipDef(ent) : null;
    if (!d) return;
    const canUse = G.equipmentUseAvailable(uid, s);
    const used = s.equipmentUsed && s.equipmentUsed[uid] === s.week;
    const body = '<div class="modal-body">' +
      '<div class="row" style="align-items:flex-start;gap:10px">' +
      '<div class="event-portrait" style="width:76px;height:76px;flex:0 0 76px;display:flex;align-items:center;justify-content:center"><img src="' + A.equipThumb(d, 52) + '" style="width:52px;height:52px" alt=""></div>' +
      '<div class="grow"><div class="row between"><h3 style="margin:0;font-size:21px">' + U.esc(d.name) + '</h3>' + tag('设备', 'teal') + '</div>' +
      '<div class="tiny-text mt6">' + U.esc(d.desc) + '</div>' +
      '<div class="row wrap mt6">' + d.tags.map(t => tag(t, 'gray')).join('') + tag('状态 ' + Math.round(ent.condition) + '%', ent.condition < 35 ? 'coral' : 'green') + '</div></div></div>' +
      '<div class="divider"></div>' + useSummary(d) +
      '<div class="tiny-text">主动功能每周一次，消耗 1 AP。被动加成仍然生效。</div></div>' +
      '<div class="modal-foot"><button class="btn" data-act="closeModal">关闭</button>' +
      '<button class="btn primary" data-act="useEquip" data-id="' + uid + '"' + (canUse.ok ? '' : ' disabled title="' + U.esc(used ? '本周已使用' : canUse.reason || '') + '"') + '>' + (used ? '本周已用' : U.esc(d.use ? d.use.label : '使用') + ' (1AP)') + '</button></div>';
    openModal(modalShell(d.name, 'EQUIPMENT', body, { size: 'narrow' }), { type: 'equipment', closeable: true });
  };
  UI.showEquipment = UI.showEquipment;

  UI.showHallway = function () {
    const places = [
      { name: '细胞间', code: 'CELL CULTURE', note: '需要无菌资质与独立空调。' },
      { name: '公共仪器平台', code: 'CORE FACILITY', note: '电镜、测序与流式细胞仪。' },
      { name: '会议室', code: 'SEMINAR ROOM', note: '组会、答辩与咖啡机。' },
      { name: '咖啡厅', code: 'CAFE', note: '跨学科偶遇发生地。' }
    ];
    const body = '<div class="modal-body"><div class="section-title">3F 走廊</div>' +
      '<div class="tiny-text mb10">你推开门，走廊的感应灯亮了一排。其它房间都还锁着——先把这间实验室做好。</div>' +
      '<div class="hall-grid">' + places.map(p =>
        '<div class="hall-card locked"><div class="hall-code">' + p.code + '</div><div class="hall-name">' + p.name + '</div>' +
        '<div class="tiny-text">' + p.note + '</div><div class="hall-lock">LOCKED · 尚未解锁</div></div>'
      ).join('') + '</div>' +
      '<div class="tiny-text mt10">随着实验室升级与声望提升，这些场所会逐步开放。</div>' +
      '<div class="divider"></div><div class="section-title">RB 城市</div>' +
      '<div class="tiny-text">科技处、校外市场、外卖站与有名湖已经可以前往。3F 的其它房间仍然锁着。</div></div>' +
      '<div class="modal-foot"><button class="btn" data-act="closeModal">回到实验室</button>' +
      '<button class="btn primary" data-act="city">前往 RB 城市 →</button></div>';
    openModal(modalShell('走廊', '3F · HALLWAY', body, { size: '' }), { type: 'hallway', closeable: true });
  };

  UI.showBackpack = function () {
    const s = G.state;
    if (!s) return;
    const items = Object.keys(s.inventory || {}).filter(k => s.inventory[k] > 0);
    const active = G.activeStudents(s);
    const studentSelect = active.length ? '<select id="bag-student">' + active.map(st =>
      '<option value="' + st.uid + '"' + (G.ui.selectedStudentId === st.uid ? ' selected' : '') + '>' + U.esc(st.name) + ' · 默契 ' + Math.round(st.affinity || 0) + '</option>').join('') + '</select>' : '<span class="tiny-text">还没有学生</span>';
    const list = items.map(id => {
      const item = G.marketItemDef(id);
      if (!item) return '';
      return '<div class="bag-item"><div class="bag-icon">' + icon(item.icon, 'dark') + '</div>' +
        '<div class="grow"><div class="row between"><strong>' + U.esc(item.name) + '</strong><span class="tag gold">×' + s.inventory[id] + '</span></div>' +
        '<div class="tiny-text">' + U.esc(item.desc) + '</div>' + itemSummary(item) +
        '<button class="btn tiny primary mt6" data-act="bagUse" data-id="' + id + '"' + (item.effect && item.effect.affinity && !active.length ? ' disabled title="先招募一名学生"' : '') + '>' + (item.effect && item.effect.affinity ? '赠送 / 使用' : '使用') + '</button></div></div>';
    }).join('');
    const fishKeys = Object.keys((s.fishing && s.fishing.catches) || {}).filter(k => s.fishing.catches[k] > 0);
    const fish = fishKeys.length ? fishKeys.map(id => {
      const f = D.FISH.find(x => x.id === id);
      return f ? '<span class="tag teal">' + U.esc(f.name) + ' ×' + s.fishing.catches[id] + '</span>' : '';
    }).join(' ') : '<span class="tiny-text">鱼篓是空的。</span>';
    const body = '<div class="modal-body">' +
      '<div class="row between mb10"><div><div class="section-title" style="margin:0">背包</div><div class="tiny-text">科研、感情、事业与钓鱼物品。按 B 随时打开。</div></div>' +
      '<div class="row">' + tag('事业线索 ' + (s.careerClues || 0), 'blue') + tag('鱼竿 ' + (s.fishing ? s.fishing.rod : 0) + ' 级', 'teal') + '</div></div>' +
      '<div class="look-group"><div class="section-title">赠礼对象</div>' + studentSelect + '</div>' +
      '<div class="bag-grid">' + (list || '<div class="tiny-text">背包是空的。去「校外市场」看看。</div>') + '</div>' +
      '<div class="divider"></div><div class="row between"><span class="tiny-text">鱼篓</span>' +
      '<button class="btn tiny" data-act="sellAllFish"' + (fishKeys.length ? '' : ' disabled') + '>卖出全部鱼</button></div>' +
      '<div class="row wrap mt6">' + fish + '</div>' +
      '</div><div class="modal-foot"><button class="btn" data-act="closeModal">关闭</button>' +
      '<button class="btn" data-act="city">去校外市场</button></div>';
    openModal(modalShell('背包', 'INVENTORY', body, { size: '' }), { type: 'backpack', closeable: true });
  };

  UI.fishing = null;

  function fishingEl() { return document.getElementById('fishing-ui'); }

  UI.renderFishing = function () {
    const el = fishingEl();
    if (!el) return;
    const f = UI.fishing;
    if (!f) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.classList.remove('hidden');
    const st = G.state;
    const fish = st.fishing || { rod: 0, bait: 0, level: 1 };
    let html = '<div class="fishing-card"><div class="fishing-top"><span class="fishing-title">有名湖 · 钓鱼点</span>' +
      '<span class="fishing-meta">鱼竿 ' + fish.rod + ' 级 · 饵料 ' + (fish.bait || 0) + '</span></div>';
    if (f.phase === 'idle') {
      html += '<div class="fishing-status">湖面很安静。找一个位置，把线甩出去。</div>' +
        '<div class="fishing-actions"><button class="btn primary" data-act="fishCast"' + (fish.rod ? '' : ' disabled') + '>抛竿 (1AP)</button>' +
        '<button class="btn" data-act="fishBook">图鉴 / 卖鱼</button><button class="btn" data-act="closeFishing">收竿</button></div>';
    } else if (f.phase === 'cast') {
      html += '<div class="fishing-status waiting">浮标落水……等它动。</div><div class="fishing-wave"></div>' +
        '<div class="fishing-actions"><button class="btn" data-act="closeFishing">收线</button></div>';
    } else if (f.phase === 'bite') {
      html += '<div class="fishing-status bite">中鱼！现在提竿！</div>' +
        '<div class="fishing-actions"><button class="btn primary big-bite" data-act="fishHook">提竿！</button></div>';
    } else if (f.phase === 'result') {
      html += '<div class="fishing-status ' + (f.success ? 'success' : 'fail') + '">' + U.esc(f.message) + '</div>' +
        '<div class="fishing-actions"><button class="btn primary" data-act="fishCast"' + (fish.rod ? '' : ' disabled') + '>再抛一竿 (1AP)</button>' +
        '<button class="btn" data-act="fishBook">图鉴 / 卖鱼</button><button class="btn" data-act="closeFishing">收竿</button></div>';
    }
    html += '</div>';
    el.innerHTML = html;
  };

  UI.openFishing = function () {
    const s = G.state;
    if (!s.fishing || !s.fishing.rod) { UI.toast('还没有鱼竿', '先去校外市场买一根鱼竿。', 'warn'); return; }
    UI.fishing = { phase: 'idle' };
    UI.renderFishing();
  };

  UI.startCast = function () {
    const res = G.beginFishing();
    if (!res.ok) { UI.toast('无法抛竿', res.message, 'warn'); return; }
    if (UI._fishTimer) clearTimeout(UI._fishTimer);
    if (UI._fishWindow) clearTimeout(UI._fishWindow);
    UI.fishing = { phase: 'cast', wait: res.wait, window: res.window };
    UI.renderFishing();
    UI._fishTimer = setTimeout(() => {
      if (!UI.fishing || UI.fishing.phase !== 'cast') return;
      UI.fishing.phase = 'bite';
      UI.fishing.deadline = Date.now() + (UI.fishing.window || 2100);
      UI.renderFishing();
      UI._fishWindow = setTimeout(() => {
        if (!UI.fishing || UI.fishing.phase !== 'bite') return;
        const out = G.landFish(false);
        UI.fishing = { phase: 'result', success: false, message: out.message || '鱼跑了。' };
        UI.renderFishing();
      }, UI.fishing.window || 2100);
    }, res.wait);
  };

  UI.hookFish = function () {
    if (!UI.fishing || UI.fishing.phase !== 'bite') return;
    if (UI._fishWindow) clearTimeout(UI._fishWindow);
    if (Date.now() > (UI.fishing.deadline || 0)) {
      UI.fishing = { phase: 'result', success: false, message: '提竿太慢，鱼跑了。' };
    } else {
      const out = G.landFish(true);
      UI.fishing = { phase: 'result', success: !!out.ok, message: out.ok ? out.title + ' · ' + (out.lines || []).join(' / ') : (out.message || '脱钩了。') };
      if (out.ok) afterResult(out);
    }
    UI.renderFishing();
  };

  UI.closeFishing = function () {
    if (UI._fishTimer) clearTimeout(UI._fishTimer);
    if (UI._fishWindow) clearTimeout(UI._fishWindow);
    UI._fishTimer = UI._fishWindow = null;
    UI.fishing = null;
    const el = fishingEl();
    if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
  };

  UI.enterScene = function (id) {
    G.enterScene(id);
    UI.closeFishing();
    UI.closeModal(true);
    UI.walkTarget = null;
    UI.walkPath = null;
    UI.pendingInteract = null;
    UI.renderAll();
    const loc = D.LOCATIONS.find(x => x.id === id);
    const toastLayer = $('#toast-layer');
    if (toastLayer) toastLayer.innerHTML = '';
    UI.toast('进入 ' + (loc ? loc.name : 'RB 城市'), 'WASD 移动 · 靠近柜台按 E 交互 · 门口返回实验室', 'good', loc ? loc.icon : 'door');
    AU.play('open');
  };

  UI.leaveScene = function () {
    UI.closeFishing();
    G.leaveScene();
    UI.walkTarget = null;
    UI.walkPath = null;
    UI.renderAll();
    UI.toast('回到实验室', '门在身后合上。', 'good', 'door');
  };

  UI.showCity = function () {
    const cards = D.LOCATIONS.map(loc =>
      '<button class="city-card" data-act="travel" data-id="' + loc.id + '" style="border-left-color:' + loc.color + '">' +
      '<div class="city-icon"><img src="' + A.icon(loc.icon, 'dark') + '" alt=""></div>' +
      '<div class="city-copy"><div class="city-code">' + U.esc(loc.code) + '</div><div class="city-name">' + U.esc(loc.name) + '</div>' +
      '<p>' + U.esc(loc.desc) + '</p><span class="tag teal">已开放</span></div>' +
      '<span class="city-go">前往 →</span></button>').join('');
    const body = '<div class="modal-body"><div class="section-title">RB 城市</div>' +
      '<div class="tiny-text mb10">实验室门外是一座正在运转的城市。科研、钱、感情和运气，都在不同的地方等你。</div>' +
      '<div class="city-grid">' + cards + '</div></div>' +
      '<div class="modal-foot"><button class="btn" data-act="closeModal">回到实验室</button></div>';
    openModal(modalShell('城市', 'RB CITY MAP', body, { size: '' }), { type: 'city', closeable: true });
  };

  function locationBack() {
    return '<div class="modal-foot"><button class="btn" data-act="city">← 返回城市</button>' +
      '<button class="btn" data-act="closeModal">回到实验室</button></div>';
  }

  UI.showLocation = function (id) {
    const loc = D.LOCATIONS.find(x => x.id === id);
    if (!loc) return;
    UI.location = id;
    const s = G.state;
    let body = '';

    if (id === 'tech') {
      const grants = availableGrants();
      const active = s.applications.filter(a => a.status === 'pending');
      const cards = grants.map(g => {
        const d = g.def;
        const cat = D.GRANT_CATEGORIES[d.id] || '项目';
        const req = [];
        if (d.req.papers) req.push('论文 ' + s.stats.papers + '/' + d.req.papers);
        if (d.req.top) req.push('顶刊 ' + s.stats.topPapers + '/' + d.req.top);
        if (d.req.rep) req.push('声望 ' + Math.round(s.rep) + '/' + d.req.rep);
        return '<div class="grant-card ' + (g.win.open && g.met ? 'open' : 'locked') + '" style="border-left-color:' + d.color + '">' +
          '<div class="grant-top"><div><h4>' + U.esc(d.name) + '</h4><div class="row wrap mb6"><span class="tag ' + (g.win.open ? 'teal' : 'gray') + '">' + U.esc(cat) + '</span>' + req.map(x => '<span class="req-chip">' + U.esc(x) + '</span>').join('') + '</div>' +
          '<div class="tiny-text">' + U.esc(d.desc) + '</div></div><div class="grant-amount">' + U.fmtMoney(d.amount) + '</div></div>' +
          '<div class="row between mt6"><span class="tiny-text">' + (g.win.open ? '开放至第 ' + g.win.deadline + ' 周' : '尚未开放') + ' · 命中率约 ' + Math.round(g.chance * 100) + '%</span>' +
          '<button class="btn small ' + (g.can.ok ? 'primary' : '') + '" data-act="applyGrant" data-id="' + d.id + '"' + (g.can.ok ? '' : ' disabled title="' + U.esc(g.can.reason || '') + '"') + '>提交项目书 (2AP)</button></div></div>';
      }).join('');
      const activeGrants = (s.activeGrants || []).map(a => '<div class="row between" style="padding:3px 0"><span>' + U.esc(a.name || (G.grantDef(a.defId) || {}).name || '在研项目') + '</span><span class="tiny-text">' + U.fmtMoney(a.amount || 0) + ' · 第 ' + (a.startWeek || 1) + ' 周起</span></div>').join('');
      const pending = '<div class="decision-banner" style="background:#e7f0e9"><h4>项目状态</h4><p>' +
        (activeGrants || '还没有在研项目。') +
        (active.length ? '<br><br>评审中：' + active.map(a => U.esc((G.grantDef(a.defId) || {}).name || a.defId) + '（约第 ' + a.decisionWeek + ' 周）').join('；') : '') +
        '</p></div>';
      body = '<div class="modal-body"><div class="section-title">科技处</div>' +
        '<div class="tiny-text mb10">窗口后面的老师把章盖得很快。项目书、在研项目和下一轮指南都从这里走。</div>' + pending +
        '<div class="row between mb6"><span class="tiny-text">可申请项目 / 类型</span><span class="tag">' + grants.length + ' 类</span></div>' +
        '<div class="grant-grid">' + cards + '</div></div>' + locationBack();
    }

    if (id === 'market') {
      const shop = D.MARKET_ITEMS.map(item => {
        const owned = (s.inventory && s.inventory[item.id]) || 0;
        const needStudent = item.effect && item.effect.affinity && !G.activeStudents(s).length;
        return '<div class="market-card"><div class="market-icon"><img src="' + A.icon(item.icon, 'dark') + '" alt=""></div>' +
          '<div class="grow"><div class="row between"><h4>' + U.esc(item.name) + '</h4><span class="tag gold">' + U.fmtMoney(item.price) + '</span></div>' +
          '<div class="tiny-text">' + U.esc(item.desc) + '</div>' + itemSummary(item) +
          '<div class="row between mt6"><span class="tiny-text">持有 ' + owned + '</span>' +
          '<div class="row"><button class="btn tiny" data-act="buyItem" data-id="' + item.id + '"' + (s.funds >= item.price ? '' : ' disabled') + '>购买</button>' +
          (owned ? '<button class="btn tiny primary" data-act="useItem" data-id="' + item.id + '"' + (needStudent ? ' disabled title="先招募一名学生"' : '') + '>使用</button>' : '') + '</div></div></div></div>';
      }).join('');
      const inv = Object.keys(s.inventory || {}).filter(k => s.inventory[k] > 0);
      body = '<div class="modal-body"><div class="row between"><div class="section-title">校外市场</div>' +
        '<div class="row">' + tag('事业线索 ' + (s.careerClues || 0), 'blue') + tag('资金 ' + U.fmtMoney(s.funds), 'gold') + '</div></div>' +
        '<div class="tiny-text mb10">旧货摊、试剂贩子和一个卖鱼竿的人。这里卖的不只是物品，也可能是线索。</div>' +
        '<div class="market-grid">' + shop + '</div>' +
        (inv.length ? '<div class="divider"></div><div class="tiny-text">背包：' + inv.map(k => {
          const it = G.marketItemDef(k); return it ? U.esc(it.name) + ' ×' + s.inventory[k] : '';
        }).join(' · ') + '</div>' : '') + '</div>' + locationBack();
    }

    if (id === 'delivery') {
      body = '<div class="modal-body"><div class="section-title">外卖站</div>' +
        '<div class="decision-banner" style="background:#f6e6bd"><h4>换上工服，跑一单</h4><p>不消耗经费，只消耗行动力。跑得越多，本周单价会略高，但 PI 的压力也会上升。</p></div>' +
        '<div class="kv"><span class="k">本周已跑</span><span class="v">' + (s.delivery && s.delivery.week === s.week ? s.delivery.count : 0) + ' 单</span></div>' +
        '<div class="kv"><span class="k">累计收入</span><span class="v">' + U.fmtMoney((s.delivery && s.delivery.total) || 0) + '</span></div>' +
        '<div class="kv"><span class="k">当前行动力</span><span class="v">' + s.ap + ' / ' + G.maxAp(s) + '</span></div>' +
        '<div class="divider"></div><button class="btn primary big-btn" data-act="runDelivery"' + (s.ap < 1 ? ' disabled' : '') + '>跑一单外卖 (1AP)</button>' +
        '<div class="tiny-text mt10">每单约 ¥900–1,900。不会让你发财，但能让你把下周的试剂钱补上。</div></div>' + locationBack();
    }

    if (id === 'lake') {
      const f = s.fishing;
      const caughtCount = Object.keys(f.caught || {}).length;
      const comp = D.FISH.map(fish => {
        const known = (f.caught && f.caught[fish.id]) || 0;
        return '<div class="fish-card ' + (known ? 'known' : 'unknown') + '">' +
          '<div class="fish-mark" style="background:' + (known ? fish.color : '#6d6570') + '">' + (known ? '鱼' : '?') + '</div>' +
          '<div><div class="row between"><strong>' + (known ? U.esc(fish.name) : '未发现') + '</strong><span class="tag ' + (known ? 'teal' : 'gray') + '">' + (known ? D.FISH_RARITY[fish.rarity].name : '???') + '</span></div>' +
          '<div class="tiny-text">' + (known ? U.esc(fish.desc) : '继续钓鱼以解锁图鉴。') + '</div>' +
          '<div class="tiny-text">价值 ' + (known ? U.fmtMoney(fish.value) : '???') + ' · 捕获 ' + known + '</div></div></div>';
      }).join('');
      const basket = Object.keys(f.catches || {}).filter(k => f.catches[k] > 0).map(k => {
        const fish = D.FISH.find(x => x.id === k);
        if (!fish) return '';
        return '<span class="tag teal">' + U.esc(fish.name) + ' ×' + f.catches[k] + '</span>';
      }).join(' ');
      body = '<div class="modal-body"><div class="row between mb10"><div><div class="section-title" style="margin:0">有名湖</div><div class="tiny-text">钓鱼等级 ' + f.level + ' · 经验 ' + f.xp + ' · 鱼竿 ' + f.rod + ' 级 · 饵料 ' + (f.bait || 0) + '</div></div>' +
        '<div class="row">' + tag('图鉴 ' + caughtCount + '/' + D.FISH.length, 'teal') + tag('累计 ' + (f.total || 0) + ' 条', 'gold') + '</div></div>' +
        (!f.rod ? '<div class="decision-banner" style="background:#f6e6bd"><h4>你还没有鱼竿</h4><p>先去「校外市场」买一根轻量碳素鱼竿；饵料可以提高稀有种概率。</p></div>' : '') +
        '<div class="row mb10"><button class="btn primary" data-act="fishGo"' + (s.ap < 1 || !f.rod ? ' disabled' : '') + '>' + (!f.rod ? '需要鱼竿' : '去钓鱼点') + '</button>' +
        '<button class="btn" data-act="sellAllFish"' + (basket ? '' : ' disabled') + '>卖出全部鱼</button>' +
        '<span class="tiny-text">鱼篓：' + (basket || '空') + '</span></div>' +
        '<div class="fish-grid">' + comp + '</div></div>' + locationBack();
    }

    openModal(modalShell(loc.name, loc.code, body, { size: '' }), { type: 'location', closeable: true });
  };

  function onSceneMove(e) {
    if (UI.mode !== 'game' || !G.state || UI.modalOpen) return;
    const canvas = $('#scene-canvas');
    const pt = canvasPoint(canvas, e);
    const hs = A.hitTest(G.state, pt.x, pt.y, A.lastLayout);
    if (hs !== UI.hovered) {
      UI.hovered = hs;
      const hint = $('#scene-hint');
      if (hs) {
        const near = UI.nearby && UI.nearby.id === hs.id;
        hint.innerHTML = '<b>' + U.esc(hs.label) + '</b><span>' + U.esc(hs.hint || '') + '</span><span class="key">' + (near ? 'E' : 'CLICK') + '</span>';
        hint.classList.add('show');
        canvas.classList.add('pointing');
      } else {
        hint.classList.remove('show');
        canvas.classList.remove('pointing');
      }
    }
  }

  function onSceneClick(e) {
    if (UI.mode !== 'game' || !G.state || UI.modalOpen) return;
    const canvas = $('#scene-canvas');
    const pt = canvasPoint(canvas, e);
    const hs = A.hitTest(G.state, pt.x, pt.y, A.lastLayout);
    if (!hs) {
      const walk = A.nearestWalkable(G.state, pt.x, pt.y);
      if (walk) {
        const path = A.findPath(G.state, G.state.player.x, G.state.player.y, walk.x, walk.y);
        UI.walkPath = path;
        UI.walkTarget = walk;
        UI.pendingInteract = null;
      }
      return;
    }
    const p = G.state.player;
    const d = Math.hypot(hs.ax - p.x, hs.ay - p.y);
    const reach = (G.state.scene && G.state.scene !== 'lab') ? (hs.radius || 1.5) : (hs.radius || 30) + 8;
    if (hs.action === 'expansion' || d <= reach) {
      UI.interact(hs);
      return;
    }
    const approach = A.approachPoint(G.state, hs, p.x, p.y);
    if (approach) {
      const path = A.findPath(G.state, p.x, p.y, approach.x, approach.y);
      if (path && path.length) {
        UI.walkPath = path;
        UI.walkTarget = approach;
        UI.pendingInteract = hs;
        UI.toast('走近一点', hs.label + ' · 到达后按 E 交互', 'good', 'arrow');
      } else {
        UI.toast('过不去', '换个方向绕一下。', 'warn');
      }
    } else {
      UI.toast('过不去', '换个方向绕一下。', 'warn');
    }
  }

  UI.updatePlayer = function (dt) {
    const s = G.state;
    if (!s || !s.player) return;
    const p = s.player;
    const keys = UI.keys;
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;
    if (dx || dy) {
      UI.walkTarget = null;
      UI.walkPath = null;
      UI.pendingInteract = null;
    } else if (UI.walkPath && UI.walkPath.length) {
      let wp = UI.walkPath[0];
      let tx = wp.x - p.x;
      let ty = wp.y - p.y;
      let d = Math.hypot(tx, ty);
      const nearWp = (s.scene && s.scene !== 'lab') ? 0.3 : 4;
      if (d < nearWp) {
        UI.walkPath.shift();
        if (!UI.walkPath.length) {
          UI.walkTarget = null;
          p.moving = false;
          if (UI.pendingInteract) {
            const obj = UI.pendingInteract;
            UI.pendingInteract = null;
            UI.interact(obj);
          }
          return;
        }
        wp = UI.walkPath[0];
        tx = wp.x - p.x;
        ty = wp.y - p.y;
        d = Math.hypot(tx, ty);
      }
      if (d > 0.5) {
        dx = tx / d;
        dy = ty / d;
      }
    } else if (UI.walkTarget) {
      const tx = UI.walkTarget.x - p.x;
      const ty = UI.walkTarget.y - p.y;
      const d = Math.hypot(tx, ty);
      const nearTarget = (s.scene && s.scene !== 'lab') ? 0.22 : 2.5;
      if (d < nearTarget) {
        UI.walkTarget = null;
        p.moving = false;
        if (UI.pendingInteract) {
          const obj = UI.pendingInteract;
          UI.pendingInteract = null;
          UI.interact(obj);
        }
        return;
      }
      dx = tx / d;
      dy = ty / d;
    }
    if (!dx && !dy) {
      p.moving = false;
      return;
    }
    const len = Math.hypot(dx, dy) || 1;
    const step = (s.scene && s.scene !== 'lab' ? 3.2 : UI.playerSpeed) * Math.min(dt, 0.06);
    const nx = p.x + (dx / len) * step;
    const ny = p.y + (dy / len) * step;
    let moved = false;
    if (A.isWalkable(s, nx, p.y)) { p.x = nx; moved = true; }
    if (A.isWalkable(s, p.x, ny)) { p.y = ny; moved = true; }
    if (!moved) {
      UI.walkTarget = null;
      UI.walkPath = null;
      UI.pendingInteract = null;
    }
    if (Math.abs(dx) > Math.abs(dy)) p.facing = dx < 0 ? 'left' : 'right';
    else if (Math.abs(dy) > 0.2) p.facing = dy < 0 ? 'up' : 'down';
    p.moving = moved;
    UI.updateNearby();
  };

  /* =========================================================
     EVENT DELEGATION
     ========================================================= */

  function handleChange(e) {
    const el = e.target.closest('[data-change]');
    if (!el) return;
    const uid = el.dataset.id;
    if (el.dataset.change === 'focus') G.setFocus(uid, el.value);
    if (el.dataset.change === 'project') G.setStudentProject(uid, el.value);
    UI.renderAll();
    if (UI.modalType === 'student') showStudentProfile(uid);
    else refreshPanel();
  }

  function handleClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el) {
      // click on backdrop closes normal modals
      if (e.target.id === 'modal-layer' && UI.modalOpen && UI.modalCloseable && UI.modalType !== 'event' && UI.modalType !== 'eventResult') {
        UI.closeModal();
      }
      return;
    }
    const act = el.dataset.act;
    const id = el.dataset.id;
    if (AU && A) AU.play('click');

    switch (act) {
      case 'closeModal':
        if (UI.modalType === 'event' || UI.modalType === 'eventResult') return;
        UI.closeModal();
        break;
      case 'newGame':
        UI.startIntro();
        break;
      case 'continueGame': UI.continueGame(); break;
      case 'nextIntro': UI.nextIntro(); break;
      case 'skipIntro':
        UI.introSlide = 3;
        renderIntro();
        break;
      case 'chooseProject':
        UI.introProject = id;
        renderIntro();
        break;
      case 'firstWeekTeam':
        UI.closeModal(true);
        openPanel('team');
        break;
      case 'doAction':
        UI.doAction(id);
        break;
      case 'advance':
        UI.advance();
        break;
      case 'advanceConfirm':
        UI.closeModal(true);
        UI.runWeek();
        break;
      case 'reportContinue':
        UI.reportContinue();
        break;
      case 'eventChoice':
        UI.eventChoice(parseInt(el.dataset.index, 10));
        break;
      case 'eventContinue':
        UI.eventContinue();
        break;
      case 'panelTab':
        if (UI.panelType !== id) { UI.panelType = id; openPanel(id); }
        break;
      case 'openPanel':
        openPanel(id);
        break;
      case 'openBackpack':
        UI.showBackpack();
        break;
      case 'bagUse': {
        const sel = document.querySelector('#bag-student');
        if (sel) G.ui.selectedStudentId = sel.value;
        const res = G.useMarketItem(id);
        if (res.ok) { afterResult(res); UI.showBackpack(); }
        else UI.toast('无法使用', res.message, 'warn');
        break;
      }
      case 'city':
        UI.showCity();
        break;
      case 'travel':
        UI.enterScene(id);
        break;
      case 'leaveScene':
        UI.leaveScene();
        break;
      case 'buyItem': {
        const res = G.buyMarketItem(id);
        if (res.ok) { afterResult(res); UI.showLocation('market'); }
        else UI.toast('无法购买', res.message, 'warn');
        break;
      }
      case 'useItem': {
        const res = G.useMarketItem(id);
        if (res.ok) { afterResult(res); UI.showLocation('market'); }
        else UI.toast('无法使用', res.message, 'warn');
        break;
      }
      case 'runDelivery': {
        const res = G.runDelivery();
        if (res.ok) { afterResult(res); UI.showLocation('delivery'); }
        else UI.toast('跑单失败', res.message, 'warn');
        break;
      }
      case 'fish': {
        const res = G.fish();
        if (res.ok) { afterResult(res); UI.showLocation('lake'); }
        else UI.toast('今天不适合钓鱼', res.message, 'warn');
        break;
      }
      case 'fishGo':
        UI.closeModal(true);
        UI.openFishing();
        break;
      case 'fishCast':
        UI.startCast();
        break;
      case 'fishHook':
        UI.hookFish();
        break;
      case 'fishBook':
        UI.showLocation('lake');
        break;
      case 'closeFishing':
        UI.closeFishing();
        break;
      case 'sellFish': {
        const res = G.sellFish(id);
        if (res.ok) { afterResult(res); UI.showLocation('lake'); }
        else UI.toast('卖鱼失败', res.message, 'warn');
        break;
      }
      case 'sellAllFish': {
        const res = G.sellAllFish();
        if (res.ok) {
          afterResult(res);
          if (UI.modalType === 'backpack') UI.showBackpack();
          else UI.showLocation('lake');
        } else UI.toast('卖鱼失败', res.message, 'warn');
        break;
      }
      case 'fixtureUse': {
        const use = el.dataset.use;
        const f = (D.FIXTURES || []).find(x => x.id === id);
        UI.closeModal(true);
        if (use === 'panel') openPanel((f && f.panel) || 'research');
        else UI.doAction(use);
        break;
      }
      case 'selectProject':
        G.ui.selectedProjectId = id;
        refreshPanel();
        UI.renderAll();
        break;
      case 'activateProject':
        afterResult(G.activateProject(id));
        refreshPanel();
        break;
      case 'mentor': {
        if (!id) break;
        G.ui.selectedStudentId = id;
        afterResult(G.doAction('mentor'));
        refreshPanel();
        break;
      }
      case 'fire':
        confirmModal('解雇成员', '确定让这名成员离开？需要支付 2 个月工资作为补偿，全室士气 -4。', '确定解雇', 'fireConfirm');
        UI._pendingFire = id;
        break;
      case 'fireConfirm': {
        const uid = UI._pendingFire;
        UI.closeModal(true);
        if (uid) afterResult(G.fireStudent(uid));
        refreshPanel();
        break;
      }
      case 'hire':
        afterResult(G.hireStudent(id));
        refreshPanel();
        break;
      case 'refreshApplicants':
        afterResult(G.refreshApplicants());
        refreshPanel();
        break;
      case 'teamActivity':
        afterResult(G.teamActivity());
        refreshPanel();
        break;
      case 'openStudent':
        showStudentProfile(id);
        break;
      case 'delegate':
        showDelegate(id);
        break;
      case 'delegatePaper':
        showDelegate((G.activeStudents(s)[0] || {}).uid, id);
        break;
      case 'delegateDo': {
        const res = G.delegateTask(el.dataset.uid, el.dataset.task, el.dataset.paper || null);
        if (res.ok) {
          UI.closeModal(true);
          afterResult(res);
          refreshPanel();
        } else UI.toast('委派失败', res.message, 'warn');
        break;
      }
      case 'openFixture':
        UI.showFixture(id);
        break;
      case 'useEquip': {
        const res = G.useEquipment(id);
        if (res.ok) {
          UI.closeModal(true);
          afterResult(res);
          refreshPanel();
        } else UI.toast('无法使用设备', res.reason || res.message, 'warn');
        break;
      }
      case 'revisePaper':
        G.ui.selectedPaperId = id;
        afterResult(G.doAction('revise'));
        refreshPanel();
        break;
      case 'openJournal':
        showJournalPicker(id);
        break;
      case 'submitJournal': {
        const paperId = el.dataset.paper;
        const journalId = el.dataset.journal;
        const res = G.submitPaper(paperId, journalId);
        if (res.ok) {
          UI.closeModal(true);
          afterResult(res);
          openPanel('papers');
        } else {
          UI.toast('无法投稿', res.message, 'warn');
        }
        break;
      }
      case 'urgePaper':
        afterResult(G.urgePaper(id));
        refreshPanel();
        break;
      case 'applyGrant':
        afterResult(G.applyGrant(id));
        if (UI.location === 'tech') UI.showLocation('tech');
        else refreshPanel();
        break;
      case 'borrow':
        afterResult(G.borrowMoney(parseInt(el.dataset.amount, 10)));
        refreshPanel();
        break;
      case 'repay':
        afterResult(G.repayLoan(el.dataset.amount === 'all' ? 'all' : parseInt(el.dataset.amount, 10)));
        refreshPanel();
        break;
      case 'buyEquip':
        afterResult(G.buyEquipment(id));
        refreshPanel();
        break;
      case 'sellEquip':
        confirmModal('出售设备', '出售后只能收回约 45% 的价值。确定吗？', '出售', 'sellEquipConfirm');
        UI._pendingEquip = id;
        break;
      case 'sellEquipConfirm':
        UI.closeModal(true);
        if (UI._pendingEquip) afterResult(G.sellEquipment(UI._pendingEquip));
        refreshPanel();
        break;
      case 'repairEquip':
        afterResult(G.repairEquipment(id));
        refreshPanel();
        break;
      case 'upgradeLab':
        afterResult(G.upgradeLab());
        refreshPanel();
        break;
      case 'save':
        if (G.save()) UI.toast('已保存', '本地存档已更新。', 'good', 'save');
        else UI.toast('保存失败', '浏览器可能禁用了本地存储。', 'bad');
        break;
      case 'setLang':
        UI.setLang(el.dataset.lang);
        break;
      case 'customize':
        UI.openCustomize(UI.mode === 'game' ? 'game' : 'intro');
        break;
      case 'look':
        UI.setLookField(el.dataset.field, el.dataset.value);
        break;
      case 'lookDone':
        UI.closeModal(true);
        if (UI.customizeFrom === 'game' && G.state) {
          G.state.look = Object.assign({}, UI.lookDraft || defaultLook());
          G.save();
          UI.renderAll();
          UI.toast('外观已更新', '新的发型与衣着会出现在实验室里。', 'good');
        } else {
          renderIntro();
        }
        break;
      case 'settings':
        UI.openSettings('game');
        break;
      case 'titleSettings':
        UI.openSettings('title');
        break;
      case 'help':
        UI.openHelp();
        break;
      case 'credits':
        UI.openCredits();
        break;
      case 'toggleMusic':
        AU.toggleMusic();
        UI.openSettings(UI.settingsFrom);
        break;
      case 'toggleSfx':
        AU.toggleSfx();
        UI.openSettings(UI.settingsFrom);
        break;
      case 'fullscreen':
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
        break;
      case 'resetConfirm':
        confirmModal('删除存档', '这会删除当前实验室的全部进度，无法恢复。确定吗？', '删除并重开', 'resetDo', '取消');
        break;
      case 'resetDo':
        G.reset();
        UI.closeModal(true);
        UI.showTitle();
        UI.toast('存档已删除', '可以开始新的旅程了。', 'warn');
        break;
      case 'exportSave':
        exportSaveFile();
        break;
      case 'endingRestart':
        G.reset();
        UI.closeModal(true);
        UI.mode = 'title';
        UI.startIntro();
        break;
      case 'endingTitle':
        UI.closeModal(true);
        UI.showTitle();
        break;
      case 'sound':
        toggleAllSound();
        break;
      case 'titleContinue':
        UI.continueGame();
        break;
      default:
        break;
    }
  }

  function exportSaveFile() {
    if (!G.state) return;
    try {
      const blob = new Blob([G.exportSave()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'lablife-save-week' + G.state.week + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      UI.toast('存档已导出', '文件已下载。', 'good', 'save');
    } catch (e) {
      UI.toast('导出失败', '浏览器阻止了下载。', 'bad');
    }
  }

  /* =========================================================
     INIT / LOOP
     ========================================================= */

  UI.continueGame = function () {
    const s = G.load();
    if (!s) {
      UI.toast('没有存档', '先开始一局新的游戏。', 'warn');
      return;
    }
    UI.mode = 'game';
    UI.lookDraft = Object.assign(defaultLook(), s.look || {});
    $('#title-screen').classList.add('hidden');
    $('#intro-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
    $('#modal-layer').classList.add('hidden');
    UI.modalOpen = false;
    UI.renderAll();
    AU.resume();
    AU.play('open');
    if (s.ended) {
      UI.showEnding(s.ending || s.ended);
    } else if (s.pendingEvent) {
      UI.showEvent();
    } else {
      UI.toast('继续经营', s.labName + ' · 第 ' + s.week + ' 周', 'good');
    }
  };

  function toggleAllSound() {
    const next = !AU.isMusicOn() || !AU.isSfxOn();
    AU.toggleMusic(next);
    AU.toggleSfx(next);
    updateSoundButton();
  }

  function updateSoundButton() {
    const btn = $('#btn-sound');
    if (!btn) return;
    const on = AU.isMusicOn() || AU.isSfxOn();
    btn.innerHTML = '<img src="' + A.icon(on ? 'sound' : 'soundoff', 'light') + '" alt="">';
    btn.title = on ? '静音' : '开启声音';
  }

  UI.init = function () {
    $('#btn-new').addEventListener('click', () => { AU.resume(); UI.startIntro(); });
    $('#btn-continue').addEventListener('click', () => { AU.resume(); UI.continueGame(); });
    $('#btn-title-settings').addEventListener('click', () => { AU.resume(); UI.openSettings('title'); });
    $('#btn-credits').addEventListener('click', () => { AU.resume(); UI.openCredits(); });
    $('#intro-next').addEventListener('click', () => { AU.resume(); UI.nextIntro(); });
    $('#intro-skip').addEventListener('click', () => { AU.resume(); UI.introSlide = 3; renderIntro(); });
    $('#btn-advance').addEventListener('click', () => UI.advance());
    $('#btn-backpack').addEventListener('click', () => { AU.resume(); UI.showBackpack(); });
    $('#btn-save').addEventListener('click', () => {
      if (G.save()) UI.toast('已保存', '本地存档已更新。', 'good', 'save');
    });
    $('#btn-sound').addEventListener('click', toggleAllSound);
    $('#btn-help').addEventListener('click', () => { AU.resume(); UI.openHelp(); });
    $('#btn-settings').addEventListener('click', () => { AU.resume(); UI.openSettings('game'); });

    $$('.dock-btn').forEach(btn => btn.addEventListener('click', () => {
      AU.resume();
      openPanel(btn.dataset.panel);
    }));

    const canvas = $('#scene-canvas');
    canvas.addEventListener('mousemove', onSceneMove);
    canvas.addEventListener('mouseleave', () => {
      UI.hovered = null;
      $('#scene-hint').classList.remove('show');
      canvas.classList.remove('pointing');
    });
    canvas.addEventListener('click', onSceneClick);

    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);

    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (UI.mode === 'intro') {
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); UI.nextIntro(); }
        return;
      }
      if (UI.mode !== 'game') return;
      if (e.key === 'Escape') {
        if (UI.modalOpen && UI.modalCloseable && UI.modalType !== 'event' && UI.modalType !== 'eventResult') UI.closeModal();
        return;
      }
      if (UI.modalOpen) return;
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
        UI.keys[k] = true;
        return;
      }
      if (k === 'e' || e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault();
        if (UI.fishing && UI.fishing.phase === 'bite') { UI.hookFish(); return; }
        if (UI.nearby) UI.interact(UI.nearby);
        return;
      }
      if (k === 'b') {
        e.preventDefault();
        UI.showBackpack();
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        UI.advance();
        return;
      }
      if (/^[1-6]$/.test(e.key)) {
        const tab = PANEL_TABS[parseInt(e.key, 10) - 1];
        if (tab) openPanel(tab.id);
      }
    });
    document.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright') {
        UI.keys[k] = false;
      }
    });
    window.addEventListener('blur', () => { UI.keys = {}; });

    // objective toasts
    G.onObjectives = function (list) {
      list.forEach(o => {
        const parts = [];
        if (o.reward && o.reward.funds) parts.push('+' + U.fmtMoney(o.reward.funds));
        if (o.reward && o.reward.rep) parts.push('声望 +' + o.reward.rep);
        UI.toast('目标完成 · ' + o.title, parts, 'great', 'star');
      });
      if (G.state) UI.renderAll();
    };

    const saveBtn = $('#btn-save');
    const helpBtn = $('#btn-help');
    const setBtn = $('#btn-settings');
    const bagBtn = $('#btn-backpack');
    if (bagBtn) bagBtn.innerHTML = icon('briefcase', 'light');
    if (saveBtn) saveBtn.innerHTML = icon('save', 'light');
    if (helpBtn) helpBtn.innerHTML = icon('help', 'light');
    if (setBtn) setBtn.innerHTML = icon('gear', 'light');
    $$('.d-icon[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon, 'light'); });

    UI.showTitle();
    updateSoundButton();

    // resume audio on first interaction
    const resume = () => { AU.resume(); document.removeEventListener('pointerdown', resume); };
    document.addEventListener('pointerdown', resume);
  };

  UI.tick = function (ts) {
    const t = ts / 1000;
    const dt = UI.lastTs ? Math.min(0.08, (ts - UI.lastTs) / 1000) : 0.016;
    UI.lastTs = ts;
    if (UI.mode === 'title') {
      const cv = $('#title-canvas');
      if (cv) A.drawTitle(cv, t);
    } else if (UI.mode === 'intro') {
      const cv = $('#intro-canvas');
      if (cv) A.drawIntro(cv, UI.introSlide, t);
    } else if (UI.mode === 'game' && G.state) {
      if (!UI.modalOpen) UI.updatePlayer(dt);
      UI.updateNearby();
      const cv = $('#scene-canvas');
      if (cv) A.drawScene(cv, G.state, t, UI);
    }
  };

  UI.renderAll = UI.renderAll;
  window.LabUI = UI;
})();

