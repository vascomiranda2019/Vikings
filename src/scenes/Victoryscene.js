import { t } from '../i18n/i18n.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  init(data) {
    this.kills = data.kills || 0;
    this.tempo = data.tempo || '3:00';
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    this.add.rectangle(cx, cy, w, h, 0x1a1200, 0.92);

    this.add.text(cx, cy - 120, t('vitoria_titulo'), {
      fontFamily: 'monospace', fontSize: '32px', color: '#f2c14e', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 70, t('vitoria_sub'), {
      fontFamily: 'monospace', fontSize: '18px', color: '#e8d090',
    }).setOrigin(0.5);

    this.add.rectangle(cx, cy - 40, 300, 2, 0xf2c14e, 0.5);

    this.add.text(cx, cy, `${t('abates')}: ${this.kills}`, {
      fontFamily: 'monospace', fontSize: '24px', color: '#cfd3dc',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 40, `${t('tempo_sobrevivido')}: ${this.tempo}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#a0a8b8',
    }).setOrigin(0.5);

    const instrucao = this.add.text(cx, cy + 100, t('reiniciar'), {
      fontFamily: 'monospace', fontSize: '20px', color: '#7e8597',
    }).setOrigin(0.5);
    this.tweens.add({ targets: instrucao, alpha: { from: 1, to: 0.2 }, duration: 700, yoyo: true, repeat: -1 });

    this.criarEstrelas(w, h);

    this.input.keyboard.once('keydown-R', () => this.scene.start('GameScene'));
  }

  criarEstrelas(w, h) {
    for (let i = 0; i < 30; i++) {
      const estrela = this.add.rectangle(
        Phaser.Math.Between(0, w), Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 4), Phaser.Math.Between(1, 4), 0xf2c14e, 0.8
      );
      this.tweens.add({
        targets: estrela, alpha: { from: 0.8, to: 0.1 },
        duration: Phaser.Math.Between(800, 2000), delay: Phaser.Math.Between(0, 2000),
        yoyo: true, repeat: -1,
      });
    }
  }
}