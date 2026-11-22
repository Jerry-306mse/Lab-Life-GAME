
/* Lab Life — content and balance tables. All story text lives here. */
(function () {
  'use strict';
  const U = window.LabUtil;

  const PROJECTS = [
  {
    "id": "microbot",
    "name": "微纳蜂群",
    "full": "可编程微纳机器人",
    "tagline": "让微小的机器，在血管里排队前行。",
    "field": "工程",
    "tags": [
      "材料",
      "工程",
      "生物"
    ],
    "color": "#e76f51",
    "accent": "#ffb08a",
    "icon": "robot",
    "difficulty": "高",
    "desc": "把磁控、微流控与活体成像拧成一股绳。做成一次，就能上封面；做砸一次，也能写三篇方法学论文。",
    "milestones": [
      "磁控集群成形",
      "复杂流体中的导航",
      "活体血栓清除验证",
      "可降解微机器人平台"
    ],
    "startingQuality": 43,
    "novelty": 74,
    "titleParts": {
      "things": [
        "磁驱微纳集群",
        "仿生微游泳体",
        "可编程微纳机器人",
        "血小板仿生载体",
        "声磁双驱微机器人"
      ],
      "methods": [
        "磁控自组装",
        "微流控精准制造",
        "闭环导航控制",
        "活体成像追踪",
        "群体智能路径规划"
      ],
      "goals": [
        "在复杂流体中的协同推进",
        "血栓靶向清除",
        "眼底微创递送",
        "单细胞尺度操控",
        "血管内实时导航"
      ]
    }
  },
  {
    "id": "microbiome",
    "name": "城市呼吸",
    "full": "城市空气微生物组图谱",
    "tagline": "一座城市每天呼吸什么，没人真正知道。",
    "field": "生物",
    "tags": [
      "生物",
      "环境",
      "计算"
    ],
    "color": "#57b8a6",
    "accent": "#a9e5d8",
    "icon": "leaf",
    "difficulty": "中",
    "desc": "在地铁、学校与屋顶之间布一张采样网。数据脏、样本杂、审稿人问“所以呢”，但故事足够大。",
    "milestones": [
      "建立城市采样网",
      "绘制季节扩散图谱",
      "锁定关键抗性基因",
      "城市健康预警模型"
    ],
    "startingQuality": 46,
    "novelty": 68,
    "titleParts": {
      "things": [
        "城市空气微生物组",
        "地铁气溶胶群落",
        "建筑表面生物膜",
        "城市鸟类肠道菌群",
        "室内真菌网络"
      ],
      "methods": [
        "宏基因组时序采样",
        "单细胞转录组",
        "机器学习溯源",
        "培养组学",
        "空间代谢组"
      ],
      "goals": [
        "的昼夜节律",
        "的抗性基因图谱",
        "的季节性扩散路径",
        "与呼吸健康的关联",
        "的城市生物多样性基线"
      ]
    }
  },
  {
    "id": "synbio",
    "name": "合成生态",
    "full": "可编程微生物群落",
    "tagline": "让一群微生物学会分工，而不是互相抢饭。",
    "field": "生物",
    "tags": [
      "生物",
      "工程",
      "计算"
    ],
    "color": "#7aa66a",
    "accent": "#c8e6a8",
    "icon": "leaf",
    "difficulty": "高",
    "desc": "设计、构建、测试、学习。每一次失败都能变成下一轮的训练数据，但污染也会一起进化。",
    "milestones": [
      "构建最小群落",
      "稳定分工网络",
      "环境压力下的鲁棒性",
      "可部署的合成生态"
    ],
    "startingQuality": 44,
    "novelty": 76,
    "titleParts": {
      "things": [
        "合成微生物群落",
        "可编程共生网络",
        "人工生态底盘",
        "环境响应型菌群",
        "分工型细胞联盟"
      ],
      "methods": [
        "生态位工程",
        "群体感应回路",
        "适应性实验室进化",
        "单细胞追踪",
        "计算生态设计"
      ],
      "goals": [
        "的稳定分工机制",
        "的污染抵抗能力",
        "的碳源分配策略",
        "的环境响应开关",
        "的长期共存边界"
      ]
    }
  },
  {
    "id": "quantum",
    "name": "量子界面",
    "full": "量子材料界面输运",
    "tagline": "在界面那一层，电子不再遵守你熟悉的规则。",
    "field": "材料",
    "tags": [
      "材料",
      "计算",
      "化学"
    ],
    "color": "#8a6fd6",
    "accent": "#cfc0ff",
    "icon": "chip",
    "difficulty": "极高",
    "desc": "生长、表征、低温输运。每一层原子都可能让故事改写，也可能让三个月白干。",
    "milestones": [
      "界面生长窗口",
      "拓扑输运证据",
      "可重复器件阵列",
      "室温候选界面"
    ],
    "startingQuality": 39,
    "novelty": 82,
    "titleParts": {
      "things": [
        "量子界面",
        "拓扑边界态",
        "二维异质结",
        "莫尔超晶格",
        "自旋轨道耦合界面"
      ],
      "methods": [
        "分子束外延",
        "低温量子输运",
        "角分辨光电子能谱",
        "第一性原理界面筛选",
        "范德华堆叠"
      ],
      "goals": [
        "的拓扑输运证据",
        "的界面重构机制",
        "的可重复器件路径",
        "的自旋-电荷转换",
        "的室温稳定性"
      ]
    }
  },
  {
    "id": "aimat",
    "name": "固态之芯",
    "full": "AI 发现超离子导体",
    "tagline": "算得比做得快，但电池只认实验。",
    "field": "计算",
    "tags": [
      "计算",
      "材料",
      "化学"
    ],
    "color": "#6f8fd6",
    "accent": "#b8c9ff",
    "icon": "chip",
    "difficulty": "高",
    "desc": "用生成模型在海量结构中淘金，再用一炉一炉的烧结验证。算力、样品与运气，缺一不可。",
    "milestones": [
      "构建候选材料库",
      "预测室温超离子通道",
      "实验合成验证",
      "全固态电池原型"
    ],
    "startingQuality": 41,
    "novelty": 78,
    "titleParts": {
      "things": [
        "超离子导体界面",
        "固态电解质晶界",
        "锂离子输运网络",
        "熵稳定氧化物",
        "钠离子快导体"
      ],
      "methods": [
        "主动学习势函数",
        "高通量第一性原理",
        "图神经网络筛选",
        "原位谱学",
        "生成式结构设计"
      ],
      "goals": [
        "的室温导电机制",
        "的界面失效起源",
        "的快速筛选框架",
        "的长期循环稳定性",
        "的离子协同输运"
      ]
    }
  }
];

  const FIXTURES = [
    {
      id: 'glovebox', name: '惰性手套箱', short: '手套箱', sprite: 'glovebox', tier: 2,
      tags: ['材料', '化学'], desc: '实验室老资历，院长说他导师当年就用的这个手套箱',
      panel: 'research', verb: '检查手套箱',
      use: { label: '处理敏感样品', data: 12, quality: 3, rigor: 2, cost: 800, desc: '上面的便签纸写着“使用前请用胶带密封四周”。' }
    },
    {
      id: 'fumehood', name: '通风橱', short: '通风橱', sprite: 'fumehood', tier: 2,
      tags: ['化学', '生物', '通用'], desc: '之前实验室有学生中毒了，所以换的这是一个崭新的通风橱。',
      panel: 'research', verb: '检查通风橱',
      use: { label: '安全反应', data: 10, quality: 4, rigor: 3, cost: 600, desc: '镇室之宝' }
    },
    {
      id: 'microscope', name: '倒置荧光显微镜', short: '显微镜', sprite: 'microscope', tier: 2,
      tags: ['生物', '材料'], desc: '二手市场严选，将就着用吧。',
      panel: 'research', verb: '看显微镜',
      use: { label: '显微观察', data: 3, insight: 10, quality: 2, clarity: 2, cost: 250, desc: '给你一个灭掉全世界的微观结构（镜子里的世界有点看不清）。' }
    },
    {
      id: 'pipette', name: '大容量移液枪', short: '移液枪', sprite: 'pipette', tier: 1,
      tags: ['通用', '生物', '化学'], desc: '从 0.5 µL 到 1 mL 的一套大虫牌移液枪，但是看上去不是很准的样子。',
      panel: 'research', verb: '整理移液枪',
      use: { label: '平行加样', data: 12, quality: 2, rigor: 2, cost: 300, desc: '没有关系，都是合理的误差。' }
    },
    {
      id: 'balance', name: '精准天平', short: '天平', sprite: 'balance', tier: 1,
      tags: ['化学', '材料'], desc: '整数部分准确估读。',
      panel: 'research', verb: '使用天平',
      use: { label: '精确称量', data: 5, quality: 5, rigor: 4, cost: 150, desc: '把“差不多”写进实验生涯里。' }
    },
    {
      id: 'computer', name: '电脑工作站', short: '电脑', sprite: 'computer', tier: 2,
      tags: ['计算', '通用'], desc: '一台显示器看数据，一台显示器看论文，第三台用来显示“未读邮件 247”。',
      panel: 'papers', verb: '打开电脑',
      use: { label: '建模与写作', insight: 7, clarity: 7, progress: 12, cost: 0, desc: '租用电脑期间请爱惜使用。' }
    },
    {
      id: 'bench', name: '中央实验台', short: '实验台', sprite: 'bench', tier: 1,
      tags: ['通用'], desc: '实验室真正的心脏。当然桌面也是真脏。',
      panel: 'research', verb: '站在实验台前',
      use: { label: '手工实验', data: 7, quality: 2, rigor: 1, cost: 400, desc: '最普通的实验台，也是所有故事开始的地方。' }
    }
  ];

  const EQUIPMENT = [
  {
    "id": "centrifuge",
    "name": "台式离心机",
    "price": 18000,
    "tier": 1,
    "tags": [
      "通用",
      "生物"
    ],
    "upkeep": 180,
    "icon": "centrifuge",
    "sprite": "centrifuge",
    "starter": true,
    "slot": 1,
    "desc": "转得不算快，但能够发出拖拉机般的轰鸣。",
    "use": {
      "label": "分离样本",
      "data": 8,
      "quality": 2,
      "rigor": 2,
      "cost": 300,
      "desc": "把上清液和沉淀分开，当然有时候也可以把盖子甩飞。"
    }
  },
  {
    "id": "microscope",
    "name": "激光共聚焦显微镜",
    "price": 90000,
    "tier": 3,
    "tags": [
      "生物",
      "材料"
    ],
    "upkeep": 900,
    "icon": "microscope",
    "sprite": "microscope",
    "slot": 2,
    "desc": "不是二手，胜似二手",
    "use": {
      "label": "深层成像",
      "data": 3,
      "insight": 14,
      "quality": 4,
      "clarity": 3,
      "cost": 600,
      "desc": "又不是造火箭，大概看看得了"
    }
  },
  {
    "id": "cleanbench",
    "name": "超净工作台",
    "price": 48000,
    "tier": 2,
    "tags": [
      "生物",
      "通用"
    ],
    "upkeep": 420,
    "icon": "bench",
    "sprite": "cleanbench",
    "slot": 3,
    "desc": "无菌操作的基本尊严。至少不用再和隔壁借。",
    "use": {
      "label": "无菌操作",
      "data": 8,
      "quality": 5,
      "rigor": 3,
      "cost": 500,
      "desc": "使用前请认真祈祷。"
    }
  },
  {
    "id": "printer3d",
    "name": "高精度 3D 打印机",
    "price": 38000,
    "tier": 2,
    "tags": [
      "工程",
      "材料"
    ],
    "upkeep": 350,
    "icon": "printer",
    "sprite": "printer3d",
    "slot": 4,
    "desc": "打印支架、夹具和那些“应该能买到但就是买不到”的小零件。",
    "use": {
      "label": "打印原型",
      "data": 7,
      "quality": 3,
      "novelty": 2,
      "cost": 450,
      "desc": "当天设计、当天打印、当天发现设计错了。迭代速度就是生产力。"
    }
  },
  {
    "id": "glovebox",
    "name": "双工位手套箱",
    "price": 72000,
    "tier": 3,
    "tags": [
      "材料",
      "化学"
    ],
    "upkeep": 700,
    "icon": "glovebox",
    "sprite": "glovebox",
    "slot": 5,
    "desc": "多一个工位，少一次排队。隔绝水和氧，也隔绝你和正常作息的最后一点联系。",
    "use": {
      "label": "双工位装样",
      "data": 16,
      "quality": 5,
      "rigor": 4,
      "cost": 900,
      "desc": "两个人同时装样就可以把一天的活压到半天。"
    }
  },
  {
    "id": "gpu",
    "name": "GPU 计算工作站",
    "price": 85000,
    "tier": 3,
    "tags": [
      "计算",
      "通用"
    ],
    "upkeep": 650,
    "icon": "gpu",
    "sprite": "gpu",
    "slot": 6,
    "desc": "八张卡，一台空调外机。整层楼都知道你在训练模型。",
    "use": {
      "label": "训练模型",
      "insight": 12,
      "rigor": 4,
      "clarity": 2,
      "cost": 150,
      "desc": "快跑吧，再不跑真没饭吃了。"
    }
  },
  {
    "id": "microfluidics",
    "name": "微流控平台",
    "price": 92000,
    "tier": 3,
    "tags": [
      "工程",
      "生物"
    ],
    "upkeep": 820,
    "icon": "chip",
    "sprite": "microfluidics",
    "slot": 7,
    "desc": "在头发丝宽的通道里安排流体的命运，顺道安排你的命运。",
    "use": {
      "label": "芯片实验",
      "data": 10,
      "quality": 5,
      "novelty": 3,
      "cost": 700,
      "desc": "本来不打算做，但是院长说芯片项目好骗钱。"
    }
  },
  {
    "id": "sequencer",
    "name": "便携式测序仪",
    "price": 160000,
    "tier": 4,
    "tags": [
      "生物",
      "环境"
    ],
    "upkeep": 1500,
    "icon": "dna",
    "sprite": "sequencer",
    "slot": 8,
    "desc": "小小的也很可爱。",
    "use": {
      "label": "现场测序",
      "data": 12,
      "insight": 8,
      "rigor": 3,
      "cost": 1200,
      "desc": "数据仅供参考，需要权威数据还是请找外包"
    }
  },
  {
    "id": "sem",
    "name": "二手场发射电镜",
    "price": 210000,
    "tier": 4,
    "tags": [
      "材料",
      "工程"
    ],
    "upkeep": 2100,
    "icon": "sem",
    "sprite": "sem",
    "slot": 9,
    "desc": "前任主人说它“只是有点挑样品”。你选择相信。",
    "use": {
      "label": "形貌表征",
      "insight": 8,
      "quality": 7,
      "rigor": 3,
      "cost": 900,
      "desc": "看到表面，也看到审稿人将信将疑的那一层。"
    }
  },
  {
    "id": "coffee",
    "name": "半自动咖啡机",
    "price": 12000,
    "tier": 1,
    "tags": [
      "通用"
    ],
    "upkeep": 240,
    "icon": "coffee",
    "sprite": "coffee",
    "slot": 10,
    "morale": 2,
    "desc": "牛马生命水。全室士气 +2。",
    "use": {
      "label": "请大家喝咖啡",
      "morale": 3,
      "stress": -5,
      "cost": 200,
      "desc": "不产出数据，但能让实验室的牛马再留一会儿。"
    }
  }
];

  const DIMENSIONS = [
    { id: 'novelty', name: '新颖性', short: '新', color: '#e76f51' },
    { id: 'rigor', name: '严谨性', short: '严', color: '#6f8fd6' },
    { id: 'data', name: '数据完整度', short: '数', color: '#57b8a6' },
    { id: 'clarity', name: '表达清晰度', short: '清', color: '#d4b04e' }
  ];

  const JOURNAL_SERIES = {
    transactions: { name: '学报系列', en: 'Transactions', color: '#5b8fb9' },
    science: { name: '科学系列', en: 'Science', color: '#c0913f' },
    nature: { name: '自然系列', en: 'Nature', color: '#7d6bb0' },
    declaration: { name: '声明系列', en: 'Declarations', color: '#b06a8a' },
    rb: { name: 'RB 系列', en: 'RB Series', color: '#2f7f78' }
  };

  const JOURNALS = [
  {
    "id": "acta",
    "name": "RB 交叉学报",
    "short": "交叉学报",
    "series": "transactions",
    "if": 4.2,
    "threshold": 40,
    "rep": 20,
    "apc": 0,
    "review": [
      2,
      3
    ],
    "color": "#5b8fb9",
    "integrity": 0,
    "dimReq": {
      "novelty": 42,
      "rigor": 48,
      "data": 44,
      "clarity": 42
    },
    "dimWeights": {
      "novelty": 0.2,
      "rigor": 0.35,
      "data": 0.3,
      "clarity": 0.15
    },
    "desc": "老老实实的方法学与交叉结果。编辑喜欢清楚的故事，也喜欢完整的补充材料。"
  },
  {
    "id": "rbj",
    "name": "RB 城市学报",
    "short": "RB城市学报",
    "series": "transactions",
    "if": 3.4,
    "threshold": 32,
    "rep": 16,
    "apc": 0,
    "review": [
      2,
      3
    ],
    "color": "#7a9e7e",
    "integrity": 0,
    "dimReq": {
      "novelty": 34,
      "rigor": 38,
      "data": 40,
      "clarity": 42
    },
    "dimWeights": {
      "novelty": 0.2,
      "rigor": 0.3,
      "data": 0.3,
      "clarity": 0.2
    },
    "desc": "本地综合性学报。编辑是马亚楠的旧识，但匿名评审照旧。"
  },
  {
    "id": "frontiers",
    "name": "JOKE 交叉科学前沿",
    "short": "交叉前沿",
    "series": "transactions",
    "if": 7.2,
    "threshold": 51,
    "rep": 36,
    "apc": 0,
    "review": [
      3,
      4
    ],
    "color": "#3d7ea6",
    "integrity": 0,
    "dimReq": {
      "novelty": 54,
      "rigor": 52,
      "data": 50,
      "clarity": 52
    },
    "dimWeights": {
      "novelty": 0.3,
      "rigor": 0.25,
      "data": 0.2,
      "clarity": 0.25
    },
    "desc": "对交叉工作友好，审稿速度体面。年轻实验室的合理第一站。"
  },
  {
    "id": "matletters",
    "name": "RB 材料学报",
    "short": "材料学报",
    "series": "transactions",
    "if": 8.4,
    "threshold": 57,
    "rep": 48,
    "apc": 0,
    "review": [
      3,
      4
    ],
    "color": "#b07a42",
    "integrity": 0,
    "dimReq": {
      "novelty": 50,
      "rigor": 62,
      "data": 60,
      "clarity": 50
    },
    "dimWeights": {
      "novelty": 0.2,
      "rigor": 0.35,
      "data": 0.3,
      "clarity": 0.15
    },
    "desc": "材料方向的稳健选择。审稿人最爱问：第三组对照在哪里？"
  },
  {
    "id": "science_adv",
    "name": "科学·进展",
    "short": "科学进展",
    "series": "science",
    "if": 15.2,
    "threshold": 69,
    "rep": 88,
    "apc": 0,
    "review": [
      4,
      6
    ],
    "color": "#c0913f",
    "integrity": 0,
    "dimReq": {
      "novelty": 68,
      "rigor": 70,
      "data": 68,
      "clarity": 62
    },
    "dimWeights": {
      "novelty": 0.35,
      "rigor": 0.3,
      "data": 0.2,
      "clarity": 0.15
    },
    "desc": "科学系列的第一道高墙。新颖性要站得住，数据也要经得起拆。"
  },
  {
    "id": "scifront",
    "name": "科学·前沿",
    "short": "科学前沿",
    "series": "science",
    "if": 18.8,
    "threshold": 78,
    "rep": 120,
    "apc": 0,
    "review": [
      5,
      7
    ],
    "color": "#d4a13e",
    "integrity": 0,
    "dimReq": {
      "novelty": 78,
      "rigor": 76,
      "data": 72,
      "clarity": 65
    },
    "dimWeights": {
      "novelty": 0.4,
      "rigor": 0.25,
      "data": 0.2,
      "clarity": 0.15
    },
    "desc": "综合顶刊。编辑会先问：除了你们自己，谁会在意？"
  },
  {
    "id": "cellh",
    "name": "细胞·地平线",
    "short": "细胞地平线",
    "series": "declaration",
    "legacy": true,
    "if": 11.4,
    "threshold": 61,
    "rep": 62,
    "apc": 0,
    "review": [
      4,
      5
    ],
    "color": "#b06a8a",
    "integrity": 0,
    "dimReq": {
      "novelty": 64,
      "rigor": 60,
      "data": 58,
      "clarity": 62
    },
    "dimWeights": {
      "novelty": 0.3,
      "rigor": 0.25,
      "data": 0.2,
      "clarity": 0.25
    },
    "desc": "旧存档中的生命科学投稿选项。"
  },
  {
    "id": "natcomm",
    "name": "自然·通讯",
    "short": "自然通讯",
    "series": "nature",
    "if": 14.8,
    "threshold": 64,
    "rep": 78,
    "apc": 0,
    "review": [
      4,
      6
    ],
    "color": "#6c82c4",
    "integrity": 0,
    "dimReq": {
      "novelty": 70,
      "rigor": 60,
      "data": 62,
      "clarity": 60
    },
    "dimWeights": {
      "novelty": 0.4,
      "rigor": 0.2,
      "data": 0.2,
      "clarity": 0.2
    },
    "desc": "自然系列的宽门。故事要新，但不必每一页都像教科书。"
  },
  {
    "id": "naturex",
    "name": "自然·综合",
    "short": "自然综合",
    "series": "nature",
    "if": 23.6,
    "threshold": 84,
    "rep": 160,
    "apc": 0,
    "review": [
      6,
      9
    ],
    "color": "#7d6bb0",
    "integrity": 0,
    "dimReq": {
      "novelty": 85,
      "rigor": 78,
      "data": 76,
      "clarity": 70
    },
    "dimWeights": {
      "novelty": 0.45,
      "rigor": 0.2,
      "data": 0.15,
      "clarity": 0.2
    },
    "desc": "传说中的那本刊。投出去的那一刻，整个实验室都会安静。"
  },
  {
    "id": "rapid",
    "name": "快速声明",
    "short": "快速声明",
    "series": "declaration",
    "if": 10.5,
    "threshold": 59,
    "rep": 52,
    "apc": 20000,
    "review": [
      2,
      3
    ],
    "color": "#b06a8a",
    "integrity": 0,
    "dimReq": {
      "novelty": 70,
      "rigor": 48,
      "data": 46,
      "clarity": 68
    },
    "dimWeights": {
      "novelty": 0.45,
      "rigor": 0.1,
      "data": 0.1,
      "clarity": 0.35
    },
    "desc": "抢先发表请找快速声明，请相信，版面费只是通往成功的阶梯。"
  },
  {
    "id": "declaration",
    "name": "研究声明",
    "short": "研究声明",
    "series": "declaration",
    "if": 17.2,
    "threshold": 74,
    "rep": 105,
    "apc": 250000,
    "review": [
      4,
      6
    ],
    "color": "#c0799a",
    "integrity": 0,
    "dimReq": {
      "novelty": 82,
      "rigor": 60,
      "data": 54,
      "clarity": 78
    },
    "dimWeights": {
      "novelty": 0.45,
      "rigor": 0.1,
      "data": 0.1,
      "clarity": 0.35
    },
    "desc": "声明系列第二本，听说快速声明赚大了所以再开了一本。"
  },
  {
    "id": "rb_review",
    "name": "RB 科学评论",
    "short": "RB科学评论",
    "series": "rb",
    "if": 28,
    "threshold": 90,
    "rep": 220,
    "apc": 0,
    "review": [
      8,
      11
    ],
    "color": "#2f7f78",
    "integrity": 0,
    "dimReq": {
      "novelty": 90,
      "rigor": 88,
      "data": 88,
      "clarity": 82
    },
    "dimWeights": {
      "novelty": 0.3,
      "rigor": 0.3,
      "data": 0.25,
      "clarity": 0.15
    },
    "desc": "RB 系列的最高刊，也是整座城市登顶之作。四个维度都要接近满分，科学评论发了，帽子就有了。"
  },
  {
    "id": "advanced_materials",
    "name": "先进材料科学",
    "short": "先进材料",
    "series": "science",
    "if": 28.5,
    "threshold": 82,
    "rep": 150,
    "apc": 5000,
    "review": [
      4,
      8
    ],
    "color": "#c0913f",
    "integrity": 0,
    "dimReq": {
      "novelty": 85,
      "rigor": 80,
      "data": 82,
      "clarity": 75
    },
    "dimWeights": {
      "novelty": 0.35,
      "rigor": 0.25,
      "data": 0.25,
      "clarity": 0.15
    },
    "desc": "材料科学领域的高水平期刊，重视创新性、实验严谨性和应用价值。"
  },
  {
    "id": "global",
    "name": "全球万物学报",
    "short": "万物学报",
    "series": "transactions",
    "if": 0.9,
    "threshold": 5,
    "rep": 2,
    "apc": 6000,
    "review": [
      1,
      2
    ],
    "color": "#8b8173",
    "integrity": -5,
    "predatory": true,
    "dimReq": {
      "novelty": 5,
      "rigor": 5,
      "data": 5,
      "clarity": 5
    },
    "dimWeights": {
      "novelty": 0.25,
      "rigor": 0.25,
      "data": 0.25,
      "clarity": 0.25
    },
    "desc": "“48 小时录用，附赠编委头衔。”你隐约知道哪里不对。"
  }
];

  const INITIAL_JOURNALS = [
  "acta",
  "rbj",
  "frontiers",
  "global"
];
  const JOURNAL_UNLOCK_ORDER = [
  "rapid",
  "matletters",
  "natcomm",
  "science_adv",
  "declaration",
  "scifront",
  "naturex",
  "rb_review"
];

  const LOAN = {
    rate: 0.02,
    options: [50000, 100000, 200000],
    baseLimit: 200000,
    repLimit: 300000
  };

  const GRANTS = [
  {
    "id": "school",
    "name": "校级交叉培育基金",
    "short": "交叉培育",
    "amount": 100000,
    "minWeek": 5,
    "cycle": 24,
    "window": 6,
    "maxTimes": 3,
    "req": {
      "papers": 0,
      "top": 0,
      "rep": 0
    },
    "base": 0.68,
    "review": [
      4,
      5
    ],
    "repGain": 10,
    "color": "#7aa66a",
    "desc": "学校给年轻 PI 的小口粮。钱不多，但足够买一些二手设备。"
  },
  {
    "id": "industry",
    "name": "灵犀科技 · 横向合作",
    "short": "企业横向",
    "amount": 300000,
    "minWeek": 12,
    "cycle": 32,
    "window": 8,
    "maxTimes": 3,
    "req": {
      "papers": 1,
      "top": 0,
      "rep": 20
    },
    "base": 0.78,
    "review": [
      2,
      3
    ],
    "repGain": 5,
    "color": "#d4b04e",
    "desc": "企业要一个可展示的原型，你要一笔能续命的钱。"
  },
  {
    "id": "rb",
    "name": "RB 面上项目",
    "short": "RB 面上",
    "amount": 400000,
    "minWeek": 20,
    "cycle": 48,
    "window": 8,
    "maxTimes": 2,
    "req": {
      "papers": 2,
      "top": 0,
      "rep": 100
    },
    "base": 0.46,
    "review": [
      6,
      8
    ],
    "repGain": 38,
    "color": "#57b8a6",
    "desc": "地区层面最重要的一笔常规资助。评审看本子，看看你过去两年到底做成了什么。"
  },
  {
    "id": "intl",
    "name": "国际联合实验室",
    "short": "国际联合",
    "amount": 500000,
    "minWeek": 72,
    "cycle": 72,
    "window": 8,
    "maxTimes": 1,
    "req": {
      "papers": 6,
      "top": 2,
      "rep": 480
    },
    "base": 0.35,
    "review": [
      6,
      8
    ],
    "repGain": 72,
    "color": "#6f8fd6",
    "desc": "与海外三地联合申报。时差会议会吞掉你的夜晚，但窗口足够大。"
  },
  {
    "id": "young",
    "name": "国家优秀青年科学基金",
    "short": "优青",
    "amount": 800000,
    "minWeek": 56,
    "cycle": 60,
    "window": 8,
    "maxTimes": 2,
    "req": {
      "papers": 5,
      "top": 1,
      "rep": 320
    },
    "base": 0.3,
    "review": [
      8,
      10
    ],
    "repGain": 95,
    "color": "#e08a5b",
    "desc": "人才帽子，也是下一段路费。函评专家会认真读你的每一篇代表作。"
  },
  {
    "id": "key",
    "name": "重点研发计划",
    "short": "重点研发",
    "amount": 1500000,
    "minWeek": 92,
    "cycle": 72,
    "window": 10,
    "maxTimes": 1,
    "req": {
      "papers": 8,
      "top": 2,
      "rep": 650
    },
    "base": 0.2,
    "review": [
      10,
      12
    ],
    "repGain": 170,
    "color": "#b06a8a",
    "desc": "大团队、大目标、大预算。你需要证明自己不只是“会写小文章的人”。"
  },
  {
    "id": "explore",
    "name": "科技处 · 青年探索项目",
    "short": "青年探索",
    "amount": 150000,
    "minWeek": 4,
    "cycle": 20,
    "window": 6,
    "maxTimes": 4,
    "req": {
      "papers": 0,
      "top": 0,
      "rep": 10
    },
    "base": 0.62,
    "review": [
      3,
      5
    ],
    "repGain": 18,
    "color": "#6aa6a0",
    "desc": "科技处给高风险小项目的试错钱。金额不大，但可以让你把“也许”做出来。"
  },
  {
    "id": "transfer",
    "name": "科技处 · 成果转化专项",
    "short": "成果转化",
    "amount": 250000,
    "minWeek": 30,
    "cycle": 36,
    "window": 8,
    "maxTimes": 2,
    "req": {
      "papers": 2,
      "top": 0,
      "rep": 80
    },
    "base": 0.42,
    "review": [
      5,
      7
    ],
    "repGain": 34,
    "color": "#c08a52",
    "desc": "把论文变成样机、专利或产品。评审会问：谁愿意为它付钱？"
  }
];

  const GRANT_CATEGORIES = {
    school: '培育', industry: '横向', rb: '面上', intl: '国际', young: '人才',
    key: '重大', explore: '探索', transfer: '转化'
  };

  const MARKET_ITEMS = [
  {
    "id": "old_lens",
    "name": "旧镜头",
    "price": 12000,
    "category": "research",
    "icon": "microscope",
    "desc": "从旧货摊淘来的显微镜头。镀膜有划痕，但成像意外地干净。",
    "effect": {
      "insight": 8,
      "quality": 4,
      "novelty": 2
    }
  },
  {
    "id": "rare_reagent",
    "name": "稀有试剂",
    "price": 9000,
    "category": "research",
    "icon": "flask",
    "desc": "一小瓶没有标签的试剂。卖家说“上一任主人是做界面的”。",
    "effect": {
      "data": 12,
      "quality": 3
    }
  },
  {
    "id": "coffee_beans",
    "name": "精品咖啡豆",
    "price": 2200,
    "category": "relationship",
    "icon": "coffee",
    "desc": "不是设备，但可能是本周最受实验室欢迎的采购。",
    "effect": {
      "morale": 8,
      "stress": -4
    }
  },
  {
    "id": "gift_ribbon",
    "name": "一条好看的丝带",
    "price": 1800,
    "category": "relationship",
    "icon": "heart",
    "desc": "可以系在样品瓶上，也可以送给某个人。",
    "effect": {
      "affinity": 8,
      "morale": 5
    }
  },
  {
    "id": "old_map",
    "name": "有名湖旧地图",
    "price": 3000,
    "category": "career",
    "icon": "paper",
    "desc": "手绘的湖岸线，背面写着一行字：“鱼会记得来过的人。”",
    "effect": {
      "clues": 1,
      "rep": 3
    }
  },
  {
    "id": "fishing_rod",
    "name": "轻量碳素鱼竿",
    "price": 18000,
    "category": "fishing",
    "icon": "arrow",
    "desc": "湖边小店里最贵的一根。甩得远，也更不容易断线。",
    "effect": {
      "rod": 1
    }
  },
  {
    "id": "bait_pack",
    "name": "秘制饵料",
    "price": 1500,
    "category": "fishing",
    "icon": "leaf",
    "desc": "闻起来像整个湖底的秘密。下一次抛竿更容易遇到稀有种。",
    "effect": {
      "bait": 5
    }
  },
  {
    "id": "conference_ticket",
    "name": "交叉学科会议门票",
    "price": 8000,
    "category": "career",
    "icon": "book",
    "desc": "一场没有线上直播的会议。真正重要的是走廊里的偶遇。",
    "effect": {
      "rep": 10,
      "clues": 1
    }
  },
  {
    "id": "repair_kit",
    "name": "精密仪器保养套装",
    "price": 5000,
    "category": "research",
    "icon": "wrench",
    "desc": "不是维修，是一次认真保养。所有设备状态 +15。",
    "effect": {
      "condition": 15
    }
  },
  {
    "id": "lucky_charm",
    "name": "湖神小挂件",
    "price": 2600,
    "category": "career",
    "icon": "star",
    "desc": "便宜、俗气、莫名其妙地让人安心。全室士气 +5，压力 -6。",
    "effect": {
      "morale": 5,
      "stress": -6
    }
  }
];

  const FISH = [
  {
    "id": "crucian",
    "name": "鲫鱼",
    "rarity": "common",
    "value": 120,
    "minLevel": 1,
    "weight": 34,
    "color": "#9fb7a7",
    "desc": "湖里最常见的居民。耐心足够，总能遇见。"
  },
  {
    "id": "carp",
    "name": "鲤鱼",
    "rarity": "common",
    "value": 180,
    "minLevel": 1,
    "weight": 26,
    "color": "#c9a34e",
    "desc": "金色的鳞片在傍晚会亮一下。"
  },
  {
    "id": "grasscarp",
    "name": "草鱼",
    "rarity": "common",
    "value": 220,
    "minLevel": 1,
    "weight": 18,
    "color": "#7f9b71",
    "desc": "力气很大，适合练习收线。"
  },
  {
    "id": "perch",
    "name": "鲈鱼",
    "rarity": "uncommon",
    "value": 380,
    "minLevel": 2,
    "weight": 12,
    "color": "#8da6b8",
    "desc": "喜欢躲在桥墩的阴影里。"
  },
  {
    "id": "snakehead",
    "name": "黑鱼",
    "rarity": "uncommon",
    "value": 520,
    "minLevel": 2,
    "weight": 7,
    "color": "#4f5b58",
    "desc": "湖边的老钓客说，它记得每一根断过的线。"
  },
  {
    "id": "koi",
    "name": "锦鲤",
    "rarity": "rare",
    "value": 1200,
    "minLevel": 3,
    "weight": 2.4,
    "color": "#e08a5b",
    "desc": "没有人知道它为什么在这里。看到它的人会安静一会儿。"
  },
  {
    "id": "silverscale",
    "name": "银鳞鱼",
    "rarity": "rare",
    "value": 900,
    "minLevel": 3,
    "weight": 3,
    "color": "#c9d8de",
    "desc": "鳞片像碎掉的月光。"
  },
  {
    "id": "sturgeon",
    "name": "湖鲟",
    "rarity": "epic",
    "value": 2600,
    "minLevel": 4,
    "weight": 0.8,
    "color": "#6a7f8c",
    "desc": "活了很久的鱼。钓上来之后，最好放回去。"
  },
  {
    "id": "golden_eel",
    "name": "金鳗",
    "rarity": "epic",
    "value": 3200,
    "minLevel": 4,
    "weight": 0.5,
    "color": "#d4b04e",
    "desc": "只在雨后的夜里出现。"
  },
  {
    "id": "lake_ghost",
    "name": "湖影",
    "rarity": "legendary",
    "value": 8000,
    "minLevel": 5,
    "weight": 0.12,
    "color": "#7d6bb0",
    "desc": "图鉴最后一页。没有人能证明它真的存在。"
  }
];

  const FISH_RARITY = {
    common: { name: '常见', color: '#7a9e7e' },
    uncommon: { name: '少见', color: '#5b8fb9' },
    rare: { name: '稀有', color: '#c0913f' },
    epic: { name: '史诗', color: '#b06a8a' },
    legendary: { name: '传说', color: '#7d6bb0' }
  };

  const LOCATIONS = [
    { id: 'tech', name: '科技处', code: 'RESEARCH OFFICE', icon: 'paper', color: '#5b8fb9', desc: '提交项目书、查看在研项目、打听下一轮指南。窗口后面的人永远在盖章。' },
    { id: 'market', name: '校外市场', code: 'OFF-CAMPUS MARKET', icon: 'briefcase', color: '#d4b04e', desc: '旧货、试剂、礼物和来路不明的地图。科研、感情和事业都可能在这里拐弯。' },
    { id: 'delivery', name: '外卖站', code: 'DELIVERY HUB', icon: 'arrow', color: '#e08a5b', desc: '换上工服，跑几单。没人会问你为什么一个 PI 在送外卖。' },
    { id: 'lake', name: '有名湖', code: 'FAMOUS LAKE', icon: 'leaf', color: '#57b8a6', desc: '城市边缘的一片水。钓鱼、卖鱼、把图鉴一页页填满。' }
  ];

  const LAB_CITIES = ['剑桥', '波士顿', '东京', '苏黎世', '新加坡', '首尔', '慕尼黑', '多伦多', '鹿特丹', '特拉维夫', '北京', '上海', '深圳', '杭州', '南京', '成都', '武汉', '香港', '悉尼', 'RB 城'];
  const LAB_PREFIXES = ['冷泉', '微系统', '城市生态', '界面', '仿生', '量子生命', '计算材料', '纳米医学', '交叉系统', '微生物组', '软物质', '智能感知', '极端条件', '可持续', '单细胞', '神经形态', '未来材料', '湖泊生态'];
  const LAB_SUFFIXES = ['实验室', '研究中心', '联合实验室', '研究所', '交叉科学中心', '青年实验室'];
  const LAB_COLORS = ['#8fb6c9', '#b06a8a', '#6f8fd6', '#57b8a6', '#7aa66a', '#c88ac8', '#e08a5b', '#d4b04e', '#2f7f78', '#a78b6a'];

  const STARTUP_GRANT = {
    id: 'startup', name: 'RB 青年学者启动基金', short: '青年启动',
    amount: 200000, startWeek: 1, endWeek: 96, color: '#57b8a6',
    desc: '你唯一确定拥有的东西。三年 20 万，含设备、试剂与学生的第一杯咖啡。'
  };

  const PORTRAIT_STYLES = ['short', 'bob', 'bun', 'curly', 'long', 'fringe', 'undercut', 'braid'];

  const LOOK_OPTIONS = {
    styles: ['short', 'bob', 'bun', 'curly', 'long', 'fringe', 'undercut', 'braid'],
    hairColors: ['#241f25', '#4a3330', '#6a4a35', '#8a5a3a', '#b07a45', '#d6b06a', '#8c86a8', '#4e5b6a'],
    skins: ['#f6d1ad', '#e8b98c', '#d9a878', '#b9825d', '#8d5f47'],
    coats: ['#f8f2e2', '#e9eef0', '#dfe9dc', '#efe2d0', '#e6e0f0'],
    accents: ['#57b8a6', '#6f8fd6', '#e76f51', '#d4b04e', '#b06a8a', '#7aa66a']
  };

  const STUDENTS = [
  {
    "defId": "chenxiaoman",
    "name": "陈小满",
    "role": "硕士生",
    "field": "生物",
    "skill": 38,
    "talent": 62,
    "diligence": 82,
    "creativity": 45,
    "resilience": 70,
    "teamwork": 78,
    "communication": 58,
    "salary": 4200,
    "potential": 82,
    "color": "#57b8a6",
    "quote": "老师，我把上周的样本又跑了一遍，结果还是不一样。",
    "bio": "本科做过三年土壤微生物。话不多，记录本永远写得比别人的清楚。",
    "portrait": {
      "skin": "#f0c49a",
      "hair": "#2b2430",
      "style": "bob",
      "coat": "#f7f3e8",
      "accent": "#57b8a6",
      "glasses": false
    }
  },
  {
    "defId": "ayinur",
    "name": "阿依努尔",
    "role": "硕士生",
    "field": "计算",
    "skill": 35,
    "talent": 74,
    "diligence": 58,
    "creativity": 88,
    "resilience": 55,
    "teamwork": 62,
    "communication": 66,
    "salary": 4200,
    "potential": 90,
    "color": "#6f8fd6",
    "quote": "我写了个小工具，把你们手工标注的三个星期变成了四分钟。",
    "bio": "计算机背景，半路被城市生态的数据吸引。点子很多，作息很飘。",
    "portrait": {
      "skin": "#d9a878",
      "hair": "#2a1e1a",
      "style": "long",
      "coat": "#f7f3e8",
      "accent": "#6f8fd6",
      "glasses": true
    }
  },
  {
    "defId": "zhaoyiming",
    "name": "黄宏乾",
    "role": "博士生",
    "field": "材料",
    "skill": 58,
    "talent": 88,
    "diligence": 64,
    "creativity": 72,
    "resilience": 42,
    "teamwork": 50,
    "communication": 54,
    "salary": 6800,
    "potential": 95,
    "color": "#e08a5b",
    "quote": "你考不考虑换个电脑？",
    "bio": "直博生，深度学习大师，电子产品爱好者，不需要休息的人。",
    "portrait": {
      "skin": "#e8b98c",
      "hair": "#1f1b22",
      "style": "undercut",
      "coat": "#f7f3e8",
      "accent": "#e08a5b",
      "glasses": false
    }
  },
  {
    "defId": "linmeng",
    "name": "沈佳伟",
    "role": "硕士生",
    "field": "工程",
    "skill": 32,
    "talent": 55,
    "diligence": 66,
    "creativity": 80,
    "resilience": 72,
    "teamwork": 84,
    "communication": 88,
    "salary": 4200,
    "potential": 80,
    "color": "#d4b04e",
    "quote": "这周又什么都没做啊！",
    "bio": "考研调剂生，四角洲玩家，被PUA后可读研。",
    "portrait": {
      "skin": "#f2c9a0",
      "hair": "#5a3a2a",
      "style": "fringe",
      "coat": "#f7f3e8",
      "accent": "#d4b04e",
      "glasses": false
    }
  },
  {
    "defId": "zhouye",
    "name": "时俊杰",
    "role": "博士生",
    "field": "材料物理",
    "skill": 54,
    "talent": 76,
    "diligence": 78,
    "creativity": 63,
    "resilience": 60,
    "teamwork": 48,
    "communication": 45,
    "salary": 6500,
    "potential": 90,
    "color": "#c88ac8",
    "quote": "一定要把实验室的安全放在首位。",
    "bio": "水系电池出身，实验室安全员。喜欢开会，会把所有废液桶都贴好标签。",
    "portrait": {
      "skin": "#e3b48a",
      "hair": "#241f25",
      "style": "curly",
      "coat": "#f7f3e8",
      "accent": "#c88ac8",
      "glasses": true
    }
  },
  {
    "defId": "xucheng",
    "name": "许澄",
    "role": "博后",
    "field": "生物",
    "skill": 72,
    "talent": 80,
    "diligence": 68,
    "creativity": 74,
    "resilience": 78,
    "teamwork": 66,
    "communication": 62,
    "salary": 11500,
    "potential": 96,
    "color": "#57b8a6",
    "quote": "我不需要你告诉我做什么，我需要你告诉我为什么值得做。",
    "bio": "做过两站博士后，发表记录干净。她来面试时先问了实验室的动物伦理审批。",
    "portrait": {
      "skin": "#f2c9a0",
      "hair": "#2a2022",
      "style": "bun",
      "coat": "#f7f3e8",
      "accent": "#57b8a6",
      "glasses": false
    }
  },
  {
    "defId": "hejiashu",
    "name": "何嘉树",
    "role": "硕士生",
    "field": "环境",
    "skill": 40,
    "talent": 60,
    "diligence": 72,
    "creativity": 58,
    "resilience": 68,
    "teamwork": 72,
    "communication": 74,
    "salary": 4400,
    "potential": 84,
    "color": "#7aa66a",
    "quote": "采样点我都踩过了，地铁二号线早高峰的菌群真的不一样。",
    "bio": "环境工程背景，能扛着采样箱走一整天。擅长和社区、学校打交道。",
    "portrait": {
      "skin": "#c98f62",
      "hair": "#1e1a1a",
      "style": "short",
      "coat": "#f7f3e8",
      "accent": "#7aa66a",
      "glasses": false
    }
  },
  {
    "defId": "tangtang",
    "name": "唐糖",
    "role": "博士生",
    "field": "计算",
    "skill": 61,
    "talent": 82,
    "diligence": 57,
    "creativity": 90,
    "resilience": 64,
    "teamwork": 76,
    "communication": 70,
    "salary": 6800,
    "potential": 94,
    "color": "#6f8fd6",
    "quote": "你的数据里有一个特别漂亮的假阳性，我帮它找到了家。",
    "bio": "统计与机器学习双背景。喜欢把审稿人没问的问题也提前回答掉。",
    "portrait": {
      "skin": "#f0c49a",
      "hair": "#3a2a2a",
      "style": "braid",
      "coat": "#f7f3e8",
      "accent": "#6f8fd6",
      "glasses": true
    }
  },
  {
    "defId": "luopan",
    "name": "洪扬",
    "role": "博士生",
    "field": "材料",
    "skill": 57,
    "talent": 71,
    "diligence": 64,
    "creativity": 70,
    "resilience": 74,
    "teamwork": 80,
    "communication": 56,
    "salary": 6600,
    "potential": 89,
    "color": "#e08a5b",
    "quote": "怎么还不开组会。",
    "bio": "材料科学出身，实验室的万能牛马，非常非常非常非常非常非常非常非常非常非常非常非常非常爱开组会。",
    "portrait": {
      "skin": "#e8b98c",
      "hair": "#2b2b2b",
      "style": "short",
      "coat": "#f7f3e8",
      "accent": "#e08a5b",
      "glasses": false
    }
  },
  {
    "defId": "suqing",
    "name": "苏晴",
    "role": "博后",
    "field": "生物",
    "skill": 76,
    "talent": 85,
    "diligence": 82,
    "creativity": 66,
    "resilience": 58,
    "teamwork": 80,
    "communication": 84,
    "salary": 12000,
    "potential": 97,
    "color": "#b06a8a",
    "quote": "我想做真正能进医院的东西，不是只停在补充材料里。",
    "bio": "神经科学博士，做过三年脑机接口。演讲极好，但容易把日程排到没有缝隙。",
    "portrait": {
      "skin": "#f2c9a0",
      "hair": "#241c24",
      "style": "long",
      "coat": "#f7f3e8",
      "accent": "#b06a8a",
      "glasses": false
    }
  },
  {
    "defId": "gaoyuan",
    "name": "高远",
    "role": "技术员",
    "field": "工程",
    "skill": 64,
    "talent": 70,
    "diligence": 80,
    "creativity": 55,
    "resilience": 82,
    "teamwork": 82,
    "communication": 48,
    "salary": 7800,
    "potential": 88,
    "color": "#d4b04e",
    "quote": "图纸给我，明天下午来拿。",
    "bio": "机械加工与设备维护出身。不太写论文，但没有他，实验室会在一周内停摆。",
    "portrait": {
      "skin": "#d9a878",
      "hair": "#1f1b22",
      "style": "undercut",
      "coat": "#8fa7c4",
      "accent": "#d4b04e",
      "glasses": false
    }
  },
  {
    "defId": "wenning",
    "name": "温宁",
    "role": "硕士生",
    "field": "材料",
    "skill": 36,
    "talent": 66,
    "diligence": 60,
    "creativity": 75,
    "resilience": 70,
    "teamwork": 70,
    "communication": 64,
    "salary": 4300,
    "potential": 86,
    "color": "#e08a5b",
    "quote": "我做过一点电化学，也做过一点陶艺。它们可能是一回事。",
    "bio": "材料本科，辅修过 ceramics。动手能力强，喜欢把失败样品做成小摆件。",
    "portrait": {
      "skin": "#f0c49a",
      "hair": "#4a2e2a",
      "style": "bun",
      "coat": "#f7f3e8",
      "accent": "#e08a5b",
      "glasses": false
    }
  },
  {
    "defId": "jiangyu",
    "name": "江屿",
    "role": "博士生",
    "field": "环境",
    "skill": 52,
    "talent": 68,
    "diligence": 75,
    "creativity": 62,
    "resilience": 73,
    "teamwork": 70,
    "communication": 80,
    "salary": 6400,
    "potential": 88,
    "color": "#7aa66a",
    "quote": "如果研究不能和真实的人发生关系，我为什么要做它？",
    "bio": "环境健康方向，做过社区暴露评估。写得的本子比很多老师都好。",
    "portrait": {
      "skin": "#c98f62",
      "hair": "#2a2022",
      "style": "fringe",
      "coat": "#f7f3e8",
      "accent": "#7aa66a",
      "glasses": true
    }
  },
  {
    "defId": "bailu",
    "name": "白露",
    "role": "硕士生",
    "field": "化学",
    "skill": 34,
    "talent": 72,
    "diligence": 55,
    "creativity": 82,
    "resilience": 64,
    "teamwork": 76,
    "communication": 78,
    "salary": 4300,
    "potential": 87,
    "color": "#c88ac8",
    "quote": "我做了一个会变色的凝胶，暂时还没想好它有什么用。",
    "bio": "化学背景，喜欢软物质和奇怪的现象。实验记录里夹着很多手绘。",
    "portrait": {
      "skin": "#f2c9a0",
      "hair": "#6a4a3a",
      "style": "short",
      "coat": "#f7f3e8",
      "accent": "#c88ac8",
      "glasses": false
    }
  }
];

  const SPEAKERS = {
    player: { name: '林知远', title: '实验室主任 / PI', portrait: { skin: '#e8b98c', hair: '#241f25', style: 'short', coat: '#f7f3e8', accent: '#57b8a6', glasses: true } },
    zhou: { name: '马亚楠', title: 'RB 实验中心主任', portrait: { skin: '#d9a878', hair: '#4a3a3a', style: 'bun', coat: '#8fa7c4', accent: '#d4b04e', glasses: false } },
    gu: { name: '岳阳', title: '北岭大学 / 旧同事', portrait: { skin: '#e3b48a', hair: '#1f1b22', style: 'undercut', coat: '#2f2a3a', accent: '#b06a8a', glasses: true } },
    reviewer: { name: '审稿人 2 号', title: '匿名', portrait: { skin: '#cfd6d8', hair: '#4a4a4a', style: 'short', coat: '#d8d8d8', accent: '#8b8173', glasses: true, mask: true } },
    editor: { name: '期刊编辑', title: '《交叉科学前沿》', portrait: { skin: '#f0c49a', hair: '#2a2022', style: 'bob', coat: '#c0913f', accent: '#f7f3e8', glasses: true } },
    reporter: { name: '陆小满', title: '《RB 晚报》记者', portrait: { skin: '#f2c9a0', hair: '#3a2a2a', style: 'fringe', coat: '#d57b4d', accent: '#f7f3e8', glasses: false } },
    officer: { name: '科研处老师', title: 'RB 实验中心', portrait: { skin: '#e3b48a', hair: '#6a6a6a', style: 'short', coat: '#7a9e7e', accent: '#f7f3e8', glasses: true } }
  };

  const OBJECTIVES = [
    { id: 'hire1', title: '不是一个人', desc: '招募第一名实验室成员。', reward: { funds: 5000 }, check: s => s.students.length >= 1 },
    { id: 'exp1', title: '第一管数据', desc: '完成 3 次实验。', reward: { funds: 3000 }, check: s => s.stats.experiments >= 3 },
    { id: 'paper1', title: '把故事写出来', desc: '发表第一篇论文。', reward: { rep: 20, funds: 5000 }, check: s => s.stats.papers >= 1 },
    { id: 'grant1', title: '续命成功', desc: '获得第一笔竞争性经费。', reward: { rep: 15 }, check: s => s.stats.grants >= 1 },
    { id: 'team3', title: '小团队', desc: '同时拥有 3 名成员。', reward: { funds: 8000 }, check: s => s.students.filter(x => x.status !== 'left').length >= 3 },
    { id: 'lab2', title: '像样的实验室', desc: '将实验室升到 2 级。', reward: { rep: 25 }, check: s => s.labLevel >= 2 },
    { id: 'paper5', title: '稳定输出', desc: '发表 5 篇论文。', reward: { funds: 20000, rep: 30 }, check: s => s.stats.papers >= 5 },
    { id: 'top1', title: '摸到天花板', desc: '在《自然·综合》或《科学·前沿》发表论文。', reward: { funds: 30000, rep: 50 }, check: s => s.stats.topPapers >= 1 },
    { id: 'rep300', title: '被看见', desc: '学术声望达到 300。', reward: { funds: 15000 }, check: s => s.rep >= 300 },
    { id: 'rank100', title: '进入世界前 100', desc: '实验室世界排名进入前 100。', reward: { funds: 40000, rep: 50 }, check: s => U.rankInfo(simScore(s)) <= 100 }
  ];

  // simScore is injected by sim.js at runtime; objective checks run after boot.
  let simScore = function () { return 0; };

  const RANK_THRESHOLDS = [
    { rank: 1, score: 5200 }, { rank: 3, score: 4200 }, { rank: 6, score: 3500 },
    { rank: 10, score: 2900 }, { rank: 18, score: 2350 }, { rank: 30, score: 1850 },
    { rank: 45, score: 1450 }, { rank: 70, score: 1100 }, { rank: 100, score: 850 },
    { rank: 160, score: 620 }, { rank: 250, score: 430 }, { rank: 400, score: 280 },
    { rank: 600, score: 160 }, { rank: 800, score: 90 }, { rank: 999, score: 0 }
  ];

  const LEADERBOARD = [
    { name: '冷泉交叉科学中心', city: '剑桥', score: 4680, color: '#8fb6c9' },
    { name: '跨学科系统实验室', city: '波士顿', score: 4210, color: '#b06a8a' },
    { name: '量子生命研究所', city: '东京', score: 3820, color: '#6f8fd6' },
    { name: '微系统与仿生中心', city: '苏黎世', score: 3410, color: '#57b8a6' },
    { name: '城市生态与健康实验室', city: '新加坡', score: 2960, color: '#7aa66a' },
    { name: '软物质界面中心', city: '首尔', score: 2580, color: '#c88ac8' },
    { name: '仿生材料研究所', city: '慕尼黑', score: 2210, color: '#e08a5b' },
    { name: '计算材料联合实验室', city: '多伦多', score: 1880, color: '#6f8fd6' },
    { name: '微生物组与城市健康中心', city: '鹿特丹', score: 1560, color: '#57b8a6' },
    { name: '纳米医学前沿实验室', city: '特拉维夫', score: 1280, color: '#d4b04e' }
  ];

  const TIPS = [
    '基金不是工资，是燃料。烧完之前，要找到下一桶。',
    '审稿人 2 号也是人。虽然他的意见看起来不像。',
    '先毕业，再改变世界。',
    '一台好设备能省三个月，也能让你多修三个月。',
    '学生不是生产力单位。至少不应该是。',
    '“初步结果很有希望”是学术圈最贵的六个字。',
    '每周留一点时间给没有写进本子的东西。',
    '你以为你在管理实验室，其实是实验室在管理你。',
    '一篇论文的命运，三分之一在数据，三分之一在写作，三分之一在编辑那天的心情。',
    '真正稀缺的不是经费，是还能一起熬夜的人。'
  ];

  /* ---------- Events ---------- */
  function firstPaper(s, status) {
    return s.papers.find(p => p.status === status);
  }

  function studentByStress(s) {
    return s.students.filter(x => x.status === 'active').sort((a, b) => b.stress - a.stress)[0];
  }

  const EVENTS = [
    {
      id: 'reviewer_two', title: '审稿人 2 号', speaker: 'reviewer', weight: 11, once: false,
      condition: s => s.papers.some(p => p.status === 'review'),
      text: '“该工作缺乏根本性创新。建议作者补充引用本人 1998 年发表的 37 篇论文，并解释为什么没有引用。”',
      choices: [
        {
          label: '逐条回复，附上补充实验', hint: '消耗 1 行动力 · 提升论文质量',
          condition: s => s.ap >= 1,
          run: s => {
            s.ap -= 1;
            const p = firstPaper(s, 'review');
            if (p) { p.quality = Math.min(100, p.quality + 3); p.reviewBoost = (p.reviewBoost || 0) + 0.08; }
            U.piStress(s, 4);
            return ['你写了六页 response，礼貌、具体、刀刀见血。', '论文质量 +3，接收概率提升。你今晚睡得还行。'];
          }
        },
        {
          label: '补一个关键实验', hint: '花费 ¥8,000 · 论文质量 +5',
          condition: s => s.funds >= 8000,
          run: s => {
            U.funds(s, -8000);
            const p = firstPaper(s, 'review');
            if (p) { p.quality = Math.min(100, p.quality + 5); p.reviewBoost = (p.reviewBoost || 0) + 0.12; }
            U.stressAll(s, 3);
            return ['学生连夜补了一个剂量梯度。图 3 终于不再像拼贴画。', '论文质量 +5，接收概率明显提升。'];
          }
        },
        {
          label: '在社交媒体上阴阳怪气', hint: '很爽 · 但学术圈很小',
          condition: () => true,
          run: s => {
            s.rep = Math.max(0, s.rep - 6);
            s.integrity = Math.max(0, s.integrity - 2);
            U.piStress(s, 3);
            return ['你发了一条没有指名道姓的帖子，收获了 2,000 个赞和 3 个同行的默默拉黑。', '声望 -6，学术诚信 -2。'];
          }
        }
      ]
    },
    {
      id: 'student_crisis', title: '凌晨两点的消息', speaker: 'student', weight: 9, once: false,
      condition: s => !!studentByStress(s) && studentByStress(s).stress >= 68,
      text: s => {
        const st = studentByStress(s);
        return `${st.name} 给你发来一条很长的消息，最后一句是：“老师，我是不是不适合做科研？”`;
      },
      choices: [
        {
          label: '约她/他明天吃早饭，先不听实验汇报', hint: '消耗 1 行动力 · 压力下降',
          condition: s => s.ap >= 1,
          run: s => {
            const st = studentByStress(s);
            s.ap -= 1;
            if (st) { st.stress = U.clamp(st.stress - 22, 0, 100); st.morale = U.clamp(st.morale + 14, 0, 100); }
            U.piStress(s, -4);
            return ['你们在楼下吃了豆浆油条，聊了她的本科、家里和一只叫“数据”的猫。', '她的压力 -22，士气 +14。实验可以晚一天。'];
          }
        },
        {
          label: '发一笔临时补贴，让她/他休息一周', hint: '花费 ¥6,000 · 全室士气 +4',
          condition: s => s.funds >= 6000,
          run: s => {
            const st = studentByStress(s);
            U.funds(s, -6000);
            if (st) { st.stress = U.clamp(st.stress - 18, 0, 100); st.morale = U.clamp(st.morale + 10, 0, 100); st.restWeeks = 1; }
            U.moraleAll(s, 4);
            return ['你批了一周假，没有问进度。', '全室士气 +4。第二天，有人在冰箱上贴了一张谢谢的便签。'];
          }
        },
        {
          label: '“再坚持一下，这个数据很重要”', hint: '进度优先 · 风险',
          condition: () => true,
          run: s => {
            const st = studentByStress(s);
            if (st) { st.stress = U.clamp(st.stress + 10, 0, 100); st.morale = U.clamp(st.morale - 12, 0, 100); }
            U.moraleAll(s, -3);
            return ['她回了一个“好的”。', '实验继续了，但有些东西开始变得安静。全室士气 -3。'];
          }
        }
      ]
    },
    {
      id: 'equipment_break', title: '它又坏了', speaker: 'player', weight: 8, once: false,
      condition: s => s.equipment.some(e => e.condition < 32),
      text: '离心机发出一种不属于任何说明书的响声，然后停了。屏幕上显示：E-07。手册里没有 E-07。',
      choices: [
        {
          label: '叫原厂维修', hint: '花费 ¥12,000 · 彻底修好',
          condition: s => s.funds >= 12000,
          run: s => {
            const eq = s.equipment.find(e => e.condition < 32) || s.equipment[0];
            U.funds(s, -12000);
            if (eq) eq.condition = 100;
            return ['工程师换了主板，顺手清理了十年没清过的滤网。', '设备恢复 100%。账单很痛，但数据更贵。'];
          }
        },
        {
          label: '让罗盘/高远试试', hint: '免费 · 有风险',
          condition: s => s.students.some(x => ['罗盘', '高远'].includes(x.name) && x.status === 'active'),
          run: s => {
            const eq = s.equipment.find(e => e.condition < 32) || s.equipment[0];
            if (eq) eq.condition = U.chance(0.65) ? 78 : 12;
            if (eq && eq.condition === 12) U.stressAll(s, 5);
            return eq && eq.condition > 50
              ? ['他拆开外壳，吹了吹灰，拧紧一颗松掉的螺丝。机器重新转了起来。', '设备恢复到 78%。省下了一笔维修费。']
              : ['他沉默了很久，说：“得等一个配件。”', '设备仍处于故障状态，全室压力 +5。'];
          }
        },
        {
          label: '先停用，改用隔壁的', hint: '不花钱 · 本周产出下降',
          condition: () => true,
          run: s => {
            s.flags.borrowedEquipment = 2;
            U.moraleAll(s, -2);
            return ['你提着样本去了隔壁，欠了人情，也欠了一顿火锅。', '未来两周设备加成降低，全室士气 -2。'];
          }
        }
      ]
    },
    {
      id: 'collab_invite', title: '一封跨洋邮件', speaker: 'editor', weight: 7, once: false,
      condition: s => s.rep >= 80,
      text: '一位在波士顿做城市微生物组的教授愿意共享一批未发表的样本，条件是共同署名，并派一名学生去交流三个月。',
      choices: [
        {
          label: '接受合作，派最合适的学生', hint: '花费 ¥20,000 · 项目大推进',
          condition: s => s.funds >= 20000 && s.students.some(x => x.status === 'active'),
          run: s => {
            U.funds(s, -20000);
            const p = s.projects.find(x => x.status === 'active');
            if (p) { p.data = Math.min(100, p.data + 18); p.quality = Math.min(100, p.quality + 3); p.novelty = Math.min(100, p.novelty + 4); }
            const st = s.students.filter(x => x.status === 'active').sort((a, b) => b.communication - a.communication)[0];
            if (st) { st.skill = Math.min(st.potential, st.skill + 4); st.morale += 8; st.travelled = true; }
            s.rep += 10;
            return ['学生带着一个空箱子和两盒试剂飞走了。', '项目数据 +18，质量 +3，声望 +10。三个月后，她会带回更多。'];
          }
        },
        {
          label: '只共享数据，不派人', hint: '稳妥 · 小幅收益',
          condition: () => true,
          run: s => {
            const p = s.projects.find(x => x.status === 'active');
            if (p) { p.data = Math.min(100, p.data + 8); p.novelty += 2; }
            return ['你们签了一份数据共享协议。没有飞机，也没有时差会议。', '项目数据 +8，新颖度 +2。'];
          }
        },
        {
          label: '婉拒，先把自己的事做完', hint: '专注 · 士气 +3',
          condition: () => true,
          run: s => {
            U.moraleAll(s, 3);
            return ['你回了一封很得体的邮件。实验室这周准时下班。', '全室士气 +3。'];
          }
        }
      ]
    },
    {
      id: 'conference', title: '会议邀请', speaker: 'officer', weight: 6, once: false,
      condition: s => s.week >= 20,
      text: '交叉科学年会邀请你做一场 15 分钟的报告。差旅自理，但台下坐着几个你一直想认识的人。',
      choices: [
        {
          label: '带两名学生一起去', hint: '花费 ¥18,000 · 声望与技能',
          condition: s => s.funds >= 18000,
          run: s => {
            U.funds(s, -18000);
            s.rep += 18;
            s.ap = Math.min(s.maxAp, s.ap + 1);
            s.students.filter(x => x.status === 'active').slice(0, 2).forEach(st => {
              st.skill = Math.min(st.potential, st.skill + 3);
              st.morale += 5;
            });
            return ['你讲了 12 分钟，留了 3 分钟回答问题。台下有人记了满满一页。', '声望 +18，两名学生技能 +3、士气 +5。'];
          }
        },
        {
          label: '只自己去，快去快回', hint: '花费 ¥8,000 · 声望 +8',
          condition: s => s.funds >= 8000,
          run: s => {
            U.funds(s, -8000);
            s.rep += 8;
            return ['你在会场吃了三块小蛋糕，换了六张名片。', '声望 +8。'];
          }
        },
        {
          label: '不去，把时间留给实验室', hint: '本周行动力 +1',
          condition: () => true,
          run: s => {
            s.ap = Math.min(s.maxAp + 1, s.ap + 2);
            U.moraleAll(s, 2);
            return ['你把邀请函归档，转身去看了学生的 Western blot。', '行动力 +2，全室士气 +2。'];
          }
        }
      ]
    },
    {
      id: 'media', title: '记者来了', speaker: 'reporter', weight: 6, once: false,
      condition: s => s.stats.papers >= 1,
      text: '《RB 晚报》想做一期“城市里的年轻科学家”。记者问：能不能拍一张你拿着移液枪、皱眉看镜头的照片？',
      choices: [
        {
          label: '配合采访，顺便讲讲科学', hint: '声望 +12 · 全室士气 +2',
          condition: () => true,
          run: s => {
            s.rep += 12;
            U.moraleAll(s, 2);
            return ['报道标题是《他们在实验室里，寻找城市的呼吸》。', '你的学生把链接转发了十七个群。声望 +12。'];
          }
        },
        {
          label: '让学生上镜', hint: '学生士气 +8 · 声望 +6',
          condition: s => s.students.some(x => x.status === 'active'),
          run: s => {
            const st = s.students.filter(x => x.status === 'active').sort((a, b) => b.communication - a.communication)[0];
            if (st) { st.morale += 8; st.skill = Math.min(st.potential, st.skill + 1); }
            s.rep += 6;
            return [`${st ? st.name : '学生'}对着镜头讲了五分钟，比你有感染力。`, '声望 +6，学生士气 +8。'];
          }
        },
        {
          label: '拒绝，不想被写成“天才少年”', hint: '专注 · 压力 -5',
          condition: () => true,
          run: s => {
            U.piStress(s, -5);
            return ['你礼貌地拒绝了。那天下午，实验室难得的安静。', '压力 -5。'];
          }
        }
      ]
    },
    {
      id: 'rival_scoop', title: '被抢发了', speaker: 'gu', weight: 7, once: false,
      condition: s => s.week >= 40 && s.projects.some(p => p.status === 'active' && p.papers === 0),
      text: '顾维在群里转了一篇预印本，研究问题和你正在做的几乎一样，方法更漂亮，样本量是你的四倍。他配文：“恭喜团队，终于把这条路走通了。”',
      choices: [
        {
          label: '承认撞车，转向新的切入点', hint: '新颖度 -8 · 质量 +6',
          condition: () => true,
          run: s => {
            const p = s.projects.find(x => x.status === 'active' && x.papers === 0) || s.projects.find(x => x.status === 'active');
            if (p) { p.novelty = Math.max(20, p.novelty - 8); p.quality += 6; p.data = Math.min(100, p.data + 10); }
            return ['你花了一整晚读那篇预印本，第二天在白板上画了一条新的分岔路。', '新颖度 -8，但质量 +6，数据 +10。故事还能讲，只是要换个讲法。'];
          }
        },
        {
          label: '加快节奏，抢在他们正式发表前投出去', hint: '全室压力 +10 · 项目进度 +12',
          condition: () => true,
          run: s => {
            const p = s.projects.find(x => x.status === 'active');
            if (p) { p.data = Math.min(100, p.data + 12); p.quality -= 2; }
            U.stressAll(s, 10);
            U.piStress(s, 8);
            return ['你把组会改成了每日站会，咖啡机连续工作了 14 个小时。', '项目数据 +12，质量 -2，全室压力 +10。'];
          }
        },
        {
          label: '给顾维发消息，问他愿不愿意合作', hint: '意外选项 · 声望 +8',
          condition: () => true,
          run: s => {
            s.rep += 8;
            s.flags.guTruce = true;
            U.piStress(s, -3);
            return ['他隔了三个小时才回：“你倒是没变。”', '你们约了下周通电话。声望 +8。有些竞争不必是战争。'];
          }
        }
      ]
    },
    {
      id: 'power_outage', title: '跳闸', speaker: 'player', weight: 6, once: false,
      condition: s => s.projects.some(p => p.status === 'active'),
      text: '整层楼突然断电。培养箱的备用电源只撑了四十分钟，而你的细胞已经在里面待了三天。',
      choices: [
        {
          label: '立刻租一台备用电源', hint: '花费 ¥9,000 · 保住样本',
          condition: s => s.funds >= 9000,
          run: s => {
            U.funds(s, -9000);
            return ['你和学生摸黑把培养箱推到了走廊尽头的备用插座旁。', '样本保住了，账单 +¥9,000。'];
          }
        },
        {
          label: '先救数据，样本重做', hint: '数据 +8 · 压力 +8',
          condition: () => true,
          run: s => {
            const p = s.projects.find(x => x.status === 'active');
            if (p) p.data = Math.min(100, p.data + 8);
            U.stressAll(s, 8);
            U.piStress(s, 6);
            return ['你优先保住了服务器。细胞死了一批，但硬盘活着。', '项目数据 +8，全室压力 +8。'];
          }
        }
      ]
    },
    {
      id: 'holiday_dinner', title: '年终聚餐', speaker: 'player', weight: 6, once: false,
      condition: s => s.week >= 40 && s.students.length > 0,
      text: '一年快过去了。有人提议去吃火锅，有人说不如把经费留着买试剂。',
      choices: [
        {
          label: '我请客，火锅', hint: '花费 ¥3,000 · 全室士气 +10',
          condition: s => s.funds >= 3000,
          run: s => {
            U.funds(s, -3000);
            U.moraleAll(s, 10);
            U.stressAll(s, -5);
            return ['你们吃了三盘毛肚，聊了很多和科研无关的事。', '全室士气 +10，压力 -5。'];
          }
        },
        {
          label: '实验室点外卖，继续干活', hint: '经费 +0 · 进度 +6',
          condition: () => true,
          run: s => {
            const p = s.projects.find(x => x.status === 'active');
            if (p) p.data = Math.min(100, p.data + 6);
            U.moraleAll(s, 2);
            return ['披萨盒堆在会议桌上，投影仪还亮着。', '项目数据 +6，士气 +2。'];
          }
        }
      ]
    },
    {
      id: 'ethics_offer', title: '一个太漂亮的结果', speaker: 'student', weight: 5, once: false,
      condition: s => s.week >= 30,
      text: '一个学生兴奋地冲进办公室：“老师，我把那三个异常点删掉，曲线就完美了。真的，只有三个点。”',
      choices: [
        {
          label: '一起检查原始记录，不删点', hint: '诚信 +3 · 进度放缓',
          condition: () => true,
          run: s => {
            s.integrity = Math.min(100, s.integrity + 3);
            U.moraleAll(s, 3);
            const p = s.projects.find(x => x.status === 'active');
            if (p) p.quality += 2;
            return ['你们在原始记录里发现了一个校准错误。修好之后，曲线没有那么完美，但它是真的。', '诚信 +3，论文质量 +2，全室士气 +3。'];
          }
        },
        {
          label: '“先按现在的图投出去，之后再解释”', hint: '危险 · 声望短期提升',
          condition: () => true,
          run: s => {
            s.integrity = Math.max(0, s.integrity - 12);
            s.rep += 10;
            s.flags.riskyPaper = true;
            return ['你把那三个点留在了补充材料里，用一行小字解释。', '声望 +10，诚信 -12。你知道这件事没有结束。'];
          }
        }
      ]
    },
    {
      id: 'teaching_offer', title: '一门课', speaker: 'officer', weight: 6, once: false,
      condition: s => s.week >= 16,
      text: '学院缺一门《交叉科学导论》的主讲。每周四节课，一学期 ¥20,000，还会占用你不少精力。',
      choices: [
        {
          label: '接下这门课', hint: '收入 ¥20,000 · 行动力 -1（本周）',
          condition: s => true,
          run: s => {
            U.funds(s, 20000);
            s.ap = Math.max(0, s.ap - 1);
            s.flags.teaching = true;
            return ['你重新捡起了做课件的本领。学生们很喜欢你讲“科研翻车现场”的那一节。', '收入 +¥20,000，本周行动力 -1。'];
          }
        },
        {
          label: '推荐年轻老师去', hint: '声望 +3 · 人情',
          condition: () => true,
          run: s => {
            s.rep += 3;
            return ['你推荐了隔壁刚入职的老师。她后来请你喝了一杯咖啡。', '声望 +3。'];
          }
        }
      ]
    },
    {
      id: 'patent', title: '要不要申请专利', speaker: 'officer', weight: 6, once: false,
      condition: s => s.stats.papers >= 2,
      text: '技术转移办公室问：你们那套微流控制造方法，要不要申请专利？申请费 ¥15,000，授权大概要一年。',
      choices: [
        {
          label: '申请', hint: '花费 ¥15,000 · 长期收益',
          condition: s => s.funds >= 15000,
          run: s => {
            U.funds(s, -15000);
            s.flags.patentPending = s.week + 48;
            s.rep += 4;
            return ['你填了 27 页表格，在“发明人”一栏写下了三个学生的名字。', '声望 +4。一年后，也许会有惊喜。'];
          }
        },
        {
          label: '先发论文，开放科学', hint: '诚信 +2 · 声望 +5',
          condition: () => true,
          run: s => {
            s.integrity = Math.min(100, s.integrity + 2);
            s.rep += 5;
            return ['你把方法细节全部写进了补充材料。', '诚信 +2，声望 +5。有人会因此少走弯路。'];
          }
        }
      ]
    },
    {
      id: 'cat', title: '实验室来了一只猫', speaker: 'player', weight: 5, once: true,
      condition: s => s.week >= 8,
      text: '一只橘猫蹲在门口，脖子上没有项圈。它看了看你，径直走进实验室，在唯一一把干净的椅子上睡着了。',
      choices: [
        {
          label: '留下它，起名“数据”', hint: '全室士气 +6 · 每周小确幸',
          condition: () => true,
          run: s => {
            s.flags.cat = true;
            U.moraleAll(s, 6);
            U.piStress(s, -4);
            return ['从此实验室多了一个不交周报的成员。它最喜欢趴在打印机上。', '全室士气 +6，压力 -4。'];
          }
        },
        {
          label: '送到楼下保安室', hint: '理性 · 压力 -2',
          condition: () => true,
          run: s => {
            U.piStress(s, -2);
            return ['你把它抱下楼。第二天，它又出现在门口。', '你假装没看见。'];
          }
        }
      ]
    },
    {
      id: 'visiting_scholar', title: '访问学者', speaker: 'zhou', weight: 5, once: false,
      condition: s => s.week >= 24 && s.rep >= 120,
      text: '马亚楠问你能不能接收一位访问学者，做半年，自带经费，但需要你出工位和一点指导时间。',
      choices: [
        {
          label: '欢迎，正好缺一个做交叉的人', hint: '获得临时帮手 · 声望 +5',
          condition: () => true,
          run: s => {
            s.flags.visitor = 24;
            s.rep += 5;
            U.moraleAll(s, 2);
            return ['来访的是做科学史的老师，对你们的项目提了很多“外行问题”。', '其中三个问题后来变成了论文的引言。声望 +5。'];
          }
        },
        {
          label: '婉拒，实验室太挤了', hint: '无变化',
          condition: () => true,
          run: s => ['你回绝了。马亚楠说理解，但语气里有一点点失望。']
        }
      ]
    },
    {
      id: 'open_day', title: '开放日', speaker: 'linmeng', weight: 5, once: false,
      condition: s => s.week >= 28 && s.students.length >= 2,
      text: '林檬提议做一次实验室开放日，让中学生来看看“科学家到底在干什么”。预算 ¥4,000。',
      choices: [
        {
          label: '办，让学生来讲', hint: '花费 ¥4,000 · 声望 +8 · 学生成长',
          condition: s => s.funds >= 4000,
          run: s => {
            U.funds(s, -4000);
            s.rep += 8;
            s.students.filter(x => x.status === 'active').forEach(st => {
              st.communication = Math.min(100, st.communication + 2);
              st.morale += 4;
            });
            return ['三十个中学生挤在实验室里，问题从“你们工资多少”问到“能不能复活恐龙”。', '声望 +8，全室学生表达 +2、士气 +4。'];
          }
        },
        {
          label: '下次吧，最近太忙', hint: '无变化',
          condition: () => true,
          run: s => ['林檬说好，但把提案默默挪到了下个季度。']
        }
      ]
    },
    {
      id: 'donor', title: '一位老校友', speaker: 'zhou', weight: 4, once: true,
      condition: s => s.week >= 60 && s.rep >= 200,
      text: '一位退休校友想给中心捐一台设备，指定给“最像他当年那个实验室”的团队。马亚楠让你写一页申请。',
      choices: [
        {
          label: '认真写一页，讲你们在做什么', hint: '可能获得设备',
          condition: () => true,
          run: s => {
            if (U.chance(0.65)) {
              s.flags.donorEquipment = true;
              s.pendingDonation = true;
              return ['一周后，一台保养良好的老离心机被推进了实验室。', '有人在一张便签上写：“别让它闲着。”'];
            }
            return ['你写了三版，最后交上去一版最朴素的。', '设备给了另一个实验室。马亚楠说：“下次还有机会。”'];
          }
        },
        {
          label: '把机会让给更年轻的 PI', hint: '声望 +10 · 人情',
          condition: () => true,
          run: s => {
            s.rep += 10;
            return ['你推荐了刚入职的另一位 PI。她后来在组会上说了好几次谢谢。', '声望 +10。'];
          }
        }
      ]
    }
  ];

  const STORIES = [
    {
      id: 'story_rival', title: '旧同事的电话', speaker: 'gu', atWeek: 8, once: true,
      condition: s => s.week >= 8,
      text: '“听说你在 RB 那边支了个摊子？”电话那头是顾维，背景里有咖啡机和很多人的笑声，“我这边刚拿了重点。你要是缺设备，跟我说，别客气。”',
      choices: [
        {
          label: '“先顾好你自己吧。”', hint: '士气 +3 · 压力 -2',
          run: s => {
            s.flags.guRival = true;
            U.moraleAll(s, 3);
            U.piStress(s, -2);
            return ['你挂了电话，在白板上写下了下一年的目标。', '全室士气 +3。顾维这个名字，被你圈了起来。'];
          }
        },
        {
          label: '认真请教他的项目经验', hint: '声望 +5 · 获得灵感',
          run: s => {
            s.rep += 5;
            s.projects.forEach(p => { if (p.status === 'active') p.novelty += 2; });
            return ['他讲了二十分钟，确实有几句话有用。', '声望 +5，在研项目新颖度 +2。你决定不把这件事告诉学生。'];
          }
        },
        {
          label: '沉默三秒，然后说“恭喜”', hint: '心态 +1',
          run: s => {
            U.piStress(s, -3);
            return ['你说得很轻，但他是听得见的。', '压力 -3。有些体面，是给自己留的。'];
          }
        }
      ]
    },
    {
      id: 'story_six_month', title: '半年检查', speaker: 'zhou', atWeek: 24, once: true,
      condition: s => s.week >= 24,
      text: s => {
        if (s.rep >= 100) return '马亚楠翻了翻你的年度材料，点点头：“不错，比我想的快。但别急着铺摊子，先把一件事做透。”';
        return '马亚楠把茶杯放下：“半年了。中心可以给你时间，但不会无限给。你需要一个能被外面看见的结果。”';
      },
      choices: [
        {
          label: '“再给我一年，我会拿出东西。”', hint: '压力 +5 · 项目数据 +8',
          run: s => {
            U.piStress(s, 5);
            const p = s.projects.find(x => x.status === 'active');
            if (p) p.data = Math.min(100, p.data + 8);
            return ['她没有立刻回答，只是在便签上写了什么。', '项目数据 +8。你知道这不是空话。'];
          }
        },
        {
          label: '请她帮忙对接一个合作方', hint: '声望 +8 · 新机会',
          run: s => {
            s.rep += 8;
            s.flags.zhouHelp = true;
            return ['她打了两个电话，其中一个直接打给了市疾控中心。', '声望 +8。新的样本来源正在路上。'];
          }
        },
        {
          label: '把困难如实说出来', hint: '压力 -8 · 士气 +4',
          run: s => {
            U.piStress(s, -8);
            U.moraleAll(s, 4);
            return ['你讲了经费、设备和人的问题。她听完只说：“早说。”', '压力 -8，全室士气 +4。有些门，推开比想象中容易。'];
          }
        }
      ]
    },
    {
      id: 'story_annual', title: '年度考核', speaker: 'zhou', atWeek: 48, once: true,
      condition: s => s.week >= 48,
      text: s => {
        const papers = s.stats.papers;
        if (papers >= 3 && s.rep >= 180) {
          return `一年过去，你们发表了 ${papers} 篇论文，声望 ${Math.round(s.rep)}。马亚楠把一份新的实验室平面图推到你面前：“明年，你们可以再大一点。”`;
        }
        return `一年过去，你们发表了 ${papers} 篇论文。马亚楠没有批评，只问：“你觉得，明年这个时候，会有什么不同？”`;
      },
      choices: [
        {
          label: '申请扩建实验室', hint: '若达标：实验室升级',
          condition: s => s.rep >= 150 && s.stats.papers >= 2,
          run: s => {
            s.flags.expandOffer = true;
            U.funds(s, 30000);
            return ['中心批了一笔小型改造经费，还腾出了隔壁的半间房。', '获得 ¥30,000 改造补贴。实验室可以升级了。'];
          }
        },
        {
          label: '把资源投到人身上', hint: '全室士气 +8 · 学生技能 +2',
          run: s => {
            U.moraleAll(s, 8);
            s.students.forEach(st => { if (st.status === 'active') { st.skill = Math.min(st.potential, st.skill + 2); } });
            return ['你给每个人买了一台新显示器，并认真谈了下一年的计划。', '全室士气 +8，学生技能 +2。'];
          }
        },
        {
          label: '先保住基本盘', hint: '经费 +¥15,000',
          run: s => {
            U.funds(s, 15000);
            return ['你把预算表压缩到最紧，砍掉了两次出差。', '获得 ¥15,000 结余。'];
          }
        }
      ]
    },
    {
      id: 'story_poach', title: '有人来挖人', speaker: 'gu', atWeek: 72, once: true,
      condition: s => s.week >= 72 && s.students.some(x => x.status === 'active' && x.skill >= 65),
      text: s => {
        const st = s.students.filter(x => x.status === 'active').sort((a, b) => b.skill - a.skill)[0];
        return `顾维开出了一份你很难匹配的待遇，想挖走 ${st.name}。学生没有立刻答应，但也没有拒绝。`;
      },
      choices: [
        {
          label: '匹配待遇，给独立课题', hint: '花费 ¥60,000 · 留住核心成员',
          condition: s => s.funds >= 60000,
          run: s => {
            U.funds(s, -60000);
            const st = s.students.filter(x => x.status === 'active').sort((a, b) => b.skill - a.skill)[0];
            if (st) { st.morale += 18; st.salary += 2000; st.stress -= 10; st.star = true; }
            return ['你给了她/他一个独立的子课题，和一句“这里需要你”。', '核心成员留了下来，士气 +18。账上少了一大笔。'];
          }
        },
        {
          label: '坦诚谈一次，不承诺钱', hint: '风险 · 士气 +6',
          condition: () => true,
          run: s => {
            const st = s.students.filter(x => x.status === 'active').sort((a, b) => b.skill - a.skill)[0];
            if (st && U.chance(0.55)) {
              st.morale += 6;
              return ['你们聊了三个小时，聊的是当初为什么开始。', '她/他决定再留一年。士气 +6。'];
            }
            if (st) { st.status = 'left'; st.morale = 0; U.moraleAll(s, -8); }
            return ['一周后，工位空了。桌上留了一盆小绿植。', '全室士气 -8。你开始重新招人。'];
          }
        },
        {
          label: '祝她/他前程似锦', hint: '声望 +10 · 失去成员',
          condition: () => true,
          run: s => {
            const st = s.students.filter(x => x.status === 'active').sort((a, b) => b.skill - a.skill)[0];
            if (st) { st.status = 'left'; st.morale = 0; }
            s.rep += 10;
            U.moraleAll(s, -4);
            return ['你帮她/他写了推荐信。离开那天，大家一起拍了照。', '声望 +10，全室士气 -4。你希望她/他真的过得好。'];
          }
        }
      ]
    },
    {
      id: 'story_conference', title: '主旨报告', speaker: 'zhou', atWeek: 88, once: true,
      condition: s => s.week >= 88 && s.rep >= 260,
      text: '国际交叉科学大会邀请你做 30 分钟主旨报告。马亚楠说：“这次不是去听别人讲，是别人来听你讲。”',
      choices: [
        {
          label: '认真准备，讲你们的故事', hint: '声望 +35 · 全室士气 +10',
          condition: s => true,
          run: s => {
            s.rep += 35;
            U.moraleAll(s, 10);
            U.piStress(s, 6);
            return ['你花了三周做幻灯片，删掉了 42 页。讲完时，台下安静了一秒，然后开始鼓掌。', '声望 +35，全室士气 +10。'];
          }
        },
        {
          label: '带学生一起上台', hint: '学生技能 +5 · 声望 +22',
          condition: s => s.students.some(x => x.status === 'active'),
          run: s => {
            s.rep += 22;
            const st = s.students.filter(x => x.status === 'active').sort((a, b) => b.communication - a.communication)[0];
            if (st) { st.skill = Math.min(st.potential, st.skill + 5); st.morale += 14; }
            U.moraleAll(s, 8);
            return ['你把最后五分钟交给了学生。她/他讲得比你还稳。', '声望 +22，全室士气 +8。'];
          }
        }
      ]
    },
    {
      id: 'story_bridge', title: '中心的周转金', speaker: 'zhou', atWeek: 18, once: true,
      condition: s => s.week >= 18 && (s.funds < 0 || s.negativeMonths >= 1),
      text: s => '马亚楠把一张预算表推回来，指了指最后一行：“账上撑不住了，怎么不早说？”\n\n“中心有一笔周转金，十五万。可以借你，但要算在明年考核里。”',
      choices: [
        {
          label: '接受十五万周转借款', hint: '+¥150,000 · 声望 -5 · 记为借款',
          run: s => {
            U.funds(s, 150000);
            s.rep = Math.max(0, s.rep - 5);
            s.negativeMonths = 0;
            s.flags.debt = (s.flags.debt || 0) + 150000;
            return ['马亚楠让你在借据上签了字，没有利息，也没有期限。', '经费 +¥150,000。账上的红灯暂时灭了。'];
          }
        },
        {
          label: '把一间设备退租，先活下去', hint: '+¥60,000 · 全室士气 -10',
          run: s => {
            U.funds(s, 60000);
            s.negativeMonths = 0;
            U.moraleAll(s, -10);
            return ['你退掉了最贵的那间设备机时，把实验排期重新写了一遍。', '经费 +¥60,000，全室士气 -10。'];
          }
        },
        {
          label: '拒绝，自己想办法', hint: '压力 +12 · 获得 1 行动力',
          run: s => {
            U.piStress(s, 12);
            s.ap = Math.min(Game.maxAp(s) + 1, s.ap + 2);
            return ['你说再给我两个月。马亚楠看了你一会儿，把借据收了回去。', '行动力 +2，压力 +12。你还有一点时间。'];
          }
        }
      ]
    },
    {
      id: 'story_scandal', title: '一封匿名举报', speaker: 'officer', atWeek: 40, once: true,
      condition: s => s.week >= 40 && s.integrity < 45,
      text: '中心收到一封匿名邮件，质疑你们某篇论文的图片处理。邮件没有抄送期刊，只抄送了马亚楠。',
      choices: [
        {
          label: '主动联系期刊，提交原始数据', hint: '诚信 +10 · 声望 -10',
          condition: () => true,
          run: s => {
            s.integrity = Math.min(100, s.integrity + 10);
            s.rep = Math.max(0, s.rep - 10);
            return ['你花了两个星期整理原始数据，公开了全部处理流程。', '期刊接受了解释。诚信 +10，声望 -10。你保住了更重要的东西。'];
          }
        },
        {
          label: '先压下来，看看风声', hint: '风险 · 诚信 -8',
          condition: () => true,
          run: s => {
            s.integrity = Math.max(0, s.integrity - 8);
            s.flags.coverUp = true;
            return ['你删掉了邮件，告诉自己事情没那么严重。', '诚信 -8。那封邮件像一根刺，留在了抽屉里。'];
          }
        }
      ]
    }
  ];

  window.LAB_DATA = {
    PROJECTS, FIXTURES, EQUIPMENT, JOURNALS, JOURNAL_SERIES, INITIAL_JOURNALS, JOURNAL_UNLOCK_ORDER,
    DIMENSIONS, LOAN, GRANTS, GRANT_CATEGORIES, MARKET_ITEMS, FISH, FISH_RARITY, LOCATIONS,
    LAB_CITIES, LAB_PREFIXES, LAB_SUFFIXES, LAB_COLORS, LOOK_OPTIONS, STARTUP_GRANT, STUDENTS, SPEAKERS,
    OBJECTIVES, RANK_THRESHOLDS, LEADERBOARD, TIPS, EVENTS, STORIES,
    PORTRAIT_STYLES,
    set scoreFn(fn) { simScore = fn; }
  };
})();

