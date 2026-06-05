export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  static get TYPES() {
    return {
      draugr: { texture: 'draugr', speed: 70,  hp: 1, gemas: 1 },
      lobo:   { texture: 'lobo',   speed: 140, hp: 1, gemas: 1 },
      jotunn: { texture: 'jotunn', speed: 45,  hp: 3, gemas: 3 },
    };
  }

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  init(tipoKey) {
    const tipo   = Enemy.TYPES[tipoKey];
    this.tipoKey = tipoKey;
    this.hp      = tipo.hp;
    this.speed   = tipo.speed;
    this.gemas   = tipo.gemas;
    this.setCollideWorldBounds(true);
    return this;
  }

  moverParaJogador(player) {
    if (this.active) this.scene.physics.moveToObject(this, player, this.speed);
  }

  // Retorna true se morreu
  receberDano() {
    this.hp--;
    if (this.hp <= 0) return true;
    this.setTint(0xff5555);
    this.scene.time.delayedCall(150, () => { if (this.active) this.clearTint(); });
    return false;
  }

  mostrarDano() {
    const { x, y } = this;
    const txt = this.scene.add.text(x, y - 10, '-1', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ff6666',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200);
    this.scene.tweens.add({
      targets: txt, y: y - 50, alpha: 0, duration: 700, ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  particulasMorte() {
    const cor = this.tipoKey === 'jotunn' ? 0x7ab8cc
              : this.tipoKey === 'lobo'   ? 0x8a8a9a : 0x4a5d3a;
    const num = this.tipoKey === 'jotunn' ? 10 : 6;
    const { x, y } = this;
    for (let i = 0; i < num; i++) {
      const ang  = (i / num) * Math.PI * 2;
      const dist = Phaser.Math.Between(20, 50);
      const p    = this.scene.add.circle(x, y, Phaser.Math.Between(2, 5), cor).setDepth(15);
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: Phaser.Math.Between(300, 500), ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }
}
