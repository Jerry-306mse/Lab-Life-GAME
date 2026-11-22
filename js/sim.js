
/* Lab Life — simulation core. No DOM in this file. */
(function () {
  'use strict';
  const U = window.LabUtil;
  const D = window.LAB_DATA;

  const SAVE_KEY = 'lablife_save_v1';
  const META_KEY = 'lablife_meta_v1';

  const LAB_LEVELS = {
    1: { name: '借来的实验室', cap: 3, equip: 3, ap: 6, rent: 8000, desc: '半间旧实验室，一台总在响的离心机。' },
    2: { name: '像样的实验室', cap: 5, equip: 5, ap: 6, rent: 12000, cost: 120000, req: { rep: 120, papers: 2, top: 0 }, desc: '有了独立细胞间和像样的门禁。' },
    3: { name: '交叉研究中心', cap: 7, equip: 7, ap: 7, rent: 18000, cost: 350000, req: { rep: 350, papers: 4, top: 0 }, desc: '两层空间，三个方向开始互相借力。' },
    4: { name: '世界级平台', cap: 9, equip: 9, ap: 8, rent: 28000, cost: 900000, req: { rep: 800, papers: 8, top: 2 }, desc: '一整层楼。访客进来时会先安静两秒。' }
  };

  const ACTIONS = [
    { id: 'experiment', name: '做实验', ap: 1, icon: 'flask', tone: 'teal', desc: '为当前项目积累数据，消耗少量试剂。', hint: '+数据 · 小额耗材' },
    { id: 'analyze', name: '分析数据', ap: 1, icon: 'chart', tone: 'blue', desc: '把 15 点数据转化为洞察，并提升质量。', hint: '需要 15 数据' },
    { id: 'write', name: '写论文', ap: 2, icon: 'paper', tone: 'gold', desc: '消耗 30 点洞察，开启一篇新论文草稿。', hint: '需要 30 洞察' },
    { id: 'revise', name: '改论文', ap: 1, icon: 'pen', tone: 'coral', desc: '推进草稿，或完成一轮返修。', hint: '草稿/返修' },
    { id: 'mentor', name: '指导学生', ap: 1, icon: 'heart', tone: 'pink', desc: '提升选中学生的技能，缓解压力。', hint: '选一名学生' },
    { id: 'network', name: '学术社交', ap: 1, icon: 'users', tone: 'blue', desc: '经营声望，可能带来合作与新候选人。', hint: '+声望' },
    { id: 'grant', name: '写基金', ap: 0, icon: 'coin', tone: 'gold', desc: '查看本轮基金窗口。提交申请消耗 2 行动力。', hint: '打开基金页面' },
    { id: 'rest', name: '休息', ap: 1, icon: 'coffee', tone: 'green', desc: '降低 PI 压力，提升全室士气。', hint: '-压力 · +士气' },
    { id: 'consult', name: '横向咨询', ap: 1, icon: 'briefcase', tone: 'gray', desc: '赚一笔快钱，但会挤压研究时间。', hint: '每 4 周一次' }
  ];

  const FOCI = {
    experiment: { name: '实验', icon: 'flask', desc: '积累数据，压力增长较快' },
    analyze: { name: '分析', icon: 'chart', desc: '把数据转成洞察' },
    write: { name: '写作', icon: 'paper', desc: '推进论文草稿' },
    survey: { name: '调研', icon: 'book', desc: '提升质量与新颖度' },
    rest: { name: '休整', icon: 'coffee', desc: '恢复压力与士气' }
  };

  const Game = {
    state: null,
    ui: {
      selectedProjectId: null,
      selectedStudentId: null,
      selectedPaperId: null,
      panel: null,
      journalPaperId: null
    },
    ACTIONS: ACTIONS,
    FOCI: FOCI,
    LAB_LEVELS: LAB_LEVELS,
    SAVE_KEY: SAVE_KEY,
    META_KEY: META_KEY
  };

  /* ---------------- creation ---------------- */

  function makeProject(def, status) {
    return {
      defId: def.id,
      name: def.name,
      full: def.full,
      field: def.field,
      tags: def.tags.slice(),
      status: status,
      data: 0,
      insight: 0,
      quality: def.startingQuality,
      novelty: def.novelty,
      papers: 0,
      maxPapers: 4,
      totalData: 0,
      breakthroughs: 0,
      startedWeek: status === 'active' ? 1 : 0
    };
  }

  function makeStudent(def, isApplicant) {
    const variance = () => U.randInt(-4, 4);
    const st = {
      uid: isApplicant ? 'app_' + def.defId + '_' + U.uid('x').slice(-5) : 'stu_' + def.defId,
      defId: def.defId,
      name: def.name,
      role: def.role,
      field: def.field,
      skill: U.clamp(def.skill + variance(), 10, 98),
      talent: U.clamp(def.talent + variance(), 20, 100),
      diligence: U.clamp(def.diligence + variance(), 20, 100),
      creativity: U.clamp(def.creativity + variance(), 20, 100),
      resilience: U.clamp(def.resilience + variance(), 20, 100),
      teamwork: U.clamp(def.teamwork + variance(), 20, 100),
      communication: U.clamp(def.communication + variance(), 20, 100),
      potential: def.potential,
      salary: def.salary,
      color: def.color,
      quote: def.quote,
      bio: def.bio,
      portrait: def.portrait,
      stress: isApplicant ? 0 : U.randInt(6, 16),
      morale: isApplicant ? 70 : U.randInt(70, 82),
      affinity: isApplicant ? U.randInt(8, 24) : U.randInt(16, 36),
      projectId: null,
      focus: 'experiment',
      status: isApplicant ? 'applicant' : 'active',
      exp: 0,
      level: 1,
      joinedWeek: isApplicant ? 0 : 1,
      weeksInLab: 0,
      burnoutWeeks: 0,
      restWeeks: 0
    };
    return st;
  }

  function genApplicants(n, state) {
    const s = state || Game.state;
    const usedDefs = new Set((s.students || []).map(x => x.defId).concat((s.applicants || []).map(x => x.defId)));
    const pool = D.STUDENTS.filter(d => !usedDefs.has(d.defId));
    const chosen = U.shuffle(pool).slice(0, n);
    return chosen.map(d => makeStudent(d, true));
  }

  Game.newGame = function (projectId, opts) {
    opts = opts || {};
    const rngState = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const state = {
      version: 1,
      rngState: rngState,
      rankSeed: rngState % 1000003,
      playerName: opts.playerName || '林知远',
      labName: opts.labName || '知远实验室',
      look: Object.assign({
        style: 'short', hair: '#241f25', skin: '#e8b98c',
        coat: '#f8f2e2', accent: '#57b8a6', glasses: true
      }, opts.look || {}),
      week: 1,
      funds: 300000,
      rep: 0,
      citations: 0,
      integrity: 90,
      piStress: 8,
      ap: 6,
      maxAp: 6,
      labLevel: 1,
      studentCap: 3,
      equipCap: 3,
      projects: D.PROJECTS.map(p => makeProject(p, p.id === projectId ? 'active' : 'locked')),
      scene: 'lab',
      scenePositions: {},
      player: { x: 98, y: 198, facing: 'down', moving: false },
      students: [],
      applicants: [],
      equipment: [],
      papers: [],
      applications: [],
      grantLastApplied: {},
      loan: { balance: 0, totalBorrowed: 0, totalInterest: 0, rate: D.LOAN.rate },
      journalUnlocks: D.INITIAL_JOURNALS.slice(),
      journalSubmissions: 0,
      equipmentUsed: {},
      inventory: {},
      careerClues: 0,
      fishing: { level: 1, xp: 0, catches: {}, rod: 0, bait: 0, total: 0 },
      delivery: { week: 0, count: 0, total: 0 },
      activeGrants: [Object.assign({}, D.STARTUP_GRANT, { startWeek: 1, endWeek: 96 })],
      log: [],
      weekReport: null,
      pendingEvent: null,
      seenEvents: [],
      seenStories: [],
      completedObjectives: [],
      weekActions: [],
      flags: {},
      cooldowns: { consult: 0, teamActivity: 0, recruit: 0 },
      stats: {
        papers: 0, topPapers: 0, grants: 0, grantMoney: 0, experiments: 0,
        analyses: 0, drafts: 0, studentsHired: 0, studentsLost: 0, applications: 0,
        conferences: 0, citations: 0, weeksPlayed: 0
      },
      negativeMonths: 0,
      monthStartFunds: 300000,
      ended: null,
      ending: null,
      createdAt: Date.now()
    };
    // starter equipment
    D.EQUIPMENT.filter(e => e.starter).forEach(e => {
      state.equipment.push({ uid: 'eq_' + e.id, defId: e.id, condition: 92, installedWeek: 1 });
    });
    state.applicants = genApplicants(3, state);
    U.addLog(state, '你带着两个纸箱和一盆快死的琴叶榕，搬进了 RB 实验中心 3 楼。', 'story');
    U.addLog(state, 'RB 青年学者启动基金到账：' + U.fmtMoney(300000) + '。', 'money');
    Game.state = state;
    Game.ui.selectedProjectId = projectId;
    Game.ui.selectedStudentId = null;
    Game.ui.selectedPaperId = null;
    checkObjectives(state, true);
    Game.save();
    return state;
  };

  /* ---------------- derived ---------------- */

  Game.score = function (s) {
    s = s || Game.state;
    if (!s) return 0;
    const activeStudents = s.students.filter(x => x.status === 'active').length;
    return Math.round(
      s.rep * 1.0 +
      s.citations * 0.6 +
      s.stats.papers * 8 +
      s.stats.topPapers * 90 +
      s.stats.grantMoney / 8000 +
      activeStudents * 12 +
      s.labLevel * 40 +
      s.integrity * 0.5
    );
  };

  Game.rank = function (s) {
    return U.rankInfo(Game.score(s));
  };

  function rankSeedValue(rank, s) {
    const x = Math.sin((rank + 1) * 12.9898 + ((s.rankSeed || 1) % 997) * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  Game.worldLab = function (rank, s) {
    s = s || Game.state;
    const a = rankSeedValue(rank, s);
    const b = rankSeedValue(rank + 17, s);
    const c = rankSeedValue(rank + 41, s);
    const city = D.LAB_CITIES[Math.floor(a * D.LAB_CITIES.length) % D.LAB_CITIES.length];
    const prefix = D.LAB_PREFIXES[Math.floor(b * D.LAB_PREFIXES.length) % D.LAB_PREFIXES.length];
    const suffix = D.LAB_SUFFIXES[Math.floor(c * D.LAB_SUFFIXES.length) % D.LAB_SUFFIXES.length];
    const base = U.scoreForRank(rank);
    const score = Math.max(0, Math.round(base * (0.985 + b * 0.03)));
    return {
      rank: rank, name: prefix + suffix, city: city, score: score,
      color: D.LAB_COLORS[Math.floor(c * D.LAB_COLORS.length) % D.LAB_COLORS.length]
    };
  };

  Game.leaderboard = function (s) {
    s = s || Game.state;
    const playerRank = Game.rank(s);
    const playerScore = Math.round(Game.score(s));
    const player = { rank: playerRank, name: s.labName + '（你）', city: 'RB 城', score: playerScore, color: '#e8b84b', player: true };
    const rows = [];
    for (let r = 1; r <= 10; r++) {
      if (r === playerRank) rows.push(player);
      else rows.push(Game.worldLab(r, s));
    }
    if (playerRank > 10) {
      const from = Math.max(11, playerRank - 3);
      const to = Math.min(U.RANK_MAX, playerRank + 3);
      for (let r = from; r <= to; r++) {
        if (r === playerRank) rows.push(player);
        else rows.push(Game.worldLab(r, s));
      }
    }
    return rows.sort((a, b) => a.rank - b.rank);
  };

  Game.SCENE_SPAWNS = {
    tech: { x: 6.2, y: 7.4, facing: 'up' },
    market: { x: 6.2, y: 7.4, facing: 'up' },
    delivery: { x: 6.2, y: 7.4, facing: 'up' },
    lake: { x: 7.2, y: 8.2, facing: 'up' }
  };

  Game.enterScene = function (id) {
    const s = Game.state;
    if (!Game.SCENE_SPAWNS[id]) return { ok: false, message: '未知场所' };
    s.scenePositions = s.scenePositions || {};
    if (s.scene && s.scene !== id) {
      s.scenePositions[s.scene] = { x: s.player.x, y: s.player.y, facing: s.player.facing };
    }
    s.scene = id;
    const spawn = s.scenePositions[id] || Game.SCENE_SPAWNS[id];
    s.player = { x: spawn.x, y: spawn.y, facing: spawn.facing || 'up', moving: false };
    autoSave();
    return { ok: true };
  };

  Game.leaveScene = function () {
    const s = Game.state;
    if (s.scene && s.scene !== 'lab') {
      s.scenePositions = s.scenePositions || {};
      s.scenePositions[s.scene] = { x: s.player.x, y: s.player.y, facing: s.player.facing };
    }
    s.scene = 'lab';
    const p = (s.scenePositions && s.scenePositions.lab) || { x: 98, y: 198, facing: 'down' };
    s.player = { x: p.x, y: p.y, facing: p.facing || 'down', moving: false };
    autoSave();
  };

  Game.sceneName = function (s) {
    s = s || Game.state;
    if (!s.scene || s.scene === 'lab') return '实验室';
    const loc = D.LOCATIONS.find(x => x.id === s.scene);
    return loc ? loc.name : 'RB 城市';
  };

  Game.date = function (s) {
    return U.dateOf((s || Game.state).week);
  };

  Game.maxAp = function (s) {
    s = s || Game.state;
    let ap = LAB_LEVELS[s.labLevel].ap;
    if (s.piStress >= 88) ap -= 1;
    if (s.flags.exhausted) ap -= 1;
    return Math.max(2, ap);
  };

  Game.labLevelInfo = function (level) {
    return LAB_LEVELS[level];
  };

  Game.currentProject = function (s) {
    s = s || Game.state;
    return s.projects.find(p => p.defId === Game.ui.selectedProjectId && p.status === 'active') ||
      s.projects.find(p => p.status === 'active') || null;
  };

  Game.projectDef = function (p) {
    return D.PROJECTS.find(x => x.id === (p.defId || p.id));
  };

  Game.equipDef = function (e) {
    return D.EQUIPMENT.find(x => x.id === (e.defId || e.id));
  };

  Game.fixtureDef = function (id) {
    return D.FIXTURES.find(x => x.id === id);
  };

  Game.equipmentAnyDef = function (id, s) {
    s = s || Game.state;
    const fixture = Game.fixtureDef(id);
    if (fixture) return fixture;
    const direct = D.EQUIPMENT.find(x => x.id === id);
    if (direct) return direct;
    const entry = s && s.equipment ? s.equipment.find(e => e.uid === id) : null;
    return entry ? Game.equipDef(entry) : null;
  };

  Game.equipmentOwned = function (id, s) {
    s = s || Game.state;
    if (Game.fixtureDef(id)) return true;
    return s.equipment.some(e => e.uid === id || e.defId === id);
  };

  Game.journalDef = function (id) {
    return D.JOURNALS.find(x => x.id === id);
  };

  Game.grantDef = function (id) {
    return D.GRANTS.find(x => x.id === id) || (id === 'startup' ? D.STARTUP_GRANT : null);
  };

  Game.student = function (uid, s) {
    s = s || Game.state;
    return s.students.find(x => x.uid === uid) || s.applicants.find(x => x.uid === uid) || null;
  };

  Game.activeStudents = function (s) {
    s = s || Game.state;
    return s.students.filter(x => x.status === 'active');
  };

  Game.avgMorale = function (s) {
    const list = Game.activeStudents(s);
    if (!list.length) return 70;
    return list.reduce((a, b) => a + b.morale, 0) / list.length;
  };

  Game.fixtureBonus = function (project, s) {
    if (!project) return 0;
    let score = 0;
    (D.FIXTURES || []).forEach(f => {
      if (!f.tags) return;
      if (f.tags.some(t => project.tags.includes(t))) score += f.tier * 1.7;
      else if (f.tags.includes('通用')) score += f.tier * 0.8;
    });
    return score;
  };

  Game.equipBonus = function (project, s) {
    s = s || Game.state;
    if (!project) return 0;
    let score = Game.fixtureBonus(project, s);
    s.equipment.forEach(e => {
      const def = Game.equipDef(e);
      if (!def) return;
      const cf = e.condition <= 15 ? 0.15 : e.condition / 100;
      if (def.tags.some(t => project.tags.includes(t))) score += def.tier * 4.2 * cf;
      else if (def.tags.includes('通用')) score += def.tier * 1.8 * cf;
    });
    if (s.flags.borrowedEquipment > 0) score *= 0.7;
    return Math.min(30, Math.round(score * 10) / 10);
  };

  Game.paperFit = function (paper, project) {
    if (!paper || !project) return 1;
    return paper.projectId === project.defId ? 1 : 0.9;
  };

  Game.equipmentUseAvailable = function (id, s) {
    s = s || Game.state;
    const def = Game.equipmentAnyDef(id);
    if (!def || !def.use) return { ok: false, reason: '这台设备没有可执行的主动功能' };
    if (!Game.equipmentOwned(id, s)) return { ok: false, reason: '尚未安装这台设备' };
    if (s.equipmentUsed && s.equipmentUsed[id] === s.week) return { ok: false, reason: '本周已经用过这台设备' };
    if (s.ap < 1) return { ok: false, reason: '至少需要 1 点行动力' };
    if ((def.use.cost || 0) > s.funds) return { ok: false, reason: '经费不足' };
    return { ok: true };
  };

  Game.useEquipment = function (id, opts) {
    opts = opts || {};
    const s = Game.state;
    const def = Game.equipmentAnyDef(id);
    const check = Game.equipmentUseAvailable(id, s);
    if (!check.ok) return check;
    const use = def.use;
    const project = Game.currentProject(s);
    if (!project && !use.morale) return { ok: false, reason: '没有在研项目' };
    const paper = Game.ui.selectedPaperId
      ? s.papers.find(p => p.id === Game.ui.selectedPaperId && ['draft', 'ready', 'revision', 'rejected'].includes(p.status))
      : s.papers.find(p => p.projectId === (project && project.defId) && ['draft', 'ready', 'revision'].includes(p.status));
    const entry = s.equipment.find(e => e.uid === id || e.defId === id);
    const conditionF = entry ? (entry.condition <= 15 ? 0.2 : entry.condition / 100) : 1;
    const fit = (project && def.tags && def.tags.some(t => project.tags.includes(t)) ? 1 : 0.58) * conditionF;
    const lines = [];
    if (use.cost) U.funds(s, -use.cost, true);
    s.ap -= 1;
    s.equipmentUsed = s.equipmentUsed || {};
    s.equipmentUsed[id] = s.week;
    U.piStress(s, 2);
    if (use.morale) {
      U.moraleAll(s, use.morale);
      s.piStress = Math.max(0, s.piStress + (use.stress || 0));
      lines.push(`全室士气 +${use.morale}，PI 压力 ${use.stress || 0}。`);
    }
    if (project) {
      if (use.data) {
        const gained = Math.min(125 - project.data, use.data * fit);
        project.data += gained;
        project.totalData = (project.totalData || 0) + gained;
      }
      if (use.insight) project.insight = Math.min(100, project.insight + use.insight * fit);
      if (use.quality) project.quality = Math.min(100, project.quality + use.quality * fit);
      if (use.progress) {
        if (paper) paper.progress = Math.min(100, paper.progress + use.progress * fit);
        else project.insight = Math.min(100, project.insight + use.progress * 0.35);
      }
      const dims = ['novelty', 'rigor', 'data', 'clarity'];
      if (paper && paper.dimensions) {
        dims.forEach(k => {
          const add = use[k];
          if (add) Game.gainDimension(paper, k, add * fit);
        });
        if (use.quality) paper.quality = Math.min(100, paper.quality + use.quality * 0.4 * fit);
        if (use.progress) paper.progress = Math.min(100, paper.progress + use.progress * 0.2 * fit);
      }
      lines.push(`${def.name}：数据 +${Math.round((use.data || 0) * fit)} · 洞察 +${Math.round((use.insight || 0) * fit)} · 质量 +${Math.round((use.quality || 0) * fit)}`);
      if (paper && use.clarity) lines.push(`论文表达 +${Math.round(use.clarity * fit)}。`);
      if (!paper && use.progress) lines.push('还没有成稿，部分产出转化为洞察。');
      if (fit < 0.8) lines.push('设备与当前方向不完全匹配，产出打折。');
    }
    U.addLog(s, `使用${def.name}：${use.label}。`, 'equip');
    autoSave();
    return { ok: true, title: def.name, lines, tone: 'good' };
  };

  /* ---------------- academic loan ---------------- */

  Game.loanLimit = function (s) {
    s = s || Game.state;
    return D.LOAN.baseLimit + Math.min(D.LOAN.repLimit, Math.floor((s.rep || 0) * 180));
  };

  Game.borrowMoney = function (amount) {
    const s = Game.state;
    amount = Math.floor(amount || 0);
    if (amount <= 0) return { ok: false, message: '借款金额无效' };
    const limit = Game.loanLimit(s);
    if ((s.loan.balance || 0) + amount > limit) {
      return { ok: false, message: `当前信用额度为 ${U.fmtMoney(limit)}，已借 ${U.fmtMoney(s.loan.balance || 0)}` };
    }
    s.loan.balance = (s.loan.balance || 0) + amount;
    s.loan.totalBorrowed = (s.loan.totalBorrowed || 0) + amount;
    U.funds(s, amount);
    U.addLog(s, `学术借贷到账 ${U.fmtMoney(amount)}，周利率 ${(s.loan.rate * 100).toFixed(0)}%。`, 'money');
    autoSave();
    return { ok: true, title: '借款到账', lines: [`+${U.fmtMoney(amount)}`, `当前负债 ${U.fmtMoney(s.loan.balance)}`, `每周利息 ${(s.loan.rate * 100).toFixed(0)}%`], tone: 'warn' };
  };

  Game.repayLoan = function (amount) {
    const s = Game.state;
    const balance = s.loan.balance || 0;
    if (balance <= 0) return { ok: false, message: '当前没有负债' };
    amount = amount === 'all' ? balance : Math.max(0, Math.min(Math.floor(amount || 0), balance));
    if (amount <= 0) return { ok: false, message: '还款金额无效' };
    const pay = Math.min(amount, Math.floor(s.funds));
    if (pay <= 0) return { ok: false, message: '账上经费不足' };
    U.funds(s, -pay);
    s.loan.balance = Math.max(0, balance - pay);
    U.addLog(s, `偿还学术贷款 ${U.fmtMoney(pay)}，剩余负债 ${U.fmtMoney(s.loan.balance)}。`, 'money');
    autoSave();
    return { ok: true, title: '还款完成', lines: [`-${U.fmtMoney(pay)}`, `剩余负债 ${U.fmtMoney(s.loan.balance)}`], tone: 'good' };
  };

  /* ---------------- external district ---------------- */

  Game.marketItemDef = function (id) {
    return D.MARKET_ITEMS.find(x => x.id === id);
  };

  Game.buyMarketItem = function (id) {
    const s = Game.state;
    const item = Game.marketItemDef(id);
    if (!item) return { ok: false, message: '商品不存在' };
    if (s.funds < item.price) return { ok: false, message: '经费不足' };
    U.funds(s, -item.price, true);
    s.inventory = s.inventory || {};
    s.inventory[id] = (s.inventory[id] || 0) + 1;
    U.addLog(s, `在校外市场购买「${item.name}」。`, 'money');
    autoSave();
    return { ok: true, title: '购买成功', lines: [`${item.name} ×1`, `-${U.fmtMoney(item.price)}`], tone: 'good' };
  };

  Game.useMarketItem = function (id) {
    const s = Game.state;
    const item = Game.marketItemDef(id);
    if (!item) return { ok: false, message: '物品不存在' };
    if (!(s.inventory && s.inventory[id] > 0)) return { ok: false, message: '背包里没有这件物品' };
    const lines = [];
    const e = item.effect || {};
    if (e.data || e.insight || e.quality || e.novelty) {
      const p = Game.currentProject(s);
      if (!p) return { ok: false, message: '没有在研项目' };
      if (e.data) p.data = Math.min(125, p.data + e.data);
      if (e.insight) p.insight = Math.min(100, p.insight + e.insight);
      if (e.quality) p.quality = Math.min(100, p.quality + e.quality);
      if (e.novelty) p.novelty = Math.min(100, p.novelty + e.novelty);
      lines.push(`项目数据 +${e.data || 0} · 洞察 +${e.insight || 0} · 质量 +${e.quality || 0}`);
    }
    if (e.condition) {
      s.equipment.forEach(x => { x.condition = Math.min(100, x.condition + e.condition); });
      lines.push(`所有设备状态 +${e.condition}。`);
    }
    if (e.morale && !e.affinity) {
      U.moraleAll(s, e.morale);
      lines.push(`全室士气 +${e.morale}。`);
    }
    if (e.stress) {
      s.piStress = U.clamp(s.piStress + e.stress, 0, 100);
      lines.push(`PI 压力 ${e.stress > 0 ? '+' : ''}${e.stress}。`);
    }
    if (e.affinity) {
      const st = s.students.find(x => x.uid === Game.ui.selectedStudentId && x.status === 'active') || Game.activeStudents(s)[0];
      if (!st) return { ok: false, message: '还没有可以送礼物的人' };
      st.affinity = Math.min(100, (st.affinity || 0) + e.affinity);
      st.morale = Math.min(100, st.morale + (e.morale || 0));
      lines.push(`${st.name} 的默契 +${e.affinity}，士气 +${e.morale || 0}。`);
    }
    if (e.rep) { s.rep += e.rep; lines.push(`声望 +${e.rep}。`); }
    if (e.clues) {
      s.careerClues = (s.careerClues || 0) + e.clues;
      lines.push(`事业线索 +${e.clues}。`);
    }
    if (e.rod) {
      const curRod = typeof s.fishing.rod === 'number' ? s.fishing.rod : 0;
      s.fishing.rod = Math.min(3, curRod + e.rod);
      lines.push(`鱼竿升级到 ${s.fishing.rod} 级。`);
    }
    if (e.bait) {
      s.fishing.bait = (s.fishing.bait || 0) + e.bait;
      lines.push(`饵料 +${e.bait}。`);
    }
    s.inventory[id]--;
    U.addLog(s, `使用了「${item.name}」。`, 'life');
    autoSave();
    return { ok: true, title: item.name, lines: lines.length ? lines : ['物品已经用掉。'], tone: 'good' };
  };

  Game.runDelivery = function () {
    const s = Game.state;
    if (s.ap < 1) return { ok: false, message: '至少需要 1 点行动力' };
    s.ap -= 1;
    s.delivery = s.delivery || { week: s.week, count: 0, total: 0 };
    if (s.delivery.week !== s.week) { s.delivery.week = s.week; s.delivery.count = 0; }
    s.delivery.count++;
    const pay = U.randInt(900, 1900) + (s.delivery.count > 3 ? 150 : 0);
    s.delivery.total = (s.delivery.total || 0) + pay;
    U.funds(s, pay);
    U.piStress(s, 4);
    U.addLog(s, `跑了一单外卖，收入 ${U.fmtMoney(pay)}。`, 'money');
    autoSave();
    return { ok: true, title: '跑完一单', lines: [`+${U.fmtMoney(pay)}`, '压力 +4', `本周第 ${s.delivery.count} 单`], tone: 'good' };
  };

  Game.beginFishing = function () {
    const s = Game.state;
    if (s.ap < 1) return { ok: false, message: '至少需要 1 点行动力' };
    const f = s.fishing = s.fishing || { level: 1, xp: 0, catches: {}, caught: {}, rod: 0, bait: 0, total: 0 };
    if (!f.caught) f.caught = {};
    if (!f.rod) return { ok: false, message: '先去校外市场买一根鱼竿' };
    s.ap -= 1;
    f.castBait = (f.bait || 0) > 0;
    if (f.castBait) f.bait--;
    autoSave();
    return {
      ok: true,
      wait: U.randInt(900, 2300),
      window: 2100,
      rod: f.rod,
      bait: f.castBait
    };
  };

  Game.landFish = function (success) {
    const s = Game.state;
    const f = s.fishing;
    if (!f) return { ok: false, message: '还没有开始钓鱼' };
    if (!success) {
      U.piStress(s, 1);
      autoSave();
      return { ok: false, message: '提竿太慢，鱼跑了。' };
    }
    const pool = D.FISH.filter(x => x.minLevel <= f.level);
    let totalW = 0;
    const weighted = pool.map(x => {
      let w = x.weight;
      if (x.rarity === 'rare') w *= 1 + 0.25 * (f.rod || 1);
      if (x.rarity === 'epic' || x.rarity === 'legendary') w *= 1 + 0.35 * (f.rod || 1) + (f.castBait ? 0.5 : 0);
      if (x.rarity === 'common') w *= 1 / (1 + 0.15 * (f.rod || 1));
      totalW += w;
      return { fish: x, w: w };
    });
    let roll = U.rnd() * totalW;
    let chosen = weighted[weighted.length - 1].fish;
    for (const row of weighted) {
      roll -= row.w;
      if (roll <= 0) { chosen = row.fish; break; }
    }
    f.catches[chosen.id] = (f.catches[chosen.id] || 0) + 1;
    f.caught[chosen.id] = (f.caught[chosen.id] || 0) + 1;
    f.total = (f.total || 0) + 1;
    const xpGain = { common: 1, uncommon: 2, rare: 4, epic: 7, legendary: 12 }[chosen.rarity] || 1;
    f.xp = (f.xp || 0) + xpGain;
    const thresholds = [0, 5, 12, 24, 40, 65];
    while (f.level < 5 && f.xp >= thresholds[f.level]) f.level++;
    U.piStress(s, 2);
    U.addLog(s, `在有名湖钓到「${chosen.name}」（${D.FISH_RARITY[chosen.rarity].name}）。`, 'life');
    autoSave();
    return {
      ok: true, title: `上鱼！${chosen.name}`,
      lines: [D.FISH_RARITY[chosen.rarity].name + ' · 价值 ' + U.fmtMoney(chosen.value), '钓鱼经验 +' + xpGain, '图鉴 ' + Object.keys(f.caught).length + '/' + D.FISH.length],
      tone: chosen.rarity === 'legendary' ? 'great' : 'good', fish: chosen
    };
  };

  Game.fish = function () {
    const begin = Game.beginFishing();
    if (!begin.ok) return begin;
    return Game.landFish(true);
  };

  Game.sellFish = function (id, qty) {
    const s = Game.state;
    const f = s.fishing;
    const fish = D.FISH.find(x => x.id === id);
    if (!f || !fish || !f.catches || !f.catches[id]) return { ok: false, message: '没有这种鱼' };
    const amount = Math.max(1, Math.min(f.catches[id], qty || f.catches[id]));
    const pay = fish.value * amount;
    f.catches[id] -= amount;
    if (f.catches[id] <= 0) delete f.catches[id];
    U.funds(s, pay);
    autoSave();
    return { ok: true, title: '卖鱼', lines: [`${fish.name} ×${amount}`, `+${U.fmtMoney(pay)}`], tone: 'good' };
  };

  Game.sellAllFish = function () {
    const s = Game.state;
    const f = s.fishing;
    if (!f || !f.catches) return { ok: false, message: '还没有鱼' };
    let pay = 0, count = 0;
    Object.keys(f.catches).forEach(id => {
      const fish = D.FISH.find(x => x.id === id);
      if (!fish) return;
      pay += fish.value * f.catches[id];
      count += f.catches[id];
    });
    if (!count) return { ok: false, message: '鱼篓是空的' };
    f.catches = {};
    U.funds(s, pay);
    autoSave();
    return { ok: true, title: '卖出全部鱼', lines: [`${count} 条鱼`, `+${U.fmtMoney(pay)}`], tone: 'good' };
  };

  Game.studentFit = function (student, project) {
    if (!project) return 0.8;
    return project.tags.includes(student.field) ? 1.12 : 0.88;
  };

  Game.studentOutput = function (student, project, s) {
    s = s || Game.state;
    const moraleF = 0.68 + student.morale / 180;
    const stressF = student.stress >= 88 ? 0.48 : student.stress >= 72 ? 0.7 : student.stress >= 55 ? 0.86 : 1;
    const equipF = 1 + Game.equipBonus(project, s) / 110;
    if (!project) return { data: 0, insight: 0, write: 0, quality: 0, novelty: 0, stress: 0 };
    const fit = Game.studentFit(student, project);
    let data = 0, insight = 0, write = 0, quality = 0, novelty = 0;
    if (student.focus === 'experiment') {
      data = (2.8 + student.skill / 19 + student.diligence / 26) * fit * moraleF * stressF * equipF * U.rand(0.82, 1.18);
    } else if (student.focus === 'analyze') {
      insight = (1.5 + student.skill / 25 + student.creativity / 38) * moraleF * stressF * U.rand(0.8, 1.2);
    } else if (student.focus === 'write') {
      write = (1.6 + student.communication / 23 + student.skill / 45) * moraleF * U.rand(0.8, 1.2);
    } else if (student.focus === 'survey') {
      quality = (0.25 + student.talent / 180 + student.creativity / 260) * U.rand(0.7, 1.3);
      novelty = (0.18 + student.creativity / 300) * U.rand(0.7, 1.3);
    }
    return { data, insight, write, quality, novelty };
  };

  Game.gainDimension = function (paper, key, amount) {
    if (!paper || !amount) return 0;
    paper.dimensions = paper.dimensions || { novelty: 40, rigor: 40, data: 40, clarity: 40 };
    const before = paper.dimensions[key] || 0;
    paper.dimensions[key] = Math.min(100, before + amount);
    const real = paper.dimensions[key] - before;
    if (paper.demands && paper.demands[key] > 0) {
      paper.demands[key] = Math.max(0, paper.demands[key] - real);
      if (paper.demands[key] <= 0.05) delete paper.demands[key];
    }
    return real;
  };

  Game.delegateTask = function (uid, task, paperId) {
    const s = Game.state;
    const st = Game.student(uid, s);
    if (!st || st.status !== 'active') return { ok: false, message: '没有这名学生' };
    if (st.lastTaskWeek === s.week) return { ok: false, message: '这名学生本周已经承担过委派任务' };
    if (st.stress >= 92) return { ok: false, message: '学生压力过高，先让他/她休息' };
    const project = Game.currentProject(s);
    if (!project) return { ok: false, message: '没有在研项目' };
    const paper = (paperId && s.papers.find(p => p.id === paperId)) ||
      s.papers.find(p => p.projectId === project.defId && ['draft', 'ready', 'revision', 'rejected'].includes(p.status));
    const fit = Game.studentFit(st, project);
    const morale = 0.72 + st.morale / 200;
    const lines = [];
    let data = 0, insight = 0, progress = 0, quality = 0, novelty = 0, clarity = 0;
    if (task === 'experiment') {
      data = (3.4 + st.skill / 14) * fit * morale;
      quality = 0.35;
      lines.push(`${st.name} 代做了实验，数据 +${Math.round(data)}。`);
    } else if (task === 'analyze') {
      insight = (2.2 + st.skill / 21) * morale;
      quality = 0.25;
      lines.push(`${st.name} 完成了数据清洗与分析，洞察 +${Math.round(insight)}。`);
    } else if (task === 'write') {
      if (!paper) return { ok: false, message: '还没有需要写作的草稿，先让学生做实验或分析' };
      progress = (7 + st.communication / 12) * fit;
      clarity = 3 + st.communication / 35;
      lines.push(`${st.name} 写了初稿，论文进度 +${Math.round(progress)}，表达 +${Math.round(clarity)}。`);
    } else if (task === 'revise') {
      if (!paper) return { ok: false, message: '还没有需要返修的论文' };
      progress = (6 + st.communication / 14) * fit;
      quality = 0.4;
      clarity = 2.5 + st.communication / 40;
      if (paper.status === 'revision') paper.revisionNeeded = Math.max(0, (paper.revisionNeeded || 1) - 1);
      const dim = paper.demands && Object.keys(paper.demands).sort((a, b) => (paper.demands[b] || 0) - (paper.demands[a] || 0))[0];
      if (dim) paper.demands[dim] = Math.max(0, paper.demands[dim] - (2 + st.skill / 30));
      lines.push(`${st.name} 按审稿意见返修，进度 +${Math.round(progress)}。`);
      if (dim) lines.push(`补上了部分「${D.DIMENSIONS.find(d => d.id === dim).name}」。`);
      if (paper.status === 'revision' && paper.revisionNeeded === 0 && !Game.missingDemands(paper).length) {
        paper.status = 'ready';
        paper.resubmit = true;
        lines.push('返修完成，可以重新投稿。');
      }
    } else if (task === 'literature') {
      novelty = (3.2 + st.creativity / 22) * fit;
      clarity = 1.5;
      lines.push(`${st.name} 补读文献并重写了引言，新颖性 +${Math.round(novelty)}。`);
    } else {
      return { ok: false, message: '未知的委派任务' };
    }
    project.data = Math.min(125, project.data + data);
    project.insight = Math.min(100, project.insight + insight);
    project.quality = Math.min(100, project.quality + quality);
    if (paper) {
      paper.progress = Math.min(100, paper.progress + progress);
      paper.quality = Math.min(100, paper.quality + quality);
      paper.dimensions = paper.dimensions || { novelty: 40, rigor: 40, data: 40, clarity: 40 };
      if (data) Game.gainDimension(paper, 'data', data * 0.4);
      if (insight || quality) Game.gainDimension(paper, 'rigor', insight * 0.35 + quality);
      if (clarity) Game.gainDimension(paper, 'clarity', clarity);
      if (novelty) Game.gainDimension(paper, 'novelty', novelty);
    }
    st.lastTaskWeek = s.week;
    st.stress = Math.min(100, st.stress + 4);
    st.morale = Math.max(0, st.morale - 1);
    U.addLog(s, `${st.name} 接受了委派任务：${task === 'experiment' ? '实验' : task === 'analyze' ? '分析' : task === 'write' ? '写作' : task === 'revise' ? '返修' : '文献'}。`, 'team');
    autoSave();
    return { ok: true, title: `委派给 ${st.name}`, lines, tone: 'good' };
  };

  /* ---------------- actions ---------------- */

  Game.canDo = function (actionId, s) {
    s = s || Game.state;
    const a = ACTIONS.find(x => x.id === actionId);
    if (!a) return { ok: false, reason: '未知操作' };
    if (s.ended) return { ok: false, reason: '本局已结束' };
    if (actionId === 'grant') return { ok: true };
    if (s.ap < a.ap) return { ok: false, reason: '行动力不足' };
    if (actionId === 'experiment') {
      const p = Game.currentProject(s);
      if (!p) return { ok: false, reason: '没有在研项目' };
      if (p.papers >= p.maxPapers) return { ok: false, reason: '该方向已完成，去研究页开启新方向' };
      if (s.funds < 600) return { ok: false, reason: '经费不足以购买试剂' };
    }
    if (actionId === 'analyze') {
      const p = Game.currentProject(s);
      if (!p) return { ok: false, reason: '没有在研项目' };
      if (p.papers >= p.maxPapers) return { ok: false, reason: '该方向已完成，去研究页开启新方向' };
      if (p.data < 15) return { ok: false, reason: '至少需要 15 点数据' };
    }
    if (actionId === 'write') {
      const p = Game.currentProject(s);
      if (!p) return { ok: false, reason: '没有在研项目' };
      if (p.papers >= p.maxPapers) return { ok: false, reason: '该方向的故事已经写完了' };
      if (p.insight < 30) return { ok: false, reason: '至少需要 30 点洞察' };
    }
    if (actionId === 'revise') {
      const paper = Game.ui.selectedPaperId ? s.papers.find(p => p.id === Game.ui.selectedPaperId) : null;
      const available = s.papers.find(p => ['draft', 'ready', 'revision', 'rejected'].includes(p.status));
      if (!paper && !available) return { ok: false, reason: '没有需要修改的论文' };
    }
    if (actionId === 'mentor') {
      if (!s.students.some(x => x.status === 'active')) return { ok: false, reason: '还没有学生' };
    }
    if (actionId === 'consult') {
      if (s.week < s.cooldowns.consult) return { ok: false, reason: '本月没有合适的咨询机会' };
    }
    return { ok: true };
  };

  Game.doAction = function (actionId, opts) {
    opts = opts || {};
    const s = Game.state;
    const check = Game.canDo(actionId, s);
    if (!check.ok) return { ok: false, message: check.reason };
    const a = ACTIONS.find(x => x.id === actionId);
    if (actionId === 'grant') {
      return { ok: true, open: 'grants', lines: [] };
    }
    s.ap -= a.ap;
    const lines = [];
    let title = a.name;
    let tone = 'good';
    const project = Game.currentProject(s);
    const stressFactor = s.piStress >= 80 ? 0.82 : s.piStress >= 60 ? 0.92 : 1;

    if (actionId === 'experiment') {
      const eq = Game.equipBonus(project, s);
      const gain = Math.round((7 + 5.2 / 1.4 + eq * 0.48) * stressFactor * U.rand(0.84, 1.2));
      const qGain = Math.round((0.4 + 0.6 + eq / 45) * 10) / 10;
      const cost = 500 + Math.round(eq * 18);
      U.funds(s, -cost, true);
      project.data = Math.min(125, project.data + gain);
      project.totalData += gain;
      project.quality = Math.min(100, project.quality + qGain);
      const draft = s.papers.find(p => p.projectId === project.defId && ['draft', 'ready', 'revision', 'rejected'].includes(p.status));
      if (draft) {
        Game.gainDimension(draft, 'data', 5);
        Game.gainDimension(draft, 'rigor', 1.5);
      }
      s.stats.experiments++;
      U.piStress(s, 5);
      lines.push(`数据 +${gain}`, `质量 +${qGain.toFixed(1)}`, `试剂 -${U.fmtMoney(cost)}`);
      if (U.chance(0.13)) {
        const ins = U.randInt(3, 8);
        project.insight = Math.min(100, project.insight + ins);
        lines.push(`意外发现：洞察 +${ins}`);
        title = '实验有意外收获';
      } else {
        title = '实验推进';
      }
      if (U.chance(0.055)) {
        project.data = Math.max(0, project.data - 3);
        U.moraleAll(s, -1);
        lines.push('有一组样本污染了，数据 -3');
        tone = 'warn';
      }
      U.addLog(s, `${project.name}：实验完成，数据 +${gain}。`, 'research');
    }

    if (actionId === 'analyze') {
      const converted = 15;
      project.data = Math.max(0, project.data - converted);
      const gain = Math.round((10 + s.rep / 160 + project.novelty / 28) * stressFactor * U.rand(0.85, 1.15));
      project.insight = Math.min(100, project.insight + gain);
      const qGain = Math.round((1.2 + project.data / 90) * 10) / 10;
      project.quality = Math.min(100, project.quality + qGain);
      const apaper = s.papers.find(p => p.projectId === project.defId && ['draft', 'ready', 'revision', 'rejected'].includes(p.status));
      if (apaper) {
        Game.gainDimension(apaper, 'rigor', 4);
        Game.gainDimension(apaper, 'data', 2);
      }
      s.stats.analyses++;
      U.piStress(s, 2);
      lines.push(`消耗数据 ${converted}`, `洞察 +${gain}`, `质量 +${qGain.toFixed(1)}`);
      title = '数据开始说话';
      U.addLog(s, `${project.name}：分析完成，洞察 +${gain}。`, 'research');
    }

    if (actionId === 'write') {
      const draft = Game.createPaper(project, s);
      lines.push(`草稿《${draft.title}》`, `质量 ${Math.round(draft.quality)}`, `洞察 -30`);
      title = '新论文草稿';
      tone = 'great';
      Game.ui.selectedPaperId = draft.id;
      U.addLog(s, `开始撰写《${draft.title}》。`, 'paper');
    }

    if (actionId === 'revise') {
      let paper = Game.ui.selectedPaperId ? s.papers.find(p => p.id === Game.ui.selectedPaperId) : null;
      if (!paper || !['draft', 'ready', 'revision', 'rejected'].includes(paper.status)) {
        paper = s.papers.find(p => ['draft', 'ready', 'revision', 'rejected'].includes(p.status));
      }
      if (!paper) return { ok: false, message: '没有需要修改的论文' };
      if (paper.status === 'revision' || paper.status === 'rejected') {
        paper.revisionNeeded = Math.max(0, (paper.revisionNeeded || 1) - 1);
        paper.quality = Math.min(100, paper.quality + 3);
        const missing = Game.missingDemands(paper);
        const targets = missing.length ? missing.slice(0, 2) : ['clarity', 'rigor'];
        targets.forEach((k, idx) => {
          const gain = Game.gainDimension(paper, k, 4 + idx);
          const d = D.DIMENSIONS.find(x => x.id === k);
          lines.push(`${d ? d.name : k} +${Math.round(gain)}`);
        });
        paper.progress = Math.min(100, paper.progress + 20);
        const still = Game.missingDemands(paper);
        if (paper.revisionNeeded === 0 && !still.length) {
          paper.status = 'ready';
          paper.resubmit = true;
          lines.push('修改完成，可以重新投稿');
          tone = 'great';
        } else if (still.length) {
          lines.push('审稿意见仍未补足：' + still.map(k => {
            const d = D.DIMENSIONS.find(x => x.id === k);
            return `${d ? d.name : k}还差 ${Math.ceil(paper.demands[k])}`;
          }).join('、'));
        } else {
          lines.push(`还需完成 ${paper.revisionNeeded} 轮修改`);
        }
        title = '返修推进';
      } else {
        const gain = Math.round((18 + s.rep / 260 + (paper.quality || 40) / 12) * stressFactor);
        paper.progress = Math.min(100, paper.progress + gain);
        paper.quality = Math.min(100, paper.quality + 1.1);
        Game.gainDimension(paper, 'clarity', 3);
        Game.gainDimension(paper, 'rigor', 1);
        if (paper.status === 'ready') {
          paper.quality = Math.min(100, paper.quality + 1.5);
          lines.push('论文润色完成', `质量 +1.5`, '表达 +3');
        } else {
          lines.push(`写作进度 +${gain}%`);
          if (paper.progress >= 100) {
            paper.status = 'ready';
            lines.push('初稿完成，可以投稿了');
            tone = 'great';
          }
        }
        title = '论文推进';
      }
      U.piStress(s, 3);
      U.addLog(s, `论文《${paper.title}》修改推进。`, 'paper');
    }

    if (actionId === 'mentor') {
      let st = Game.ui.selectedStudentId ? Game.student(Game.ui.selectedStudentId, s) : null;
      if (!st || st.status !== 'active') st = Game.activeStudents(s)[0];
      if (!st) return { ok: false, message: '没有可指导的学生' };
      const skillGain = U.randInt(2, 4) + (st.talent > 75 ? 1 : 0);
      st.skill = Math.min(st.potential, st.skill + skillGain);
      st.morale = U.clamp(st.morale + 8, 0, 100);
      st.stress = U.clamp(st.stress - 9, 0, 100);
      st.exp += 8;
      U.piStress(s, 1);
      lines.push(`${st.name}：技能 +${skillGain}`, '士气 +8', '压力 -9');
      title = '一次像样的指导';
      U.addLog(s, `你与 ${st.name} 讨论了课题。`, 'team');
    }

    if (actionId === 'network') {
      const gain = U.randInt(2, 5) + (s.rep > 400 ? 2 : 0);
      s.rep += gain;
      U.piStress(s, 2);
      lines.push(`声望 +${gain}`);
      if (U.chance(0.22)) {
        const fresh = genApplicants(1, s);
        if (fresh.length) {
          s.applicants.push(fresh[0]);
          lines.push(`认识了新的候选人：${fresh[0].name}`);
        }
      }
      if (U.chance(0.12)) {
        project.novelty = Math.min(100, project.novelty + 3);
        lines.push('合作者给了你一个新角度：新颖度 +3');
      }
      title = '学术社交';
      U.addLog(s, `参加了一场线上研讨会，声望 +${gain}。`, 'rep');
    }

    if (actionId === 'rest') {
      U.piStress(s, -20);
      U.moraleAll(s, 5);
      s.ap = Math.min(Game.maxAp(s), s.ap + 0);
      lines.push('压力 -20', '全室士气 +5');
      if (U.chance(0.3)) {
        project.insight = Math.min(100, project.insight + 3);
        lines.push('洗澡时想到一个点子：洞察 +3');
      }
      title = '喘口气';
      U.addLog(s, '你给自己放了半天假。', 'life');
    }

    if (actionId === 'consult') {
      const pay = U.randInt(8000, 14000);
      U.funds(s, pay);
      s.rep = Math.max(0, s.rep - 1);
      U.piStress(s, 7);
      s.cooldowns.consult = s.week + 4;
      lines.push(`咨询费 +${U.fmtMoney(pay)}`, '声望 -1', '压力 +7');
      title = '横向咨询';
      U.addLog(s, `完成一次企业咨询，收入 ${U.fmtMoney(pay)}。`, 'money');
    }

    s.weekActions = s.weekActions || [];
    s.weekActions.push(title + ' · ' + lines.slice(0, 2).join(' / '));
    if (s.weekActions.length > 12) s.weekActions.shift();
    checkObjectives(s, false);
    Game.updateMaxAp(s);
    autoSave();
    return { ok: true, title: title, lines: lines, tone: tone, action: actionId };
  };

  Game.updateMaxAp = function (s) {
    s = s || Game.state;
    s.maxAp = Game.maxAp(s);
    s.ap = Math.min(s.ap, s.maxAp);
  };

  Game.createPaper = function (project, s) {
    s = s || Game.state;
    const def = Game.projectDef(project);
    const students = s.students.filter(x => x.status === 'active' && x.projectId === project.defId);
    const avgSkill = students.length ? students.reduce((a, b) => a + b.skill, 0) / students.length : 34;
    const quality = U.clamp(
      project.quality * 0.46 +
      (45 + s.rep / 90) * 0.22 +
      avgSkill * 0.18 +
      project.novelty * 0.14 +
      U.rand(-4, 4),
      22, 96
    );
    const parts = def.titleParts;
    const title = U.pick(parts.methods) + '揭示' + U.pick(parts.things) + U.pick(parts.goals);
    const avgComm = students.length ? students.reduce((a, b) => a + b.communication, 0) / students.length : 42;
    const avgCreate = students.length ? students.reduce((a, b) => a + b.creativity, 0) / students.length : 45;
    const eq = Game.equipBonus(project, s);
    const dimensions = {
      novelty: U.clamp(project.novelty * 0.62 + avgCreate * 0.22 + s.rep / 70 + U.rand(-5, 5), 18, 92),
      rigor: U.clamp(project.quality * 0.55 + avgSkill * 0.28 + eq * 0.8 + U.rand(-4, 4), 18, 94),
      data: U.clamp(project.data * 0.64 + project.quality * 0.22 + eq * 0.5 + U.rand(-4, 4), 18, 96),
      clarity: U.clamp(avgComm * 0.5 + project.quality * 0.3 + s.rep / 160 + U.rand(-4, 4), 18, 92)
    };
    const paper = {
      id: U.uid('paper'),
      title: title,
      projectId: project.defId,
      quality: Math.round(((quality + (dimensions.novelty + dimensions.rigor + dimensions.data + dimensions.clarity) / 4) / 2) * 10) / 10,
      novelty: project.novelty,
      dimensions: dimensions,
      demands: {},
      lastRejectedJournal: null,
      reviewHistory: [],
      status: 'draft',
      progress: 0,
      journalId: null,
      submittedWeek: 0,
      reviewAt: 0,
      reviewWeeks: 0,
      chance: 0,
      revisionNeeded: 0,
      resubmit: false,
      authors: students.map(x => x.uid),
      citations: 0,
      publishedWeek: 0,
      rejectedBy: [],
      reviewBoost: 0,
      counted: false
    };
    s.papers.unshift(paper);
    project.insight = Math.max(0, project.insight - 30);
    project.papers = (project.papers || 0) + 1;
    project.drafts = (project.drafts || 0) + 1;
    project.quality = Math.min(100, project.quality + 1.5);
    paper.counted = true;
    s.stats.drafts++;
    return paper;
  };

  /* ---------------- papers ---------------- */

  Game.paperAcceptChance = function (paper, journalId, s) {
    s = s || Game.state;
    const j = Game.journalDef(journalId);
    if (!j) return 0;
    const q = paper.quality || 0;
    const dims = paper.dimensions || { novelty: 45, rigor: 45, data: 45, clarity: 45 };
    const req = j.dimReq || { novelty: 45, rigor: 45, data: 45, clarity: 45 };
    const weights = j.dimWeights || { novelty: 0.25, rigor: 0.25, data: 0.25, clarity: 0.25 };
    let fit = 0, weightSum = 0, weak = 0;
    Object.keys(req).forEach(k => {
      const w = weights[k] || 0.25;
      const ratio = (dims[k] || 0) / req[k];
      fit += Math.min(1.15, ratio) * w;
      weightSum += w;
      if (ratio < 0.72) weak = Math.max(weak, 0.72 - ratio);
    });
    const dimScore = (fit / (weightSum || 1)) * 100;
    let chance = 0.08 +
      (q - j.threshold) * 0.018 +
      (dimScore - 100) * 0.012 -
      weak * 0.65 +
      s.rep / 4800 +
      (paper.reviewBoost || 0) * 0.4 +
      (s.integrity - 80) / 900;
    if (j.predatory) chance = 0.96;
    if (paper.lastRejectedJournal === j.id) chance -= 0.06;
    return U.clamp(chance, 0.02, 0.92);
  };

  Game.unlockJournals = function (count, s) {
    s = s || Game.state;
    s.journalUnlocks = s.journalUnlocks || D.INITIAL_JOURNALS.slice();
    const fresh = [];
    for (let i = 0; i < count; i++) {
      const next = D.JOURNAL_UNLOCK_ORDER.find(id => !s.journalUnlocks.includes(id));
      if (!next) break;
      s.journalUnlocks.push(next);
      fresh.push(Game.journalDef(next));
    }
    return fresh.filter(Boolean);
  };

  Game.missingDemands = function (paper) {
    if (!paper || !paper.demands) return [];
    return Object.keys(paper.demands).filter(k => (paper.demands[k] || 0) > 0.05);
  };

  Game.makeDemands = function (paper, journal, severity) {
    const dims = paper.dimensions || { novelty: 45, rigor: 45, data: 45, clarity: 45 };
    const req = journal.dimReq || { novelty: 45, rigor: 45, data: 45, clarity: 45 };
    const demands = {};
    const ranked = Object.keys(req)
      .map(k => ({ k, gap: (req[k] || 0) - (dims[k] || 0), room: 100 - (dims[k] || 0) }))
      .filter(row => row.room > 0)
      .sort((a, b) => b.gap - a.gap);
    const count = severity >= 3 ? 3 : severity === 2 ? 2 : 1;
    ranked.slice(0, count).forEach((row, idx) => {
      const base = Math.max(2, Math.ceil(Math.max(0, row.gap)));
      demands[row.k] = Math.min(row.room, base + U.randInt(1, 3 + idx));
    });
    return demands;
  };

  Game.submitPaper = function (paperId, journalId) {
    const s = Game.state;
    const paper = s.papers.find(p => p.id === paperId);
    const j = Game.journalDef(journalId);
    if (!paper || !j) return { ok: false, message: '论文或期刊不存在' };
    if (!(s.journalUnlocks || D.INITIAL_JOURNALS).includes(j.id)) return { ok: false, message: '这个投稿选项还没有解锁' };
    if (!['ready', 'rejected', 'revision'].includes(paper.status)) return { ok: false, message: '这篇论文还不能投稿' };
    if (paper.status === 'revision' && (paper.revisionNeeded || 0) > 0) {
      return { ok: false, message: `还需要完成 ${paper.revisionNeeded} 轮返修` };
    }
    if (j.apc > 0 && s.funds < j.apc) return { ok: false, message: '版面费不足' };
    if (paper.status === 'rejected' && !paper.counted) {
      const proj = s.projects.find(p => p.defId === paper.projectId);
      if (proj && proj.papers >= proj.maxPapers) return { ok: false, message: '该方向的论文额度已满，先等现有论文的结果' };
      if (proj) proj.papers++;
      paper.counted = true;
    }
    const sameJournal = paper.lastRejectedJournal === j.id || paper.journalId === j.id;
    if (sameJournal) {
      const missing = Game.missingDemands(paper);
      if (missing.length) {
        const names = missing.map(k => {
          const d = D.DIMENSIONS.find(x => x.id === k);
          return `${d ? d.name : k}还差 ${Math.ceil(paper.demands[k])}`;
        });
        return { ok: false, message: '审稿意见要求先补足：' + names.join('、') };
      }
    } else {
      // Transfer: old journal's specific demands and review boost must not leak.
      paper.demands = {};
      paper.reviewBoost = 0;
    }
    if (j.apc > 0) U.funds(s, -j.apc, true);
    const weeks = U.randInt(j.review[0], j.review[1]);
    paper.status = 'review';
    paper.journalId = j.id;
    paper.submittedWeek = s.week;
    paper.reviewWeeks = weeks;
    paper.reviewAt = s.week + weeks;
    paper.chance = Game.paperAcceptChance(paper, j.id, s);
    paper.reviewBoost = 0;
    paper.reviewHistory = paper.reviewHistory || [];
    paper.reviewHistory.push({ journal: j.id, week: s.week, chance: paper.chance });
    s.journalSubmissions = (s.journalSubmissions || 0) + 1;
    const fresh = Game.unlockJournals(1, s);
    U.piStress(s, 3);
    U.addLog(s, `《${paper.title}》投稿至 ${j.name}。`, 'paper');
    autoSave();
    const lines = [`${j.name}`, `预计 ${weeks} 周后收到意见`, `当前接收概率约 ${Math.round(paper.chance * 100)}%`];
    if (fresh.length) lines.push(`新投稿选项解锁：${D.JOURNAL_SERIES[fresh[0].series].name}《${fresh[0].name}》`);
    return {
      ok: true,
      title: '已投稿',
      lines,
      tone: 'good',
      unlocked: fresh
    };
  };

  Game.publishPaper = function (paper, journal, s) {
    s = s || Game.state;
    const j = journal || Game.journalDef(paper.journalId);
    paper.status = 'published';
    paper.publishedWeek = s.week;
    paper.citations = 0;
    paper.demands = {};
    paper.quality = Math.min(100, paper.quality + 2);
    const repGain = Math.round(j.rep * (0.72 + paper.quality / 160) + paper.novelty / 12);
    const award = Math.round(j.if * 2200);
    s.rep += repGain;
    s.integrity = U.clamp(s.integrity + (j.integrity || 0), 0, 100);
    U.funds(s, award, true);
    s.stats.papers++;
    if (['naturex', 'scifront', 'declaration', 'rb_review'].includes(j.id) || j.if >= 15) s.stats.topPapers++;
    paper.authors.forEach(uid => {
      const st = s.students.find(x => x.uid === uid);
      if (st) {
        st.skill = Math.min(st.potential, st.skill + 3);
        st.morale = U.clamp(st.morale + 7, 0, 100);
        st.exp += 20;
      }
    });
    U.moraleAll(s, 4);
    const proj = s.projects.find(p => p.defId === paper.projectId);
    if (proj) {
      if (!paper.counted) proj.papers = (proj.papers || 0) + 1;
      paper.counted = true;
      proj.quality = Math.min(100, proj.quality + 2);
      proj.breakthroughs = (proj.breakthroughs || 0) + 1;
    }
    U.addLog(s, `论文发表：${j.name}《${paper.title}》，声望 +${repGain}。`, 'paper');
    return { repGain, award, journal: j };
  };

  Game.urgePaper = function (paperId) {
    const s = Game.state;
    const paper = s.papers.find(p => p.id === paperId);
    if (!paper || paper.status !== 'review') return { ok: false, message: '只能催审稿中的论文' };
    if (s.ap < 1) return { ok: false, message: '行动力不足' };
    s.ap -= 1;
    let lines = [];
    if (U.chance(0.55)) {
      paper.reviewAt = Math.max(s.week + 1, paper.reviewAt - 1);
      lines.push('编辑回信很快：“已提醒审稿人。”', '审稿时间缩短 1 周');
    } else {
      paper.reviewAt += 1;
      lines.push('编辑说：“审稿人正在休假。”', '审稿时间延长 1 周');
    }
    U.piStress(s, 2);
    autoSave();
    return { ok: true, title: '催稿', lines: lines, tone: 'warn' };
  };

  /* ---------------- grants ---------------- */

  Game.grantWindow = function (def, week) {
    if (!def) return null;
    if (week < def.minWeek) return { open: false, next: def.minWeek, deadline: 0 };
    const pos = (week - def.minWeek) % def.cycle;
    if (pos < def.window) {
      return { open: true, deadline: week + (def.window - pos - 1), next: 0 };
    }
    const next = def.minWeek + Math.ceil((week - def.minWeek + 1) / def.cycle) * def.cycle;
    return { open: false, next: next, deadline: 0 };
  };

  Game.grantMet = function (def, s) {
    s = s || Game.state;
    if (!def || !def.req) return true;
    const papers = s.stats.papers;
    const top = s.stats.topPapers;
    return papers >= (def.req.papers || 0) && top >= (def.req.top || 0) && s.rep >= (def.req.rep || 0);
  };

  Game.grantMissing = function (def, s) {
    s = s || Game.state;
    const missing = [];
    if (!def || !def.req) return missing;
    if (s.stats.papers < (def.req.papers || 0)) missing.push(`论文 ${s.stats.papers}/${def.req.papers}`);
    if (s.stats.topPapers < (def.req.top || 0)) missing.push(`顶刊 ${s.stats.topPapers}/${def.req.top}`);
    if (s.rep < (def.req.rep || 0)) missing.push(`声望 ${Math.round(s.rep)}/${def.req.rep}`);
    return missing;
  };

  Game.proposalScore = function (def, s) {
    s = s || Game.state;
    return Math.round(
      U.clamp(
        30 +
        (50 + s.rep / 160) * 0.26 +
        Math.min(25, s.rep / 22) +
        s.stats.papers * 2.2 +
        s.stats.topPapers * 7 +
        s.integrity / 12 -
        (def && def.id === 'key' ? 6 : 0),
        0, 100
      )
    );
  };

  Game.grantChance = function (def, s) {
    s = s || Game.state;
    const score = Game.proposalScore(def, s);
    return U.clamp((def.base || 0.5) + (score - 52) / 135, 0.05, 0.94);
  };

  Game.canApplyGrant = function (defId, s) {
    s = s || Game.state;
    const def = Game.grantDef(defId);
    if (!def || defId === 'startup') return { ok: false, reason: '不可申请' };
    if (s.ap < 2) return { ok: false, reason: '需要 2 行动力' };
    if (s.applications.some(a => a.defId === defId && a.status === 'pending')) return { ok: false, reason: '已在评审中' };
    const last = s.grantLastApplied && s.grantLastApplied[defId];
    if (last && s.week - last < def.cycle) return { ok: false, reason: '本轮已申请，等下一轮' };
    if (def.maxTimes && s.applications.filter(a => a.defId === defId).length >= def.maxTimes) {
      return { ok: false, reason: '该计划已申请满次数' };
    }
    const win = Game.grantWindow(def, s.week);
    if (!win.open) return { ok: false, reason: win.next ? `第 ${win.next} 周开放` : '本轮已截止' };
    const missing = Game.grantMissing(def, s);
    if (missing.length) return { ok: false, reason: '未达标：' + missing.join('，') };
    return { ok: true };
  };

  Game.applyGrant = function (defId) {
    const s = Game.state;
    const def = Game.grantDef(defId);
    const can = Game.canApplyGrant(defId, s);
    if (!can.ok) return { ok: false, message: can.reason };
    s.ap -= 2;
    s.grantLastApplied = s.grantLastApplied || {};
    s.grantLastApplied[defId] = s.week;
    const score = Game.proposalScore(def, s);
    const chance = Game.grantChance(def, s);
    const weeks = U.randInt(def.review[0], def.review[1]);
    s.applications.unshift({
      id: U.uid('app'),
      defId: defId,
      submittedWeek: s.week,
      decisionWeek: s.week + weeks,
      score: score,
      chance: chance,
      status: 'pending'
    });
    s.stats.applications++;
    U.piStress(s, 5);
    U.addLog(s, `提交${def.name}申请，评审约 ${weeks} 周。`, 'grant');
    autoSave();
    return {
      ok: true,
      title: '本子已提交',
      lines: [`${def.name}`, `评审约 ${weeks} 周`, `自评 ${score} 分 · 命中率约 ${Math.round(chance * 100)}%`],
      tone: 'great'
    };
  };

  /* ---------------- students / lab ---------------- */

  Game.hireStudent = function (uid) {
    const s = Game.state;
    const idx = s.applicants.findIndex(x => x.uid === uid);
    if (idx < 0) return { ok: false, message: '候选人不存在' };
    if (s.students.filter(x => x.status !== 'left').length >= LAB_LEVELS[s.labLevel].cap) {
      return { ok: false, message: '工位已满，请先升级实验室' };
    }
    const st = s.applicants[idx];
    const cost = st.salary + 2000;
    if (s.funds < cost) return { ok: false, message: '经费不足以支付入职成本' };
    U.funds(s, -cost, true);
    st.uid = U.uid('stu');
    st.status = 'active';
    st.joinedWeek = s.week;
    st.stress = U.randInt(8, 18);
    st.morale = U.randInt(68, 80);
    st.projectId = (Game.currentProject(s) || {}).defId || null;
    st.focus = 'experiment';
    s.students.push(st);
    s.applicants.splice(idx, 1);
    s.stats.studentsHired++;
    U.addLog(s, `${st.name}（${st.role}）加入实验室。`, 'team');
    if (s.applicants.length < 2) s.applicants.push(...genApplicants(2 - s.applicants.length, s));
    checkObjectives(s, false);
    autoSave();
    return { ok: true, title: '新成员加入', lines: [`${st.name} · ${st.role}`, `入职成本 ${U.fmtMoney(cost)}`, `月薪 ${U.fmtMoney(st.salary)}`], tone: 'great' };
  };

  Game.fireStudent = function (uid) {
    const s = Game.state;
    const st = s.students.find(x => x.uid === uid);
    if (!st) return { ok: false, message: '成员不存在' };
    const cost = st.salary * 2;
    if (s.funds < cost) return { ok: false, message: '需要 2 个月工资作为补偿' };
    U.funds(s, -cost, true);
    st.status = 'left';
    U.moraleAll(s, -4);
    s.stats.studentsLost++;
    U.addLog(s, `${st.name} 离开了实验室。`, 'team');
    autoSave();
    return { ok: true, title: '成员离开', lines: [`${st.name} 已离开`, `补偿 ${U.fmtMoney(cost)}`, '全室士气 -4'], tone: 'bad' };
  };

  Game.setFocus = function (uid, focus) {
    const st = Game.state.students.find(x => x.uid === uid);
    if (!st || !FOCI[focus]) return;
    st.focus = focus;
    autoSave();
  };

  Game.setStudentProject = function (uid, projectId) {
    const st = Game.state.students.find(x => x.uid === uid);
    if (!st) return;
    const p = Game.state.projects.find(x => x.defId === projectId && x.status === 'active');
    st.projectId = p ? p.defId : null;
    autoSave();
  };

  Game.teamActivity = function () {
    const s = Game.state;
    if (s.week < s.cooldowns.teamActivity) return { ok: false, message: '上个月刚聚过' };
    if (s.funds < 10000) return { ok: false, message: '经费不足' };
    U.funds(s, -10000, true);
    U.moraleAll(s, 9);
    U.stressAll(s, -6);
    s.cooldowns.teamActivity = s.week + 8;
    s.ap = Math.max(0, s.ap - 0);
    U.addLog(s, '实验室团建，吃了一顿很吵的饭。', 'team');
    autoSave();
    return { ok: true, title: '团建', lines: ['花费 ¥10,000', '全室士气 +9', '压力 -6'], tone: 'good' };
  };

  Game.refreshApplicants = function () {
    const s = Game.state;
    if (s.ap < 1) return { ok: false, message: '需要 1 行动力' };
    s.ap -= 1;
    s.applicants = genApplicants(3, s);
    U.piStress(s, 1);
    autoSave();
    return { ok: true, title: '新候选人', lines: ['你刷新了招聘启事', '新的候选人已到'], tone: 'good' };
  };

  Game.activateProject = function (defId) {
    const s = Game.state;
    if (s.labLevel < 3) return { ok: false, message: '实验室达到 3 级后才能开启第二个方向' };
    const p = s.projects.find(x => x.defId === defId);
    if (!p) return { ok: false, message: '方向不存在' };
    if (p.status === 'active') return { ok: false, message: '该方向已经开启' };
    const activeCount = s.projects.filter(x => x.status === 'active').length;
    const maxActive = s.labLevel >= 4 ? 3 : 2;
    if (activeCount >= maxActive) return { ok: false, message: '当前实验室最多同时推进 ' + maxActive + ' 个方向' };
    if (s.funds < 30000) return { ok: false, message: '启动新方向需要 ¥30,000 前期经费' };
    U.funds(s, -30000, true);
    p.status = 'active';
    p.startedWeek = s.week;
    p.quality = Math.max(p.quality, 38);
    s.rep += 5;
    U.addLog(s, `开启新的研究方向：${p.name}。`, 'research');
    autoSave();
    return { ok: true, title: '新方向启动', lines: [p.full, '前期投入 ¥30,000', '可以分配学生了'], tone: 'great' };
  };

  Game.coffee = function () {
    const s = Game.state;
    if (s.flags.coffeeWeek === s.week) return { ok: false, message: '这周已经喝过了。心跳很快。' };
    s.flags.coffeeWeek = s.week;
    U.piStress(s, -4);
    U.moraleAll(s, 1);
    return { ok: true, title: '一杯手冲', lines: ['压力 -4', '全室士气 +1'], tone: 'good' };
  };

  Game.pet = function () {
    const s = Game.state;
    if (!s.flags.cat) return { ok: false, message: '这里没有猫。' };
    if (s.flags.petWeek === s.week) return { ok: false, message: '它已经不想被摸了。' };
    s.flags.petWeek = s.week;
    U.piStress(s, -2);
    U.moraleAll(s, 1);
    return { ok: true, title: '咕噜咕噜', lines: ['压力 -2', '全室士气 +1'], tone: 'good' };
  };

  Game.buyEquipment = function (defId) {
    const s = Game.state;
    const def = D.EQUIPMENT.find(x => x.id === defId);
    if (!def) return { ok: false, message: '设备不存在' };
    if (s.equipment.some(e => e.defId === defId)) return { ok: false, message: '已拥有该设备' };
    if (s.equipment.length >= LAB_LEVELS[s.labLevel].equip) return { ok: false, message: '设备位已满，请升级实验室' };
    if (s.funds < def.price) return { ok: false, message: '经费不足' };
    U.funds(s, -def.price, true);
    s.equipment.push({ uid: U.uid('eq'), defId: defId, condition: 100, installedWeek: s.week });
    if (def.morale) U.moraleAll(s, def.morale);
    U.addLog(s, `购入 ${def.name}。`, 'equipment');
    autoSave();
    return { ok: true, title: '设备到货', lines: [def.name, `-${U.fmtMoney(def.price)}`, def.tags.join(' / ')], tone: 'great' };
  };

  Game.sellEquipment = function (uid) {
    const s = Game.state;
    const idx = s.equipment.findIndex(e => e.uid === uid);
    if (idx < 0) return { ok: false, message: '设备不存在' };
    const def = Game.equipDef(s.equipment[idx]);
    const price = Math.round(def.price * 0.45 * (s.equipment[idx].condition / 100));
    s.equipment.splice(idx, 1);
    U.funds(s, price, true);
    U.addLog(s, `出售 ${def.name}，回收 ${U.fmtMoney(price)}。`, 'equipment');
    autoSave();
    return { ok: true, title: '设备出售', lines: [`${def.name} 已出售`, `+${U.fmtMoney(price)}`], tone: 'warn' };
  };

  Game.repairEquipment = function (uid) {
    const s = Game.state;
    const e = s.equipment.find(x => x.uid === uid);
    if (!e) return { ok: false, message: '设备不存在' };
    const def = Game.equipDef(e);
    const cost = Math.round(2000 + (100 - e.condition) / 100 * def.price * 0.18);
    if (s.funds < cost) return { ok: false, message: '经费不足' };
    U.funds(s, -cost, true);
    e.condition = 100;
    U.addLog(s, `维修 ${def.name}，花费 ${U.fmtMoney(cost)}。`, 'equipment');
    autoSave();
    return { ok: true, title: '维修完成', lines: [def.name + ' 恢复 100%', `-${U.fmtMoney(cost)}`], tone: 'good' };
  };

  Game.upgradeLab = function () {
    const s = Game.state;
    const next = LAB_LEVELS[s.labLevel + 1];
    if (!next) return { ok: false, message: '已经是最高等级' };
    if (s.funds < next.cost) return { ok: false, message: '经费不足' };
    if (s.rep < next.req.rep) return { ok: false, message: `声望不足（${Math.round(s.rep)}/${next.req.rep}）` };
    if (s.stats.papers < next.req.papers) return { ok: false, message: `论文不足（${s.stats.papers}/${next.req.papers}）` };
    if (s.stats.topPapers < (next.req.top || 0)) return { ok: false, message: `顶刊不足（${s.stats.topPapers}/${next.req.top}）` };
    U.funds(s, -next.cost, true);
    s.labLevel++;
    s.studentCap = next.cap;
    s.equipCap = next.equip;
    s.maxAp = Game.maxAp(s);
    s.ap = Math.min(s.maxAp, s.ap + 1);
    U.moraleAll(s, 8);
    s.rep += 20;
    U.addLog(s, `实验室升级为「${next.name}」。`, 'lab');
    checkObjectives(s, false);
    autoSave();
    const lines = [next.name, `学生容量 ${next.cap} · 设备位 ${next.equip}`, `周行动力 ${next.ap}`];
    if (s.labLevel === 2) lines.push('右侧扩建区已开放，可以走过去看看。');
    return { ok: true, title: '实验室扩建完成', lines: lines, tone: 'great' };
  };

  /* ---------------- week loop ---------------- */

  Game.advanceWeek = function () {
    const s = Game.state;
    if (s.ended) return { ok: false, message: '本局已结束' };
    const startFunds = s.funds;
    const report = {
      week: s.week,
      date: U.dateOf(s.week),
      moneyStart: startFunds,
      moneyEnd: startFunds,
      lines: [],
      research: [],
      team: [],
      money: [],
      papers: [],
      grants: [],
      decisions: [],
      actions: (s.weekActions || []).slice(),
      event: null,
      ended: null
    };
    const activeProject = Game.currentProject(s);

    // Academic loan compounds every week.
    if (s.loan && s.loan.balance > 0) {
      const interest = Math.max(1, Math.ceil(s.loan.balance * (s.loan.rate || D.LOAN.rate)));
      s.loan.balance += interest;
      s.loan.totalInterest = (s.loan.totalInterest || 0) + interest;
      report.money.push(`学术贷款周息 +${U.fmtMoney(interest)}（余额 ${U.fmtMoney(s.loan.balance)}）`);
      if (s.week % 4 === 0) U.addLog(s, `学术贷款利息累计，余额 ${U.fmtMoney(s.loan.balance)}。`, 'money');
    }

    // Flags / temporary effects
    if (s.flags.borrowedEquipment > 0) {
      s.flags.borrowedEquipment--;
      report.lines.push('设备仍借用中，产出略有下降。');
    }
    if (s.flags.visitor > 0) {
      s.flags.visitor--;
      if (activeProject) {
        activeProject.data = Math.min(125, activeProject.data + 2);
        activeProject.quality = Math.min(100, activeProject.quality + 0.4);
      }
      report.lines.push('访问学者在组会上提了一个好问题。');
    }
    if (s.flags.patentPending && s.week >= s.flags.patentPending) {
      s.flags.patentPending = 0;
      s.funds += 50000;
      s.rep += 18;
      report.lines.push('专利授权，技术转移中心发来 ¥50,000 奖励。');
      U.addLog(s, '专利授权，获得技术转移奖励。', 'money');
    }
    if (s.pendingDonation) {
      s.pendingDonation = false;
      const free = D.EQUIPMENT.find(e => e.id === 'cleanbench');
      if (s.equipment.length < LAB_LEVELS[s.labLevel].equip && !s.equipment.some(e => e.defId === free.id)) {
        s.equipment.push({ uid: U.uid('eq'), defId: free.id, condition: 68, installedWeek: s.week });
        report.lines.push('校友捐赠的超净工作台送到了（状态 68%）。');
      } else {
        s.funds += 30000;
        report.lines.push('校友捐赠折现 ¥30,000。');
      }
    }

    // Students
    let totalData = 0, totalInsight = 0, totalWrite = 0;
    s.students.forEach(st => {
      st.weeksInLab++;
      if (st.status === 'burnout') {
        st.burnoutWeeks--;
        st.stress = Math.max(0, st.stress - 4);
        if (st.burnoutWeeks <= 0) {
          st.status = 'active';
          st.stress = 45;
          st.morale = 55;
          st.projectId = activeProject ? activeProject.defId : null;
          report.team.push(`${st.name} 结束了休整，回到实验室。`);
        }
        return;
      }
      if (st.status !== 'active') return;
      if (st.restWeeks > 0) {
        st.restWeeks--;
        st.stress = U.clamp(st.stress - 12, 0, 100);
        st.morale = U.clamp(st.morale + 2, 0, 100);
        report.team.push(`${st.name} 正在休假。`);
        return;
      }
      const p = s.projects.find(x => x.defId === st.projectId && x.status === 'active') || activeProject;
      if (st.focus === 'rest') {
        st.stress = U.clamp(st.stress - 15, 0, 100);
        st.morale = U.clamp(st.morale + 4, 0, 100);
        report.team.push(`${st.name} 本周休整。`);
      } else if (p) {
        const out = Game.studentOutput(st, p, s);
        if (out.data) {
          p.data = Math.min(125, p.data + out.data);
          p.totalData += out.data;
          totalData += out.data;
          const cost = Math.round(180 + out.data * 26);
          if (s.funds < cost) {
            p.data = Math.max(0, p.data - out.data * 0.5);
            st.morale = U.clamp(st.morale - 3, 0, 100);
            report.lines.push('试剂短缺，部分实验被迫中止。');
          } else {
            s.funds -= cost;
            report.money.push(`试剂 -${U.fmtMoney(cost)}`);
          }
        }
        if (out.insight) { p.insight = Math.min(100, p.insight + out.insight); totalInsight += out.insight; }
        if (out.write) {
          const draft = s.papers.find(x => x.projectId === p.defId && x.status === 'draft');
          if (draft) { draft.progress = Math.min(100, draft.progress + out.write); totalWrite += out.write; }
          else { p.insight = Math.min(100, p.insight + out.write * 0.6); totalInsight += out.write * 0.6; }
        }
        if (out.quality) p.quality = Math.min(100, p.quality + out.quality);
        if (out.novelty) p.novelty = Math.min(100, p.novelty + out.novelty);
        st.exp += 1.2 + out.data / 12;
        const growth = Math.max(0.08, (st.potential - st.skill) * 0.018) + (st.talent > 80 ? 0.1 : 0.04);
        st.skill = Math.min(st.potential, st.skill + growth);
        const stressAdd = st.focus === 'experiment' ? 5.4 : st.focus === 'write' ? 3.2 : st.focus === 'analyze' ? 2.8 : 1.8;
        st.stress = U.clamp(st.stress + stressAdd + (s.funds < 0 ? 2 : 0) - (s.flags.cat ? 0.5 : 0), 0, 100);
        if (st.stress > 62) st.morale = U.clamp(st.morale - 1.2, 0, 100);
        else st.morale = U.clamp(st.morale + 0.3, 0, 100);
        if (st.stress >= 100 && st.status === 'active') {
          st.status = 'burnout';
          st.burnoutWeeks = 4;
          st.projectId = null;
          st.morale = U.clamp(st.morale - 15, 0, 100);
          report.team.push(`${st.name} 因过度疲劳，需要休整 4 周。`);
          U.addLog(s, `${st.name} 进入职业倦怠状态。`, 'team');
        }
        if (st.morale <= 8 && U.chance(0.12)) {
          st.status = 'left';
          s.stats.studentsLost++;
          report.team.push(`${st.name} 递交了离开申请。`);
          U.addLog(s, `${st.name} 离开了实验室。`, 'team');
        }
        st.level = 1 + Math.floor(st.exp / 90);
      }
    });
    if (totalData > 0) report.research.push(`学生实验：数据 +${Math.round(totalData)}`);
    if (totalInsight > 0) report.research.push(`学生分析：洞察 +${Math.round(totalInsight)}`);
    if (totalWrite > 0) report.research.push(`学生写作：进度 +${Math.round(totalWrite)}%`);

    // Project passive drift
    s.projects.forEach(p => {
      if (p.status !== 'active') return;
      p.quality = Math.min(100, p.quality + 0.12);
      if (p.papers === 0 && p.data > 20) p.novelty = Math.max(20, p.novelty - 0.15);
    });

    // Equipment wear
    s.equipment.forEach(e => {
      if (e.condition > 0) {
        e.condition = Math.max(0, e.condition - U.rand(0.35, 1.0));
        if (e.condition < 18 && U.chance(0.04)) {
          e.condition = 0;
          report.lines.push(`${Game.equipDef(e).name} 停摆了。`);
        }
      }
    });

    // Papers
    s.papers.forEach(p => {
      if (p.status === 'review' && s.week >= p.reviewAt) {
        const j = Game.journalDef(p.journalId);
        const chance = U.clamp((typeof p.chance === 'number' ? p.chance : 0.2) + (p.reviewBoost || 0) * 0.7, 0.03, 0.95);
        const roll = U.rnd();
        if (roll < chance) {
          const res = Game.publishPaper(p, j, s);
          report.papers.push(`《${p.title}》被 ${j.name} 接收！`);
          report.decisions.push({ type: 'accept', paper: p, journal: j, repGain: res.repGain, award: res.award });
        } else {
          const rest = 1 - chance;
          const t = (roll - chance) / Math.max(0.001, rest);
          if (t < 0.46) {
            p.status = 'revision';
            p.revisionNeeded = 1;
            p.quality = Math.min(100, p.quality + 1);
            p.demands = Game.makeDemands(p, j, 1);
            p.lastRejectedJournal = j.id;
            p.reviewBoost = 0;
            report.papers.push(`《${p.title}》收到小修意见。`);
            report.decisions.push({ type: 'minor', paper: p, journal: j, demands: p.demands });
          } else if (t < 0.78) {
            p.status = 'revision';
            p.revisionNeeded = 2;
            p.quality = Math.min(100, p.quality + 2);
            p.demands = Game.makeDemands(p, j, 2);
            p.lastRejectedJournal = j.id;
            p.reviewBoost = 0;
            report.papers.push(`《${p.title}》收到大修意见。`);
            report.decisions.push({ type: 'major', paper: p, journal: j, demands: p.demands });
          } else {
            p.status = 'rejected';
            p.rejectedBy.push(p.journalId);
            p.demands = Game.makeDemands(p, j, 3);
            p.lastRejectedJournal = j.id;
            p.reviewBoost = 0;
            if (p.counted) {
              const rp = s.projects.find(x => x.defId === p.projectId);
              if (rp) rp.papers = Math.max(0, (rp.papers || 0) - 1);
              p.counted = false;
            }
            U.piStress(s, 4);
            report.papers.push(`《${p.title}》被 ${j.name} 拒稿。`);
            report.decisions.push({ type: 'reject', paper: p, journal: j, demands: p.demands });
          }
        }
      }
    });

    // Grant decisions
    s.applications.forEach(a => {
      if (a.status !== 'pending' || s.week < a.decisionWeek) return;
      const def = Game.grantDef(a.defId);
      const roll = U.rnd();
      if (roll < a.chance) {
        a.status = 'won';
        s.funds += def.amount;
        s.rep += def.repGain || 0;
        s.stats.grants++;
        s.stats.grantMoney += def.amount;
        s.activeGrants.push({
          defId: def.id, name: def.name, amount: def.amount,
          startWeek: s.week, endWeek: s.week + 96, color: def.color
        });
        report.grants.push(`${def.name} 获批：+${U.fmtMoney(def.amount)}，声望 +${def.repGain || 0}`);
        report.decisions.push({ type: 'grantWon', grant: def, application: a });
        U.addLog(s, `${def.name} 获批，经费 +${U.fmtMoney(def.amount)}。`, 'grant');
      } else {
        a.status = 'lost';
        report.grants.push(`${def.name} 未获资助。`);
        report.decisions.push({ type: 'grantLost', grant: def, application: a });
        U.addLog(s, `${def.name} 申请未获资助。`, 'grant');
      }
    });

    // Monthly finance
    if (U.monthlyWeek(s.week)) {
      const level = LAB_LEVELS[s.labLevel];
      const salaries = s.students.filter(x => x.status === 'active').reduce((a, b) => a + b.salary, 0);
      const upkeep = s.equipment.reduce((a, e) => a + (Game.equipDef(e) ? Game.equipDef(e).upkeep : 0), 0);
      const subsidy = 4000 + s.labLevel * 2000;
      const total = level.rent + salaries + upkeep;
      s.funds += subsidy;
      s.funds -= total;
      s.monthStartFunds = s.funds;
      report.money.push(`中心运行补贴：+${U.fmtMoney(subsidy)}`);
      report.money.push(`月固定支出：房租 ${U.fmtMoney(level.rent)} · 工资 ${U.fmtMoney(salaries)} · 维护 ${U.fmtMoney(upkeep)}`);
      report.money.push(`净支出：-${U.fmtMoney(Math.max(0, total - subsidy))}`);
      if (s.funds < 0) {
        s.negativeMonths++;
        report.lines.push(`账上出现赤字（连续 ${s.negativeMonths} 个月）。`);
        U.moraleAll(s, -5);
        if (s.negativeMonths >= 2) {
          report.ended = Game.makeEnding('bankrupt');
        }
      } else {
        s.negativeMonths = 0;
      }
      // citations at month end
      let citeGain = 0;
      s.papers.forEach(p => {
        if (p.status !== 'published') return;
        const j = Game.journalDef(p.journalId);
        const age = s.week - p.publishedWeek;
        const gain = Math.max(1, Math.round(j.if * 0.22 + p.quality / 34 + age / 75));
        p.citations += gain;
        citeGain += gain;
      });
      if (citeGain > 0) {
        s.citations += citeGain;
        s.stats.citations += citeGain;
        s.rep += Math.round(citeGain * 0.42);
        report.research.push(`本月新增引用 ${citeGain}（总引用 ${s.citations}）`);
      }
    }

    // Annual performance award, paid from the center's outcome fund.
    if (s.week === 48 || s.week === 96) {
      const base = s.flags.yearBonusBase || { papers: 0, top: 0 };
      const dp = Math.max(0, s.stats.papers - base.papers);
      const dt = Math.max(0, s.stats.topPapers - base.top);
      const bonus = dp * 8000 + dt * 40000 + (s.rep >= 500 ? 20000 : 0);
      if (bonus > 0) {
        s.funds += bonus;
        report.lines.push('年度科研绩效奖励：+' + U.fmtMoney(bonus) + '。');
        U.addLog(s, '获得年度科研绩效奖励 ' + U.fmtMoney(bonus) + '。', 'money');
      }
      s.flags.yearBonusBase = { papers: s.stats.papers, top: s.stats.topPapers };
    }

    // Startup progress report
    if (!s.flags.startupReported && s.week >= 48) {
      s.flags.startupReported = true;
      if (s.stats.papers >= 1) {
        s.funds += 100000;
        report.lines.push('青年启动基金中期检查通过，拨付第二期 ¥100,000。');
      } else {
        report.lines.push('青年启动基金中期检查：缺少阶段性成果，第二期暂缓。');
        U.piStress(s, 6);
      }
    }

    if (s.funds < 50000 && !s.flags.lowFundsWarned) {
      s.flags.lowFundsWarned = true;
      report.lines.push('经费预警：账上不足 ¥50,000。考虑申请基金、做一次横向咨询，或者缩减开支。');
    }
    if (s.funds >= 80000) s.flags.lowFundsWarned = false;

    // Stress
    U.piStress(s, 2 + (s.ap === 0 ? 1 : 0));
    if (s.piStress >= 92 && !s.flags.exhausted) {
      s.flags.exhausted = true;
      report.lines.push('你连续数周没有好好休息。下周行动力 -1。');
    } else if (s.piStress < 70 && s.flags.exhausted) {
      s.flags.exhausted = false;
    }

    // Objectives
    const completed = checkObjectives(s, false);
    completed.forEach(o => report.lines.push(`目标完成：${o.title}`));

    // Story / random event
    report.event = Game.pickEvent(s);

    // Ending check
    if (!report.ended) {
      if (s.integrity <= 0) report.ended = Game.makeEnding('integrity');
      else if (s.week >= 144) report.ended = Game.makeEnding('final');
    }

    if (report.ended) {
      s.ended = report.ended;
      s.ending = report.ended;
    } else {
      s.week++;
    }
    s.stats.weeksPlayed++;
    Game.updateMaxAp(s);
    s.ap = s.maxAp;
    report.moneyEnd = s.funds;
    s.weekReport = report;
    s.weekActions = [];

    // Make sure pending event is materialised after report
    if (report.event) s.pendingEvent = report.event;

    autoSave();
    return { ok: true, report: report };
  };

  /* ---------------- events ---------------- */

  Game.pickEvent = function (s) {
    // story first
    for (let i = 0; i < D.STORIES.length; i++) {
      const st = D.STORIES[i];
      if (s.seenStories.includes(st.id)) continue;
      if (s.week < st.atWeek) continue;
      let ok = true;
      try { ok = !st.condition || st.condition(s); } catch (e) { ok = false; }
      if (!ok) continue;
      s.seenStories.push(st.id);
      return {
        id: st.id, title: st.title, speaker: st.speaker, text: st.text,
        choices: st.choices, story: true
      };
    }
    // random
    if (!U.chance(0.22)) return null;
    const pool = D.EVENTS.filter(ev => {
      if (s.seenEvents.includes(ev.id)) return false;
      try { return !ev.condition || ev.condition(s); } catch (e) { return false; }
    });
    if (!pool.length) return null;
    let total = pool.reduce((a, e) => a + (e.weight || 5), 0);
    let roll = U.rnd() * total;
    let chosen = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i++) {
      roll -= pool[i].weight || 5;
      if (roll <= 0) { chosen = pool[i]; break; }
    }
    if (chosen.once) s.seenEvents.push(chosen.id);
    return {
      id: chosen.id, title: chosen.title, speaker: chosen.speaker,
      text: chosen.text, choices: chosen.choices, story: false
    };
  };

  Game.eventText = function (event, s) {
    s = s || Game.state;
    try { return typeof event.text === 'function' ? event.text(s) : event.text; } catch (e) { return '……'; }
  };

  Game.resolveEvent = function (choiceIndex) {
    const s = Game.state;
    const ev = s.pendingEvent;
    if (!ev) return { ok: false, message: '没有待处理事件' };
    const ch = ev.choices[choiceIndex];
    if (!ch) return { ok: false, message: '选项不存在' };
    let ok = true;
    try { ok = !ch.condition || ch.condition(s); } catch (e) { ok = false; }
    if (!ok) return { ok: false, message: '当前条件不足' };
    let lines = [];
    try {
      lines = ch.run(s) || [];
    } catch (e) {
      console.error(e);
      lines = ['事情的发展有些出乎意料。'];
    }
    if (ev.id === 'cat' && ch.label.indexOf('留下') >= 0) s.flags.cat = true;
    s.pendingEvent = null;
    checkObjectives(s, false);
    autoSave();
    return { ok: true, event: ev, lines: lines, choice: ch };
  };

  /* ---------------- objectives / ending ---------------- */

  function checkObjectives(s, silent) {
    const newly = [];
    D.OBJECTIVES.forEach(o => {
      if (s.completedObjectives.includes(o.id)) return;
      let done = false;
      try { done = o.check(s); } catch (e) { done = false; }
      if (!done) return;
      s.completedObjectives.push(o.id);
      if (o.reward) {
        if (o.reward.funds) s.funds += o.reward.funds;
        if (o.reward.rep) s.rep += o.reward.rep;
      }
      newly.push(o);
      U.addLog(s, `完成目标「${o.title}」。`, 'objective');
    });
    if (newly.length && !silent && Game.onObjectives) {
      try { Game.onObjectives(newly); } catch (e) { /* UI not ready */ }
    }
    return newly;
  }
  Game.checkObjectives = checkObjectives;

  Game.makeEnding = function (type) {
    const s = Game.state;
    const score = Game.score(s);
    const rank = U.rankInfo(score);
    let tier, title, subtitle, text, grade;
    if (type === 'bankrupt') {
      tier = 'closed'; title = '灯灭了'; grade = 'F';
      subtitle = '实验室因连续赤字关闭';
      text = '最后一个月的电费单贴在门上。你把离心机卖给隔壁，把学生的合同转给了马亚楠。她没有责怪你，只说：“先活下去，再回来。”';
    } else if (type === 'integrity') {
      tier = 'scandal'; title = '不能撤回的图'; grade = 'F';
      subtitle = '学术诚信破产，实验室关闭';
      text = '调查组进驻的那天，实验室异常安静。你保住了几篇论文，但失去了更难以重建的东西。走廊尽头的灯还亮着，只是不再属于你。';
    } else if (rank <= 10 && s.stats.papers >= 4 && s.stats.topPapers >= 2) {
      tier = 'legend'; title = '世界顶级科研团队'; grade = 'S';
      subtitle = `三年，世界排名第 ${rank}`;
      text = '三年后的评审会上，有人问你们做对了什么。你看了看台下那些年轻的脸，说：“我们只是没有在失败的时候，把彼此弄丢。”';
    } else if (rank <= 50 && s.stats.papers >= 3) {
      tier = 'world'; title = '国际一流'; grade = 'A';
      subtitle = `三年，世界排名第 ${rank}`;
      text = '你们没有成为唯一的中心，但已经有人从别的城市飞来，只为在组会上坐一个下午。马亚楠说，这才刚刚开始。';
    } else if (rank <= 10) {
      tier = 'rising'; title = '名声在外'; grade = 'A';
      subtitle = `三年，世界排名第 ${rank} · 论文 ${s.stats.papers} 篇`;
      text = '排名很高，邀请很多，但你们自己知道：真正能留下来的工作还不够。三年后的第一件事，是把那篇一直没写的论文写完。';
    } else if (rank <= 200) {
      tier = 'rising'; title = '小有名气'; grade = 'B';
      subtitle = `三年，世界排名第 ${rank}`;
      text = '实验室活了下来，而且活得不错。你们有论文、有学生、有一台总在响的离心机。世界还没有为你们转身，但已经在侧目。';
    } else {
      tier = 'unknown'; title = '仍在路上'; grade = 'C';
      subtitle = `三年，世界排名第 ${rank}`;
      text = '三年到了。你们没有进入世界前两百，但也没有散。最后一晚，大家把白板擦干净，又写满了下一个三年的计划。';
    }
    return {
      type: type, tier: tier, title: title, subtitle: subtitle, text: text, grade: grade,
      score: score, rank: rank, week: s.week,
      stats: JSON.parse(JSON.stringify(s.stats)),
      rep: Math.round(s.rep), citations: s.citations
    };
  };

  /* ---------------- save ---------------- */

  function rehydrateEvent(ev) {
    if (!ev || !ev.id) return null;
    const def = D.STORIES.find(x => x.id === ev.id) || D.EVENTS.find(x => x.id === ev.id);
    if (!def) return ev;
    return {
      id: def.id,
      title: def.title,
      speaker: def.speaker,
      text: def.text,
      choices: def.choices,
      story: !!def.atWeek
    };
  }

  function autoSave() {
    try { Game.save(); } catch (e) { console.warn('save failed', e); }
  }
  Game.autoSave = autoSave;

  Game.save = function () {
    if (!Game.state) return false;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(Game.state));
      localStorage.setItem(META_KEY, JSON.stringify({
        labName: Game.state.labName,
        playerName: Game.state.playerName,
        week: Game.state.week,
        date: U.dateOf(Game.state.week),
        updatedAt: Date.now()
      }));
      return true;
    } catch (e) {
      console.warn('save failed', e);
      return false;
    }
  };

  Game.migrateState = function (s) {
    if (!s.rankSeed) s.rankSeed = (s.rngState || Date.now()) % 1000003;
    if (!s.look) s.look = { style: 'short', hair: '#241f25', skin: '#e8b98c', coat: '#f8f2e2', accent: '#57b8a6', glasses: true };
    if (!s.scene) s.scene = 'lab';
    if (!s.scenePositions) s.scenePositions = {};
    if (s.scene !== 'lab' && s.player && (s.player.x > 50 || s.player.y > 50)) {
      s.player = Object.assign({ facing: 'up', moving: false }, Game.SCENE_SPAWNS[s.scene] || { x: 6.2, y: 7.4 });
    }
    Object.keys(s.scenePositions).forEach(k => {
      if (k !== 'lab') {
        const p = s.scenePositions[k];
        if (p && (p.x > 50 || p.y > 50)) delete s.scenePositions[k];
      }
    });
    if (!s.loan) s.loan = { balance: 0, totalBorrowed: 0, totalInterest: 0, rate: D.LOAN.rate };
    if (!s.loan.rate) s.loan.rate = D.LOAN.rate;
    if (!Array.isArray(s.journalUnlocks) || !s.journalUnlocks.length) s.journalUnlocks = D.INITIAL_JOURNALS.slice();
    if (!s.equipmentUsed) s.equipmentUsed = {};
    if (!s.inventory) s.inventory = {};
    if (typeof s.careerClues !== 'number') s.careerClues = 0;
    if (!s.fishing) s.fishing = { level: 1, xp: 0, catches: {}, rod: 0, bait: 0, total: 0 };
    if (!s.fishing.catches) s.fishing.catches = {};
    if (typeof s.fishing.level !== 'number') s.fishing.level = 1;
    if (typeof s.fishing.rod !== 'number') s.fishing.rod = 0;
    if (!s.delivery) s.delivery = { week: 0, count: 0, total: 0 };
    if (typeof s.journalSubmissions !== 'number') s.journalSubmissions = 0;
    (s.papers || []).forEach(p => {
      if (!p.dimensions) {
        p.dimensions = {
          novelty: U.clamp((p.novelty || 55) * 0.9, 20, 95),
          rigor: U.clamp((p.quality || 45) * 0.9, 20, 95),
          data: U.clamp((p.quality || 45) * 0.85 + 8, 20, 95),
          clarity: U.clamp((p.quality || 45) * 0.8 + 10, 20, 95)
        };
      }
      if (!p.demands) p.demands = {};
      if (!Array.isArray(p.reviewHistory)) p.reviewHistory = [];
      if (typeof p.counted !== 'boolean') p.counted = p.status !== 'rejected';
    });
    (s.students || []).forEach(st => {
      if (typeof st.lastTaskWeek !== 'number') st.lastTaskWeek = 0;
      if (typeof st.affinity !== 'number') st.affinity = U.randInt(16, 36);
    });
    return s;
  };

  Game.load = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.projects) return null;
      Game.migrateState(s);
      if (!s.grantLastApplied) s.grantLastApplied = {};
      if (!s.player) s.player = { x: 98, y: 198, facing: 'down', moving: false };
      if (!Array.isArray(s.weekActions)) s.weekActions = [];
      if (!Array.isArray(s.completedObjectives)) s.completedObjectives = [];
      if (!s.flags) s.flags = {};
      if (typeof s.negativeMonths !== 'number') s.negativeMonths = 0;
      if (s.pendingEvent) s.pendingEvent = rehydrateEvent(s.pendingEvent);
      if (s.weekReport && s.weekReport.event) s.weekReport.event = rehydrateEvent(s.weekReport.event);
      Game.state = s;
      Game.ui.selectedProjectId = (Game.currentProject(s) || {}).defId || null;
      Game.ui.selectedStudentId = (Game.activeStudents(s)[0] || {}).uid || null;
      Game.ui.selectedPaperId = (s.papers.find(p => ['draft', 'revision', 'ready'].includes(p.status)) || {}).id || null;
      Game.updateMaxAp(s);
      return s;
    } catch (e) {
      console.warn('load failed', e);
      return null;
    }
  };

  Game.hasSave = function () {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  };

  Game.meta = function () {
    try { return JSON.parse(localStorage.getItem(META_KEY) || 'null'); } catch (e) { return null; }
  };

  Game.reset = function () {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(META_KEY);
    } catch (e) { /* ignore */ }
    Game.state = null;
  };

  Game.exportSave = function () {
    return Game.state ? JSON.stringify(Game.state) : '';
  };

  Game.importSave = function (json) {
    try {
      const s = JSON.parse(json);
      if (!s || !s.projects || !s.students) return false;
      Game.migrateState(s);
      if (!s.grantLastApplied) s.grantLastApplied = {};
      if (!s.player) s.player = { x: 98, y: 198, facing: 'down', moving: false };
      if (!Array.isArray(s.weekActions)) s.weekActions = [];
      if (!Array.isArray(s.completedObjectives)) s.completedObjectives = [];
      if (!s.flags) s.flags = {};
      if (typeof s.negativeMonths !== 'number') s.negativeMonths = 0;
      if (s.pendingEvent) s.pendingEvent = rehydrateEvent(s.pendingEvent);
      if (s.weekReport && s.weekReport.event) s.weekReport.event = rehydrateEvent(s.weekReport.event);
      Game.state = s;
      Game.ui.selectedProjectId = (Game.currentProject(s) || {}).defId || null;
      Game.ui.selectedStudentId = (Game.activeStudents(s)[0] || {}).uid || null;
      Game.updateMaxAp(s);
      Game.save();
      return true;
    } catch (e) { return false; }
  };

  /* ---------------- expose ---------------- */

  Game.LAB_LEVELS = LAB_LEVELS;
  Game.ACTIONS = ACTIONS;
  Game.FOCI = FOCI;
  Game.genApplicants = genApplicants;
  Game.makeStudent = makeStudent;
  Game.autoSave = autoSave;
  Game.ACTIONS_BY_ID = ACTIONS.reduce((a, x) => { a[x.id] = x; return a; }, {});

  // wire score function into objectives
  D.scoreFn = function (s) { return Game.score(s); };

  window.Game = Game;
})();

