export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'dragao');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.isBoss  = true;
    this.tipoKey = 'dragao';
    this.maxHp   = 200;    // afina aqui a dureza do boss
    this.hp      = this.maxHp;
    this.speed   = 40;     // lento mas implacavel
    this.gemas   = 0;

    this.setDepth(11);
    this.setScale(6);          // o sprite e 16x16; amplia-se para impor como boss
    this.play('dragao_fly');
    // Corpo de colisao um pouco mais pequeno que o sprite, para ser justo.
    this.body.setSize(this.width * 0.6, this.height * 0.6);
    this.setCollideWorldBounds(true);
  }

  moverParaJogador(player) {
    if (!this.active) return;
    this.scene.physics.moveToObject(this, player, this.speed);
    const vx = this.body.velocity.x;
    if (vx > 2)       this.setFlipX(true);
    else if (vx < -2) this.setFlipX(false);
  }

  // Retorna true se morreu. A barra de vida e atualizada no GameScene.
  receberDano() {
    this.hp--;
    this.setTint(0xff8888);
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });
    return this.hp <= 0;
  }

  // O boss nao mostra "-1" a cada golpe; a barra de vida ja chega e evita
  // encher o ecra de numeros quando leva muitos acertos seguidos.
  mostrarDano() {}

  // Explosao grande quando o dragao cai.
  particulasMorte() {
    const { x, y } = this;
    for (let i = 0; i < 24; i++) {
      const ang  = (i / 24) * Math.PI * 2;
      const dist = Phaser.Math.Between(40, 110);
      const cor  = Phaser.Utils.Array.GetRandom([0xff3b00, 0xff8c1a, 0xffe27a, 0x8a1a1a]);
      const p    = this.scene.add.circle(x, y, Phaser.Math.Between(3, 8), cor).setDepth(20);
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: Phaser.Math.Between(500, 900), ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }
}