export default class Companion extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'corvo');
    scene.add.existing(this);
    this.setDepth(9);

    // O sprite e pequeno (16x16), por isso aumenta-se um pouco. Toca a
    // animacao de bater as asas em continuo.
    this.setScale(1.6);
    this.play('corvo_fly');

    this.fireCooldown   = 1800;  // bem mais lento que os machados, para nao facilitar
    this.proximoDisparo = 0;
    this.range          = 360;   // so dispara a inimigos dentro deste alcance
    this.projSpeed      = 380;
    this.projLifespan   = 1600;

    // Cada corvo paira num ponto um pouco diferente para nao ficarem todos
    // colados uns aos outros.
    this.offsetX = Phaser.Math.Between(-45, 45);
    this.offsetY = Phaser.Math.Between(-45, 45);
  }

  // Acompanha o jogador de forma suave, mantendo o seu desvio.
  seguir(player) {
    const alvoX = player.x + this.offsetX;
    const alvoY = player.y + this.offsetY;

    // Vira-se para o lado do alvo. Por defeito o corvo olha para a esquerda,
    // por isso espelha-se quando o alvo esta a direita. A zona morta evita
    // que fique a tremer quando ja esta quase no sitio.
    const dx = alvoX - this.x;
    if (dx > 4)       this.setFlipX(true);
    else if (dx < -4) this.setFlipX(false);

    this.x = Phaser.Math.Linear(this.x, alvoX, 0.08);
    this.y = Phaser.Math.Linear(this.y, alvoY, 0.08);
  }

  // Procura o inimigo mais proximo dentro do alcance e cospe-lhe uma bola
  // de fogo. As bolas vao para o seu proprio grupo, tratado no GameScene.
  tentarDisparar(time, enemies, fireballs) {
    if (time < this.proximoDisparo) return;
    const alvo = this._inimigoMaisProximo(enemies);
    if (!alvo) return;

    const fb = fireballs.create(this.x, this.y, 'bolafogo');
    fb.setDepth(5);
    this.scene.physics.moveTo(fb, alvo.x, alvo.y, this.projSpeed);
    this.scene.time.delayedCall(this.projLifespan, () => { if (fb.active) fb.destroy(); });

    this.proximoDisparo = time + this.fireCooldown;
  }

  _inimigoMaisProximo(enemies) {
    let melhor = null;
    let melhorDist = this.range;
    enemies.getChildren().forEach((e) => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < melhorDist) { melhorDist = d; melhor = e; }
    });
    return melhor;
  }
}