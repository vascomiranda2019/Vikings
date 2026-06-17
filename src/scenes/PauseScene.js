import { t } from '../i18n/i18n.js';
import { guardarVolume } from '../som.js';

export default class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    // Fundo escurecido por cima do jogo pausado
    this.add.rectangle(cx, cy, w, h, 0x000000, 0.75);

    // Painel central
    this.add.rectangle(cx, cy, 320, 400, 0x12131a, 0.92).setStrokeStyle(2, 0x3a4a5a);

    // Titulo
    this.add.text(cx, cy - 130, t('pausa_titulo'), {
      fontFamily: 'monospace', fontSize: '32px', color: '#f2c14e',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.rectangle(cx, cy - 95, 240, 2, 0xf2c14e, 0.4);

    // Botoes
    this.criarBotao(cx, cy - 30, 240, 52, t('pausa_continuar'), 0xf2c14e, 18, () => this.continuar());
    this.criarBotao(cx, cy + 38, 240, 52, t('pausa_recomecar'), 0x6a7686, 18, () => this.recomecar());
    this.criarBotao(cx, cy + 106, 240, 52, t('pausa_terminar'), 0xe03c3c, 18, () => this.terminar());

    // Toggle de som
    this._criarToggleSom(cx, cy + 148);

    // Dica de teclado
    const dica = this.add.text(cx, cy + 178, t('pausa_dica'), {
      fontFamily: 'monospace', fontSize: '12px', color: '#7e8597',
    }).setOrigin(0.5);
    this.tweens.add({ targets: dica, alpha: { from: 1, to: 0.3 }, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-ESC', () => this.continuar());
  }

  // ---- ACOES ----

  continuar() {
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  recomecar() {
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  terminar() {
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }

  // ---- BARRA DE VOLUME ----

  _criarToggleSom(cx, y) {
    const TRACK_W = 120;
    const TRACK_H = 8;
    const iconX   = cx - 52;
    const trackLX = cx - 34;
    const trackCX = trackLX + TRACK_W / 2;

    // Separador acima da barra
    this.add.rectangle(cx, y - 16, 240, 1, 0x3a4a5a, 0.6);

    this.add.text(cx - 72, y + 4, t('som') + ':', {
      fontFamily: 'monospace', fontSize: '13px', color: '#565e70',
    }).setOrigin(1, 0.5);

    let volAnterior = this.sound.volume > 0 ? this.sound.volume : 0.7;

    const obterCorAtiva  = () => this.sound.volume > 0 ? 0xf2c14e : 0x3a4455;
    const obterIcone     = () => this.sound.volume > 0 ? '♪' : '✕';
    const obterCorIcone  = () => this.sound.volume > 0 ? '#f2c14e' : '#4a5060';

    const icone = this.add.text(iconX, y + 4, obterIcone(), {
      fontFamily: 'monospace', fontSize: '18px', color: obterCorIcone(),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Pista de fundo
    this.add.rectangle(trackCX, y + 4, TRACK_W, TRACK_H, 0x2a3040).setOrigin(0.5);

    // Preenchimento dinamico
    const fill   = this.add.rectangle(trackLX, y + 4, 0, TRACK_H, 0xf2c14e).setOrigin(0, 0.5);
    // Handle
    const handle = this.add.rectangle(trackLX, y + 4, 8, 20, 0xf2c14e).setOrigin(0.5);
    // Hitbox invisivel
    const hitbox = this.add.rectangle(trackCX, y + 4, TRACK_W, 24, 0, 0)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    const atualizar = (vol) => {
      vol = Phaser.Math.Clamp(vol, 0, 1);
      this.sound.setVolume(vol);
      guardarVolume(vol);
      fill.width = TRACK_W * vol;
      handle.x   = trackLX + TRACK_W * vol;
      fill.setFillStyle(obterCorAtiva());
      handle.setFillStyle(obterCorAtiva());
      icone.setText(obterIcone());
      icone.setColor(obterCorIcone());
    };

    atualizar(this.sound.volume);

    let arrastando = false;
    const calcVol = (px) => Phaser.Math.Clamp((px - trackLX) / TRACK_W, 0, 1);

    hitbox.on('pointerdown', (pointer) => {
      arrastando = true;
      const v = calcVol(pointer.x);
      if (v > 0) volAnterior = v;
      atualizar(v);
    });
    this.input.on('pointermove', (pointer) => {
      if (!arrastando) return;
      const v = calcVol(pointer.x);
      if (v > 0) volAnterior = v;
      atualizar(v);
    });
    this.input.on('pointerup', () => { arrastando = false; });

    icone.on('pointerdown', () => {
      if (this.sound.volume > 0) {
        volAnterior = this.sound.volume;
        atualizar(0);
      } else {
        atualizar(volAnterior > 0 ? volAnterior : 0.7);
      }
    });
  }

  // ---- HELPER BOTAO (mesmo estilo da MenuScene) ----

  criarBotao(x, y, larg, alt, texto, corBorda, tamFonte, aoClicar) {
    const corCSS = Phaser.Display.Color.IntegerToColor(corBorda).rgba;

    const bg = this.add.rectangle(x, y, larg, alt, 0x0c1120)
      .setStrokeStyle(2, corBorda);
    // Borda interior subtil
    this.add.rectangle(x, y, larg - 6, alt - 6, 0x000000, 0)
      .setStrokeStyle(1, corBorda, 0.25);

    const txt = this.add.text(x, y, texto, {
      fontFamily: 'monospace', fontSize: `${tamFonte}px`,
      color: corCSS, fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillColor(0x172035);
      txt.setColor('#ffffff');
      this.tweens.add({ targets: [bg, txt], scaleX: 1.06, scaleY: 1.06, duration: 110, ease: 'Back.easeOut' });
    });
    bg.on('pointerout', () => {
      bg.setFillColor(0x0c1120);
      txt.setColor(corCSS);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 110 });
    });
    bg.on('pointerdown', aoClicar);
  }
}
