
/* Lab Life — procedural pixel art. Everything is drawn; no external sprites. */
(function () {
  'use strict';
  const U = window.LabUtil;

  const P = {
    ink: '#1b1724',
    ink2: '#2e2839',
    night: '#11121c',
    wall: '#d9c9b0',
    wallLight: '#e8d9c2',
    wallDark: '#b9a488',
    floorA: '#c9b99f',
    floorB: '#c2b196',
    floorC: '#d2c3a9',
    wood: '#8e6849',
    woodLight: '#b98a61',
    woodDark: '#5e4330',
    metal: '#8e959c',
    metalLight: '#c4c9cc',
    metalDark: '#5e666e',
    paper: '#f3e7cf',
    paper2: '#e7d5b4',
    cream: '#fff8e9',
    teal: '#2f7f78',
    tealLight: '#57b8a6',
    tealDark: '#1d5a56',
    coral: '#e76f51',
    coralLight: '#ffa184',
    gold: '#e8b84b',
    goldLight: '#ffd97a',
    blue: '#6f8fd6',
    blueLight: '#a8bdf0',
    pink: '#b06a8a',
    green: '#7aa66a',
    red: '#c95353',
    white: '#fffdf6',
    shadow: 'rgba(20, 15, 24, 0.25)'
  };

  const Art = {
    icons: {},
    portraits: {},
    P: P,
    sceneCache: null,
    hotspots: [],
    lastLayout: null
  };

  function ctx2d(canvas) {
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    return c;
  }

  function px(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function outline(c, x, y, w, h, color) {
    px(c, x, y, w, 1, color);
    px(c, x, y + h - 1, w, 1, color);
    px(c, x, y, 1, h, color);
    px(c, x + w - 1, y, 1, h, color);
  }

  function shade(c, x, y, w, h, top, bottom, dark) {
    px(c, x, y, w, h, top);
    px(c, x, y + h - 4, w, 4, bottom);
    px(c, x, y + h - 1, w, 1, dark);
    px(c, x + w - 1, y, 1, h, dark);
  }

  function dither(c, x, y, w, h, color, step) {
    c.fillStyle = color;
    const s = step || 2;
    for (let yy = y; yy < y + h; yy += s) {
      for (let xx = x + ((yy / s) % 2 ? s : 0); xx < x + w; xx += s * 2) {
        c.fillRect(Math.round(xx), Math.round(yy), 1, 1);
      }
    }
  }

  function text(c, str, x, y, color, scale) {
    const s = scale || 1;
    c.fillStyle = color;
    let cx = x;
    for (const ch of String(str).toUpperCase()) {
      const g = FONT5[ch];
      if (!g) { cx += 4 * s; continue; }
      for (let row = 0; row < g.length; row++) {
        for (let col = 0; col < g[row].length; col++) {
          if (g[row][col] === '1' || g[row][col] === '#') c.fillRect(cx + col * s, y + row * s, s, s);
        }
      }
      cx += (g[0].length + 1) * s;
    }
    return cx;
  }

  function textWidth(str, scale) {
    const s = scale || 1;
    let w = 0;
    for (const ch of String(str).toUpperCase()) {
      const g = FONT5[ch];
      w += ((g ? g[0].length : 3) + 1) * s;
    }
    return w;
  }

  const FONT5 = {
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    'C': ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    'G': ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'I': ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    'J': ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    'W': ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
    'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
    '.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
    '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
    ':': ['00000', '00110', '00110', '00000', '00110', '00110', '00000'],
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000']
  };
  Art.FONT5 = FONT5;

  /* =========================================================
     ICONS
     ========================================================= */

  const ICON_MAPS = {
    flask: [
      '................',
      '.......##.......',
      '......#++#......',
      '......#++#......',
      '......#..#......',
      '.....#....#.....',
      '.....#....#.....',
      '....#......#....',
      '....#..oo..#....',
      '...#..oooo..#...',
      '...#..oooo..#...',
      '..#...oooo...#..',
      '..#...oooo...#..',
      '..#..........#..',
      '...##########...',
      '................'
    ],
    chart: [
      '................',
      '..##########....',
      '..#........#....',
      '..#......o.#....',
      '..#....ooo.#....',
      '..#..ooooo.#....',
      '..#.ooooooo#....',
      '..#........#....',
      '..#........#....',
      '..#........#....',
      '..##########....',
      '....##...##.....',
      '....##...##.....',
      '................',
      '................',
      '................'
    ],
    paper: [
      '................',
      '...########.....',
      '...#......#.....',
      '...#.####.#.....',
      '...#......#.....',
      '...#.####.#.....',
      '...#......#.....',
      '...#.####.#.....',
      '...#......#.....',
      '...########.....',
      '....#....#......',
      '....#....#......',
      '....######......',
      '................',
      '................',
      '................'
    ],
    pen: [
      '................',
      '..........##....',
      '.........#++#...',
      '........#++##...',
      '.......#++##....',
      '......#++##.....',
      '.....#++##......',
      '....#++##.......',
      '...#++##........',
      '..#++##.........',
      '..###...........',
      '.#..............',
      '................',
      '................',
      '................',
      '................'
    ],
    heart: [
      '................',
      '................',
      '...##....##.....',
      '..#oo#..#oo#....',
      '.#oooo##oooo#...',
      '.#oooooooooo#...',
      '.#oooooooooo#...',
      '..#oooooooo#....',
      '...#oooooo#.....',
      '....#oooo#......',
      '.....#oo#.......',
      '......##........',
      '................',
      '................',
      '................',
      '................'
    ],
    users: [
      '................',
      '.....##.........',
      '....#oo#........',
      '....#oo#........',
      '.....##.........',
      '...######.......',
      '..#oooooo#......',
      '..#oooooo#......',
      '...######.......',
      '..##....##......',
      '.#oo#..#oo#.....',
      '.#oo#..#oo#.....',
      '..##....##......',
      '................',
      '................',
      '................'
    ],
    coin: [
      '................',
      '.....####.......',
      '...##oooo##.....',
      '..#oooooooo#....',
      '.#ooo#ooo#oo#...',
      '.#oo#ooooo#o#...',
      '.#oo#ooooo#o#...',
      '.#oo#ooooo#o#...',
      '.#oo#ooooo#o#...',
      '.#ooo#ooo#oo#...',
      '..#oooooooo#....',
      '...##oooo##.....',
      '.....####.......',
      '................',
      '................',
      '................'
    ],
    coffee: [
      '................',
      '................',
      '...########.....',
      '...#......#.....',
      '...#.####.#.....',
      '...#.#..#.#.....',
      '...#.####.#.....',
      '...#......#.....',
      '....######......',
      '.....#..#.......',
      '.....#..#.......',
      '....######......',
      '................',
      '..o.....o.......',
      '................',
      '................'
    ],
    briefcase: [
      '................',
      '......####......',
      '......#..#......',
      '..############..',
      '..#..........#..',
      '..#..........#..',
      '..#....##....#..',
      '..#....##....#..',
      '..#..........#..',
      '..#..........#..',
      '..############..',
      '................',
      '................',
      '................',
      '................',
      '................'
    ],
    book: [
      '................',
      '..###########...',
      '..#.........#...',
      '..#.#######.#...',
      '..#.#.....#.#...',
      '..#.#.....#.#...',
      '..#.#######.#...',
      '..#.........#...',
      '..#.#######.#...',
      '..#.#.....#.#...',
      '..#.#######.#...',
      '..#.........#...',
      '..###########...',
      '................',
      '................',
      '................'
    ],
    wrench: [
      '................',
      '.........##.....',
      '........#oo#....',
      '........#oo#....',
      '.......#ooo#....',
      '........###.....',
      '.......#.#......',
      '......#..#......',
      '.....#..#.......',
      '....#..#........',
      '...#..#.........',
      '..#..#..........',
      '.##.#...........',
      '.##.............',
      '................',
      '................'
    ],
    calendar: [
      '................',
      '..##......##....',
      '..#........#....',
      '.############...',
      '.#..........#...',
      '.#.##.##.##.#...',
      '.#..........#...',
      '.#.##.##.##.#...',
      '.#..........#...',
      '.#.##.##.##.#...',
      '.#..........#...',
      '.############...',
      '................',
      '................',
      '................',
      '................'
    ],
    star: [
      '................',
      '.......##.......',
      '.......##.......',
      '......#oo#......',
      '......#oo#......',
      '.....######.....',
      '....#oooooo#....',
      '.....######.....',
      '......#oo#......',
      '.....#o##o#.....',
      '....##....##....',
      '................',
      '................',
      '................',
      '................',
      '................'
    ],
    lock: [
      '................',
      '......####......',
      '.....#....#.....',
      '.....#....#.....',
      '.....#....#.....',
      '...##########...',
      '...#oooooooo#...',
      '...#ooo##ooo#...',
      '...#ooo##ooo#...',
      '...#oooooooo#...',
      '...#oooooooo#...',
      '...##########...',
      '................',
      '................',
      '................',
      '................'
    ],
    check: [
      '................',
      '................',
      '............##..',
      '...........#oo#.',
      '..........#oo#..',
      '.........#oo#...',
      '..##....#oo#....',
      '.#oo#..#oo#.....',
      '.#oo#.#oo#......',
      '..#oo#oo#.......',
      '...#oooo#.......',
      '....#oo#........',
      '.....##.........',
      '................',
      '................',
      '................'
    ],
    x: [
      '................',
      '..##........##..',
      '.#oo#......#oo#.',
      '..#oo#....#oo#..',
      '...#oo#..#oo#...',
      '....#oo##oo#....',
      '.....#oooo#.....',
      '......#oo#......',
      '.....#oooo#.....',
      '....#oo##oo#....',
      '...#oo#..#oo#...',
      '..#oo#....#oo#..',
      '.#oo#......#oo#.',
      '..##........##..',
      '................',
      '................'
    ],
    save: [
      '................',
      '..############..',
      '..#..........#..',
      '..#.##....##.#..',
      '..#.##....##.#..',
      '..#..........#..',
      '..#..........#..',
      '..############..',
      '..#....##....#..',
      '..#....##....#..',
      '..#....##....#..',
      '..#....##....#..',
      '..############..',
      '................',
      '................',
      '................'
    ],
    sound: [
      '................',
      '.......##.......',
      '.....##.##......',
      '....##...##.....',
      '...##.....##....',
      '..###########...',
      '..###########...',
      '..###########...',
      '...##.....##....',
      '....##...##.....',
      '.....##.##......',
      '.......##.......',
      '................',
      '................',
      '................',
      '................'
    ],
    gear: [
      '................',
      '....##....##....',
      '....#oo..oo#....',
      '...#oooooooo#...',
      '..#oooooooooo#..',
      '.#oo#oooooo#oo#.',
      '.#oo#oooooo#oo#.',
      '.#oooooooooooo#.',
      '.#oo#oooooo#oo#.',
      '.#oo#oooooo#oo#.',
      '..#oooooooooo#..',
      '...#oooooooo#...',
      '....#oo..oo#....',
      '....##....##....',
      '................',
      '................'
    ],
    help: [
      '................',
      '.....####.......',
      '...##oooo##.....',
      '..#oooooooo#....',
      '..#ooo##ooo#....',
      '..#oo#..#oo#....',
      '.....##oo#......',
      '......#oo#......',
      '......##........',
      '......#oo#......',
      '......####......',
      '......#oo#......',
      '......####......',
      '................',
      '................',
      '................'
    ],
    arrow: [
      '................',
      '................',
      '.......##.......',
      '......#oo#......',
      '.....#oooo#.....',
      '....#oooooo#....',
      '...#oooooooo#...',
      '..#oooooooooo#..',
      '...#oooooooo#...',
      '....#oooooo#....',
      '.....#oooo#.....',
      '......#oo#......',
      '.......##.......',
      '................',
      '................',
      '................'
    ],
    plus: [
      '................',
      '................',
      '......####......',
      '......#oo#......',
      '......#oo#......',
      '..##########....',
      '..#oooooooo#....',
      '..#oooooooo#....',
      '..##########....',
      '......#oo#......',
      '......#oo#......',
      '......####......',
      '................',
      '................',
      '................',
      '................'
    ],
    dna: [
      '................',
      '..##......##....',
      '...#oo....#oo...',
      '....#oo..#oo....',
      '.....#oo#oo#....',
      '......#oooo#....',
      '.......#oo#.....',
      '........##......',
      '.......#oo#.....',
      '......#oooo#....',
      '.....#oo#oo#....',
      '....#oo..#oo....',
      '...#oo....#oo...',
      '..##......##....',
      '................',
      '................'
    ],
    leaf: [
      '................',
      '..........###...',
      '........##ooo#..',
      '......##ooooo#..',
      '....##oooooo#...',
      '...#ooooooo#....',
      '..#ooooooo#.....',
      '..#oooooo#......',
      '..#ooooo#.......',
      '...#ooo#........',
      '....#o#.........',
      '.....#..........',
      '....#.#.........',
      '...#...#........',
      '................',
      '................'
    ],
    chip: [
      '................',
      '..##..####..##..',
      '..#....##....#..',
      '..############..',
      '..#oooooooooo#..',
      '..#o##oooo##o#..',
      '..#o#oooooo#o#..',
      '..#o##oooo##o#..',
      '..#oooooooooo#..',
      '..#oooooooooo#..',
      '..############..',
      '..#....##....#..',
      '..##..####..##..',
      '................',
      '................',
      '................'
    ],
    robot: [
      '................',
      '.......##.......',
      '.......##.......',
      '....########....',
      '...#oooooooo#...',
      '...#o######o#...',
      '...#o#o##o#o#...',
      '...#o######o#...',
      '...#ooo##ooo#...',
      '....########....',
      '...#..####..#...',
      '..#...#oo#...#..',
      '..#...#oo#...#..',
      '......####......',
      '................',
      '................'
    ],
    microscope: [
      '................',
      '.......###......',
      '......#ooo#.....',
      '......#ooo#.....',
      '.......###......',
      '........#.......',
      '.......#........',
      '......#.........',
      '.....#..........',
      '....#...........',
      '...#.....##.....',
      '..#.....#oo#....',
      '..#.....#oo#....',
      '..############..',
      '................',
      '................'
    ],
    centrifuge: [
      '................',
      '................',
      '...##########...',
      '..#oooooooooo#..',
      '..#oo######oo#..',
      '..#o##oooo##o#..',
      '..#o#oo##oo#o#..',
      '..#o#oo##oo#o#..',
      '..#o##oooo##o#..',
      '..#oo######oo#..',
      '..#oooooooooo#..',
      '...##########...',
      '....#......#....',
      '...##......##...',
      '................',
      '................'
    ],
    door: [
      '................',
      '...##########...',
      '...#oooooooo#...',
      '...#o######o#...',
      '...#o#....#o#...',
      '...#o#....#o#...',
      '...#o#....#o#...',
      '...#o#....#o#...',
      '...#o#....#o#...',
      '...#o#....#o#...',
      '...#o######o#...',
      '...#oooooooo#...',
      '...##########...',
      '................',
      '................',
      '................'
    ],
    cat: [
      '................',
      '................',
      '..##........##..',
      '..#o#......#o#..',
      '..#oo######oo#..',
      '...#oooooooo#...',
      '...#o#oooo#o#...',
      '...#oooooooo#...',
      '....#oooooo#....',
      '.....#oooo#.....',
      '......####......',
      '.....######.....',
      '....#oooooo#....',
      '....########....',
      '................',
      '................'
    ],
    phone: [
      '................',
      '................',
      '...##########...',
      '..#oooooooooo#..',
      '..#o########o#..',
      '..#o#oooooo#o#..',
      '..#o#oooooo#o#..',
      '..#o########o#..',
      '..#oooooooooo#..',
      '..#o##o##o##o#..',
      '..#oooooooooo#..',
      '...##########...',
      '................',
      '................',
      '................',
      '................'
    ],
    whiteboard: [
      '................',
      '..############..',
      '..#..........#..',
      '..#.##.##.##.#..',
      '..#..........#..',
      '..#.##.##.##.#..',
      '..#..........#..',
      '..#.##.##.##.#..',
      '..#..........#..',
      '..#.##.##.##.#..',
      '..############..',
      '....#......#....',
      '....#......#....',
      '................',
      '................',
      '................'
    ],
    plant: [
      '................',
      '......##........',
      '....##oo##......',
      '...#oooooo#.....',
      '..#oooooooo#....',
      '..#oooooooo#....',
      '...##oooo##.....',
      '.....#oo#.......',
      '.....#oo#.......',
      '.....#oo#.......',
      '....######......',
      '...#oooooo#.....',
      '...#oooooo#.....',
      '....######......',
      '................',
      '................'
    ],
    flask2: [
      '................',
      '................',
      '.....######.....',
      '.....#....#.....',
      '.....#....#.....',
      '....#......#....',
      '....#..oo..#....',
      '...#..oooo..#...',
      '...#..oooo..#...',
      '..#...oooo...#..',
      '..#...oooo...#..',
      '..#..........#..',
      '...##########...',
      '................',
      '................',
      '................'
    ]
  };

  Art.icon = function (name, theme) {
    const key = name + '|' + (theme || 'dark');
    if (Art.icons[key]) return Art.icons[key];
    const map = ICON_MAPS[name] || ICON_MAPS.flask;
    const cv = document.createElement('canvas');
    cv.width = 16;
    cv.height = 16;
    const c = ctx2d(cv);
    const dark = theme !== 'light';
    const col = {
      '#': dark ? P.ink : P.paper,
      '+': dark ? '#ffffff' : P.goldLight,
      'o': dark ? P.teal : P.tealLight,
      '-': dark ? P.ink2 : '#7b8794'
    };
    for (let y = 0; y < 16; y++) {
      const row = map[y] || '';
      for (let x = 0; x < 16; x++) {
        const ch = row[x];
        if (!ch || ch === '.') continue;
        const color = ch === '#' ? col['#'] : ch === '+' ? col['+'] : ch === 'o' ? col['o'] : col['-'];
        c.fillStyle = color;
        c.fillRect(x, y, 1, 1);
      }
    }
    const url = cv.toDataURL();
    Art.icons[key] = url;
    return url;
  };

  Art.iconEl = function (name, theme, cls) {
    return '<img class="' + (cls || '') + '" src="' + Art.icon(name, theme) + '" alt="">';
  };

  /* =========================================================
     PORTRAITS
     ========================================================= */

  function getPortraitConfig(key, state) {
    if (key && typeof key === 'object') return key;
    if (key === 'player') {
      const look = (state && state.look) || (window.Game && window.Game.state && window.Game.state.look);
      if (look) return look;
    }
    if (D_STUDENTS[key]) return D_STUDENTS[key].portrait;
    if (D_SPEAKERS[key]) return D_SPEAKERS[key].portrait;
    if (state && key && key.indexOf('stu_') === 0) {
      const st = state.students.find(x => x.uid === key);
      if (st) return st.portrait;
    }
    return { skin: '#e8b98c', hair: '#241f25', style: 'short', coat: '#f7f3e8', accent: P.teal, glasses: false };
  }

  const D_STUDENTS = (window.LAB_DATA ? window.LAB_DATA.STUDENTS : []).reduce(function (a, s) { a[s.defId] = s; return a; }, {});
  const D_SPEAKERS = (window.LAB_DATA ? window.LAB_DATA.SPEAKERS : {});

  Art.portrait = function (key, size, state) {
    const config = getPortraitConfig(key, state);
    const baseKey = key === 'player'
      ? ['player', config.style, config.hair, config.skin, config.coat, config.accent, config.glasses ? 'g' : ''].join(':')
      : (typeof key === 'string' ? key : (config.style + config.hair + config.skin));
    const cacheKey = baseKey + '|' + (size || 96);
    if (Art.portraits[cacheKey]) return Art.portraits[cacheKey];
    const S = 64;
    const cv = document.createElement('canvas');
    cv.width = S;
    cv.height = S;
    const c = ctx2d(cv);
    const accent = config.accent || P.teal;
    const coat = config.coat || P.paper;
    // background: two-tone workshop wall with a soft dither
    px(c, 0, 0, S, S, mix(accent, '#171b28', 0.52));
    px(c, 0, 0, S, 18, mix(accent, '#0d1018', 0.7));
    for (let y = 0; y < S; y += 4) {
      for (let x = (y / 4) % 2 ? 2 : 0; x < S; x += 4) {
        px(c, x, y, 1, 1, 'rgba(255,255,255,0.075)');
      }
    }
    px(c, 0, 50, S, 14, mix(accent, '#0b0e15', 0.62));
    // collar / shoulders
    px(c, 5, 45, 54, 19, P.ink);
    px(c, 7, 46, 50, 17, coat);
    px(c, 7, 59, 50, 4, mix(coat, P.ink, 0.24));
    // shirt / neckline
    px(c, 25, 46, 14, 18, accent);
    px(c, 29, 46, 6, 8, mix(accent, '#fff', 0.35));
    px(c, 22, 46, 5, 8, mix(coat, P.ink, 0.14));
    px(c, 37, 46, 5, 8, mix(coat, P.ink, 0.14));
    // neck
    px(c, 27, 38, 10, 9, shadeColor(config.skin, -20));
    px(c, 28, 37, 8, 8, config.skin);
    px(c, 29, 43, 6, 2, shadeColor(config.skin, -10));
    // head / ears
    px(c, 16, 10, 32, 35, P.ink);
    px(c, 18, 12, 28, 31, config.skin);
    px(c, 20, 12, 24, 2, mix(config.skin, '#fff', 0.18));
    px(c, 18, 32, 28, 2, shadeColor(config.skin, -6));
    px(c, 14, 25, 4, 9, shadeColor(config.skin, -9));
    px(c, 46, 25, 4, 9, shadeColor(config.skin, -9));
    px(c, 15, 27, 2, 5, shadeColor(config.skin, 8));
    px(c, 47, 27, 2, 5, shadeColor(config.skin, 8));
    // hair
    drawHair(c, config, 16, 8, 32, 34);
    // forehead shadow / brows
    px(c, 21, 18, 22, 1, 'rgba(80,45,40,0.12)');
    px(c, 22, 22, 7, 2, shadeColor(config.hair, -12));
    px(c, 35, 22, 7, 2, shadeColor(config.hair, -12));
    px(c, 23, 23, 5, 1, mix(config.hair, '#fff', 0.08));
    px(c, 36, 23, 5, 1, mix(config.hair, '#fff', 0.08));
    // eyes
    px(c, 22, 26, 7, 4, P.white);
    px(c, 35, 26, 7, 4, P.white);
    px(c, 24, 26, 3, 4, P.ink);
    px(c, 37, 26, 3, 4, P.ink);
    px(c, 24, 26, 1, 1, P.white);
    px(c, 37, 26, 1, 1, P.white);
    px(c, 22, 29, 7, 1, shadeColor(config.skin, -18));
    px(c, 35, 29, 7, 1, shadeColor(config.skin, -18));
    // nose
    px(c, 30, 30, 3, 5, shadeColor(config.skin, -12));
    px(c, 31, 34, 2, 1, shadeColor(config.skin, -24));
    // mouth
    px(c, 27, 37, 10, 2, shadeColor(config.skin, -32));
    px(c, 29, 37, 6, 1, shadeColor(config.skin, -48));
    px(c, 29, 39, 6, 1, 'rgba(255,225,210,0.35)');
    // blush
    px(c, 19, 33, 5, 2, 'rgba(225,110,95,0.28)');
    px(c, 40, 33, 5, 2, 'rgba(225,110,95,0.28)');
    // glasses
    if (config.glasses) {
      px(c, 20, 25, 10, 1, P.ink);
      px(c, 20, 25, 1, 7, P.ink);
      px(c, 20, 31, 10, 1, P.ink);
      px(c, 29, 25, 1, 7, P.ink);
      px(c, 34, 25, 10, 1, P.ink);
      px(c, 34, 25, 1, 7, P.ink);
      px(c, 34, 31, 10, 1, P.ink);
      px(c, 43, 25, 1, 7, P.ink);
      px(c, 30, 27, 4, 1, P.ink);
      px(c, 21, 26, 7, 1, 'rgba(180,220,230,0.25)');
    }
    // mask
    if (config.mask) {
      px(c, 19, 32, 26, 11, '#e9eef0');
      px(c, 19, 32, 26, 1, '#ffffff');
      px(c, 19, 42, 26, 1, '#aeb9be');
      px(c, 23, 34, 18, 1, '#cfd8db');
      px(c, 23, 37, 18, 1, '#cfd8db');
    }
    // earring
    if (config.earring) {
      px(c, 14, 33, 3, 3, P.goldLight);
      px(c, 15, 33, 1, 1, '#fff4c8');
    }
    // coat collar / lapels / buttons
    px(c, 21, 46, 5, 7, mix(coat, P.ink, 0.12));
    px(c, 38, 46, 5, 7, mix(coat, P.ink, 0.12));
    px(c, 26, 47, 2, 13, mix(accent, '#fff', 0.15));
    px(c, 36, 47, 2, 13, mix(accent, '#fff', 0.15));
    px(c, 31, 52, 2, 2, mix(coat, P.ink, 0.25));
    px(c, 31, 57, 2, 2, mix(coat, P.ink, 0.25));
    px(c, 10, 53, 8, 7, mix(coat, P.ink, 0.08));
    px(c, 12, 55, 4, 1, mix(accent, P.ink, 0.2));
    // badge / lanyard
    px(c, 42, 51, 6, 8, P.ink);
    px(c, 43, 52, 4, 6, P.cream);
    px(c, 44, 54, 2, 1, accent);
    const url = cv.toDataURL();
    Art.portraits[cacheKey] = url;
    return url;
  };

  Art.portraitForStudent = function (st) {
    if (!st) return Art.portrait('player', 96);
    return Art.portrait(st.uid || st.defId, 96, window.Game && window.Game.state);
  };

  function drawHair(c, cfg, x, y, w, h) {
    const hair = cfg.hair || '#241f25';
    const hi = mix(hair, '#fff', 0.22);
    const hi2 = mix(hair, '#fff', 0.1);
    const dark = shadeColor(hair, -20);
    const deeper = shadeColor(hair, -34);
    switch (cfg.style) {
      case 'bob':
        px(c, x - 1, y + 2, w + 2, 13, hair);
        px(c, x - 2, y + 10, 7, 23, hair);
        px(c, x + w - 5, y + 10, 7, 23, hair);
        px(c, x + 2, y, w - 4, 4, hi);
        px(c, x + 5, y + 3, 8, 2, hi2);
        px(c, x - 1, y + 16, 3, 12, dark);
        px(c, x + w - 2, y + 16, 3, 12, dark);
        break;
      case 'long':
        px(c, x - 1, y + 1, w + 2, 14, hair);
        px(c, x - 3, y + 10, 6, 38, hair);
        px(c, x + w - 3, y + 10, 6, 38, hair);
        px(c, x + 2, y - 1, w - 4, 4, hi);
        px(c, x + 4, y + 4, 9, 2, hi2);
        px(c, x - 3, y + 26, 3, 17, dark);
        px(c, x + w, y + 26, 3, 17, dark);
        break;
      case 'bun':
        px(c, x, y + 2, w, 12, hair);
        px(c, x + 9, y - 7, 14, 11, hair);
        px(c, x + 11, y - 6, 10, 3, hi);
        px(c, x + 12, y - 3, 4, 2, hi2);
        px(c, x + 2, y + 12, 4, 10, dark);
        px(c, x + w - 6, y + 12, 4, 10, dark);
        break;
      case 'curly':
        px(c, x + 1, y + 1, w - 2, 13, hair);
        for (let i = 0; i < 9; i++) {
          px(c, x + (i * 5) % (w - 5), y + (i % 3 === 0 ? -3 : 1), 7, 7, hair);
        }
        px(c, x - 2, y + 10, 5, 12, hair);
        px(c, x + w - 3, y + 10, 5, 12, hair);
        px(c, x + 4, y - 1, 4, 2, hi);
        px(c, x + 17, y + 2, 5, 2, hi2);
        break;
      case 'fringe':
        px(c, x, y + 1, w, 12, hair);
        px(c, x + 2, y + 9, 10, 5, hair);
        px(c, x + 15, y + 8, 6, 6, hair);
        px(c, x + 23, y + 9, 8, 5, hair);
        px(c, x + 2, y - 1, w - 4, 3, hi);
        px(c, x + 6, y + 4, 10, 2, hi2);
        px(c, x - 2, y + 8, 4, 13, hair);
        px(c, x + w - 2, y + 8, 4, 13, hair);
        break;
      case 'undercut':
        px(c, x + 2, y, w - 4, 8, hair);
        px(c, x + 1, y + 2, w - 2, 3, hi);
        px(c, x + 7, y + 4, 6, 2, hi2);
        px(c, x + 1, y + 8, 4, 6, dark);
        px(c, x + w - 5, y + 8, 4, 6, dark);
        px(c, x + 1, y + 12, 2, 2, deeper);
        px(c, x + w - 3, y + 12, 2, 2, deeper);
        break;
      case 'braid':
        px(c, x, y + 1, w, 13, hair);
        px(c, x + 3, y - 1, w - 6, 3, hi);
        px(c, x + 7, y + 4, 8, 2, hi2);
        px(c, x + w - 4, y + 12, 6, 7, hair);
        px(c, x + w - 5, y + 18, 6, 6, hair);
        px(c, x + w - 6, y + 24, 5, 5, hair);
        px(c, x + w - 7, y + 29, 4, 4, hair);
        px(c, x + w - 3, y + 19, 2, 2, P.goldLight);
        px(c, x + w - 2, y + 26, 2, 2, P.goldLight);
        break;
      default: // short
        px(c, x, y + 1, w, 11, hair);
        px(c, x + 2, y - 1, w - 4, 3, hi);
        px(c, x + 6, y + 3, 9, 2, hi2);
        px(c, x - 1, y + 9, 4, 8, dark);
        px(c, x + w - 3, y + 9, 4, 8, dark);
        px(c, x + 9, y + 9, 9, 3, hair);
        px(c, x + 13, y + 6, 4, 3, dark);
        break;
    }
  }

  function mix(a, b, t) {
    const ca = hex(a), cb = hex(b);
    if (!ca || !cb) return a;
    return 'rgb(' + Math.round(ca[0] + (cb[0] - ca[0]) * t) + ',' +
      Math.round(ca[1] + (cb[1] - ca[1]) * t) + ',' +
      Math.round(ca[2] + (cb[2] - ca[2]) * t) + ')';
  }
  Art.mix = mix;

  function shadeColor(c, amt) {
    const v = hex(c);
    if (!v) return c;
    return 'rgb(' + Math.max(0, Math.min(255, v[0] + amt)) + ',' +
      Math.max(0, Math.min(255, v[1] + amt)) + ',' +
      Math.max(0, Math.min(255, v[2] + amt)) + ')';
  }

  function hex(h) {
    if (typeof h !== 'string') return null;
    let s = h.replace('#', '');
    if (s.length === 3) s = s.split('').map(x => x + x).join('');
    if (!/^[0-9a-f]{6}$/i.test(s)) return null;
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  Art.hex = hex;

  /* =========================================================
     TITLE SCENE
     ========================================================= */

  Art.drawTitle = function (canvas, t) {
    const c = ctx2d(canvas);
    const W = 480, H = 270;
    // ---- dark lab interior at night ----
    px(c, 0, 0, W, H, '#121722');
    // back wall
    px(c, 0, 0, W, 176, '#1b2430');
    for (let x = 0; x < W; x += 12) {
      px(c, x, 0, 1, 176, x % 24 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.08)');
    }
    px(c, 0, 0, W, 5, '#0b0e15');
    px(c, 0, 172, W, 5, '#0b0e15');
    // floor planks
    px(c, 0, 176, W, 94, '#2a211d');
    for (let y = 176; y < H; y += 12) {
      px(c, 0, y, W, 1, 'rgba(0,0,0,0.25)');
      for (let x = (y / 12) % 2 ? 0 : 23; x < W; x += 46) {
        px(c, x, y, 1, 12, 'rgba(0,0,0,0.22)');
      }
    }
    // big window with rain and city
    const wx = 240, wy = 22, ww = 214, wh = 132;
    px(c, wx - 5, wy - 5, ww + 10, wh + 10, '#0a0d14');
    px(c, wx - 3, wy - 3, ww + 6, wh + 6, '#4a3a2c');
    const sky = c.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, '#0a1226');
    sky.addColorStop(0.58, '#1a2946');
    sky.addColorStop(1, '#3a4054');
    c.fillStyle = sky;
    c.fillRect(wx, wy, ww, wh);
    // moon
    px(c, wx + 152, wy + 15, 18, 18, 'rgba(240,230,200,0.14)');
    px(c, wx + 155, wy + 17, 12, 12, '#e7dfc4');
    px(c, wx + 160, wy + 17, 7, 12, '#d6cdb2');
    // skyline
    for (let i = 0; i < 16; i++) {
      const bw = 10 + ((i * 7) % 17);
      const bh = 18 + ((i * 13) % 54);
      px(c, wx + 3 + i * 14, wy + wh - bh, bw, bh, '#0f1728');
      for (let j = 0; j < 3; j++) {
        if ((i + j * 3) % 4 !== 0) {
          px(c, wx + 6 + i * 14, wy + wh - bh + 5 + j * 7, 2, 2, 'rgba(240,195,105,0.55)');
        }
      }
    }
    // rain on glass
    c.strokeStyle = 'rgba(175,205,230,0.28)';
    c.lineWidth = 1;
    for (let i = 0; i < 46; i++) {
      const rx = wx + (U.seededNoise(i, 1, 7) * ww + t * 20) % ww;
      const ry = wy + (U.seededNoise(i, 2, 8) * wh + t * 78) % wh;
      c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 1, ry + 4); c.stroke();
    }
    // window mullions
    px(c, wx + ww / 2 - 2, wy, 4, wh, '#0a0d14');
    px(c, wx, wy + wh / 2 - 2, ww, 4, '#0a0d14');
    px(c, wx, wy, ww, 3, '#0a0d14');
    px(c, wx, wy + wh - 3, ww, 3, '#0a0d14');
    // windowsill
    px(c, wx - 7, wy + wh + 2, ww + 14, 4, '#6b4f3a');
    // ---- desk ----
    const dx = 214, dy = 158, dw = 258, dh = 72;
    px(c, dx + 3, dy + dh, dw - 6, 6, 'rgba(0,0,0,0.3)');
    px(c, dx, dy, dw, dh, '#1b1724');
    px(c, dx + 2, dy + 2, dw - 4, 12, '#a57a53');
    px(c, dx + 2, dy + 14, dw - 4, dh - 16, '#6e4e36');
    for (let i = 0; i < 5; i++) px(c, dx + 10 + i * 48, dy + 18, 2, dh - 22, '#5a3f2b');
    // desk top objects: papers, laptop, microscope, mug
    px(c, dx + 18, dy - 6, 36, 22, '#e8dcc4');
    px(c, dx + 20, dy - 2, 30, 2, '#a89c8a');
    px(c, dx + 20, dy + 3, 22, 2, '#a89c8a');
    px(c, dx + 62, dy - 9, 42, 26, '#2b303a');
    px(c, dx + 64, dy - 7, 38, 21, '#5b879b');
    px(c, dx + 67, dy - 4, 26, 2, '#b9e2e8');
    px(c, dx + 68, dy + 2, 18, 1, '#9fd0d8');
    px(c, dx + 112, dy - 2, 18, 12, '#d8d2c4');
    px(c, dx + 114, dy, 14, 2, '#a89c8a');
    px(c, dx + 116, dy + 4, 10, 1, '#a89c8a');
    // microscope
    px(c, dx + 144, dy - 22, 10, 8, '#c4c9cc');
    px(c, dx + 148, dy - 26, 4, 6, '#8e959c');
    px(c, dx + 147, dy - 14, 5, 14, '#8e959c');
    px(c, dx + 140, dy - 1, 20, 5, '#5e666e');
    // mug + steam
    px(c, dx + 176, dy - 10, 10, 10, '#d9d2c0');
    px(c, dx + 186, dy - 7, 3, 4, '#d9d2c0');
    px(c, dx + 178, dy - 8, 6, 2, '#6b432e');
    for (let i = 0; i < 3; i++) {
      px(c, dx + 179 + Math.sin(t * 1.7 + i) * 2, dy - 14 - i * 3, 1, 2, 'rgba(240,240,230,0.25)');
    }
    // plant on desk
    px(c, dx + 224, dy - 16, 12, 14, '#9a6a47');
    px(c, dx + 222, dy - 30, 16, 16, P.green);
    px(c, dx + 226, dy - 34, 8, 10, '#88b073');
    // cat sleeping on the warm corner
    const cx = dx + 198, cy = dy - 20;
    px(c, cx, cy + 8, 22, 7, '#c98a4a');
    px(c, cx + 2, cy + 15, 18, 3, '#a86f38');
    px(c, cx + 14, cy + 1, 9, 9, '#c98a4a');
    px(c, cx + 15, cy - 2, 3, 4, '#c98a4a');
    px(c, cx + 19, cy - 2, 3, 4, '#c98a4a');
    px(c, cx + 16, cy + 4, 2, 1, P.ink);
    px(c, cx + 20, cy + 4, 2, 1, P.ink);
    px(c, cx - 2, cy + 9, 5, 2, '#c98a4a');
    // lamp
    px(c, dx + 8, dy - 30, 2, 28, '#3b3a44');
    px(c, dx + 2, dy - 32, 16, 3, '#3b3a44');
    px(c, dx + 4, dy - 29, 12, 4, '#f1d27a');
    // chair and PI silhouette (back view)
    px(c, 318, 204, 54, 48, '#15131c');
    px(c, 324, 210, 42, 38, '#24222d');
    px(c, 326, 216, 38, 6, '#35323f');
    px(c, 336, 168, 18, 20, '#e8b98c');
    px(c, 332, 160, 26, 15, '#241f25');
    px(c, 326, 182, 38, 28, '#f4eddb');
    px(c, 326, 182, 38, 4, '#dcd4c2');
    px(c, 330, 184, 8, 20, '#57b8a6');
    // shoulders / arms
    px(c, 318, 190, 8, 18, '#f4eddb');
    px(c, 364, 190, 8, 18, '#f4eddb');
    // headset? no
    // wall left: whiteboard and notes
    px(c, 22, 36, 116, 78, '#0b0e14');
    px(c, 24, 38, 112, 74, '#e9e4d4');
    for (let i = 0; i < 18; i++) {
      const lx = 30 + (U.seededNoise(i, 1, 3) * 94) | 0;
      const ly = 44 + (U.seededNoise(i, 2, 4) * 58) | 0;
      const lw = 4 + (U.seededNoise(i, 3, 5) * 20) | 0;
      px(c, lx, ly, lw, 1, [P.teal, P.coral, P.blue, P.gold][i % 4]);
    }
    px(c, 34, 54, 24, 16, P.teal);
    px(c, 64, 48, 18, 22, P.coral);
    px(c, 88, 60, 26, 10, P.blue);
    // pinned notes
    px(c, 30, 122, 26, 20, P.goldLight);
    px(c, 36, 128, 14, 1, '#a8863a');
    px(c, 62, 118, 22, 18, P.coralLight);
    px(c, 68, 124, 10, 1, '#a64a36');
    // shelf
    px(c, 24, 148, 100, 6, '#6b4f3a');
    for (let i = 0; i < 8; i++) {
      px(c, 28 + i * 11, 140 - (i % 3) * 3, 7, 8 + (i % 3) * 3, [P.coral, P.teal, P.gold, P.blue, P.pink][i % 5]);
    }
    // floor boxes left
    px(c, 22, 220, 54, 46, '#8a6744');
    px(c, 30, 228, 38, 3, '#5e4330');
    text(c, 'LAB', 32, 238, '#4b3726', 1);
    px(c, 82, 236, 40, 30, '#6b4f3a');
    px(c, 90, 244, 24, 2, '#4b3726');
    // warm lamp light
    c.globalCompositeOperation = 'lighter';
    const glow = c.createRadialGradient(dx + 10, dy - 20, 3, dx + 10, dy - 20, 110);
    glow.addColorStop(0, 'rgba(255,210,120,0.28)');
    glow.addColorStop(0.4, 'rgba(255,190,100,0.10)');
    glow.addColorStop(1, 'rgba(255,190,100,0)');
    c.fillStyle = glow;
    c.fillRect(0, 40, 360, 240);
    const cityGlow = c.createRadialGradient(wx + 120, wy + 90, 10, wx + 120, wy + 90, 160);
    cityGlow.addColorStop(0, 'rgba(120,170,210,0.10)');
    cityGlow.addColorStop(1, 'rgba(120,170,210,0)');
    c.fillStyle = cityGlow;
    c.fillRect(wx - 120, wy - 40, ww + 240, wh + 160);
    c.globalCompositeOperation = 'source-over';
    // dust
    for (let i = 0; i < 24; i++) {
      const x = (U.seededNoise(i, 3, 9) * W + Math.sin(t * 0.2 + i) * 5) | 0;
      const y = 30 + ((U.seededNoise(i, 4, 10) * 220 + t * 2) % 220);
      px(c, x, y, 1, 1, 'rgba(245,235,210,0.18)');
    }
    // vignette, darker on the left for the title
    const vg = c.createLinearGradient(0, 0, W, 0);
    vg.addColorStop(0, 'rgba(5,7,12,0.9)');
    vg.addColorStop(0.28, 'rgba(5,7,12,0.6)');
    vg.addColorStop(0.55, 'rgba(5,7,12,0.1)');
    vg.addColorStop(1, 'rgba(5,7,12,0.25)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
    const vg2 = c.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 300);
    vg2.addColorStop(0, 'rgba(0,0,0,0)');
    vg2.addColorStop(1, 'rgba(2,3,7,0.5)');
    c.fillStyle = vg2;
    c.fillRect(0, 0, W, H);
  };

  function drawMainBuilding(c, x, y, w, h, t) {
    px(c, x, y, w, h, '#20222d');
    px(c, x, y, w, 4, '#343746');
    px(c, x + 4, y + 4, w - 8, h - 4, '#191b26');
    // vertical facade ribs
    for (let i = 0; i < 5; i++) {
      px(c, x + 18 + i * 44, y + 4, 3, h - 8, '#12141e');
    }
    // windows grid
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = x + 26 + col * 48;
        const wy = y + 20 + row * 34;
        const lit = U.seededNoise(row, col, 12) > 0.5;
        drawWindow(c, wx, wy, 26, 20, lit, t, row === 2 && col === 2);
      }
    }
    // 3F lab window, larger
    const wx = x + 116, wy = y + 98, ww = 72, wh = 38;
    px(c, wx - 4, wy - 4, ww + 8, wh + 8, '#0b0d14');
    px(c, wx, wy, ww, wh, '#e3b56b');
    px(c, wx, wy, ww, wh, 'rgba(255,215,140,0.85)');
    // interior silhouette: desk, lamp, person
    px(c, wx + 4, wy + 16, ww - 8, 3, '#6b4b2f');
    px(c, wx + 8, wy + 8, 2, 10, '#5a3d26');
    px(c, wx + 10, wy + 6, 9, 3, '#5a3d26');
    px(c, wx + 12, wy + 10, 5, 6, '#2c2430');
    px(c, wx + 44, wy + 10, 12, 12, '#25202a');
    px(c, wx + 47, wy + 13, 5, 6, '#e4c09c');
    px(c, wx + 45, wy + 19, 11, 9, '#f2ead7');
    // shelves / plants
    px(c, wx + 30, wy + 8, 2, 12, '#4f3b2a');
    px(c, wx + 26, wy + 6, 10, 3, '#4f3b2a');
    // vertical sign
    const flick = Math.sin(t * 3.1) > 0.92 ? 0.55 : 1;
    px(c, x + 8, y + 38, 14, 58, '#151822');
    px(c, x + 10, y + 40, 10, 54, 'rgba(87,184,166,' + (0.9 * flick) + ')');
    text(c, 'R', x + 12, y + 44, '#0d2624', 1);
    text(c, 'B', x + 12, y + 56, '#0d2624', 1);
    text(c, 'L', x + 12, y + 72, '#0d2624', 1);
    text(c, 'A', x + 12, y + 80, '#0d2624', 1);
    text(c, 'B', x + 12, y + 88, '#0d2624', 1);
    // ground floor entrance
    px(c, x + 94, y + 154, 48, 42, '#0b0e17');
    px(c, x + 98, y + 158, 40, 38, '#c9a76a');
    px(c, x + 101, y + 161, 34, 35, '#e7d6b5');
    px(c, x + 101, y + 183, 34, 13, '#24222b');
    px(c, x + 129, y + 180, 4, 2, '#f1d27a');
    text(c, 'RB', x + 108, y + 167, '#8c5f37', 1);
    // windowsill glow
    const glow = c.createRadialGradient(wx + ww / 2, wy + wh / 2, 5, wx + ww / 2, wy + wh / 2, 96);
    glow.addColorStop(0, 'rgba(255,205,120,0.16)');
    glow.addColorStop(1, 'rgba(255,205,120,0)');
    c.fillStyle = glow;
    c.fillRect(wx - 90, wy - 90, ww + 180, wh + 180);
  }

  function drawWindow(c, x, y, w, h, lit, t, special) {
    px(c, x, y, w, h, lit ? 'rgba(242,198,115,0.8)' : '#101626');
    if (lit) {
      px(c, x, y + h - 6, w, 6, 'rgba(150,100,60,0.4)');
      px(c, x + 3, y + 4, w - 6, 2, 'rgba(255,245,210,0.35)');
      if (special) {
        px(c, x + 4, y + h - 8, 4, 8, '#4a3a2c');
        px(c, x + 5, y + h - 13, 2, 5, '#4a3a2c');
      }
    } else {
      px(c, x + 2, y + 3, 3, 3, 'rgba(100,130,180,0.18)');
    }
    px(c, x + w / 2 - 1, y, 2, h, '#0b0e17');
    px(c, x, y + h / 2 - 1, w, 2, '#0b0e17');
  }

  function drawSkyline(c, x, y, w, h, color, t, speed) {
    c.fillStyle = color;
    for (let i = 0; i < 18; i++) {
      const bw = 12 + (U.seededNoise(i, 3, 1) * 24) | 0;
      const bh = 14 + (U.seededNoise(i, 4, 2) * 46) | 0;
      const bx = x + i * 27;
      c.fillRect(bx, y + h - bh, bw, bh);
      for (let j = 0; j < 3; j++) {
        if (U.seededNoise(i, j, 5) > 0.55) {
          c.fillStyle = 'rgba(220,180,100,0.25)';
          c.fillRect(bx + 3, y + h - bh + 6 + j * 8, 2, 2);
          c.fillStyle = color;
        }
      }
    }
  }

  function drawBuilding(c, x, y, w, h, base, light, t) {
    px(c, x, y, w, h, base);
    px(c, x, y, w, 3, light);
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 3; col++) {
        const lit = U.seededNoise(x + row, col, 8) > 0.55;
        px(c, x + 6 + col * 16, y + 10 + row * 16, 8, 7, lit ? 'rgba(235,190,110,0.4)' : '#0e1424');
      }
    }
  }

  function drawTree(c, x, y, w, h, t) {
    px(c, x + 12, y + 26, 4, 28, '#0b0e15');
    for (let i = 0; i < 10; i++) {
      const bx = x + 2 + (U.seededNoise(i, 6, 2) * 24) | 0;
      const by = y + 6 + (U.seededNoise(i, 7, 3) * 22) | 0;
      px(c, bx, by, 8, 6, '#0b0e15');
    }
  }

  /* =========================================================
     INTRO SCENES
     ========================================================= */

  Art.drawIntro = function (canvas, slide, t) {
    const c = ctx2d(canvas);
    const W = 480, H = 360;
    c.fillStyle = '#0d1220';
    c.fillRect(0, 0, W, H);
    if (slide === 0) drawIntroOffice(c, W, H, t);
    else if (slide === 1) drawIntroCity(c, W, H, t);
    else if (slide === 2) drawIntroEmptyLab(c, W, H, t);
    else drawIntroChoose(c, W, H, t);
  };

  function drawIntroOffice(c, W, H, t) {
    // wall
    px(c, 0, 0, W, H, '#2a2a35');
    px(c, 0, 0, W, 24, '#20202a');
    // window with rain
    px(c, 46, 38, 170, 116, '#0d1626');
    px(c, 52, 42, 158, 108, '#20324e');
    drawSkyline(c, 52, 48, 158, 80, '#101a2c', t, 0.3);
    for (let i = 0; i < 40; i++) {
      const x = 52 + (U.seededNoise(i, 1, 2) * 158 + t * 9) % 158;
      const y = 42 + (U.seededNoise(i, 2, 3) * 108 + t * 52) % 108;
      px(c, x, y, 1, 3, 'rgba(160,190,220,0.3)');
    }
    px(c, 46, 38, 4, 116, '#4a3a2c');
    px(c, 212, 38, 4, 116, '#4a3a2c');
    px(c, 128, 38, 4, 116, '#4a3a2c');
    // desk
    px(c, 60, 240, 320, 16, '#7c5b3f');
    px(c, 60, 256, 320, 60, '#5d4030');
    px(c, 60, 240, 320, 4, '#a07a55');
    // chair
    px(c, 290, 196, 70, 70, '#33303a');
    px(c, 300, 206, 50, 40, '#44404d');
    // person slumped
    px(c, 305, 160, 38, 50, '#25222c');
    px(c, 312, 168, 24, 26, '#d8ab83');
    px(c, 310, 160, 28, 14, '#1e1a21');
    px(c, 320, 182, 8, 3, '#5a3a2f');
    // paper on desk
    px(c, 130, 218, 74, 48, '#e8ddc9');
    px(c, 136, 224, 62, 4, '#8f8373');
    px(c, 136, 232, 46, 3, '#a89c8a');
    px(c, 136, 239, 54, 3, '#a89c8a');
    px(c, 136, 250, 40, 8, '#c95a4e');
    text(c, 'REVIEW', 139, 252, '#f4e6d0', 1);
    // lamp
    px(c, 372, 150, 4, 90, '#3d3a44');
    px(c, 356, 146, 34, 8, '#3d3a44');
    px(c, 360, 154, 26, 6, '#e8c46b');
    const lg = c.createRadialGradient(372, 165, 4, 372, 165, 90);
    lg.addColorStop(0, 'rgba(255,210,110,0.22)');
    lg.addColorStop(1, 'rgba(255,210,110,0)');
    c.fillStyle = lg;
    c.fillRect(290, 90, 180, 180);
    // boxes
    px(c, 392, 258, 56, 54, '#9a744c');
    px(c, 398, 264, 44, 4, '#6e5236');
    text(c, 'LAB', 404, 276, '#4b3726', 1);
    // vignette
    const vg = c.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 300);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }

  function drawIntroCity(c, W, H, t) {
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#10172c');
    sky.addColorStop(0.6, '#26334e');
    sky.addColorStop(1, '#3a3a46');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) {
      px(c, (U.seededNoise(i, 1, 2) * W) | 0, (U.seededNoise(i, 2, 3) * 150) | 0, 1, 1, 'rgba(220,230,255,0.4)');
    }
    drawSkyline(c, 0, 80, W, 160, '#121a2e', t, 0.2);
    drawBuilding(c, 20, 120, 80, 150, '#1b2238', '#303b5a', t);
    drawBuilding(c, 360, 100, 86, 170, '#1a2033', '#2c3652', t);
    // taxi
    px(c, 90, 250, 180, 46, '#d9b64c');
    px(c, 100, 232, 140, 30, '#e6c45a');
    px(c, 112, 236, 50, 22, '#20304a');
    px(c, 174, 236, 50, 22, '#20304a');
    px(c, 116, 240, 16, 12, '#4d6a88');
    px(c, 180, 240, 16, 12, '#4d6a88');
    px(c, 100, 272, 16, 12, '#1b1724');
    px(c, 244, 272, 16, 12, '#1b1724');
    px(c, 124, 288, 10, 4, '#f4e6b0');
    px(c, 234, 288, 10, 4, '#f4e6b0');
    text(c, 'RB', 146, 260, '#3b2e16', 2);
    // rain
    for (let i = 0; i < 80; i++) {
      const x = (U.seededNoise(i, 5, 6) * W + t * 12) % W;
      const y = (U.seededNoise(i, 6, 7) * H + t * 70) % H;
      px(c, x, y, 1, 4, 'rgba(170,200,230,0.3)');
    }
    // vignette
    const vg = c.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 320);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }

  function drawIntroEmptyLab(c, W, H, t) {
    px(c, 0, 0, W, H, '#181b27');
    px(c, 0, 0, W, 80, '#22232f');
    px(c, 0, 80, W, H - 80, '#2c2c37');
    // bare floor tiles
    for (let y = 80; y < H; y += 24) {
      for (let x = 0; x < W; x += 24) {
        px(c, x, y, 23, 23, (x / 24 + y / 24) % 2 ? '#33333e' : '#2d2d38');
      }
    }
    // window
    px(c, 300, 40, 120, 90, '#0d1626');
    px(c, 306, 44, 108, 82, '#24364f');
    drawSkyline(c, 306, 50, 108, 60, '#111b2d', t, 0.2);
    // boxes
    px(c, 70, 250, 70, 62, '#9a744c');
    px(c, 78, 258, 54, 4, '#6e5236');
    text(c, 'LAB', 88, 274, '#4b3726', 1);
    px(c, 150, 266, 48, 46, '#8a6744');
    // old bench
    px(c, 60, 180, 140, 12, '#8c6a4d');
    px(c, 60, 192, 140, 42, '#654a37');
    px(c, 68, 160, 30, 22, '#3a3a44');
    // hanging bulb
    px(c, 240, 0, 2, 36, '#3a3a44');
    px(c, 232, 36, 18, 10, '#f1d27a');
    const lg = c.createRadialGradient(241, 44, 4, 241, 44, 100);
    lg.addColorStop(0, 'rgba(255,215,130,0.3)');
    lg.addColorStop(1, 'rgba(255,215,130,0)');
    c.fillStyle = lg;
    c.fillRect(140, 0, 200, 170);
    // two figures with key
    drawFigure(c, 330, 250, '#f2ead7', '#2f7f78', '#241f25', 'short');
    drawFigure(c, 294, 250, '#c9d6de', '#6f8fd6', '#4a3a3a', 'bun');
    px(c, 306, 224, 8, 3, '#f1d27a');
    // vignette
    const vg = c.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 320);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }

  function drawIntroChoose(c, W, H, t) {
    px(c, 0, 0, W, H, '#11141f');
    // three glowing columns
    const cols = [P.coral, P.tealLight, P.blue];
    for (let i = 0; i < 3; i++) {
      const x = 88 + i * 104;
      const g = c.createLinearGradient(0, 80, 0, 330);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, cols[i]);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = 0.16;
      c.fillStyle = g;
      c.fillRect(x, 70, 72, 260);
      c.globalAlpha = 1;
      px(c, x + 32, 80, 8, 230, cols[i]);
      px(c, x + 20, 120, 32, 4, cols[i]);
      px(c, x + 20, 220, 32, 4, cols[i]);
    }
    // floor
    px(c, 0, 300, W, 60, '#0b0e17');
    // silhouettes
    drawFigure(c, 240, 298, '#f2ead7', P.teal, '#241f25', 'short');
    // particles
    for (let i = 0; i < 50; i++) {
      const x = (U.seededNoise(i, 1, 8) * W) | 0;
      const y = 60 + ((U.seededNoise(i, 2, 9) * 240 + t * 8) % 240);
      px(c, x, y, 1, 1, 'rgba(230,240,255,0.4)');
    }
    const vg = c.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 330);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }

  function drawFigure(c, x, y, coat, accent, hair, style) {
    // x = center feet
    px(c, x - 11, y - 2, 22, 4, 'rgba(0,0,0,0.35)');
    px(c, x - 8, y - 22, 16, 20, P.ink);
    px(c, x - 7, y - 22, 14, 22, coat);
    px(c, x - 7, y - 10, 14, 10, coat);
    px(c, x - 3, y - 8, 6, 7, accent);
    px(c, x - 8, y - 40, 16, 18, P.ink);
    px(c, x - 7, y - 40, 14, 14, '#e8b98c');
    if (style === 'bun') {
      px(c, x - 8, y - 45, 16, 7, hair);
      px(c, x - 5, y - 48, 10, 5, hair);
    } else {
      px(c, x - 8, y - 45, 16, 8, hair);
      px(c, x - 9, y - 42, 3, 10, hair);
    }
    px(c, x - 4, y - 33, 3, 2, P.ink);
    px(c, x + 2, y - 33, 3, 2, P.ink);
  }

  /* =========================================================
     SCENE
     ========================================================= */

  const ROOM = {
    wallH: 58,
    barrierX: 382,
    rightX: 472,
    leftBench: { x: 10, y: 76, w: 62, h: 136 },
    island: { x: 122, y: 100, w: 224, h: 62 },
    fume: { x: 78, y: 58, w: 74, h: 42 },
    computerDesk: { x: 300, y: 178, w: 76, h: 44 },
    coffee: { x: 52, y: 238, w: 38, h: 48 },
    door: { x: 12, y: 240, w: 38, h: 48 }
  };

  const DESKS = [
    { x: 96, y: 220, w: 68 },
    { x: 180, y: 220, w: 68 },
    { x: 264, y: 220, w: 68 },
    { x: 348, y: 220, w: 68 }
  ];

  const STANDING = [
    { x: 84, y: 196 },
    { x: 330, y: 194 },
    { x: 390, y: 190 },
    { x: 64, y: 220 },
    { x: 440, y: 228 }
  ];

  function availableDesks(state) {
    return state.labLevel >= 2 ? 4 : 3;
  }

  function makeLayout(state) {
    const desks = DESKS.slice();
    const available = availableDesks(state);
    const students = (state.students || []).filter(x => x.status === 'active' || x.status === 'burnout');
    const people = students.map((st, i) => {
      if (i < available) {
        return { st, x: desks[i].x + 52, y: desks[i].y + 27, seated: true, desk: i };
      }
      const pos = STANDING[(i - available) % STANDING.length];
      return { st, x: pos.x, y: pos.y, seated: false, desk: -1 };
    });
    return { desks, availableDesks: available, people };
  }

  Art.SCENE_CONFIG = {
    tech: { w: 960, h: 580, spawn: { x: 470, y: 500 } },
    market: { w: 960, h: 580, spawn: { x: 470, y: 500 } },
    delivery: { w: 960, h: 580, spawn: { x: 470, y: 500 } },
    lake: { w: 960, h: 580, spawn: { x: 470, y: 480 } }
  };

  Art.sceneSize = function (state) {
    const id = state && state.scene;
    const cfg = Art.SCENE_CONFIG[id];
    return cfg ? { w: cfg.w, h: cfg.h } : { w: 480, h: 290 };
  };

  Art.drawScene = function (canvas, state, t, ui) {
    const scene = state.scene || 'lab';
    if (scene !== 'lab') {
      if (window.LabIso) return window.LabIso.draw(canvas, state, t, ui);
      return drawPlaceScene(canvas, state, t, scene, ui);
    }
    if (canvas.width !== 960 || canvas.height !== 580) {
      canvas.width = 960;
      canvas.height = 580;
    }
    const c = ctx2d(canvas);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, 960, 580);
    c.save();
    c.scale(2, 2);
    const W = 480, H = 290;
    const layout = makeLayout(state);
    Art.lastLayout = layout;
    const date = U.dateOf(state.week);
    const season = date.season;
    const phase = ((t * 0.0035) + 0.18) % 1;
    const sky = skyColors(phase);
    // room
    px(c, 0, 0, W, H, P.ink);
    drawWall(c, W, sky, season, phase, t);
    drawFloor(c, W, H, season, state);
    drawBackFurniture(c, state, t);
    drawFumeHood(c, state, t);
    drawBenches(c, state, t);
    drawFixedInstruments(c, state, t);
    drawEquipment(c, state, t);
    drawDesks(c, state, t, layout);
    drawPeople(c, state, layout, t);
    drawPlayer(c, state, t);
    drawForeground(c, state, t);
    drawExpansion(c, state, t);
    drawWallDecor(c, state, t);
    drawWeatherInside(c, state, t, season, phase);
    drawInteractHighlight(c, state, t, ui);
    drawLighting(c, W, H, phase, t);
    c.restore();
    return layout;
  };

  let hdPlayerCanvas = null;
  function drawPlayerHD(c, state, t) {
    const p = state.player;
    if (!hdPlayerCanvas) {
      hdPlayerCanvas = document.createElement('canvas');
      hdPlayerCanvas.width = 72;
      hdPlayerCanvas.height = 112;
    }
    const tmp = hdPlayerCanvas;
    const tc = ctx2d(tmp);
    tc.clearRect(0, 0, tmp.width, tmp.height);
    const fake = { player: { x: 36, y: 84, facing: p.facing, moving: p.moving }, look: state.look };
    drawPlayer(tc, fake, t);
    c.imageSmoothingEnabled = false;
    c.drawImage(tmp, Math.round(p.x - 90), Math.round(p.y - 220), 180, 282);
  }

  function drawPlaceScene(canvas, state, t, id, ui) {
    const cfg = Art.SCENE_CONFIG[id] || { w: 960, h: 580 };
    if (canvas.width !== cfg.w || canvas.height !== cfg.h) {
      canvas.width = cfg.w;
      canvas.height = cfg.h;
    }
    const c = ctx2d(canvas);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cfg.w, cfg.h);
    const phase = ((t * 0.0035) + 0.18) % 1;
    const sky = skyColors(phase);
    if (id === 'tech') drawTechPlace(c, t, sky);
    else if (id === 'market') drawMarketPlace(c, t, sky, phase);
    else if (id === 'delivery') drawDeliveryPlace(c, t, sky);
    else if (id === 'lake') drawLakePlace(c, t, sky, phase);
    if (id === 'lake' && ui && ui.fishing && (ui.fishing.phase === 'cast' || ui.fishing.phase === 'bite')) {
      const bx = 480 + Math.sin(t * 2.2) * (ui.fishing.phase === 'bite' ? 8 : 2);
      const by = 430 + Math.sin(t * 3.1) * 2;
      c.strokeStyle = 'rgba(240,235,215,.75)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(state.player.x + 18, state.player.y - 58);
      c.quadraticCurveTo((state.player.x + bx) / 2, by - 46, bx, by);
      c.stroke();
      px(c, bx - 4, by - 4, 9, 7, '#f2e4c8');
      px(c, bx - 2, by + 3, 5, 3, '#b54a3a');
      px(c, bx - 12, by + 8, 24, 2, 'rgba(220,245,235,.45)');
      px(c, bx - 7, by + 12, 14, 1, 'rgba(220,245,235,.3)');
    }
    drawPlayerHD(c, state, t);
    // soft vignette to match the lab's lighting language
    const grd = c.createRadialGradient(480, 300, 160, 480, 300, 650);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(10,8,16,0.32)');
    c.fillStyle = grd;
    c.fillRect(0, 0, cfg.w, cfg.h);
    Art.lastLayout = null;
    return null;
  }

  function placeFloor(c, x, y, w, h, a, b, tile) {
    px(c, x, y, w, h, a);
    for (let yy = y; yy < y + h; yy += tile) {
      for (let xx = x + ((yy / tile) % 2 ? tile / 2 : 0); xx < x + w; xx += tile) {
        px(c, xx, yy, tile - 1, tile - 1, b);
        px(c, xx, yy, tile - 1, 1, mix(a, '#fff', 0.08));
      }
    }
  }

  function drawNpcBust(c, x, y, t, cfg) {
    cfg = cfg || {};
    const skin = cfg.skin || '#d9a878';
    const hair = cfg.hair || '#3a2e2a';
    const coat = cfg.coat || '#ddd3c0';
    const accent = cfg.accent || '#5b8fb9';
    const bob = Math.round(Math.sin(t * 1.8 + (cfg.phase || 0)) * 2);
    const yy = y + bob;
    // shoulders and torso
    px(c, x - 50, yy + 46, 100, 90, '#2b2633');
    px(c, x - 44, yy + 52, 88, 84, coat);
    px(c, x - 44, yy + 52, 88, 5, mix(coat, '#fff', 0.35));
    px(c, x - 38, yy + 58, 12, 72, mix(coat, '#fff', 0.12));
    px(c, x + 26, yy + 58, 12, 72, mix(coat, P.ink, 0.1));
    // shirt + tie
    px(c, x - 16, yy + 58, 32, 62, '#f4eddb');
    px(c, x - 5, yy + 60, 10, 44, accent);
    px(c, x - 2, yy + 62, 4, 24, mix(accent, '#fff', 0.3));
    // neck
    px(c, x - 10, yy + 34, 20, 18, shadeColor(skin, -18));
    px(c, x - 8, yy + 32, 16, 16, skin);
    // head
    px(c, x - 26, yy - 30, 52, 64, P.ink);
    px(c, x - 22, yy - 26, 44, 56, skin);
    px(c, x - 22, yy - 26, 44, 4, mix(skin, '#fff', 0.18));
    px(c, x - 30, yy + 2, 6, 16, shadeColor(skin, -9));
    px(c, x + 24, yy + 2, 6, 16, shadeColor(skin, -9));
    // hair
    px(c, x - 26, yy - 34, 52, 22, hair);
    px(c, x - 20, yy - 36, 40, 8, mix(hair, '#fff', 0.18));
    px(c, x - 30, yy - 18, 8, 24, hair);
    px(c, x + 22, yy - 18, 8, 24, hair);
    if (cfg.bun) { px(c, x - 12, yy - 46, 24, 18, hair); px(c, x - 8, yy - 44, 16, 4, mix(hair, '#fff', 0.2)); }
    // brows / eyes
    px(c, x - 16, yy - 2, 12, 3, shadeColor(hair, -12));
    px(c, x + 4, yy - 2, 12, 3, shadeColor(hair, -12));
    px(c, x - 16, yy + 4, 13, 7, '#fffdf4');
    px(c, x + 3, yy + 4, 13, 7, '#fffdf4');
    px(c, x - 10, yy + 4, 5, 7, P.ink);
    px(c, x + 8, yy + 4, 5, 7, P.ink);
    px(c, x - 9, yy + 5, 2, 2, '#fff');
    px(c, x + 9, yy + 5, 2, 2, '#fff');
    // nose / mouth / blush
    px(c, x - 2, yy + 13, 4, 8, shadeColor(skin, -13));
    px(c, x - 8, yy + 24, 16, 3, shadeColor(skin, -30));
    px(c, x - 8, yy + 26, 16, 1, 'rgba(255,225,210,.3)');
    px(c, x - 22, yy + 16, 7, 3, 'rgba(225,110,95,.22)');
    px(c, x + 15, yy + 16, 7, 3, 'rgba(225,110,95,.22)');
    if (cfg.glasses) {
      px(c, x - 18, yy + 2, 16, 2, P.ink); px(c, x - 18, yy + 2, 2, 11, P.ink);
      px(c, x - 18, yy + 12, 16, 2, P.ink); px(c, x - 4, yy + 2, 2, 11, P.ink);
      px(c, x + 2, yy + 2, 16, 2, P.ink); px(c, x + 2, yy + 2, 2, 11, P.ink);
      px(c, x + 2, yy + 12, 16, 2, P.ink); px(c, x + 16, yy + 2, 2, 11, P.ink);
      px(c, x - 2, yy + 6, 4, 2, P.ink);
    }
    // badge
    px(c, x + 24, yy + 72, 14, 18, P.cream);
    px(c, x + 27, yy + 75, 8, 3, accent);
  }

  function drawNpcScaled(c, x, y, scale, t, cfg) {
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    drawNpcBust(c, 0, 0, t, cfg);
    c.restore();
  }

  function drawTechPlace(c, t, sky) {
    px(c, 0, 0, 960, 580, '#1b1724');
    // wall
    px(c, 0, 68, 960, 270, '#cfc7b8');
    for (let y = 68; y < 338; y += 18) px(c, 0, y, 960, 1, 'rgba(70,60,50,.08)');
    placeFloor(c, 0, 338, 960, 242, '#a98e70', '#b79d7f', 28);
    // windows
    [90, 740].forEach(x => {
      px(c, x, 100, 150, 100, '#37465a');
      px(c, x + 6, 106, 138, 88, sky.top);
      px(c, x + 6, 150, 138, 44, sky.bottom);
      px(c, x + 72, 106, 5, 88, '#2b3440');
      px(c, x + 6, 148, 138, 4, '#2b3440');
      for (let i = 0; i < 8; i++) px(c, x + 16 + i * 15, 126 + (i % 3) * 13, 2, 2, 'rgba(255,235,180,.55)');
    });
    // grant board
    px(c, 300, 96, 340, 150, '#3a3030');
    px(c, 308, 104, 324, 134, '#e9dfc8');
    text(c, 'GRANT / PROJECT', 326, 116, '#5b4a36', 2);
    for (let i = 0; i < 4; i++) {
      px(c, 326, 140 + i * 22, 150, 8, i % 2 ? '#c9bda3' : '#d8ccb2');
      px(c, 486, 140 + i * 22, 110, 8, '#c2b296');
    }
    // counter
    px(c, 210, 306, 560, 88, '#2b2633');
    px(c, 220, 312, 540, 74, '#8b6b4e');
    px(c, 240, 318, 500, 10, '#a98a68');
    px(c, 260, 340, 160, 32, '#6f543d');
    px(c, 520, 340, 180, 32, '#6f543d');
    text(c, 'PROJECT OFFICE', 392, 348, '#f2e4c8', 2);
    // clerk
    drawNpcScaled(c, 480, 245, 0.58, t, { skin: '#d9a878', hair: '#3a2e2a', coat: '#ddd3c0', accent: '#5b8fb9', glasses: true, bun: true, phase: 0.4 });
    // framed certificates + ceiling lights + waiting chairs
    [[70, 150], [170, 150], [610, 150]].forEach(([x, y], i) => {
      px(c, x, y, 72, 54, '#3a3030'); px(c, x + 5, y + 5, 62, 44, '#e9dfc8');
      px(c, x + 16, y + 16, 40, 4, '#b8a78a'); px(c, x + 22, y + 28, 28, 3, '#c9bda3');
      px(c, x + 30, y + 38, 14, 4, i === 1 ? '#b06a8a' : '#5b8fb9');
    });
    for (let i = 0; i < 5; i++) {
      px(c, 80 + i * 200, 78, 100, 7, '#3a3030');
      px(c, 104 + i * 200, 85, 52, 4, 'rgba(255,245,205,.65)');
    }
    for (let i = 0; i < 3; i++) {
      px(c, 92 + i * 48, 420, 34, 9, '#6f543d');
      px(c, 96 + i * 48, 429, 5, 42, '#4f3b2b');
      px(c, 118 + i * 48, 429, 5, 42, '#4f3b2b');
    }
    // shelves + plants + stacks
    px(c, 760, 190, 120, 160, '#4f5b58');
    for (let i = 0; i < 4; i++) { px(c, 768, 200 + i * 36, 104, 4, '#2b2633'); for (let k = 0; k < 5; k++) px(c, 772 + k * 20, 206 + i * 36, 12, 22, ['#b06a8a','#5b8fb9','#d4b04e','#57b8a6','#c9bda3'][k]); }
    px(c, 40, 240, 44, 90, '#3b5a45'); px(c, 30, 300, 64, 30, '#6f543d');
    for (let i = 0; i < 6; i++) px(c, 44 + (i * 7) % 30, 226 + (i % 3) * 8, 12, 8, '#6fa66a');
    // door + sign
    px(c, 24, 320, 90, 180, '#2b2633');
    px(c, 32, 328, 74, 164, '#5b4a3a');
    text(c, 'EXIT', 48, 470, '#d8c7a8', 2);
  }

  function drawMarketPlace(c, t, sky, phase) {
    px(c, 0, 0, 960, 580, sky.top);
    px(c, 0, 120, 960, 220, sky.bottom);
    // distant buildings
    for (let i = 0; i < 12; i++) {
      const x = i * 84, h = 80 + (i * 37) % 90;
      px(c, x, 300 - h, 72, h, mix('#283444', sky.bottom, 0.15));
      for (let y = 0; y < 6; y++) px(c, x + 10 + (y % 2) * 20, 310 - h + y * 16, 4, 6, 'rgba(255,225,150,.32)');
    }
    placeFloor(c, 0, 330, 960, 250, '#7c7164', '#8b8071', 26);
    // street line
    px(c, 0, 330, 960, 6, '#c7b48e');
    // stalls
    const stall = (x, color, title) => {
      px(c, x, 250, 190, 120, '#3a3030');
      px(c, x + 8, 258, 174, 104, '#8b6b4e');
      for (let i = 0; i < 6; i++) px(c, x + 8 + i * 29, 220, 29, 38, i % 2 ? color : '#f1e2c4');
      px(c, x + 8, 300, 174, 10, '#6f543d');
      for (let i = 0; i < 5; i++) px(c, x + 22 + i * 30, 272, 18, 20, ['#b06a8a','#5b8fb9','#d4b04e','#57b8a6','#c9bda3'][i]);
      text(c, title, x + 38, 236, '#2b2633', 2);
    };
    stall(110, '#b06a8a', 'OLD PARTS');
    stall(620, '#57b8a6', 'FIELD GOODS');
    // crates
    for (let i = 0; i < 6; i++) { px(c, 350 + (i % 3) * 45, 400 + Math.floor(i / 3) * 38, 40, 32, '#6f543d'); px(c, 354 + (i % 3) * 45, 404 + Math.floor(i / 3) * 38, 32, 4, '#a98a68'); }
    // vendor
    drawNpcScaled(c, 480, 275, 0.58, t, { skin: '#b9825d', hair: '#4a3330', coat: '#d4b04e', accent: '#7aa66a', glasses: false, phase: 1.7 });
    // lamps
    for (let i = 0; i < 3; i++) { px(c, 80 + i * 390, 160, 4, 120, '#2b2633'); px(c, 66 + i * 390, 152, 32, 8, '#d4b04e'); px(c, 74 + i * 390, 144, 16, 10, 'rgba(255,225,130,.4)'); }
    // string lights and puddles
    for (let i = 0; i < 18; i++) {
      const x = 20 + i * 55, y = 170 + Math.sin(i * 0.8) * 12;
      px(c, x, y, 2, 2, '#d4b04e');
      px(c, x - 1, y + 2, 4, 2, 'rgba(255,215,120,.25)');
    }
    for (let i = 0; i < 4; i++) {
      px(c, 180 + i * 180, 505 + (i % 2) * 18, 60, 5, 'rgba(130,180,190,.25)');
      px(c, 188 + i * 180, 510 + (i % 2) * 18, 30, 3, 'rgba(200,230,235,.22)');
    }
    // exit
    px(c, 24, 380, 90, 150, '#2b2633'); px(c, 32, 388, 74, 134, '#5b4a3a'); text(c, 'EXIT', 48, 500, '#d8c7a8', 2);
  }

  function drawDeliveryPlace(c, t, sky) {
    px(c, 0, 0, 960, 580, '#222735');
    px(c, 0, 70, 960, 280, '#59616b');
    for (let y = 70; y < 350; y += 16) px(c, 0, y, 960, 1, 'rgba(20,20,28,.12)');
    placeFloor(c, 0, 350, 960, 230, '#686b6f', '#777a7e', 30);
    // roller door
    px(c, 600, 110, 300, 220, '#2b2633');
    for (let i = 0; i < 9; i++) px(c, 610, 120 + i * 22, 280, 4, '#4e5258');
    px(c, 610, 318, 280, 10, '#d4b04e');
    // dispatch board
    px(c, 250, 110, 290, 180, '#2b2633');
    px(c, 258, 118, 274, 164, '#e9dfc8');
    text(c, 'DELIVERY BOARD', 280, 134, '#3d4b57', 2);
    for (let i = 0; i < 4; i++) { px(c, 278, 164 + i * 26, 110, 8, '#c9bda3'); px(c, 400, 164 + i * 26, 108, 8, '#9fb7a7'); }
    // counter
    px(c, 200, 330, 460, 70, '#3a3030'); px(c, 210, 336, 440, 54, '#8b6b4e');
    text(c, 'PICK UP', 380, 356, '#f2e4c8', 2);
    // dispatcher
    drawNpcScaled(c, 430, 285, 0.56, t, { skin: '#d9a878', hair: '#2b2430', coat: '#4e5258', accent: '#e08a5b', glasses: false, phase: 0.9 });
    // bikes
    for (let i = 0; i < 3; i++) {
      const x = 80 + i * 70, y = 420;
      c.strokeStyle = '#d8d2c4'; c.lineWidth = 4;
      c.beginPath(); c.arc(x, y, 22, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x + 52, y, 22, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26, y - 34); c.lineTo(x + 52, y); c.lineTo(x + 26, y); c.closePath(); c.stroke();
    }
    // scooter
    px(c, 690, 410, 80, 30, '#b06a8a'); px(c, 710, 380, 30, 40, '#2b2633');
    px(c, 682, 438, 26, 16, '#1b1724'); px(c, 756, 438, 26, 16, '#1b1724');
    // wall clock, safety sign, cones, boxes
    px(c, 560, 180, 34, 34, '#2b2633'); px(c, 564, 184, 26, 26, '#e9dfc8');
    px(c, 576, 190, 2, 9, '#2b2633'); px(c, 576, 198, 7, 2, '#2b2633');
    px(c, 60, 180, 74, 50, '#d4b04e'); px(c, 66, 186, 62, 38, '#2b2633');
    text(c, 'SAFETY', 72, 198, '#d4b04e', 1);
    for (let i = 0; i < 4; i++) {
      px(c, 330 + i * 22, 500, 16, 14, '#e08a5b');
      px(c, 336 + i * 22, 506, 4, 8, '#f4ead6');
    }
    for (let i = 0; i < 5; i++) { px(c, 720 + (i % 3) * 36, 360 + Math.floor(i / 3) * 32, 32, 28, '#a98a68'); }
    px(c, 24, 380, 90, 150, '#2b2633'); px(c, 32, 388, 74, 134, '#5b4a3a'); text(c, 'EXIT', 48, 500, '#d8c7a8', 2);
  }

  function drawLakePlace(c, t, sky, phase) {
    px(c, 0, 0, 960, 280, sky.top);
    px(c, 0, 120, 960, 160, sky.bottom);
    // distant city
    for (let i = 0; i < 14; i++) { const h = 40 + (i * 31) % 90; px(c, i * 72, 270 - h, 58, h, mix('#2c3a4e', sky.bottom, 0.2)); }
    // water
    px(c, 0, 280, 960, 190, '#3b6f78');
    for (let y = 286; y < 470; y += 10) {
      for (let x = 0; x < 960; x += 40) {
        const off = Math.sin(t * 0.8 + y * 0.08 + x * 0.01) * 8;
        px(c, x + off, y, 22, 2, 'rgba(205,235,225,.22)');
      }
    }
    // far shore
    px(c, 0, 276, 960, 10, '#6d8a62');
    for (let i = 0; i < 18; i++) px(c, i * 58, 250 - (i % 3) * 10, 40, 26, '#3f5a3a');
    // wooden boardwalk along the near shore
    placeFloor(c, 0, 470, 960, 110, '#6f543d', '#7d6046', 30);
    for (let x = 0; x < 960; x += 30) px(c, x, 470, 2, 110, '#4f3b2b');
    px(c, 0, 468, 960, 4, '#a98a68');
    // dock reaching into the water
    px(c, 330, 360, 300, 110, '#6f543d');
    for (let i = 0; i < 10; i++) px(c, 334 + i * 30, 360, 4, 110, '#4f3b2b');
    px(c, 320, 360, 12, 110, '#4f3b2b'); px(c, 630, 360, 12, 110, '#4f3b2b');
    // reeds
    for (let i = 0; i < 26; i++) {
      const x = 20 + (i * 37) % 300, y = 320 + (i * 13) % 80;
      px(c, x, y, 2, 38 + (i % 4) * 8, '#5e8a5e'); px(c, x - 2, y + 20, 6, 3, '#8fae6e');
    }
    // boat + shed + sign
    px(c, 690, 380, 120, 24, '#8b6b4e'); px(c, 710, 350, 80, 30, '#d8c7a8');
    px(c, 710, 350, 80, 6, '#b06a8a');
    px(c, 680, 440, 190, 110, '#4f5b58'); px(c, 690, 450, 170, 88, '#c9bda3');
    text(c, 'LAKE SHOP', 720, 466, '#3d4b57', 2);
    // bench, lantern, net
    px(c, 170, 500, 110, 10, '#6f543d');
    px(c, 178, 510, 6, 28, '#4f3b2b'); px(c, 266, 510, 6, 28, '#4f3b2b');
    px(c, 180, 494, 90, 6, '#8b6b4e');
    px(c, 860, 380, 6, 120, '#3a3030'); px(c, 850, 374, 26, 12, '#d4b04e');
    px(c, 854, 386, 18, 8, 'rgba(255,225,130,.35)');
    for (let i = 0; i < 8; i++) px(c, 210 + i * 13, 476 - (i % 3) * 8, 2, 28, '#d8c7a8');
    // exit
    px(c, 24, 470, 90, 80, '#2b2633'); px(c, 32, 476, 74, 70, '#5b4a3a'); text(c, 'EXIT', 48, 520, '#d8c7a8', 2);
  }

  function skyColors(phase) {
    // 0 night, .22 dawn, .4 day, .68 dusk, 1 night
    if (phase < 0.18 || phase > 0.82) return { top: '#1a2340', bottom: '#2a3352', light: 0.2 };
    if (phase < 0.3) return { top: '#7b6d8e', bottom: '#d99a7a', light: 0.6 };
    if (phase < 0.62) return { top: '#79b8cd', bottom: '#c9dfd5', light: 1 };
    if (phase < 0.74) return { top: '#b06a7a', bottom: '#e0a06a', light: 0.7 };
    return { top: '#2a2f4e', bottom: '#4a4664', light: 0.35 };
  }

  function drawWall(c, W, sky, season, phase, t) {
    px(c, 0, 0, W, 58, P.wall);
    // wall texture
    for (let x = 0; x < W; x += 8) {
      px(c, x, 0, 1, 58, x % 16 ? 'rgba(120,95,70,0.08)' : 'rgba(255,255,255,0.1)');
    }
    px(c, 0, 0, W, 4, '#8f7b63');
    px(c, 0, 54, W, 5, P.wallDark);
    px(c, 0, 58, W, 2, P.ink);
    // windows
    drawSceneWindow(c, 30, 10, 88, 40, sky, season, phase, t, 0);
    drawSceneWindow(c, 326, 10, 94, 40, sky, season, phase, t, 1);
    // whiteboard
    drawWhiteboard(c, 122, 7, 112, 44, t);
    // clock
    px(c, 238, 14, 8, 8, P.ink);
    px(c, 239, 15, 6, 6, P.cream);
    px(c, 242, 17, 1, 3, P.ink);
    px(c, 243, 19, 2, 1, P.ink);
    // wall vents
    px(c, 238, 38, 6, 14, '#8f7b63');
    for (let i = 0; i < 4; i++) px(c, 239, 40 + i * 3, 4, 1, '#b9a488');
    // baseboard shadow
    px(c, 0, 60, W, 5, 'rgba(60,40,25,0.12)');
  }

  function drawSceneWindow(c, x, y, w, h, sky, season, phase, t, idx) {
    px(c, x - 3, y - 3, w + 6, h + 6, P.woodDark);
    px(c, x, y, w, h, '#1a2438');
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, sky.top);
    g.addColorStop(1, sky.bottom);
    c.fillStyle = g;
    c.fillRect(x, y, w, h);
    // skyline
    for (let i = 0; i < 9; i++) {
      const bw = 8 + ((idx * 5 + i * 7) % 12);
      const bh = 8 + ((i * 13 + idx * 7) % 18);
      px(c, x + 4 + i * 11, y + h - bh - 2, bw, bh, sky.light < 0.4 ? '#1a2238' : '#8798a5');
      if (sky.light < 0.4) {
        for (let j = 0; j < 2; j++) {
          if ((i + j) % 3) px(c, x + 6 + i * 11, y + h - bh + 3 + j * 5, 1, 1, 'rgba(240,200,110,0.5)');
        }
      }
    }
    // weather
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    if (season.key === 'spring') {
      c.strokeStyle = 'rgba(180,210,230,0.35)';
      for (let i = 0; i < 26; i++) {
        const rx = x + (U.seededNoise(i, 1, idx + 2) * w + t * 18) % w;
        const ry = y + (U.seededNoise(i, 2, idx + 3) * h + t * 74) % h;
        c.beginPath();
        c.moveTo(rx, ry);
        c.lineTo(rx - 1, ry + 4);
        c.stroke();
      }
    } else if (season.key === 'summer') {
      const sunX = x + w * 0.75;
      const sunY = y + 10;
      px(c, sunX, sunY, 8, 8, 'rgba(255,240,170,0.9)');
      px(c, sunX + 2, sunY + 2, 4, 4, '#fff6c8');
    } else if (season.key === 'autumn') {
      for (let i = 0; i < 12; i++) {
        const rx = x + (U.seededNoise(i, 1, idx + 4) * w + t * 8) % w;
        const ry = y + (U.seededNoise(i, 2, idx + 5) * h + t * 30) % h;
        px(c, rx, ry, 2, 1, i % 2 ? '#d58a4a' : '#b06a42');
      }
    } else {
      for (let i = 0; i < 22; i++) {
        const rx = x + (U.seededNoise(i, 1, idx + 6) * w + t * 7) % w;
        const ry = y + (U.seededNoise(i, 2, idx + 7) * h + t * 22) % h;
        px(c, rx, ry, 1, 1, 'rgba(235,245,255,0.75)');
        if (i % 3 === 0) px(c, rx + 1, ry, 1, 1, 'rgba(235,245,255,0.45)');
      }
    }
    c.restore();
    // frame mullions
    px(c, x, y, w, 2, P.woodDark);
    px(c, x, y + h - 2, w, 2, P.woodDark);
    px(c, x, y, 2, h, P.woodDark);
    px(c, x + w - 2, y, 2, h, P.woodDark);
    px(c, x + w / 2 - 1, y, 2, h, P.woodDark);
    px(c, x, y + h / 2 - 1, w, 2, P.woodDark);
    // sill
    px(c, x - 4, y + h + 1, w + 8, 3, P.woodLight);
    // plant on sill
    if (idx === 1) {
      px(c, x + 8, y + h - 6, 6, 5, '#b06a42');
      px(c, x + 6, y + h - 12, 10, 7, P.green);
      px(c, x + 8, y + h - 15, 5, 4, P.green);
    }
  }

  function drawFloor(c, W, H, season, state) {
    for (let y = 62; y < H; y += 16) {
      for (let x = 0; x < W; x += 16) {
        const n = U.seededNoise(x / 16, y / 16, 4);
        let col = ((x / 16 + y / 16) % 2) ? P.floorA : P.floorB;
        if (n > 0.86) col = P.floorC;
        px(c, x, y, 16, 16, col);
        px(c, x, y + 15, 16, 1, 'rgba(90,70,50,0.16)');
        px(c, x + 15, y, 1, 16, 'rgba(90,70,50,0.1)');
        if (n > 0.93) px(c, x + 3, y + 4, 3, 1, 'rgba(90,70,50,0.12)');
      }
    }
    // aisle wear marks
    px(c, 150, 204, 200, 3, 'rgba(90,70,50,0.07)');
    px(c, 174, 210, 150, 2, 'rgba(90,70,50,0.05)');
    // cable strip to island
    px(c, 240, 166, 3, 14, '#2a2a2a');
    px(c, 204, 180, 74, 2, '#2a2a2a');
    // scuffs
    for (let i = 0; i < 8; i++) {
      px(c, 40 + i * 51, 250 + (i % 3) * 12, 5, 1, 'rgba(80,60,40,0.12)');
    }
    // unopened expansion wing (level 1)
    if (state.labLevel < 2) {
      px(c, 382, 58, 98, 232, '#151721');
      for (let y = 62; y < 290; y += 16) {
        px(c, 382, y, 98, 1, 'rgba(255,255,255,0.03)');
      }
      for (let x = 386; x < 480; x += 22) {
        px(c, x, 62, 1, 224, 'rgba(255,255,255,0.025)');
      }
      // construction clutter
      px(c, 402, 232, 28, 30, '#3b3329');
      px(c, 406, 236, 20, 3, '#5b4a35');
      px(c, 438, 218, 22, 44, '#2c2a2a');
      px(c, 442, 224, 14, 4, '#45403a');
    }
  }

  function drawBackFurniture(c, state, t) {
    // bookshelf (expansion wing only)
    if (state.labLevel >= 2) {
      const bx = 398, by = 7, bw = 66, bh = 48;
      px(c, bx, by, bw, bh, P.woodDark);
      px(c, bx + 2, by + 2, bw - 4, bh - 4, P.wood);
      px(c, bx + 3, by + 4, bw - 6, 2, P.woodLight);
      // shelves
      for (let row = 0; row < 3; row++) {
        const sy = by + 6 + row * 14;
        px(c, bx + 3, sy + 11, bw - 6, 2, P.woodDark);
        let xx = bx + 5;
        for (let i = 0; i < 12; i++) {
          const wBook = 3 + (i % 3);
          const hBook = 8 + (i % 4);
          const cols = [P.coral, P.teal, P.gold, P.blue, P.pink, P.green];
          px(c, xx, sy + 11 - hBook, wBook, hBook, cols[(i + row) % cols.length]);
          px(c, xx, sy + 11 - hBook, 1, hBook, 'rgba(255,255,255,0.25)');
          xx += wBook + 1;
        }
      }
      // paper stacks on top
      const pcount = Math.min(6, Math.ceil((state.stats.papers || 0) / 2));
      for (let i = 0; i < pcount; i++) {
        px(c, bx + 8 + i * 3, by - 3 - i, 12, 3, P.cream);
        px(c, bx + 8 + i * 3, by - 3 - i, 12, 1, '#d8ccb4');
      }
    }
  }

  function drawWhiteboard(c, x, y, w, h, t) {
    px(c, x - 2, y - 2, w + 4, h + 4, P.metalDark);
    px(c, x, y, w, h, '#f4f0e2');
    px(c, x, y, w, 2, '#ffffff');
    px(c, x + 2, y + 3, w - 4, h - 6, '#ebe6d6');
    // scribbles
    const cols = [P.teal, P.coral, P.blue, P.gold];
    for (let i = 0; i < 16; i++) {
      const lx = x + 6 + (U.seededNoise(i, 1, 2) * (w - 16)) | 0;
      const ly = y + 6 + (U.seededNoise(i, 2, 3) * (h - 14)) | 0;
      const lw = 4 + (U.seededNoise(i, 3, 4) * 18) | 0;
      px(c, lx, ly, lw, 1, cols[i % cols.length]);
    }
    // diagram
    px(c, x + 12, y + 14, 18, 12, P.teal);
    px(c, x + 40, y + 10, 14, 16, P.coral);
    px(c, x + 66, y + 18, 18, 8, P.blue);
    px(c, x + 30, y + 19, 10, 1, P.ink);
    px(c, x + 54, y + 18, 12, 1, P.ink);
    // sticky notes
    px(c, x + 92, y + 8, 14, 12, P.goldLight);
    px(c, x + 92, y + 8, 14, 1, '#fff2b8');
    px(c, x + 96, y + 12, 6, 1, '#a8863a');
    px(c, x + 92, y + 24, 14, 11, P.coralLight);
    px(c, x + 96, y + 28, 6, 1, '#a64a36');
    // tray
    px(c, x + 4, y + h - 1, 30, 2, P.metal);
    px(c, x + 8, y + h - 3, 12, 2, P.cream);
    px(c, x + 22, y + h - 3, 10, 2, P.coral);
  }

  function drawBenches(c, state, t) {
    // left bench
    drawBench(c, ROOM.leftBench.x, ROOM.leftBench.y, ROOM.leftBench.w, ROOM.leftBench.h);
    // center island
    drawIsland(c, ROOM.island.x, ROOM.island.y, ROOM.island.w, ROOM.island.h, state, t);
    // right bench is revealed after expansion
    if (state.labLevel >= 2) {
      drawBench(c, 408, 78, 62, 132);
    }
  }

  function drawBench(c, x, y, w, h) {
    px(c, x, y, w, h, P.metalDark);
    px(c, x + 1, y + 1, w - 2, h - 2, P.metal);
    px(c, x + 2, y + 2, w - 4, 9, P.metalLight);
    px(c, x + 2, y + 11, w - 4, h - 13, '#7c838a');
    // cabinet doors
    for (let i = 0; i < 3; i++) {
      const dy = y + 24 + i * 34;
      px(c, x + 5, dy, w - 10, 28, '#6a7279');
      px(c, x + 7, dy + 2, w - 14, 24, '#7f878e');
      px(c, x + w - 12, dy + 13, 4, 2, P.metalLight);
    }
    // top edge
    px(c, x, y, w, 2, P.ink);
    px(c, x, y + h - 2, w, 2, P.ink);
    // small tools
    px(c, x + 5, y + 3, 7, 3, P.coral);
    px(c, x + 14, y + 4, 3, 2, P.gold);
  }

  function drawIsland(c, x, y, w, h, state, t) {
    px(c, x, y, w, h, P.ink);
    px(c, x + 1, y + 1, w - 2, h - 2, P.metal);
    px(c, x + 2, y + 2, w - 4, 12, P.metalLight);
    px(c, x + 2, y + 14, w - 4, h - 16, '#737b82');
    // sink
    px(c, x + w - 44, y + 6, 28, 14, '#5d666e');
    px(c, x + w - 42, y + 8, 24, 10, '#3d454c');
    px(c, x + w - 32, y + 3, 3, 7, P.metalLight);
    // faucet
    px(c, x + w - 31, y + 2, 2, 5, P.metalLight);
    px(c, x + w - 34, y + 2, 5, 2, P.metalLight);
    // reagent rack
    px(c, x + 12, y + 4, 38, 10, P.woodDark);
    px(c, x + 13, y + 5, 36, 8, P.wood);
    for (let i = 0; i < 7; i++) {
      const cols = [P.tealLight, P.coral, P.gold, P.blueLight, P.pink, P.green];
      px(c, x + 15 + i * 5, y + 2, 3, 7, cols[i % cols.length]);
      px(c, x + 15 + i * 5, y + 2, 1, 2, 'rgba(255,255,255,0.5)');
    }
    // glassware
    px(c, x + 70, y + 4, 5, 9, 'rgba(200,230,235,0.55)');
    px(c, x + 78, y + 6, 4, 7, 'rgba(200,230,235,0.45)');
    px(c, x + 88, y + 3, 3, 10, 'rgba(200,230,235,0.5)');
    // laptop / notebook
    px(c, x + 58, y + 5, 16, 10, '#2b2f3a');
    px(c, x + 60, y + 6, 12, 7, '#6fa0b8');
    px(c, x + 78, y + 7, 14, 8, P.cream);
    px(c, x + 80, y + 9, 10, 1, '#a89c8a');
    // under-counter boxes
    for (let i = 0; i < 3; i++) {
      px(c, x + 8 + i * 16, y + h - 12, 12, 10, i % 2 ? '#6b5d4d' : '#7d6b55');
    }
    // cabinet doors
    for (let i = 0; i < 5; i++) {
      px(c, x + 74 + i * 26, y + h - 10, 22, 8, '#5f676e');
      px(c, x + 76 + i * 26, y + h - 8, 18, 4, '#798188');
      px(c, x + 83 + i * 26, y + h - 6, 4, 1, '#b8bec2');
    }
    // stools
    for (let i = 0; i < 3; i++) {
      const sx = x + 44 + i * 58;
      const sy = y + h + 9;
      px(c, sx, sy + 4, 14, 3, 'rgba(20,15,20,0.2)');
      px(c, sx + 1, sy, 12, 5, P.ink);
      px(c, sx + 2, sy + 1, 10, 3, '#8f6c4f');
      px(c, sx + 4, sy + 5, 2, 6, '#5e4330');
      px(c, sx + 10, sy + 5, 2, 6, '#5e4330');
    }
  }

  function drawFumeHood(c, state, t) {
    const x = ROOM.fume.x, y = ROOM.fume.y, w = ROOM.fume.w, h = ROOM.fume.h;
    // duct
    px(c, x + 26, 32, 18, 28, '#6d777e');
    px(c, x + 28, 32, 14, 26, '#8e989f');
    px(c, x + 30, 34, 10, 2, '#b9c2c7');
    // outer frame / canopy
    px(c, x - 4, y - 4, w + 8, 6, '#4b555c');
    px(c, x - 4, y - 4, w + 8, 2, '#8e989f');
    px(c, x - 2, y - 2, w + 4, h + 4, P.ink);
    px(c, x, y, w, h, P.metalDark);
    px(c, x + 2, y + 3, w - 4, h - 6, '#7d878e');
    // side panels
    px(c, x + 1, y + 4, 3, h - 8, '#59646b');
    px(c, x + w - 4, y + 4, 3, h - 8, '#59646b');
    // glass sash
    px(c, x + 5, y + 5, w - 10, 22, '#8bbbc4');
    px(c, x + 7, y + 7, w - 14, 18, 'rgba(210,240,245,0.55)');
    px(c, x + 7, y + 7, w - 14, 2, 'rgba(255,255,255,0.75)');
    px(c, x + 10, y + 10, 12, 1, 'rgba(255,255,255,0.5)');
    px(c, x + 24, y + 12, 8, 1, 'rgba(255,255,255,0.35)');
    // interior
    px(c, x + 5, y + 27, w - 10, 11, '#4c565c');
    px(c, x + 8, y + 29, 10, 7, '#d9d2c0');
    px(c, x + 20, y + 30, 5, 6, P.tealLight);
    px(c, x + 28, y + 30, 5, 6, P.coral);
    px(c, x + 37, y + 29, 9, 7, '#b9b2a2');
    // sash handle
    px(c, x + w / 2 - 10, y + 21, 20, 3, '#c3c9cc');
    // control panel
    px(c, x + w - 20, y + 4, 14, 7, '#303840');
    px(c, x + w - 18, y + 6, 5, 3, '#73d0b8');
    px(c, x + w - 11, y + 6, 3, 3, P.gold);
    // hood label on the canopy
    px(c, x + 24, y - 4, 32, 9, '#1d3038');
    text(c, 'FUME', x + 27, y - 2, P.goldLight, 1);
    px(c, x + 50, y - 2, 3, 5, P.tealLight);
    // caution stripes
    for (let i = 0; i < 4; i++) {
      px(c, x + 6 + i * 8, y + h - 4, 5, 2, i % 2 ? P.gold : P.ink);
    }
    // exhaust shimmer
    const a = 0.12 + Math.sin(t * 1.4) * 0.04;
    px(c, x + 33, 36, 4, 20, 'rgba(220,240,245,' + a + ')');
  }

  function drawFixedInstruments(c, state, t) {
    // glovebox on the left bench
    const gx = 16, gy = 82;
    px(c, gx + 1, gy + 37, 50, 3, 'rgba(20,15,20,0.22)');
    px(c, gx, gy, 52, 38, P.ink);
    px(c, gx + 1, gy + 1, 50, 36, '#aebdc1');
    px(c, gx + 3, gy + 4, 46, 20, '#dce7e8');
    px(c, gx + 5, gy + 6, 42, 16, 'rgba(190,225,230,0.55)');
    px(c, gx + 5, gy + 6, 42, 2, 'rgba(255,255,255,0.7)');
    // gloves
    px(c, gx + 11, gy + 12, 9, 9, '#7d8b90');
    px(c, gx + 13, gy + 10, 5, 11, '#9aa8ac');
    px(c, gx + 30, gy + 12, 9, 9, '#7d8b90');
    px(c, gx + 32, gy + 10, 5, 11, '#9aa8ac');
    px(c, gx + 15, gy + 21, 3, 3, P.ink);
    px(c, gx + 34, gy + 21, 3, 3, P.ink);
    // gauge + ports
    px(c, gx + 39, gy + 3, 8, 8, P.ink);
    px(c, gx + 40, gy + 4, 6, 6, P.cream);
    px(c, gx + 42, gy + 5, 2, 3, P.coral);
    px(c, gx + 4, gy + 30, 14, 5, '#7b878d');
    px(c, gx + 35, gy + 30, 12, 5, '#7b878d');
    // balance on left bench
    const bx = 18, by = 136;
    px(c, bx + 2, by + 23, 30, 2, 'rgba(20,15,20,0.2)');
    px(c, bx, by + 10, 34, 13, P.ink);
    px(c, bx + 1, by + 11, 32, 11, '#c9c2b1');
    px(c, bx + 3, by + 12, 12, 5, '#2b3138');
    px(c, bx + 5, by + 13, 8, 3, '#7fd0c1');
    px(c, bx + 19, by + 12, 12, 8, '#e7e1d2');
    px(c, bx + 22, by + 13, 6, 2, '#a79f8e');
    // draft shield
    px(c, bx + 3, by - 4, 28, 16, 'rgba(180,220,225,0.28)');
    px(c, bx + 3, by - 4, 28, 1, 'rgba(255,255,255,0.65)');
    px(c, bx + 3, by + 10, 28, 1, 'rgba(255,255,255,0.45)');
    // microscope on island
    const mx = 134, my = 106;
    px(c, mx + 1, my + 25, 30, 3, 'rgba(20,15,20,0.2)');
    px(c, mx + 9, my + 2, 13, 6, '#3a4148');
    px(c, mx + 11, my + 1, 9, 4, P.metalLight);
    px(c, mx + 14, my + 8, 3, 9, P.metalDark);
    px(c, mx + 8, my + 16, 17, 5, P.metalLight);
    px(c, mx + 4, my + 21, 26, 4, P.metalDark);
    px(c, mx + 19, my + 11, 6, 6, '#8fb6c0');
    px(c, mx + 6, my + 10, 5, 5, '#d8e6e8');
    px(c, mx + 20, my + 7, 2, 4, P.coral);
    // pipette rack
    const px0 = 178, py0 = 112;
    px(c, px0, py0 + 16, 44, 4, P.ink);
    px(c, px0 + 1, py0 + 13, 42, 5, '#8e959c');
    for (let i = 0; i < 6; i++) {
      const cols = [P.tealLight, P.coral, P.gold, P.blueLight, P.pink, P.green];
      px(c, px0 + 3 + i * 6, py0 - 2, 3, 16, cols[i]);
      px(c, px0 + 3 + i * 6, py0 - 8, 3, 7, '#d8d2c4');
      px(c, px0 + 3 + i * 6, py0 - 10, 3, 2, P.ink);
      px(c, px0 + 4 + i * 6, py0 + 2, 1, 5, 'rgba(255,255,255,0.4)');
    }
    // computer workstation
    drawComputerDesk(c, state, t);
  }

  function drawComputerDesk(c, state, t) {
    const x = ROOM.computerDesk.x, y = ROOM.computerDesk.y, w = ROOM.computerDesk.w, h = ROOM.computerDesk.h;
    px(c, x + 2, y + h, w - 4, 4, 'rgba(20,15,20,0.22)');
    px(c, x, y, w, h, P.ink);
    px(c, x + 1, y + 1, w - 2, 12, '#a57a53');
    px(c, x + 1, y + 13, w - 2, h - 14, '#6e4e36');
    px(c, x + 5, y + 20, w - 10, 6, '#5a3f2b');
    // monitor
    px(c, x + 10, y - 14, 34, 22, P.ink);
    px(c, x + 11, y - 13, 32, 20, '#3a4650');
    px(c, x + 13, y - 11, 28, 16, '#7fb2c0');
    px(c, x + 15, y - 9, 18, 2, 'rgba(230,250,255,0.75)');
    px(c, x + 18, y - 5, 12, 1, '#d8eef2');
    px(c, x + 26, y + 8, 3, 4, P.metalDark);
    px(c, x + 19, y + 12, 15, 2, P.metalDark);
    // second monitor
    px(c, x + 48, y - 10, 22, 18, P.ink);
    px(c, x + 49, y - 9, 20, 16, '#34414b');
    px(c, x + 51, y - 7, 16, 12, '#587e88');
    px(c, x + 55, y - 5, 8, 1, '#a8d5dc');
    // keyboard + tower
    px(c, x + 12, y + 16, 30, 5, '#d8d2c4');
    px(c, x + 13, y + 17, 28, 3, '#bdb6a8');
    px(c, x + 62, y + 18, 8, 22, '#3b4148');
    px(c, x + 63, y + 20, 6, 3, '#5e666e');
    px(c, x + 63, y + 25, 6, 1, P.tealLight);
    // phone + mug + papers
    px(c, x + 50, y + 2, 9, 12, '#2a2e36');
    px(c, x + 51, y + 3, 7, 8, '#6f8fd6');
    px(c, x + 52, y + 12, 5, 1, P.ink);
    px(c, x + 43, y + 15, 7, 7, P.coral);
    px(c, x + 45, y + 16, 3, 3, '#6b3127');
    px(c, x + 2, y + 4, 10, 12, P.cream);
    px(c, x + 4, y + 7, 6, 1, '#a89c8a');
    px(c, x + 4, y + 10, 4, 1, '#a89c8a');
  }

  Art.EQUIP_SLOTS = [
    { x: 222, y: 108 }, { x: 268, y: 108 }, { x: 18, y: 168 },
    { x: 412, y: 84 }, { x: 412, y: 140 }, { x: 412, y: 196 },
    { x: 340, y: 58 }, { x: 400, y: 238 }, { x: 444, y: 238 }
  ];

  function drawEquipment(c, state, t) {
    const slots = Art.EQUIP_SLOTS;
    const cap = Game.LAB_LEVELS[state.labLevel].equip;
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (i >= cap) {
        // locked construction
        if (i < cap + 2) {
          c.globalAlpha = 0.45;
          outline(c, s.x, s.y, 34, 28, P.metalDark);
          px(c, s.x + 12, s.y + 10, 10, 2, P.metalDark);
          px(c, s.x + 16, s.y + 6, 2, 10, P.metalDark);
          c.globalAlpha = 1;
        }
        continue;
      }
      const e = state.equipment[i];
      if (!e) {
        // empty slot marker
        c.globalAlpha = 0.4;
        outline(c, s.x, s.y + 4, 30, 22, P.metalDark);
        c.globalAlpha = 1;
        continue;
      }
      drawEquipSprite(c, e, s.x, s.y, t);
    }
  }

  function drawEquipSprite(c, e, x, y, t) {
    const def = Game.equipDef(e);
    if (!def) return;
    const cond = e.condition;
    // base shadow
    px(c, x + 2, y + 27, 32, 3, 'rgba(20,15,20,0.25)');
    c.save();
    if (cond < 25) c.globalAlpha = 0.75;
    switch (def.sprite) {
      case 'centrifuge':
        px(c, x + 2, y + 8, 32, 19, P.ink);
        px(c, x + 3, y + 9, 30, 17, P.metalLight);
        px(c, x + 4, y + 10, 28, 6, '#e2e6e7');
        px(c, x + 9, y + 12, 18, 12, '#4b535a');
        px(c, x + 13, y + 14, 10, 8, '#2e343a');
        px(c, x + 17, y + 15, 3, 3, P.tealLight);
        px(c, x + 7, y + 18, 2, 2, P.coral);
        px(c, x + 26, y + 18, 2, 2, P.gold);
        break;
      case 'microscope':
        px(c, x + 13, y + 4, 10, 8, P.ink);
        px(c, x + 14, y + 5, 8, 6, P.metalLight);
        px(c, x + 16, y + 1, 5, 4, P.metalDark);
        px(c, x + 18, y + 8, 2, 8, P.metalDark);
        px(c, x + 12, y + 16, 12, 3, P.metalLight);
        px(c, x + 8, y + 19, 20, 5, P.metalDark);
        px(c, x + 10, y + 20, 16, 2, '#aab0b5');
        px(c, x + 23, y + 13, 3, 5, P.metalLight);
        px(c, x + 9, y + 11, 5, 4, '#cfe4e8');
        break;
      case 'cleanbench':
        px(c, x + 1, y + 2, 34, 25, P.ink);
        px(c, x + 2, y + 3, 32, 23, '#c9d4d6');
        px(c, x + 4, y + 4, 28, 12, '#9fc4cc');
        px(c, x + 6, y + 6, 24, 8, 'rgba(220,245,248,0.65)');
        px(c, x + 4, y + 17, 28, 7, '#6d7a80');
        px(c, x + 8, y + 19, 4, 3, P.teal);
        px(c, x + 14, y + 19, 4, 3, P.teal);
        break;
      case 'printer3d':
        px(c, x + 3, y + 3, 30, 24, P.ink);
        px(c, x + 4, y + 4, 28, 22, '#3f4650');
        px(c, x + 6, y + 5, 24, 3, P.metalLight);
        px(c, x + 7, y + 8, 2, 14, P.metalLight);
        px(c, x + 27, y + 8, 2, 14, P.metalLight);
        px(c, x + 8, y + 19, 20, 2, P.metal);
        px(c, x + 15, y + 14, 6, 6, P.coral);
        px(c, x + 17, y + 9, 2, 6, P.gold);
        break;
      case 'glovebox':
        px(c, x + 1, y + 3, 34, 23, P.ink);
        px(c, x + 2, y + 4, 32, 21, '#b8c2c6');
        px(c, x + 4, y + 5, 28, 12, '#d9e4e6');
        px(c, x + 7, y + 8, 6, 7, 'rgba(100,130,140,0.35)');
        px(c, x + 21, y + 8, 6, 7, 'rgba(100,130,140,0.35)');
        px(c, x + 9, y + 18, 14, 5, '#7e8a90');
        px(c, x + 16, y + 18, 2, 5, P.ink);
        break;
      case 'gpu':
        px(c, x + 4, y + 1, 28, 26, P.ink);
        px(c, x + 5, y + 2, 26, 24, '#2c3038');
        for (let i = 0; i < 4; i++) {
          px(c, x + 7, y + 4 + i * 5, 22, 3, '#404650');
          px(c, x + 9, y + 5 + i * 5, 2, 1, i === 2 ? P.gold : P.tealLight);
        }
        px(c, x + 7, y + 23, 22, 1, P.metal);
        break;
      case 'microfluidics':
        px(c, x + 3, y + 5, 30, 20, P.ink);
        px(c, x + 4, y + 6, 28, 18, '#d5c9a8');
        px(c, x + 8, y + 9, 20, 12, '#e8dfc7');
        for (let i = 0; i < 3; i++) {
          px(c, x + 10, y + 11 + i * 3, 16, 1, P.teal);
          px(c, x + 10 + i * 5, y + 10, 1, 8, P.blue);
        }
        px(c, x + 6, y + 7, 3, 3, P.coral);
        break;
      case 'sequencer':
        px(c, x + 3, y + 2, 30, 25, P.ink);
        px(c, x + 4, y + 3, 28, 23, '#d9d2c0');
        px(c, x + 7, y + 5, 22, 10, '#26323a');
        px(c, x + 9, y + 7, 18, 6, '#5fa0a8');
        px(c, x + 9, y + 9, 12, 1, P.tealLight);
        px(c, x + 8, y + 18, 4, 3, P.coral);
        px(c, x + 14, y + 18, 4, 3, P.gold);
        px(c, x + 20, y + 18, 4, 3, P.teal);
        break;
      case 'sem':
        px(c, x + 13, y + 1, 12, 6, P.ink);
        px(c, x + 14, y + 2, 10, 4, P.metalLight);
        px(c, x + 16, y + 7, 8, 4, P.metalDark);
        px(c, x + 18, y + 11, 4, 10, P.metalLight);
        px(c, x + 15, y + 21, 12, 4, P.metalDark);
        px(c, x + 8, y + 25, 24, 2, P.ink);
        px(c, x + 23, y + 12, 4, 6, P.blue);
        break;
      case 'coffee':
        px(c, x + 8, y + 4, 20, 22, P.ink);
        px(c, x + 9, y + 5, 18, 20, '#4a4f58');
        px(c, x + 11, y + 7, 14, 7, '#232830');
        px(c, x + 13, y + 9, 10, 3, P.goldLight);
        px(c, x + 15, y + 17, 6, 5, P.cream);
        px(c, x + 15, y + 23, 6, 2, P.metal);
        // steam
        for (let i = 0; i < 3; i++) {
          px(c, x + 16 + Math.sin(t * 2 + i) * 2, y + 1 - i * 2, 1, 2, 'rgba(240,240,230,0.35)');
        }
        break;
      default:
        px(c, x + 4, y + 4, 28, 22, P.metal);
        break;
    }
    // condition light
    const light = cond > 55 ? P.tealLight : cond > 25 ? P.gold : P.coral;
    px(c, x + 30, y + 4, 2, 2, light);
    c.restore();
  }

  Art.equipThumb = function (def, size) {
    const S = size || 40;
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const c = ctx2d(cv);
    const fake = { defId: def.id, condition: 100 };
    const tmp = document.createElement('canvas');
    tmp.width = 40; tmp.height = 32;
    const tc = ctx2d(tmp);
    drawEquipSprite(tc, fake, 2, 2, 0);
    c.drawImage(tmp, 0, 0, 40, 32, 0, 0, S, S * 0.8);
    return cv.toDataURL();
  };

  function drawDesks(c, state, t, layout) {
    layout.desks.slice(0, layout.availableDesks).forEach((d, i) => {
      // desk body
      px(c, d.x, d.y, d.w, 42, P.ink);
      px(c, d.x + 1, d.y + 1, d.w - 2, 40, P.wood);
      px(c, d.x + 2, d.y + 2, d.w - 4, 12, P.woodLight);
      px(c, d.x + 2, d.y + 14, d.w - 4, 26, '#73543b');
      // monitor
      px(c, d.x + 10, d.y - 14, 28, 18, P.ink);
      px(c, d.x + 11, d.y - 13, 26, 16, '#3a4650');
      px(c, d.x + 13, d.y - 11, 22, 12, '#7fb2c0');
      px(c, d.x + 15, d.y - 9, 12, 1, 'rgba(230,250,255,0.7)');
      px(c, d.x + 23, d.y + 3, 2, 4, P.metalDark);
      px(c, d.x + 17, d.y + 7, 14, 2, P.metalDark);
      // keyboard
      px(c, d.x + 12, d.y + 15, 26, 5, '#d8d2c4');
      px(c, d.x + 13, d.y + 16, 24, 3, '#bdb6a8');
      // mug / notes
      px(c, d.x + 47, d.y + 14, 6, 6, P.coral);
      px(c, d.x + 49, d.y + 15, 3, 2, '#6b3127');
      px(c, d.x + 47, d.y + 21, 8, 1, P.cream);
      px(c, d.x + 3, d.y + 20, 7, 8, P.cream);
      px(c, d.x + 4, d.y + 22, 5, 1, '#a89c8a');
      // chair back
      px(c, d.x + 22, d.y + 30, 24, 12, '#3a3544');
      px(c, d.x + 24, d.y + 31, 20, 9, '#4a4456');
      // legs
      px(c, d.x + 4, d.y + 38, 3, 4, P.woodDark);
      px(c, d.x + d.w - 7, d.y + 38, 3, 4, P.woodDark);
    });
  }

  function drawDeskFrontOverlay(c, d, idx) {
    const y = d.y + 13;
    px(c, d.x + 1, y, d.w - 2, 28, '#73543b');
    px(c, d.x + 1, y, d.w - 2, 2, '#a87c55');
    // drawer
    px(c, d.x + 8, y + 10, 20, 11, '#5f4330');
    px(c, d.x + 10, y + 12, 16, 7, '#72513a');
    px(c, d.x + 16, y + 15, 4, 1, '#c89d6c');
    // sticky notes & pen cup on the desk lip
    px(c, d.x + 40, y + 5, 7, 6, P.goldLight);
    px(c, d.x + 41, y + 7, 5, 1, '#a8863a');
    px(c, d.x + 49, y + 4, 5, 7, P.coral);
    px(c, d.x + 50, y + 5, 3, 1, '#7c2f27');
    px(c, d.x + 32, y + 18, 6, 2, '#d8d2c4');
  }

  function drawPeople(c, state, layout, t) {
    layout.people.forEach((p, i) => {
      drawStudent(c, p.st, p.x, p.y, t, p.seated, i);
      if (p.seated && p.desk >= 0) drawDeskFrontOverlay(c, layout.desks[p.desk], i);
    });
  }

  function drawPlayer(c, state, t) {
    const p = state.player || { x: 98, y: 198, facing: 'down', moving: false };
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const walk = p.moving ? Math.sin(t * 12) : 0;
    const bob = p.moving ? Math.abs(Math.sin(t * 12)) * 0.8 : Math.sin(t * 2) * 0.3;
    const yy = Math.round(y - bob);
    const facing = p.facing || 'down';
    const side = facing === 'left' || facing === 'right';
    const back = facing === 'up';
    const look = state.look || { style: 'short', hair: '#241f25', skin: '#e8b98c', coat: '#f8f2e2', accent: P.teal, glasses: true };
    const skin = look.skin || '#e8b98c';
    const hair = look.hair || '#241f25';
    const coat = look.coat || '#f8f2e2';
    const accent = look.accent || P.teal;
    // shadow
    px(c, x - 10, y + 1, 20, 4, 'rgba(18,13,20,0.28)');
    px(c, x - 7, y + 4, 14, 1, 'rgba(18,13,20,0.14)');
    // legs with a simple two-frame stride
    const l1 = p.moving ? (walk > 0 ? 2 : 0) : 0;
    const l2 = p.moving ? (walk < 0 ? 2 : 0) : 0;
    px(c, x - 6, yy - 9 + l1, 5, 10, '#2a2734');
    px(c, x + 1, yy - 9 + l2, 5, 10, '#2a2734');
    px(c, x - 6, yy - 3 + l1, 5, 2, '#393443');
    px(c, x + 1, yy - 3 + l2, 5, 2, '#393443');
    px(c, x - 7, yy - 1 + l1, 6, 3, '#17141d');
    px(c, x + 1, yy - 1 + l2, 6, 3, '#17141d');
    // lab coat torso
    px(c, x - 8, yy - 28, 16, 22, P.ink);
    px(c, x - 7, yy - 27, 14, 20, coat);
    px(c, x - 7, yy - 12, 14, 5, shadeColor(coat, -10));
    px(c, x - 7, yy - 8, 14, 2, shadeColor(coat, -18));
    // collar / lapels
    px(c, x - 6, yy - 27, 12, 3, mix(coat, '#fff', 0.55));
    px(c, x - 7, yy - 24, 4, 12, mix(coat, P.ink, 0.08));
    px(c, x + 3, yy - 24, 4, 12, mix(coat, P.ink, 0.08));
    // shirt / lanyard
    px(c, x - 3, yy - 26, 6, 10, accent);
    px(c, x - 2, yy - 26, 2, 5, mix(accent, '#fff', 0.35));
    px(c, x - 1, yy - 16, 2, 8, mix(accent, '#fff', 0.12));
    // pocket + buttons + badge
    px(c, x - 6, yy - 13, 4, 4, shadeColor(coat, -8));
    px(c, x - 5, yy - 12, 2, 1, accent);
    px(c, x + 3, yy - 18, 1, 1, '#8e8370');
    px(c, x + 3, yy - 14, 1, 1, '#8e8370');
    px(c, x + 4, yy - 20, 4, 5, P.cream);
    px(c, x + 5, yy - 19, 2, 3, accent);
    // arms: shoulders stay fixed, only the lower arm and hand swing
    const arm = p.moving ? Math.round(walk * 2) : 0;
    px(c, x - 11, yy - 24, 4, 5, P.ink);
    px(c, x - 10, yy - 24, 3, 5, coat);
    px(c, x - 10, yy - 19 + arm, 3, 7, coat);
    px(c, x - 10, yy - 12 + arm, 3, 3, skin);
    px(c, x + 7, yy - 24, 4, 5, P.ink);
    px(c, x + 8, yy - 24, 3, 5, coat);
    px(c, x + 8, yy - 19 - arm, 3, 7, coat);
    px(c, x + 8, yy - 12 - arm, 3, 3, skin);
    // neck
    px(c, x - 3, yy - 31, 6, 5, shadeColor(skin, -16));
    px(c, x - 2, yy - 31, 4, 4, skin);
    // head
    px(c, x - 7, yy - 44, 14, 16, P.ink);
    px(c, x - 6, yy - 43, 12, 14, skin);
    px(c, x - 6, yy - 43, 12, 2, mix(skin, '#fff', 0.18));
    px(c, x - 8, yy - 37, 2, 5, shadeColor(skin, -8));
    px(c, x + 6, yy - 37, 2, 5, shadeColor(skin, -8));
    // hair base
    px(c, x - 7, yy - 45, 14, 8, hair);
    px(c, x - 6, yy - 46, 12, 3, mix(hair, '#fff', 0.18));
    px(c, x - 5, yy - 46, 5, 2, mix(hair, '#fff', 0.1));
    px(c, x - 8, yy - 40, 3, 7, hair);
    px(c, x + 5, yy - 40, 3, 7, hair);
    if (back) {
      // back of head: hair silhouette is consistent with the selected style
      px(c, x - 6, yy - 43, 12, 13, hair);
      px(c, x - 6, yy - 43, 12, 2, mix(hair, '#fff', 0.15));
      px(c, x + 5, yy - 38, 2, 4, skin);
      px(c, x - 4, yy - 30, 8, 4, coat);
    } else if (side) {
      // profile: one eye, nose, side hair
      const dir = facing === 'left' ? -1 : 1;
      const ex = x + dir * 2;
      px(c, ex - 2, yy - 39, 5, 1, P.ink);
      px(c, ex - 1, yy - 38, 1, 2, P.ink);
      px(c, ex - 2, yy - 41, 4, 1, P.ink);
      px(c, x + dir * 6, yy - 36, 2, 3, shadeColor(skin, -8));
      px(c, x + dir * 4, yy - 33, 3, 1, '#a56f51');
      px(c, x + dir * 3, yy - 36, 1, 1, P.ink);
      if (look.glasses) {
        px(c, ex - 2, yy - 40, 5, 1, P.ink);
        px(c, ex - 2, yy - 36, 5, 1, P.ink);
        px(c, ex - 2, yy - 40, 1, 5, P.ink);
        px(c, ex + 2, yy - 40, 1, 5, P.ink);
      }
    } else {
      // front face
      px(c, x - 4, yy - 39, 3, 2, mix(skin, '#fff', 0.15));
      px(c, x + 1, yy - 39, 3, 2, mix(skin, '#fff', 0.15));
      px(c, x - 4, yy - 38, 3, 1, P.ink);
      px(c, x + 1, yy - 38, 3, 1, P.ink);
      if (look.glasses) {
        px(c, x - 4, yy - 36, 3, 1, P.ink);
        px(c, x + 1, yy - 36, 3, 1, P.ink);
        px(c, x - 4, yy - 35, 3, 1, P.ink);
        px(c, x + 1, yy - 35, 3, 1, P.ink);
        px(c, x - 3, yy - 36, 1, 1, '#fffdf4');
        px(c, x + 2, yy - 36, 1, 1, '#fffdf4');
      } else {
        px(c, x - 3, yy - 36, 1, 1, P.ink);
        px(c, x + 2, yy - 36, 1, 1, P.ink);
      }
      px(c, x - 1, yy - 33, 2, 3, shadeColor(skin, -14));
      px(c, x - 2, yy - 30, 4, 1, '#8f5a45');
      px(c, x - 1, yy - 31, 2, 1, 'rgba(255,220,205,0.3)');
    }
    // style-specific hair is drawn after the face so it never changes silhouette between directions
    if (look.style === 'bob' || look.style === 'long') {
      const len = look.style === 'long' ? 17 : 11;
      px(c, x - 8, yy - 39, 3, len, hair);
      px(c, x + 5, yy - 39, 3, len, hair);
    } else if (look.style === 'bun') {
      px(c, x - 3, yy - 49, 6, 6, hair);
      px(c, x - 2, yy - 48, 4, 2, mix(hair, '#fff', 0.15));
    } else if (look.style === 'curly') {
      px(c, x - 8, yy - 47, 5, 5, hair);
      px(c, x - 2, yy - 49, 5, 5, hair);
      px(c, x + 3, yy - 47, 5, 5, hair);
    } else if (look.style === 'fringe' && !back) {
      px(c, x - 6, yy - 41, 5, 4, hair);
      px(c, x, yy - 41, 5, 4, hair);
    } else if (look.style === 'undercut') {
      px(c, x - 8, yy - 39, 2, 4, shadeColor(hair, -25));
      px(c, x + 6, yy - 39, 2, 4, shadeColor(hair, -25));
    } else if (look.style === 'braid') {
      px(c, x + 6, yy - 38, 3, 5, hair);
      px(c, x + 6, yy - 33, 3, 4, hair);
      px(c, x + 5, yy - 29, 3, 3, hair);
    }
    // movement dust
    if (p.moving && Math.sin(t * 10) > 0.7) {
      px(c, x - 11, y - 1, 2, 1, 'rgba(230,220,200,0.32)');
      px(c, x + 9, y - 2, 2, 1, 'rgba(230,220,200,0.22)');
    }
  }

  function drawStudent(c, st, x, y, t, seated, idx) {
    const cfg = st.portrait || {};
    const skin = cfg.skin || '#e8b98c';
    const hair = cfg.hair || '#241f25';
    const coat = '#f5eedf';
    const accent = st.color || cfg.accent || P.teal;
    const bob = Math.sin(t * 2.2 + idx * 1.7) * 0.6;
    const typing = st.focus === 'experiment' || st.focus === 'write';
    const yy = Math.round(y + bob);
    const blink = Math.sin(t * 1.3 + idx * 2.1) > 0.965;
    // shadow
    px(c, x - 10, yy + 1, 20, 4, 'rgba(18,13,20,0.24)');
    // legs
    if (!seated) {
      px(c, x - 6, yy - 9, 5, 10, '#2b2834');
      px(c, x + 1, yy - 9, 5, 10, '#2b2834');
      px(c, x - 6, yy - 3, 5, 2, '#3a3542');
      px(c, x + 1, yy - 3, 5, 2, '#3a3542');
      px(c, x - 7, yy - 1, 6, 3, '#17141d');
      px(c, x + 1, yy - 1, 6, 3, '#17141d');
    }
    // lab coat body
    px(c, x - 8, yy - 28, 16, 22, P.ink);
    px(c, x - 7, yy - 27, 14, 20, coat);
    px(c, x - 7, yy - 12, 14, 5, '#e4dbc8');
    px(c, x - 7, yy - 8, 14, 2, '#d0c6b2');
    // collar and lapels
    px(c, x - 6, yy - 27, 12, 3, '#fffaf0');
    px(c, x - 7, yy - 24, 4, 12, mix(coat, P.ink, 0.1));
    px(c, x + 3, yy - 24, 4, 12, mix(coat, P.ink, 0.1));
    // shirt / accent
    px(c, x - 3, yy - 26, 6, 10, accent);
    px(c, x - 2, yy - 26, 2, 5, mix(accent, '#fff', 0.4));
    // arms / hands
    const armY = typing ? Math.sin(t * 9 + idx) * 1.5 : 0;
    px(c, x - 11, yy - 24 + armY, 4, 13, P.ink);
    px(c, x - 10, yy - 24 + armY, 3, 12, coat);
    px(c, x - 10, yy - 12 + armY, 3, 3, skin);
    px(c, x + 7, yy - 24 - armY, 4, 13, P.ink);
    px(c, x + 8, yy - 24 - armY, 3, 12, coat);
    px(c, x + 8, yy - 12 - armY, 3, 3, skin);
    // pocket / badge
    px(c, x - 6, yy - 13, 4, 4, '#ddd3bf');
    px(c, x - 5, yy - 12, 2, 1, accent);
    px(c, x + 4, yy - 20, 4, 5, P.cream);
    px(c, x + 5, yy - 19, 2, 3, accent);
    // neck
    px(c, x - 3, yy - 31, 6, 6, shadeColor(skin, -18));
    px(c, x - 2, yy - 31, 4, 5, skin);
    // head
    px(c, x - 7, yy - 44, 14, 17, P.ink);
    px(c, x - 6, yy - 43, 12, 15, skin);
    px(c, x - 6, yy - 43, 12, 2, mix(skin, '#fff', 0.16));
    px(c, x - 8, yy - 37, 2, 5, shadeColor(skin, -8));
    px(c, x + 6, yy - 37, 2, 5, shadeColor(skin, -8));
    // hair
    drawSceneHair(c, x, yy, hair, cfg.style, st);
    // brows / eyes
    px(c, x - 5, yy - 37, 4, 1, shadeColor(hair, -10));
    px(c, x + 1, yy - 37, 4, 1, shadeColor(hair, -10));
    if (!blink) {
      px(c, x - 5, yy - 35, 4, 2, P.white);
      px(c, x + 1, yy - 35, 4, 2, P.white);
      px(c, x - 4, yy - 35, 2, 2, P.ink);
      px(c, x + 2, yy - 35, 2, 2, P.ink);
      px(c, x - 4, yy - 35, 1, 1, '#fffdf4');
      px(c, x + 2, yy - 35, 1, 1, '#fffdf4');
    } else {
      px(c, x - 5, yy - 34, 4, 1, P.ink);
      px(c, x + 1, yy - 34, 4, 1, P.ink);
    }
    // nose / mouth
    px(c, x - 1, yy - 31, 2, 2, shadeColor(skin, -14));
    px(c, x - 2, yy - 28, 4, 1, 'rgba(120,70,50,0.55)');
    if (!blink) px(c, x - 1, yy - 28, 2, 1, 'rgba(255,220,205,0.25)');
    // glasses
    if (cfg.glasses) {
      px(c, x - 6, yy - 36, 5, 1, P.ink);
      px(c, x + 1, yy - 36, 5, 1, P.ink);
      px(c, x - 6, yy - 33, 5, 1, P.ink);
      px(c, x + 1, yy - 33, 5, 1, P.ink);
      px(c, x - 6, yy - 36, 1, 4, P.ink);
      px(c, x - 2, yy - 36, 1, 4, P.ink);
      px(c, x + 1, yy - 36, 1, 4, P.ink);
      px(c, x + 5, yy - 36, 1, 4, P.ink);
      px(c, x - 1, yy - 35, 2, 1, P.ink);
    }
    // lanyard
    px(c, x - 2, yy - 25, 1, 8, mix(accent, '#fff', 0.2));
    px(c, x + 2, yy - 25, 1, 8, mix(accent, '#fff', 0.2));
    // status bubble
    if (st.status === 'burnout' || st.stress > 82) {
      px(c, x + 8, yy - 50, 9, 9, P.cream);
      px(c, x + 9, yy - 49, 7, 7, P.coral);
      px(c, x + 12, yy - 47, 1, 3, P.cream);
      px(c, x + 12, yy - 43, 1, 1, P.cream);
    } else if (st.focus === 'rest') {
      px(c, x + 9, yy - 46, 2, 2, P.blueLight);
      px(c, x + 12, yy - 49, 2, 2, P.blueLight);
    }
  }

  function drawSceneHair(c, x, y, hair, style, st) {
    const hi = mix(hair, '#fff', 0.2);
    const hi2 = mix(hair, '#fff', 0.08);
    const dark = shadeColor(hair, -18);
    if (style === 'bob') {
      px(c, x - 7, y - 45, 14, 8, hair);
      px(c, x - 8, y - 40, 3, 14, hair);
      px(c, x + 5, y - 40, 3, 14, hair);
      px(c, x - 5, y - 45, 7, 2, hi);
      px(c, x - 6, y - 38, 2, 9, dark);
    } else if (style === 'long') {
      px(c, x - 7, y - 45, 14, 9, hair);
      px(c, x - 9, y - 40, 3, 24, hair);
      px(c, x + 6, y - 40, 3, 24, hair);
      px(c, x - 5, y - 45, 8, 2, hi);
      px(c, x - 8, y - 28, 2, 10, dark);
      px(c, x + 6, y - 28, 2, 10, dark);
    } else if (style === 'bun') {
      px(c, x - 7, y - 45, 14, 8, hair);
      px(c, x - 3, y - 50, 6, 6, hair);
      px(c, x - 2, y - 49, 4, 2, hi);
      px(c, x - 6, y - 38, 2, 8, dark);
    } else if (style === 'curly') {
      for (let i = 0; i < 8; i++) {
        px(c, x - 9 + (i * 3) % 17, y - 49 + (i % 3 === 0 ? -2 : 1), 6, 6, hair);
      }
      px(c, x - 8, y - 40, 3, 10, hair);
      px(c, x + 5, y - 40, 3, 10, hair);
      px(c, x - 4, y - 46, 3, 2, hi);
    } else if (style === 'fringe') {
      px(c, x - 7, y - 45, 14, 9, hair);
      px(c, x - 6, y - 38, 5, 4, hair);
      px(c, x + 1, y - 38, 5, 4, hair);
      px(c, x - 5, y - 45, 9, 2, hi);
      px(c, x - 8, y - 39, 2, 8, dark);
      px(c, x + 6, y - 39, 2, 8, dark);
    } else if (style === 'undercut') {
      px(c, x - 6, y - 45, 12, 6, hair);
      px(c, x - 5, y - 46, 9, 2, hi);
      px(c, x - 8, y - 40, 2, 4, shadeColor(hair, -22));
      px(c, x + 6, y - 40, 2, 4, shadeColor(hair, -22));
      px(c, x - 3, y - 47, 5, 2, hi2);
    } else if (style === 'braid') {
      px(c, x - 7, y - 45, 14, 8, hair);
      px(c, x - 5, y - 45, 8, 2, hi);
      px(c, x + 5, y - 40, 3, 8, hair);
      px(c, x + 5, y - 33, 3, 6, hair);
      px(c, x + 4, y - 28, 3, 5, hair);
      px(c, x + 4, y - 24, 2, 4, hair);
      px(c, x + 5, y - 35, 1, 1, P.goldLight);
      px(c, x + 5, y - 27, 1, 1, P.goldLight);
    } else {
      px(c, x - 7, y - 45, 14, 7, hair);
      px(c, x - 5, y - 45, 9, 2, hi);
      px(c, x - 3, y - 41, 6, 2, hi2);
      px(c, x - 8, y - 40, 2, 5, hair);
      px(c, x + 6, y - 40, 2, 5, hair);
    }
  }

  function drawPI(c, x, y, t) {
    // player character near whiteboard, hands behind back
    const bob = Math.sin(t * 1.6) * 0.5;
    const yy = Math.round(y + bob);
    px(c, x - 7, yy + 1, 14, 3, 'rgba(20,15,20,0.2)');
    px(c, x - 5, yy - 7, 4, 8, '#2d2a36');
    px(c, x + 1, yy - 7, 4, 8, '#2d2a36');
    px(c, x - 7, yy - 21, 14, 16, P.ink);
    px(c, x - 6, yy - 20, 12, 15, P.cream);
    px(c, x - 2, yy - 19, 4, 9, P.teal);
    px(c, x - 6, yy - 10, 12, 5, '#ddd5c4');
    px(c, x - 9, yy - 17, 3, 10, P.cream);
    px(c, x + 6, yy - 17, 3, 10, P.cream);
    px(c, x - 2, yy - 24, 4, 4, '#e8b98c');
    px(c, x - 6, yy - 34, 12, 13, P.ink);
    px(c, x - 5, yy - 33, 10, 11, '#e8b98c');
    px(c, x - 6, yy - 35, 12, 6, '#241f25');
    px(c, x - 5, yy - 36, 10, 2, '#3a3030');
    px(c, x - 4, yy - 28, 2, 2, P.ink);
    px(c, x + 2, yy - 28, 2, 2, P.ink);
    px(c, x - 5, yy - 29, 4, 1, P.ink);
    px(c, x + 1, yy - 29, 4, 1, P.ink);
    px(c, x - 5, yy - 27, 4, 1, P.ink);
    px(c, x + 1, yy - 27, 4, 1, P.ink);
    px(c, x - 1, yy - 25, 2, 1, 'rgba(120,70,50,0.5)');
  }

  function drawForeground(c, state, t) {
    // door
    px(c, 8, 238, 44, 50, P.ink);
    px(c, 10, 240, 40, 48, '#6b4f3a');
    px(c, 12, 242, 36, 44, '#7d5e45');
    px(c, 14, 244, 32, 18, '#8f6c4f');
    px(c, 14, 264, 32, 20, '#70523c');
    px(c, 40, 258, 4, 3, P.goldLight);
    // door sign
    px(c, 16, 232, 28, 7, '#1b1724');
    text(c, 'EXIT', 19, 233, P.tealLight, 1);
    // coffee cart
    px(c, 54, 240, 36, 46, P.woodDark);
    px(c, 56, 242, 32, 42, P.wood);
    px(c, 56, 242, 32, 3, P.woodLight);
    px(c, 59, 247, 26, 9, '#5b6068');
    px(c, 61, 249, 22, 5, '#2f343a');
    px(c, 62, 250, 4, 2, P.goldLight);
    px(c, 72, 258, 8, 6, P.cream);
    px(c, 74, 259, 4, 3, '#6b432e');
    px(c, 58, 270, 28, 3, P.woodDark);
    for (let i = 0; i < 10; i++) {
      px(c, 58 + i * 3, 274, 1, 8, i % 2 ? '#6b4f3a' : '#5b4230');
    }
    // steam
    for (let i = 0; i < 4; i++) {
      const sx = 70 + Math.sin(t * 1.3 + i) * 2;
      px(c, sx, 236 - i * 3, 1, 2, 'rgba(240,240,230,0.28)');
    }
    // plant on the expansion bench
    if (state.labLevel >= 2) {
      px(c, 446, 194, 22, 24, P.ink);
      px(c, 448, 196, 18, 20, '#9a6a47');
      px(c, 448, 196, 18, 3, '#b9855d');
      px(c, 455, 188, 3, 8, '#4a3a2a');
      px(c, 446, 180, 18, 14, P.green);
      px(c, 442, 186, 10, 9, P.green);
      px(c, 458, 184, 10, 10, '#6d965c');
      px(c, 450, 178, 12, 8, '#88b073');
      px(c, 453, 182, 3, 2, '#b4d49a');
    }
    // cat
    if (state.flags.cat) {
      const cx = 352, cy = 276;
      const tail = Math.sin(t * 2) * 2;
      px(c, cx, cy, 22, 9, '#c98a4a');
      px(c, cx + 2, cy + 9, 18, 3, '#a86f38');
      px(c, cx + 15, cy - 7, 9, 9, '#c98a4a');
      px(c, cx + 16, cy - 10, 3, 4, '#c98a4a');
      px(c, cx + 20, cy - 10, 3, 4, '#c98a4a');
      px(c, cx + 17, cy - 4, 2, 1, P.ink);
      px(c, cx + 21, cy - 4, 2, 1, P.ink);
      px(c, cx + 19, cy + 1, 2, 1, '#7a4a28');
      px(c, cx - 1, cy - 1, 5, 2, '#c98a4a');
      px(c, cx - 3 + tail, cy - 4, 2, 5, '#c98a4a');
      // zzz
      if (Math.sin(t * 0.8) > 0) {
        px(c, cx + 20, cy - 16, 2, 1, 'rgba(220,235,255,0.5)');
        px(c, cx + 22, cy - 19, 3, 1, 'rgba(220,235,255,0.4)');
      }
    }
    // floor boxes near door
    px(c, 96, 272, 26, 16, '#9a744c');
    px(c, 98, 274, 22, 2, '#6e5236');
    text(c, 'LAB', 101, 279, '#4b3726', 1);
    // trash bin
    px(c, 468, 254, 8, 18, '#6f777e');
    px(c, 467, 252, 10, 3, '#8e959c');
  }

  function drawExpansion(c, state, t) {
    if (state.labLevel < 2) {
      // dark, unfinished wing, wall included
      px(c, 376, 0, 104, 290, '#12141d');
      px(c, 376, 0, 104, 58, '#171923');
      for (let y = 58; y < 290; y += 16) px(c, 376, y, 104, 1, 'rgba(255,255,255,0.03)');
      // scaffolding
      px(c, 398, 72, 3, 190, '#4a3a2c');
      px(c, 458, 72, 3, 190, '#4a3a2c');
      px(c, 398, 90, 63, 3, '#4a3a2c');
      px(c, 398, 170, 63, 3, '#4a3a2c');
      // boxes and covered benches
      px(c, 410, 210, 26, 36, '#3b3329');
      px(c, 416, 216, 14, 2, '#5b4a35');
      px(c, 442, 228, 22, 28, '#2c2a2a');
      // glass partition
      px(c, 376, 58, 8, 232, P.ink);
      px(c, 378, 60, 4, 228, '#93b6bd');
      px(c, 379, 62, 2, 224, 'rgba(210,240,245,0.28)');
      for (let y = 68; y < 286; y += 24) {
        px(c, 376, y, 8, 2, '#5c666d');
      }
      // caution tape
      for (let i = 0; i < 10; i++) {
        px(c, 377, 116 + i * 7, 6, 3, i % 2 ? P.gold : P.ink);
      }
      // bright construction sign
      px(c, 390, 86, 56, 27, P.ink);
      px(c, 392, 88, 52, 23, P.gold);
      px(c, 394, 90, 48, 19, '#2a2418');
      text(c, 'EXPAND', 396, 94, P.goldLight, 1);
      px(c, 396, 102, 44, 1, P.tealLight);
      // tape across the opening
      for (let i = 0; i < 7; i++) {
        px(c, 392 + i * 10, 148, 7, 5, i % 2 ? P.gold : P.ink);
      }
      // construction dust
      for (let i = 0; i < 8; i++) {
        const dx = 398 + (U.seededNoise(i, 1, 2) * 70) | 0;
        const dy = 70 + ((U.seededNoise(i, 2, 3) * 180 + t * 3) % 180) | 0;
        px(c, dx, dy, 1, 1, 'rgba(220,210,190,0.12)');
      }
    } else {
      // right wall of the expanded lab
      px(c, 472, 58, 8, 232, '#0b0d14');
      px(c, 470, 58, 2, 232, P.woodDark);
      // a locked door to the future cell room
      px(c, 430, 62, 30, 5, '#0b0d14');
      text(c, 'CELL', 435, 63, '#7d8797', 1);
      // awards / plants shelf
      px(c, 410, 60, 56, 4, P.woodDark);
      for (let i = 0; i < 3; i++) {
        px(c, 415 + i * 15, 50, 8, 10, [P.gold, P.teal, P.coral][i]);
        px(c, 417 + i * 15, 52, 4, 4, P.cream);
      }
    }
  }

  function drawSampleCart(c, x, y, t, variant) {
    px(c, x + 2, y + 24, 28, 3, 'rgba(20,15,20,0.2)');
    px(c, x, y + 4, 32, 20, P.ink);
    px(c, x + 1, y + 5, 30, 18, '#8e959c');
    px(c, x + 2, y + 6, 28, 4, '#c4c9cc');
    px(c, x + 3, y + 11, 26, 2, '#5e666e');
    px(c, x + 3, y + 18, 26, 2, '#5e666e');
    // boxes / bottles
    px(c, x + 4, y + 12, 8, 6, variant ? P.gold : P.coral);
    px(c, x + 5, y + 12, 6, 1, 'rgba(255,255,255,0.35)');
    px(c, x + 14, y + 13, 5, 5, P.tealLight);
    px(c, x + 21, y + 12, 6, 6, P.cream);
    px(c, x + 22, y + 13, 4, 1, '#a89c8a');
    // handle
    px(c, x + 30, y - 2, 2, 12, P.metalDark);
    px(c, x + 26, y - 2, 6, 2, P.metalDark);
    // wheels
    px(c, x + 4, y + 24, 5, 4, '#2b2b2b');
    px(c, x + 22, y + 24, 5, 4, '#2b2b2b');
    px(c, x + 5, y + 25, 2, 2, '#6e7479');
    px(c, x + 23, y + 25, 2, 2, '#6e7479');
  }

  function drawWallDecor(c, state, t) {
    // safety poster between window and whiteboard
    px(c, 10, 12, 16, 30, '#2f3a44');
    px(c, 11, 13, 14, 28, P.cream);
    px(c, 13, 15, 10, 7, P.coral);
    px(c, 15, 17, 6, 3, P.cream);
    px(c, 13, 24, 10, 1, P.teal);
    px(c, 13, 27, 8, 1, P.blue);
    px(c, 13, 30, 10, 1, P.gold);
    px(c, 13, 34, 6, 1, '#8b8173');
    // award ribbon for top papers
    if (state.stats.topPapers > 0 && state.labLevel >= 2) {
      px(c, 402, 68, 8, 8, P.gold);
      px(c, 404, 70, 4, 4, P.coral);
      px(c, 404, 76, 4, 4, P.goldLight);
    }
  }

  function drawLighting(c, W, H, phase, t) {
    // warm ceiling lamps
    c.globalCompositeOperation = 'lighter';
    const lights = [[120, 72], [240, 72], [360, 72]];
    lights.forEach((l, i) => {
      const g = c.createRadialGradient(l[0], l[1], 4, l[0], l[1], 105);
      g.addColorStop(0, phase > 0.75 || phase < 0.2 ? 'rgba(255,210,120,0.15)' : 'rgba(255,240,200,0.09)');
      g.addColorStop(1, 'rgba(255,210,120,0)');
      c.fillStyle = g;
      c.fillRect(l[0] - 110, l[1] - 110, 220, 220);
    });
    c.globalCompositeOperation = 'source-over';
    // night tint
    if (phase > 0.78 || phase < 0.2) {
      c.fillStyle = 'rgba(20,30,70,0.18)';
      c.fillRect(0, 0, W, H);
    }
    // vignette
    const vg = c.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 300);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(8,8,16,0.42)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
    // dust
    for (let i = 0; i < 18; i++) {
      const x = (U.seededNoise(i, 1, 4) * W + Math.sin(t * 0.2 + i) * 6) | 0;
      const y = (U.seededNoise(i, 2, 5) * H + Math.cos(t * 0.17 + i) * 4) | 0;
      px(c, x, y, 1, 1, 'rgba(245,235,210,0.18)');
    }
  }

  function drawWeatherInside(c, state, t, season, phase) {
    // occasional dust / leaves near door when open? keep subtle
  }

  /* =========================================================
     HIT TEST / HOTSPOTS
     ========================================================= */

  Art.getPlaceInteractables = function (state) {
    const list = [];
    const add = (o) => {
      o.ax = typeof o.ax === 'number' ? o.ax : o.x + o.w / 2;
      o.ay = typeof o.ay === 'number' ? o.ay : o.y + o.h / 2;
      o.radius = o.radius || 64;
      list.push(o);
    };
    const id = state.scene;
    add({ id: 'place-exit', label: '回到实验室', hint: '离开这里', action: 'leaveScene', x: 24, y: 430, w: 90, h: 120, ax: 70, ay: 470, radius: 58 });
    if (id === 'tech') {
      add({ id: 'tech-counter', label: '科技处窗口', hint: '提交项目书 / 查看在研项目', action: 'placeActivity', place: 'tech', x: 210, y: 300, w: 560, h: 100, ax: 480, ay: 410, radius: 74 });
      add({ id: 'tech-board', label: '项目指南板', hint: '查看本轮项目类型', action: 'placeActivity', place: 'tech', x: 300, y: 96, w: 340, h: 150, ax: 470, ay: 270, radius: 58 });
    } else if (id === 'market') {
      add({ id: 'market-stall-a', label: '旧货摊', hint: '科研 / 事业物品', action: 'placeActivity', place: 'market', x: 110, y: 220, w: 190, h: 160, ax: 205, ay: 395, radius: 60 });
      add({ id: 'market-stall-b', label: '湖边货摊', hint: '钓鱼 / 感情物品', action: 'placeActivity', place: 'market', x: 620, y: 220, w: 190, h: 160, ax: 715, ay: 395, radius: 60 });
    } else if (id === 'delivery') {
      add({ id: 'delivery-board', label: '外卖接单板', hint: '跑一单，赚现金', action: 'placeActivity', place: 'delivery', x: 250, y: 110, w: 290, h: 180, ax: 395, ay: 310, radius: 64 });
      add({ id: 'delivery-counter', label: '取餐窗口', hint: '跑单 / 查看收入', action: 'placeActivity', place: 'delivery', x: 200, y: 330, w: 460, h: 80, ax: 430, ay: 425, radius: 66 });
    } else if (id === 'lake') {
      add({ id: 'lake-fish', label: '钓鱼点', hint: '抛竿 / 查看图鉴', action: 'placeActivity', place: 'lake', x: 330, y: 330, w: 300, h: 120, ax: 480, ay: 460, radius: 72 });
      add({ id: 'lake-shop', label: '湖边小店', hint: '购买鱼竿与饵料', action: 'placeActivity', place: 'market', x: 680, y: 430, w: 180, h: 100, ax: 770, ay: 500, radius: 60 });
    }
    return list;
  };

  Art.getInteractables = function (state, layout) {
    if ((state.scene || 'lab') !== 'lab') {
      if (window.LabIso) return window.LabIso.getInteractables(state);
      return Art.getPlaceInteractables(state);
    }
    layout = layout || Art.lastLayout || makeLayout(state);
    const list = [];
    const add = (o) => {
      o.ax = typeof o.ax === 'number' ? o.ax : o.x + o.w / 2;
      o.ay = typeof o.ay === 'number' ? o.ay : o.y + o.h / 2;
      o.radius = o.radius || 32;
      list.push(o);
    };

    // generic furniture / remote panels
    add({ id: 'bench', label: '中央实验台', hint: '这里可以做实验、分析数据', kind: 'fixture', fixture: 'bench', x: 120, y: 98, w: 228, h: 66, ax: 234, ay: 164, radius: 44 });
    add({ id: 'desks', label: '学生工位', hint: '查看团队、分配任务', panel: 'team', x: 92, y: 210, w: 258, h: 60, ax: 210, ay: 238, radius: 62 });
    add({ id: 'whiteboard', label: '研究白板', hint: '研究方向与项目', panel: 'research', x: 120, y: 4, w: 116, h: 52, ax: 178, ay: 56, radius: 36 });
    add({ id: 'equip-left', label: '左侧仪器台', hint: '购买、维修、升级设备', panel: 'equipment', x: 6, y: 154, w: 68, h: 60, ax: 40, ay: 210, radius: 32 });
    add({ id: 'equip-center', label: '中央仪器位', hint: '购买、维修、升级设备', panel: 'equipment', x: 218, y: 100, w: 106, h: 34, ax: 270, ay: 136, radius: 32 });

    // fixed starter instruments
    add({ id: 'fixture-glovebox', label: '惰性手套箱', hint: '材料 / 化学 · 固定仪器', kind: 'fixture', fixture: 'glovebox', x: 14, y: 78, w: 56, h: 44, ax: 68, ay: 112, radius: 32 });
    add({ id: 'fixture-balance', label: '精准天平', hint: '化学 / 材料 · 固定仪器', kind: 'fixture', fixture: 'balance', x: 14, y: 130, w: 40, h: 34, ax: 52, ay: 150, radius: 30 });
    add({ id: 'fixture-fumehood', label: '通风橱', hint: '化学 / 生物 · 固定仪器', kind: 'fixture', fixture: 'fumehood', x: 74, y: 52, w: 82, h: 50, ax: 115, ay: 100, radius: 42 });
    add({ id: 'fixture-microscope', label: '倒置荧光显微镜', hint: '生物 / 材料 · 固定仪器', kind: 'fixture', fixture: 'microscope', x: 130, y: 102, w: 38, h: 32, ax: 149, ay: 162, radius: 32 });
    add({ id: 'fixture-pipette', label: '移液枪架', hint: '通用 / 生物 · 固定仪器', kind: 'fixture', fixture: 'pipette', x: 174, y: 104, w: 48, h: 30, ax: 198, ay: 162, radius: 32 });
    add({ id: 'fixture-computer', label: '电脑工作站', hint: '计算 / 通用 · 投稿与写作', kind: 'fixture', fixture: 'computer', x: 296, y: 158, w: 84, h: 66, ax: 300, ay: 200, radius: 38 });

    // installed equipment: each one gets its own clickable station
    state.equipment.forEach((e, i) => {
      const def = window.Game && window.Game.equipDef ? window.Game.equipDef(e) : null;
      const slot = Art.EQUIP_SLOTS[i];
      if (!def || !slot) return;
      add({
        id: 'equip-' + e.uid, label: def.name,
        hint: def.use ? def.use.label + ' · 设备' : '设备',
        kind: 'equipment', uid: e.uid,
        x: slot.x - 2, y: slot.y - 4, w: 38, h: 34,
        ax: slot.x + 17, ay: slot.y + 34, radius: 30
      });
    });

    // expansion / right wing
    if (state.labLevel >= 2) {
      add({ id: 'bookshelf', label: '论文书架', hint: '查看论文与投稿', panel: 'papers', x: 392, y: 4, w: 74, h: 56, ax: 400, ay: 62, radius: 40 });
      add({ id: 'equip-right', label: '右侧仪器台', hint: '购买、维修、升级设备', panel: 'equipment', x: 404, y: 74, w: 68, h: 140, ax: 400, ay: 160, radius: 34 });
      add({ id: 'plant', label: '琴叶榕', hint: '它还活着', action: 'plant', x: 438, y: 176, w: 34, h: 44, ax: 430, ay: 214, radius: 30 });
    }

    // door / social props / expansion barrier
    add({ id: 'door', label: '实验室门', hint: '去 3F 走廊（其他场所尚未解锁）', action: 'door', x: 8, y: 234, w: 46, h: 56, ax: 31, ay: 240, radius: 32 });
    add({ id: 'coffee', label: '咖啡机', hint: '喝一杯（每周一次，不耗行动力）', action: 'coffee', x: 50, y: 234, w: 42, h: 56, ax: 70, ay: 236, radius: 28 });
    if (state.flags.cat) {
      add({ id: 'cat', label: '实验室猫「数据」', hint: '摸一摸（每周一次）', action: 'pet', x: 340, y: 254, w: 38, h: 34, ax: 360, ay: 270, radius: 28 });
    }
    if (state.labLevel < 2) {
      add({ id: 'expansion', label: '扩建预留区', hint: '实验室升到 2 级后开放', action: 'expansion', x: 376, y: 58, w: 102, h: 232, ax: 420, ay: 160, radius: 60 });
    }

    // people are always the topmost interaction target
    layout.people.forEach(p => {
      add({
        id: 'student:' + p.st.uid, label: p.st.name, hint: '查看学生档案',
        action: 'student', uid: p.st.uid,
        x: p.x - 11, y: p.y - 40, w: 22, h: 44, ax: p.x, ay: p.y - 20, radius: 28
      });
    });
    return list;
  };

  Art.getHotspots = Art.getInteractables;

  Art.hitTest = function (state, x, y, layout) {
    if ((state.scene || 'lab') !== 'lab' && window.LabIso) return window.LabIso.hitTest(state, x, y);
    const list = Art.getInteractables(state, layout);
    for (let i = list.length - 1; i >= 0; i--) {
      const h = list[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
    }
    return null;
  };

  Art.placeObstacles = function (state) {
    const id = state.scene;
    const o = [
      { x: 0, y: 0, w: 960, h: 120 },
      { x: 0, y: 0, w: 20, h: 580 },
      { x: 940, y: 0, w: 20, h: 580 },
      { x: 0, y: 550, w: 960, h: 30 }
    ];
    if (id === 'tech') {
      o.push({ x: 210, y: 300, w: 560, h: 100 });
      o.push({ x: 760, y: 190, w: 120, h: 160 });
    } else if (id === 'market') {
      o.push({ x: 110, y: 220, w: 190, h: 160 });
      o.push({ x: 620, y: 220, w: 190, h: 160 });
      o.push({ x: 340, y: 392, w: 150, h: 80 });
    } else if (id === 'delivery') {
      o.push({ x: 200, y: 330, w: 460, h: 80 });
      o.push({ x: 70, y: 390, w: 230, h: 70 });
      o.push({ x: 680, y: 360, w: 110, h: 100 });
    } else if (id === 'lake') {
      o.push({ x: 0, y: 280, w: 330, h: 190 });
      o.push({ x: 630, y: 280, w: 330, h: 190 });
    }
    return o;
  };

  Art.getObstacles = function (state) {
    if ((state.scene || 'lab') !== 'lab') {
      if (window.LabIso) return window.LabIso.obstacles(state);
      return Art.placeObstacles(state);
    }
    const o = [
      { x: 0, y: 0, w: 480, h: 62 },
      { x: 0, y: 0, w: 10, h: 290 },
      { x: 472, y: 0, w: 8, h: 290 },
      { x: 0, y: 284, w: 480, h: 6 },
      { x: 8, y: 74, w: 68, h: 140 },
      { x: 118, y: 96, w: 232, h: 68 },
      { x: 74, y: 54, w: 82, h: 54 },
      { x: 296, y: 174, w: 84, h: 52 },
      { x: 48, y: 234, w: 46, h: 56 }
    ];
    const desks = availableDesks(state);
    for (let i = 0; i < desks; i++) {
      const d = DESKS[i];
      o.push({ x: d.x - 4, y: d.y - 2, w: d.w + 8, h: 48 });
    }
    if (state.labLevel < 2) {
      o.push({ x: 374, y: 58, w: 14, h: 232 });
    } else {
      o.push({ x: 404, y: 74, w: 68, h: 142 });
    }
    return o;
  };

  Art.bounds = function (state) {
    if ((state.scene || 'lab') !== 'lab') return window.LabIso ? window.LabIso.bounds(state) : { minX: 24, maxX: 936, minY: 122, maxY: 548 };
    return {
      minX: 16,
      maxX: state.labLevel >= 2 ? 466 : 370,
      minY: 64,
      maxY: 281
    };
  };

  Art.isWalkable = function (state, x, y) {
    if ((state.scene || 'lab') !== 'lab' && window.LabIso) return window.LabIso.isWalkable(state, x, y);
    const b = Art.bounds(state);
    if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) return false;
    const obs = Art.getObstacles(state);
    const halfW = 4, top = 7, bottom = 2;
    for (let i = 0; i < obs.length; i++) {
      const o = obs[i];
      if (x + halfW > o.x && x - halfW < o.x + o.w && y - bottom > o.y && y - top < o.y + o.h) return false;
    }
    return true;
  };

  function lineWalkable(state, x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.ceil(dist / 4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (!Art.isWalkable(state, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return false;
    }
    return true;
  }

  Art.findPath = function (state, sx, sy, tx, ty) {
    if ((state.scene || 'lab') !== 'lab' && window.LabIso) return window.LabIso.findPath(state, sx, sy, tx, ty);
    const G8 = 8;
    const sceneSize = Art.sceneSize(state);
    const cols = Math.ceil(sceneSize.w / G8);
    const rows = Math.ceil(sceneSize.h / G8);
    const idx = (cx, cy) => cy * cols + cx;
    const cellOf = (x, y) => ({ cx: U.clamp(Math.floor(x / G8), 1, cols - 2), cy: U.clamp(Math.floor(y / G8), 1, rows - 2) });
    const center = (cx, cy) => ({ x: cx * G8 + G8 / 2, y: cy * G8 + G8 / 2 });
    const start = cellOf(sx, sy);
    let goal = cellOf(tx, ty);
    if (!Art.isWalkable(state, center(goal.cx, goal.cy).x, center(goal.cx, goal.cy).y)) {
      let best = null, bd = 1e9;
      for (let cy = 2; cy < rows - 2; cy++) {
        for (let cx = 2; cx < cols - 2; cx++) {
          const p = center(cx, cy);
          if (!Art.isWalkable(state, p.x, p.y)) continue;
          const d = Math.hypot(p.x - tx, p.y - ty);
          if (d < bd) { bd = d; best = { cx, cy }; }
        }
      }
      if (!best) return null;
      goal = best;
    }
    const q = [idx(start.cx, start.cy)];
    const prev = new Map();
    const seen = new Set(q);
    let found = false;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    while (q.length) {
      const cur = q.shift();
      const cx = cur % cols, cy = Math.floor(cur / cols);
      if (cx === goal.cx && cy === goal.cy) { found = true; break; }
      for (let d = 0; d < dirs.length; d++) {
        const nx = cx + dirs[d][0], ny = cy + dirs[d][1];
        if (nx < 1 || ny < 1 || nx >= cols - 1 || ny >= rows - 1) continue;
        const p = center(nx, ny);
        if (!Art.isWalkable(state, p.x, p.y)) continue;
        if (dirs[d][0] && dirs[d][1]) {
          const a = center(cx + dirs[d][0], cy);
          const b = center(cx, cy + dirs[d][1]);
          if (!Art.isWalkable(state, a.x, a.y) || !Art.isWalkable(state, b.x, b.y)) continue;
        }
        const ni = idx(nx, ny);
        if (seen.has(ni)) continue;
        seen.add(ni);
        prev.set(ni, cur);
        q.push(ni);
      }
    }
    if (!found) return null;
    const points = [];
    let cur = idx(goal.cx, goal.cy);
    while (cur !== idx(start.cx, start.cy)) {
      const cx = cur % cols, cy = Math.floor(cur / cols);
      const p = center(cx, cy);
      points.unshift(p);
      cur = prev.get(cur);
      if (cur == null) break;
    }
    const gp = center(goal.cx, goal.cy);
    points.push(Art.isWalkable(state, tx, ty) ? { x: tx, y: ty } : gp);
    // greedy smoothing
    const out = [];
    let i = 0;
    while (i < points.length) {
      let j = points.length - 1;
      for (; j > i; j--) {
        if (lineWalkable(state, i === 0 ? sx : points[i].x, i === 0 ? sy : points[i].y, points[j].x, points[j].y)) break;
      }
      out.push(points[j]);
      i = j + 1;
      if (j === points.length - 1) break;
    }
    return out;
  };

  Art.nearestWalkable = function (state, x, y) {
    if ((state.scene || 'lab') !== 'lab' && window.LabIso) return window.LabIso.nearestWalkable(state, x, y);
    if (Art.isWalkable(state, x, y)) return { x, y };
    for (let r = 4; r <= 48; r += 4) {
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * Math.PI * 2;
        const nx = x + Math.cos(ang) * r;
        const ny = y + Math.sin(ang) * r;
        if (Art.isWalkable(state, nx, ny)) return { x: nx, y: ny };
      }
    }
    return null;
  };

  Art.approachPoint = function (state, obj, fromX, fromY) {
    if ((state.scene || 'lab') !== 'lab' && window.LabIso) return window.LabIso.approachPoint(state, obj, fromX, fromY);
    const candidates = [
      { x: obj.ax, y: obj.y + obj.h + 16 },
      { x: obj.x - 16, y: obj.ay },
      { x: obj.x + obj.w + 16, y: obj.ay },
      { x: obj.ax, y: obj.y - 16 },
      { x: obj.x - 14, y: obj.y + obj.h + 12 },
      { x: obj.x + obj.w + 14, y: obj.y + obj.h + 12 }
    ];
    const ok = candidates.filter(p => Art.isWalkable(state, p.x, p.y));
    if (!ok.length) return null;
    ok.sort((a, b) => {
      const da = Math.hypot(a.x - fromX, a.y - fromY);
      const db = Math.hypot(b.x - fromX, b.y - fromY);
      return da - db;
    });
    return ok[0];
  };

  function drawInteractHighlight(c, state, t, ui) {
    if (!ui || !ui.nearby) return;
    const o = ui.nearby;
    const pulse = 0.55 + Math.sin(t * 4) * 0.25;
    c.save();
    c.globalAlpha = pulse;
    c.strokeStyle = P.goldLight;
    c.lineWidth = 1;
    const x = o.x - 3, y = o.y - 3, w = o.w + 6, h = o.h + 6;
    const len = Math.min(9, w / 3, h / 3);
    c.strokeRect(x + 0.5, y + 0.5, len, 1);
    c.strokeRect(x + 0.5, y + 0.5, 1, len);
    c.strokeRect(x + w - len, y + 0.5, len, 1);
    c.strokeRect(x + w - 0.5, y + 0.5, 1, len);
    c.strokeRect(x + 0.5, y + h - 0.5, len, 1);
    c.strokeRect(x + 0.5, y + h - len, 1, len);
    c.strokeRect(x + w - len, y + h - 0.5, len, 1);
    c.strokeRect(x + w - 0.5, y + h - len, 1, len);
    c.restore();
    // tiny bob marker above the object
    const by = Math.round(o.y - 9 + Math.sin(t * 3) * 2);
    px(c, o.ax - 3, by, 6, 5, P.ink);
    px(c, o.ax - 2, by + 1, 4, 3, P.goldLight);
    px(c, o.ax - 1, by + 2, 2, 1, P.ink);
  }

  Art.studentPositions = function (state) {
    return makeLayout(state).people;
  };

  window.LabArt = Art;
})();

