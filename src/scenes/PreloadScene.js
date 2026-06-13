import { registarIdioma } from '../i18n/i18n.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Titulo + barra de progresso
    this.add.text(cx, cy - 50, 'VALHALLA SURVIVOR', {
      fontFamily: 'monospace', fontSize: '24px', color: '#f2c14e',
    }).setOrigin(0.5);

    this.add.rectangle(cx, cy, 320, 22, 0x222634).setStrokeStyle(1, 0x3a3f55);
    const barra = this.add.rectangle(cx - 156, cy, 6, 14, 0xf2c14e).setOrigin(0, 0.5);
    this.load.on('progress', (p) => { barra.width = 304 * p; });
    this.load.on('loaderror', (file) => { console.warn('[AUDIO] Falhou a carregar:', file.key, file.src); });
    this.load.on('filecomplete-audio-musica', () => { console.log('[AUDIO] musica.mp3 carregada com sucesso!'); });

    // --- Traducoes ---
    this.load.json('pt', 'src/i18n/pt.json');
    this.load.json('en', 'src/i18n/en.json');

    //--- Assets ---
    this.load.image('chao',  'src/assets/images/chao.png');
    this.load.image('tree0', 'src/assets/images/Tree_0.png');
    this.load.image('tree1', 'src/assets/images/Tree_1.png');
    this.load.image('tree2', 'src/assets/images/Tree_2.png');
    this.load.image('tree3', 'src/assets/images/Tree_3.png');
    this.load.image('log',   'src/assets/images/Log.png');
    this.load.image('cabin', 'src/assets/images/Log_Cabin.png');
    this.load.image('snow0', 'src/assets/images/Snowman_0.png');
    this.load.image('snow1', 'src/assets/images/Snowman_1.png');
    this.load.image('snow2', 'src/assets/images/Snowman_2.png');

    // Viking: spritesheet de 12x5 frames, cada um com 115x84 px.
    this.load.spritesheet('heroi', 'src/assets/images/heroi.png', { frameWidth: 115, frameHeight: 84 });

    this.load.audio('musica',   'src/assets/audio/musica.mp3');
    this.load.audio('nivel',    'src/assets/audio/levelup.mp3');
    this.load.audio('machado',  'src/assets/audio/axesound.mp3');
    this.load.image('menu_bg',  'src/assets/images/menu.png');
  }

  create() {
    // Regista as linguas carregadas
    registarIdioma('pt', this.cache.json.get('pt'));
    registarIdioma('en', this.cache.json.get('en'));

    // Filtro suave para a imagem do menu (pixelArt mode usa NEAREST por defeito)
    this.textures.get('menu_bg').setFilter(Phaser.Textures.LINEAR);

    // Gera as texturas-placeholder (apaga isto quando usares sprites reais)
    gerarTexturas(this);

    // Animacoes do viking. A linha 0 da spritesheet (frames 0-3) e o parado,
    // a linha 3 (frames 36-46) e o andar.
    this.anims.create({
      key: 'viking_idle',
      frames: this.anims.generateFrameNumbers('heroi', { frames: [0, 1, 2, 3] }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'viking_walk',
      frames: this.anims.generateFrameNumbers('heroi', { frames: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46] }),
      frameRate: 12,
      repeat: -1,
    });

    this.scene.start('MenuScene');
  }
}

