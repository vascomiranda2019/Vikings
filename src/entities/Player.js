export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'heroi');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // O sprite do viking e grande e tem muito espaco vazio a volta. Encolhe-se
    // um pouco e ajusta-se o corpo de colisao ao boneco real (centrado em x,
    // para o virar de lado nao desalinhar a colisao).
    this.setScale(0.7).setDepth(10);
    this.body.setSize(34, 46);
    this.body.setOffset(40, 24);
    this.setCollideWorldBounds(true);

    this.play('viking_idle');

    this.speed          = 220;
    this.maxHP          = 100;
    this.hp             = 100;
    this.iframeDuration = 1000;
    this.iFrames        = false;
    this.axeSpeed       = 480;
    this.axeCooldown    = 1;   // tempo entre disparos automaticos (ms)
    this.axeLifespan    = 1500;
    this.proximoDisparo = 0;

    // Runas de ataque/recolha
    this.projeteis   = 1;   // machados por disparo (Wunjo, max 3)
    this.pierce      = 0;   // inimigos extra que cada machado atravessa (Thurisaz)
    this.magnetRange = 0;   // raio a que as gemas sao atraidas (Laguz)

    this.xp            = 0;
    this.level         = 1;
    this.xpToNextLevel = 50;

    // Escudo unico: vale 1 e nao se acumula nem regenera sozinho. Quando
    // parte, fica a zero ate o jogador voltar a escolher a runa Eihwaz.
    this.shield = 0;

    this.morreu = false;
  }

  mover(cursors, wasd) {
    let dx = 0, dy = 0;
    if (cursors.left.isDown  || wasd.left.isDown)  dx = -1;
    else if (cursors.right.isDown || wasd.right.isDown) dx =  1;
    if (cursors.up.isDown    || wasd.up.isDown)    dy = -1;
    else if (cursors.down.isDown  || wasd.down.isDown)  dy =  1;
    const len = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);

    // Toca a animacao de andar quando se move, parado caso contrario.
    const aMover = dx !== 0 || dy !== 0;
    this.play(aMover ? 'viking_walk' : 'viking_idle', true);

    // Vira-se para o lado em que se move (ja nao depende do rato).
    if (dx < 0) this.setFlipX(true);
    else if (dx > 0) this.setFlipX(false);
  }

  levaDano(amount) {
    if (this.iFrames || this.morreu) return false;

    // Se houver escudo, ele absorve o golpe inteiro e parte (fica a zero).
    if (this.shield > 0) {
      this.shield = 0;
      this.scene.cameras.main.shake(120, 0.008);
      this._ativarIFrames();
      return false;
    }

    this.hp -= amount;
    this.scene.cameras.main.shake(180, 0.012);
    if (this.hp <= 0) {
      this.hp = 0;
      this.morreu = true;
      return true;
    }
    this._ativarIFrames();
    return false;
  }

  // Pisca o jogador durante o periodo de invencibilidade. Usado tanto quando
  // se leva dano a serio como quando um escudo absorve um golpe.
  _ativarIFrames() {
    this.iFrames = true;
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 150,
      repeat: Math.floor(this.iframeDuration / 150),
      yoyo: true,
      onComplete: () => { this.setAlpha(1); this.iFrames = false; },
    });
  }

  // Retorna true se subiu de nível
  ganharXP(amount) {
    this.xp += amount;
    return this.xp >= this.xpToNextLevel;
  }

  // Aplica a subida de nível e retorna o novo nível
  subirNivel() {
    const excesso      = this.xp - this.xpToNextLevel;
    this.level++;
    this.xpToNextLevel = 50 * this.level;   // 100, 150, 200, 250...
    this.xp            = Math.max(0, excesso);
    return this.level;
  }

  aplicarUpgrade(key) {
    switch (key) {
      case 'vida':
        this.maxHP += 25;
        this.hp     = Math.min(this.hp + 25, this.maxHP);
        break;
      case 'machado':    this.axeSpeed       += 80;  break;
      case 'escudo':     this.shield = 1;            break;  // ganha um escudo
      case 'multishot':  this.projeteis = Math.min(this.projeteis + 1, 3); break;
      case 'perfuracao': this.pierce    = Math.min(this.pierce + 1, 4);    break;
      case 'iman':       this.magnetRange += 120;                          break;
    }
  }

  // Dispara sozinho, em cadencia, mirando sempre o inimigo mais proximo.
  // Ja nao usa o rato nem precisa de carregar em nada.
  tentarDisparar(time, axes, enemies) {
    if (time <= this.proximoDisparo) return;

    const alvo = this._inimigoMaisProximo(enemies);
    if (!alvo) return;   // sem inimigos por perto, nao desperdica machados

    const baseAng = Math.atan2(alvo.y - this.y, alvo.x - this.x);
    const n       = this.projeteis;
    const spread  = 0.18;                     // radianos entre machados adjacentes
    const inicio  = -((n - 1) / 2) * spread;  // centra o leque na direcao do alvo

    for (let i = 0; i < n; i++) {
      this._criarMachado(baseAng + inicio + i * spread, axes);
    }

    // Som uma vez por rajada (nao por machado), para nao ficar demasiado alto.
    if (this.scene.cache.audio.exists('machado')) {
      this.scene.sound.play('machado', { volume: 0.55 });
    }

    this.proximoDisparo = time + this.axeCooldown;
  }

  _inimigoMaisProximo(enemies) {
    let melhor = null;
    let melhorDist = Infinity;
    enemies.getChildren().forEach((e) => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < melhorDist) { melhorDist = d; melhor = e; }
    });
    return melhor;
  }

  _criarMachado(angulo, axes) {
    const m = axes.create(this.x, this.y, 'machado');
    m.setDepth(5).setAngularVelocity(720);
    m.setVelocity(Math.cos(angulo) * this.axeSpeed, Math.sin(angulo) * this.axeSpeed);
    m.golpesRestantes = this.pierce;   // quantos inimigos ainda pode atravessar
    this.scene.time.delayedCall(this.axeLifespan, () => { if (m.active) m.destroy(); });
  }
}