import { obterIdioma, definirIdioma, t } from '../i18n/i18n.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    this.add.tileSprite(0, 0, w, h, 'grelha').setOrigin(0, 0);
    this.add.rectangle(cx, cy, w, h, 0x0b0c12, 0.55);

    this.add.text(cx, cy - 140, t('titulo'), {
      fontFamily: 'monospace', fontSize: '46px', color: '#f2c14e',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 92, t('subtitulo'), {
      fontFamily: 'monospace', fontSize: '17px', color: '#cfd3dc',
    }).setOrigin(0.5);

    // Botao Jogar (principal)
    this.criarBotao(cx, cy - 10, 220, 54, t('jogar'), 0xf2c14e, 24, () => {
      this.scene.start('GameScene');
    });

    // Botao Como Jogar (secundario)
    this.criarBotao(cx, cy + 56, 220, 44, t('instrucoes'), 0x6a7686, 16, () => {
      this.scene.start('InstructionsScene');
    });

    // Seletor de idioma
    this.criarSeletorIdioma(cx, cy + 125);
  }

  // Helper para criar um botao com hover
  criarBotao(x, y, w, h, texto, corBorda, tamFonte, aoClicar) {
    const btn = this.add.rectangle(x, y, w, h, 0x1a2535)
      .setStrokeStyle(2, corBorda)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, texto, {
      fontFamily: 'monospace', fontSize: `${tamFonte}px`,
      color: Phaser.Display.Color.IntegerToColor(corBorda).rgba,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => { btn.setFillColor(0x243045); txt.setColor('#ffffff'); });
    btn.on('pointerout',  () => { btn.setFillColor(0x1a2535); txt.setColor(Phaser.Display.Color.IntegerToColor(corBorda).rgba); });
    btn.on('pointerdown', aoClicar);
  }

  criarSeletorIdioma(cx, y) {
    this.add.text(cx - 70, y, t('idioma') + ':', {
      fontFamily: 'monospace', fontSize: '14px', color: '#cfd3dc',
    }).setOrigin(1, 0.5);

    const atual = obterIdioma();
    const linguas = [{ codigo: 'pt', label: 'PT' }, { codigo: 'en', label: 'EN' }];

    linguas.forEach((lingua, i) => {
      const x = cx - 30 + i * 64;
      const ativo = atual === lingua.codigo;
      const btn = this.add.text(x, y, lingua.label, {
        fontFamily: 'monospace', fontSize: '18px',
        color: ativo ? '#f2c14e' : '#7e8597',
        fontStyle: ativo ? 'bold' : 'normal',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        definirIdioma(lingua.codigo);
        this.scene.restart();
      });
    });
  }
}