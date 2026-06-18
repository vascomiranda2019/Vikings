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

    // Serpente (inimigo fraco): 7x2 frames de 64x64. A linha 0 (frames 0-6) e o rastejar.
    this.load.spritesheet('serpente', 'src/assets/images/serpente.png', { frameWidth: 64, frameHeight: 64 });

    // Troll (inimigo forte / jotunn): folha limpa de 4 frames de 64x76, o troll de frente a andar.
    this.load.spritesheet('troll', 'src/assets/images/troll.png', { frameWidth: 64, frameHeight: 76 });

    // Lobos: 5 visuais diferentes (64x64). Ao nascer, cada lobo sorteia um destes.
    this.load.image('lobo1', 'src/assets/images/lobo1.png');
    this.load.image('lobo2', 'src/assets/images/lobo2.png');
    this.load.image('lobo3', 'src/assets/images/lobo3.png');
    this.load.image('lobo4', 'src/assets/images/lobo4.png');
    this.load.image('lobo5', 'src/assets/images/lobo5.png');

    // Corvo aliado: folha de 8x3 frames de 16x16. A linha do meio (frames 8-15) e o voo.
    this.load.spritesheet('corvo', 'src/assets/images/corvo.png', { frameWidth: 16, frameHeight: 16 });

    this.load.audio('musica',   'src/assets/audio/musica.mp3');
    this.load.audio('nivel',    'src/assets/audio/levelup.mp3');
    this.load.audio('machado',  'src/assets/audio/axesound.mp3');
    this.load.image('menu_bg',  'src/assets/images/menu.png');
    this.load.image('valhala_bg', 'src/assets/images/valhala_imagem.png');
  }

  create() {
    // Regista as linguas carregadas
    registarIdioma('pt', this.cache.json.get('pt'));
    registarIdioma('en', this.cache.json.get('en'));

    // Filtro suave para a imagem do menu (pixelArt mode usa NEAREST por defeito)
    this.textures.get('menu_bg').setFilter(Phaser.Textures.LINEAR);
    this.textures.get('valhala_bg').setFilter(Phaser.Textures.LINEAR);

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

    // Animacao da serpente a rastejar (linha de cima da spritesheet).
    this.anims.create({
      key: 'serpente_move',
      frames: this.anims.generateFrameNumbers('serpente', { frames: [0, 1, 2, 3, 4, 5, 6] }),
      frameRate: 8,
      repeat: -1,
    });

    // Animacao do troll a andar (lento, e o tanque pesado).
    this.anims.create({
      key: 'troll_walk',
      frames: this.anims.generateFrameNumbers('troll', { frames: [0, 1, 2, 3] }),
      frameRate: 5,
      repeat: -1,
    });

    // Animacao do corvo a voar (linha do meio da folha, frames 8 a 15).
    this.anims.create({
      key: 'corvo_fly',
      frames: this.anims.generateFrameNumbers('corvo', { frames: [8, 9, 10, 11, 12, 13, 14, 15] }),
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