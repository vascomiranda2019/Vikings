
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  // --- Constantes 
  static get CFG() {
    return {
      WORLD_SIZE:       2400,
      PLAYER_SPEED:     220,
      PLAYER_HP:        100,   // vida inicial
      ENEMY_DAMAGE:      20,   // dano por toque (5 toques = morte)
      IFRAME_MS:       1000,   // ms de invencibilidade apos levar dano
      ENEMY_SPEED:       70,
      ENEMY_SPAWN_MS:   900,
      ENEMY_SPAWN_DIST: 600,
      AXE_SPEED:        480,
      AXE_COOLDOWN_MS:  350,
      AXE_LIFESPAN_MS: 1500,
    };
  }

  create() {
    const c = GameScene.CFG;

    this.kills        = 0;
    this.playerHP     = c.PLAYER_HP;
    this.iFrames      = false;   // true = jogador invencivel
    this.morreu       = false;   // impede dano depois de morrer
    this.proximoDisparo = 0;

    this.criarFundo();
    this.criarTexturas();
    this.criarJogador();
    this.criarControlos();
    this.configurarCamara();
    this.criarGrupos();
    this.criarTemporizadores();
    this.criarColisoes();
    this.criarHUD();
  }

  // ---- SETUP ----

  criarFundo() {
    const { WORLD_SIZE } = GameScene.CFG;
    const g = this.add.graphics();
    g.fillStyle(0x12131a, 1);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(1, 0x1e2233, 1);
    g.strokeRect(0, 0, 64, 64);
    g.generateTexture('grelha', 64, 64);
    g.destroy();

    this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'grelha').setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  }

  criarTexturas() {
    // Heroi
    let g = this.add.graphics();
    g.fillStyle(0x2b3b55, 1);
    g.fillRoundedRect(0, 0, 28, 34, 6);
    g.fillStyle(0xd9a441, 1);
    g.fillRoundedRect(4, 0, 20, 12, 4);
    g.generateTexture('heroi', 28, 34);
    g.destroy();

    // Draugr
    g = this.add.graphics();
    g.fillStyle(0x4a5d3a, 1);
    g.fillRoundedRect(0, 0, 26, 30, 5);
    g.fillStyle(0x6b7d57, 1);
    g.fillRoundedRect(3, 2, 20, 10, 3);
    g.generateTexture('draugr', 26, 30);
    g.destroy();

    // Machado barbado
    g = this.add.graphics();
    g.fillStyle(0x6b4423, 1);
    g.fillRect(11, 3, 4, 22);
    g.fillStyle(0x8a5a2e, 1);
    g.fillRect(11, 3, 2, 22);
    g.fillStyle(0xb8bcc6, 1);
    g.fillPoints([{x:13,y:2},{x:24,y:4},{x:26,y:11},{x:19,y:16},{x:13,y:14}], true);
    g.fillStyle(0xe6e8ee, 1);
    g.fillPoints([{x:24,y:4},{x:26,y:11},{x:22,y:12},{x:22,y:6}], true);
    g.generateTexture('machado', 28, 28);
    g.destroy();
  }

  criarJogador() {
    const { WORLD_SIZE } = GameScene.CFG;
    this.player = this.physics.add.sprite(WORLD_SIZE / 2, WORLD_SIZE / 2, 'heroi');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
  }

  criarControlos() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  configurarCamara() {
    const { WORLD_SIZE } = GameScene.CFG;
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  criarGrupos() {
    this.enemies = this.physics.add.group();
    this.axes    = this.physics.add.group();
  }

  criarTemporizadores() {
    const { ENEMY_SPAWN_MS } = GameScene.CFG;
    this.time.addEvent({
      delay: ENEMY_SPAWN_MS,
      loop: true,
      callback: () => this.nascerInimigo(),
    });
  }

  criarColisoes() {
    // Machado acerta no draugr
    this.physics.add.overlap(
      this.axes, this.enemies,
      (axe, enemy) => this.machadoAcerta(axe, enemy),
      null, this
    );

    // Draugr toca no jogador → dano
    this.physics.add.overlap(
      this.player, this.enemies,
      () => this.jogadorLevaDano(),
      null, this
    );
  }

  criarHUD() {
    // Texto de abates
    this.killsText = this.add.text(16, 16, 'Abates: 0', {
      fontFamily: 'monospace', fontSize: '18px', color: '#cfd3dc',
    }).setScrollFactor(0).setDepth(100);

    // Barra de vida: fundo + preenchimento
    this.add.text(16, 46, 'HP', {
      fontFamily: 'monospace', fontSize: '13px', color: '#e03c3c',
    }).setScrollFactor(0).setDepth(100);

    this.hpBarBg = this.add.rectangle(40, 52, 120, 12, 0x6b1a1a)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

    this.hpBar = this.add.rectangle(40, 52, 120, 12, 0xe03c3c)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

    // Instrucoes
    this.add.text(16, 70, 'WASD: mover | rato: apontar e disparar', {
      fontFamily: 'monospace', fontSize: '13px', color: '#7e8597',
    }).setScrollFactor(0).setDepth(100);
  }

  // ---- LOGICA ----

  nascerInimigo() {
    if (this.morreu) return;
    const { ENEMY_SPAWN_DIST } = GameScene.CFG;
    const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const x = this.player.x + Math.cos(angulo) * ENEMY_SPAWN_DIST;
    const y = this.player.y + Math.sin(angulo) * ENEMY_SPAWN_DIST;
    const draugr = this.enemies.create(x, y, 'draugr');
    draugr.setCollideWorldBounds(true);
  }

  dispararMachado(tx, ty) {
    const { AXE_SPEED, AXE_LIFESPAN_MS } = GameScene.CFG;
    const machado = this.axes.create(this.player.x, this.player.y, 'machado');
    machado.setDepth(5);
    machado.setAngularVelocity(720);
    this.physics.moveTo(machado, tx, ty, AXE_SPEED);
    this.time.delayedCall(AXE_LIFESPAN_MS, () => {
      if (machado.active) machado.destroy();
    });
  }

  machadoAcerta(machado, draugr) {
    machado.destroy();
    draugr.destroy();
    this.kills += 1;
    this.killsText.setText('Abates: ' + this.kills);
  }

  jogadorLevaDano() {
    if (this.iFrames || this.morreu) return;

    const { ENEMY_DAMAGE, PLAYER_HP, IFRAME_MS } = GameScene.CFG;
    this.playerHP -= ENEMY_DAMAGE;

    // Atualiza a barra de vida
    const perc = Math.max(0, this.playerHP / PLAYER_HP);
    this.hpBar.width = 120 * perc;

    if (this.playerHP <= 0) {
      this.morrerJogador();
      return;
    }

    // Ativa iframes: jogador fica a piscar durante 1 segundo
    this.iFrames = true;
    this.tweens.add({
      targets: this.player,
      alpha: { from: 0.3, to: 1 },
      duration: 150,
      repeat: Math.floor(IFRAME_MS / 150),
      yoyo: true,
      onComplete: () => {
        this.player.setAlpha(1);
        this.iFrames = false;
      },
    });
  }

  morrerJogador() {
    this.morreu = true;
    this.physics.pause();

    // Tinge o jogador de vermelho
    this.player.setTint(0xff4444);

    // Camera shake no momento da morte
    this.cameras.main.shake(400, 0.02);

    // Apos 800ms vai para o ecra de Game Over
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', { kills: this.kills });
    });
  }

  // ---- LOOP 

  update(time) {
    if (this.morreu) return; // nao processa input depois de morrer

    this.moverJogador();
    this.moverInimigos();
    this.tentarDisparar(time);
  }

  moverJogador() {
    const { PLAYER_SPEED } = GameScene.CFG;
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx =  1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
    else if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy =  1;

    const len = Math.hypot(dx, dy) || 1;
    this.player.setVelocity(
      (dx / len) * PLAYER_SPEED,
      (dy / len) * PLAYER_SPEED
    );

    const ptr = this.input.activePointer;
    if (ptr.worldX < this.player.x) this.player.setFlipX(true);
    else this.player.setFlipX(false);
  }

  moverInimigos() {
    const { ENEMY_SPEED } = GameScene.CFG;
    this.enemies.getChildren().forEach((inimigo) => {
      if (inimigo.active) {
        this.physics.moveToObject(inimigo, this.player, ENEMY_SPEED);
      }
    });
  }

  tentarDisparar(time) {
    const { AXE_COOLDOWN_MS } = GameScene.CFG;
    const ptr = this.input.activePointer;
    if (ptr.isDown && time > this.proximoDisparo) {
      this.dispararMachado(ptr.worldX, ptr.worldY);
      this.proximoDisparo = time + AXE_COOLDOWN_MS;
    }
  }
}