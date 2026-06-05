import { t } from '../i18n/i18n.js';

export default class UpgradeScene extends Phaser.Scene {
  constructor() { super('UpgradeScene'); }

  init(data) {
    this.level    = data.level    || 1;
    this.upgrades = data.upgrades || [];
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, 0x000000, 0.80);

    this.add.text(cx, cy - 150, `${t('nivel').toUpperCase()} ${this.level}`, {
      fontFamily: 'monospace', fontSize: '40px', color: '#f2c14e', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 95, t('upgrade_escolhe'), {
      fontFamily: 'monospace', fontSize: '20px', color: '#cfd3dc',
    }).setOrigin(0.5);

    const cardW = 170, cardH = 200, gap = 24;
    const totalW = 3 * cardW + 2 * gap;
    const startX = cx - totalW / 2 + cardW / 2;

    this.upgrades.forEach((u, i) => this.criarCarta(startX + i * (cardW + gap), cy + 20, cardW, cardH, u));
  }

  criarCarta(x, y, w, h, upgrade) {
    const carta = this.add.rectangle(x, y, w, h, 0x1a2535)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x3a4a5a);

    const simbolo = this.add.text(x, y - 55, upgrade.letra, {
      fontFamily: 'monospace', fontSize: '28px', color: '#cfd3dc', fontStyle: 'bold',
    }).setOrigin(0.5);

    carta.on('pointerover', () => { carta.setFillColor(0x243045); carta.setStrokeStyle(2, 0xf2c14e); simbolo.setColor('#f2c14e'); });
    carta.on('pointerout',  () => { carta.setFillColor(0x1a2535); carta.setStrokeStyle(2, 0x3a4a5a); simbolo.setColor('#cfd3dc'); });
    carta.on('pointerdown', () => this.escolherUpgrade(upgrade.key));

    this.add.rectangle(x, y - 55, 56, 56, 0x0d1520).setStrokeStyle(1, 0x4a5a6a);
    // (re-desenha a letra por cima da caixa)
    simbolo.setDepth(1);

    this.add.text(x, y + 10, upgrade.nome, {
      fontFamily: 'monospace', fontSize: '15px', color: '#f2c14e', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(x, y + 55, t(upgrade.descKey), {
      fontFamily: 'monospace', fontSize: '12px', color: '#a0a8b8', align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);
  }

  escolherUpgrade(key) {
    this.scene.get('GameScene').events.emit('upgradeChosen', key);
    this.scene.stop('UpgradeScene');
    this.scene.resume('GameScene');
  }
}