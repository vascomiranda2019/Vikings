import { t } from '../i18n/i18n.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.kills = data.kills || 0;
    this.tempo = data.tempo || '0:00';
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    this.add.rectangle(cx, cy, w, h, 0x000000, 0.80);

    this.add.text(cx, cy - 110, t('gameover_titulo'), {
      fontFamily: 'monospace', fontSize: '32px', color: '#e8c87a', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 30, `${t('abates')}: ${this.kills}`, {
      fontFamily: 'monospace', fontSize: '24px', color: '#cfd3dc',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 10, `${t('sobreviveste')}: ${this.tempo}`, {
      fontFamily: 'monospace', fontSize: '20px', color: '#a0a8b8',
    }).setOrigin(0.5);

    const instrucao = this.add.text(cx, cy + 70, t('reiniciar'), {
      fontFamily: 'monospace', fontSize: '20px', color: '#7e8597',
    }).setOrigin(0.5);

    this.tweens.add({ targets: instrucao, alpha: { from: 1, to: 0.3 }, duration: 700, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-R', () => this.scene.start('GameScene'));
  }
}