import { t } from '../i18n/i18n.js';

export default class InstructionsScene extends Phaser.Scene {
  constructor() { super('InstructionsScene'); }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    // Fundo
    this.add.tileSprite(0, 0, w, h, 'grelha').setOrigin(0, 0);
    this.add.rectangle(cx, cy, w, h, 0x0b0c12, 0.85);

    // Painel
    this.add.rectangle(cx, cy, 580, 500, 0x12131a, 0.92).setStrokeStyle(2, 0x3a4a5a);

    // Titulo
    this.add.text(cx, cy - 215, t('instrucoes'), {
      fontFamily: 'monospace', fontSize: '30px', color: '#f2c14e',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // --- Objetivo ---
    this.seccao(cx, cy - 165, t('instr_objetivo_t'));
    this.add.text(cx, cy - 118, t('instr_objetivo'), {
      fontFamily: 'monospace', fontSize: '14px', color: '#cfd3dc',
      align: 'center', lineSpacing: 5,
    }).setOrigin(0.5);

    // --- Controlos ---
    this.seccao(cx, cy - 50, t('instr_controlos_t'));
    this.linha(cx, cy - 18, t('instr_mover'));
    this.linha(cx, cy + 2,  t('instr_apontar'));
    this.linha(cx, cy + 22, t('instr_atirar'));

    // --- Como funciona ---
    this.seccao(cx, cy + 62, t('instr_dicas_t'));
    this.linha(cx, cy + 92,  '• ' + t('instr_dica1'));
    this.linha(cx, cy + 112, '• ' + t('instr_dica2'));
    this.linha(cx, cy + 132, '• ' + t('instr_dica3'));
    this.linha(cx, cy + 152, '• ' + t('instr_dica4'));

    // Botao Voltar
    const btn = this.add.rectangle(cx, cy + 210, 160, 44, 0x1a2535)
      .setStrokeStyle(2, 0xf2c14e)
      .setInteractive({ useHandCursor: true });
    const btnTxt = this.add.text(cx, cy + 210, t('voltar'), {
      fontFamily: 'monospace', fontSize: '18px', color: '#f2c14e',
    }).setOrigin(0.5);

    btn.on('pointerover', () => { btn.setFillColor(0x243045); btnTxt.setColor('#ffffff'); });
    btn.on('pointerout',  () => { btn.setFillColor(0x1a2535); btnTxt.setColor('#f2c14e'); });
    btn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Tecla ESC tambem volta
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  seccao(x, y, texto) {
    this.add.text(x, y, texto, {
      fontFamily: 'monospace', fontSize: '18px', color: '#f2c14e', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  linha(x, y, texto) {
    this.add.text(x, y, texto, {
      fontFamily: 'monospace', fontSize: '13px', color: '#a8b0c0',
    }).setOrigin(0.5);
  }
}