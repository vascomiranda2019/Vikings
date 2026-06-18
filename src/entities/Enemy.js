export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  static get TYPES() {
    return {
      // Inimigo fraco: serpente (cria de Jormungandr). Usa uma spritesheet
      // animada, por isso traz escala, corpo de colisao e animacao proprios.
      serpente: {
        texture: 'serpente', speed: 70, hp: 1, gemas: 1,
        anim: 'serpente_move', escala: 0.6,
        corpo: { w: 44, h: 18, offX: 10, offY: 35 },
        corMorte: 0x6fcf6f,
      },
      lobo:   {
        texturas: ['lobo1', 'lobo2', 'lobo3', 'lobo4', 'lobo5'],
        speed: 140, hp: 1, gemas: 1,
        escala: 0.6,
        corpo: { w: 46, h: 28, offX: 9, offY: 24 },
        corMorte: 0x8a8a9a,
      },
      // Inimigo forte: troll (no papel do jotunn). Tambem usa spritesheet.
      jotunn: {
        texture: 'troll', speed: 45, hp: 3, gemas: 3,
        anim: 'troll_walk', escala: 0.8,
        corpo: { w: 30, h: 58, offX: 17, offY: 9 },
        corMorte: 0x6b4a3a,
      },
    };
  }

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  init(tipoKey) {
    const tipo    = Enemy.TYPES[tipoKey];
    this.tipoKey  = tipoKey;
    this.hp       = tipo.hp;
    this.speed    = tipo.speed;
    this.gemas    = tipo.gemas;
    this.corMorte = tipo.corMorte;
    this.setCollideWorldBounds(true);

    // Os inimigos com sprite real (spritesheet) trazem escala, corpo ajustado
    // e animacao. Os que ainda sao texturas geradas por codigo nao tem estes
    // campos e ficam exatamente como estavam.
    if (tipo.escala) this.setScale(tipo.escala);
    if (tipo.corpo) {
      this.body.setSize(tipo.corpo.w, tipo.corpo.h);
      this.body.setOffset(tipo.corpo.offX, tipo.corpo.offY);
    }
    if (tipo.anim) this.play(tipo.anim);

    return this;
  }

  moverParaJogador(player) {
    if (!this.active) return;
    this.scene.physics.moveToObject(this, player, this.speed);

    // Vira-se para o lado do movimento. A serpente, por defeito, olha para a
    // esquerda, por isso vira-se (flip) quando vai para a direita.
    const vx = this.body.velocity.x;
    if (vx > 2)       this.setFlipX(true);
    else if (vx < -2) this.setFlipX(false);
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
    const cor = this.corMorte || 0x6fcf6f;
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