// --- Geracao de texturas por codigo (placeholder) ---
function gerarTexturas(scene) {
  let g;

  // Logo Vegvisir para o menu
  {
    const sz = 160;
    const c  = sz / 2;
    const r  = 68;
    g = scene.add.graphics();

    // Halo exterior suave
    g.fillStyle(0xf2c14e, 0.05);
    g.fillCircle(c, c, r + 14);
    g.fillStyle(0xf2c14e, 0.08);
    g.fillCircle(c, c, r + 6);

    // Anel exterior
    g.lineStyle(3, 0xf2c14e, 0.9);
    g.strokeCircle(c, c, r);

    // Anel interior
    g.lineStyle(1.5, 0xf2c14e, 0.5);
    g.strokeCircle(c, c, r * 0.42);

    // 8 bracos do Vegvisir
    for (let i = 0; i < 8; i++) {
      const a   = (i * 45) * (Math.PI / 180);
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const x1  = c + cos * (r * 0.42);
      const y1  = c + sin * (r * 0.42);
      const x2  = c + cos * (r * 0.88);
      const y2  = c + sin * (r * 0.88);
      const cardinal = i % 2 === 0;

      g.lineStyle(cardinal ? 2 : 1.5, 0xf2c14e, cardinal ? 0.9 : 0.7);
      g.lineBetween(x1, y1, x2, y2);

      // Decoracao na ponta
      const pa  = a + Math.PI / 2;
      const tx  = c + cos * (r * 0.82);
      const ty  = c + sin * (r * 0.82);
      g.lineStyle(1.5, 0xf2c14e, 0.7);
      if (cardinal) {
        // Barra transversal
        g.lineBetween(tx + Math.cos(pa) * 7, ty + Math.sin(pa) * 7,
                      tx - Math.cos(pa) * 7, ty - Math.sin(pa) * 7);
      } else {
        // Bifurcacao
        const bx = c + cos * (r * 0.66);
        const by = c + sin * (r * 0.66);
        g.lineBetween(bx, by, tx + Math.cos(pa) * 6, ty + Math.sin(pa) * 6);
        g.lineBetween(bx, by, tx - Math.cos(pa) * 6, ty - Math.sin(pa) * 6);
      }
    }

    // Ponto central
    g.fillStyle(0xf2c14e, 1);
    g.fillCircle(c, c, 5);
    g.lineStyle(1.5, 0xf2c14e, 0.4);
    g.strokeCircle(c, c, 11);

    g.generateTexture('logo_menu', sz, sz);
    g.destroy();
  }

  // Grelha do chao (usada como fundo nos menus)
  g = scene.add.graphics();
  g.fillStyle(0x12131a, 1);
  g.fillRect(0, 0, 64, 64);
  g.lineStyle(1, 0x1e2233, 1);
  g.strokeRect(0, 0, 64, 64);
  g.generateTexture('grelha', 64, 64);
  g.destroy();

  // Draugr
  g = scene.add.graphics();
  g.fillStyle(0x4a5d3a, 1);
  g.fillRoundedRect(0, 0, 26, 30, 5);
  g.fillStyle(0x6b7d57, 1);
  g.fillRoundedRect(3, 2, 20, 10, 3);
  g.generateTexture('draugr', 26, 30);
  g.destroy();

  // Lobo
  g = scene.add.graphics();
  g.fillStyle(0x6a6a7a, 1);
  g.fillRoundedRect(0, 8, 32, 18, 5);
  g.fillStyle(0x8a8a9a, 1);
  g.fillRoundedRect(4, 4, 20, 14, 4);
  g.fillStyle(0x6a6a7a, 1);
  g.fillTriangle(6, 4, 10, -2, 14, 4);
  g.fillTriangle(16, 4, 20, -2, 24, 4);
  g.fillStyle(0xddddee, 1);
  g.fillCircle(10, 8, 2);
  g.fillCircle(20, 8, 2);
  g.generateTexture('lobo', 32, 26);
  g.destroy();

  // Jotunn
  g = scene.add.graphics();
  g.fillStyle(0xd4eef5, 1);
  g.fillTriangle(8, 14, 14, 4, 20, 14);
  g.fillTriangle(22, 14, 28, 4, 34, 14);
  g.fillStyle(0x7ab8cc, 1);
  g.fillRoundedRect(0, 12, 44, 46, 8);
  g.fillStyle(0xa0d4e4, 1);
  g.fillRoundedRect(4, 14, 36, 20, 6);
  g.fillStyle(0xff4444, 1);
  g.fillCircle(14, 22, 4);
  g.fillCircle(30, 22, 4);
  g.fillStyle(0x000000, 1);
  g.fillCircle(15, 22, 2);
  g.fillCircle(31, 22, 2);
  g.generateTexture('jotunn', 44, 58);
  g.destroy();

  // Machado
  g = scene.add.graphics();
  g.fillStyle(0x6b4423, 1);
  g.fillRect(11, 3, 4, 22);
  g.fillStyle(0x8a5a2e, 1);
  g.fillRect(11, 3, 2, 22);
  g.fillStyle(0xb8bcc6, 1);
  g.fillPoints([{ x: 13, y: 2 }, { x: 24, y: 4 }, { x: 26, y: 11 }, { x: 19, y: 16 }, { x: 13, y: 14 }], true);
  g.fillStyle(0xe6e8ee, 1);
  g.fillPoints([{ x: 24, y: 4 }, { x: 26, y: 11 }, { x: 22, y: 12 }, { x: 22, y: 6 }], true);
  g.generateTexture('machado', 28, 28);
  g.destroy();

  // Corvo aliado (o companheiro). Preto, no espirito dos corvos de Odin,
  // virado para a direita com bico dourado e um olho vermelho.
  g = scene.add.graphics();
  g.fillStyle(0x1a1a22, 1);
  g.fillEllipse(11, 9, 18, 11);          // corpo
  g.fillTriangle(1, 9, 8, 4, 8, 14);     // cauda
  g.fillStyle(0x2c2c3a, 1);
  g.fillEllipse(14, 7, 9, 6);            // asa/cabeca mais clara
  g.fillStyle(0xe0a020, 1);
  g.fillTriangle(19, 6, 25, 8, 19, 10);  // bico
  g.fillStyle(0xff5555, 1);
  g.fillCircle(16, 6, 1.3);              // olho
  g.generateTexture('corvo', 26, 18);
  g.destroy();

  // Bola de fogo (projetil do corvo). Halo vermelho por fora, laranja no
  // meio e um nucleo amarelo brilhante.
  g = scene.add.graphics();
  g.fillStyle(0xff3b00, 1);
  g.fillCircle(8, 8, 8);
  g.fillStyle(0xff8c1a, 1);
  g.fillCircle(8, 8, 5.5);
  g.fillStyle(0xffe27a, 1);
  g.fillCircle(8, 8, 3);
  g.generateTexture('bolafogo', 16, 16);
  g.destroy();

  // Gemas de alma. Sao tres tipos: pequena (verde, pouco XP), media (azul)
  // e grande (dourada, muito XP). O raio muda para se distinguirem bem em jogo.
  const gemas = [
    { key: 'gemaP', cor: 0x6fcf6f, brilho: 0xb9f5b9, r: 6  },
    { key: 'gemaM', cor: 0x4ea3f2, brilho: 0xa9d4fc, r: 8  },
    { key: 'gemaG', cor: 0xf2c14e, brilho: 0xfce8a0, r: 10 },
  ];
  gemas.forEach(({ key, cor, brilho, r }) => {
    g = scene.add.graphics();
    g.fillStyle(cor, 1);
    g.fillCircle(r, r, r);
    g.fillStyle(brilho, 0.8);
    g.fillCircle(r * 0.7, r * 0.7, r * 0.4);
    g.generateTexture(key, r * 2, r * 2);
    g.destroy();
  });
}