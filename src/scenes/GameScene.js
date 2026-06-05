import { t } from '../i18n/i18n.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  static get TEMPO_VITORIA() { return 180; }

  static get ENEMY_TYPES() {
    return {
      draugr: { texture: 'draugr', speed: 70,  hp: 1, xp: 10 },
      lobo:   { texture: 'lobo',   speed: 140, hp: 1, xp: 8  },
      jotunn: { texture: 'jotunn', speed: 45,  hp: 3, xp: 30 },
    };
  }

  static get POOL_UPGRADES() {
    return [
      { key: 'velocidade', nome: 'Sowilo', letra: 'S', descKey: 'upg_velocidade' },
      { key: 'cadencia',   nome: 'Tiwaz',  letra: 'T', descKey: 'upg_cadencia' },
      { key: 'vida',       nome: 'Fehu',   letra: 'F', descKey: 'upg_vida' },
      { key: 'machado',    nome: 'Kenaz',  letra: 'K', descKey: 'upg_machado' },
      { key: 'protecao',   nome: 'Algiz',  letra: 'Z', descKey: 'upg_protecao' },
    ];
  }

  create() {
    this.kills   = 0;
    this.morreu  = false;
    this.venceu  = false;
    this.iFrames = false;
    this.proximoDisparo = 0;

    this.playerSpeed    = 220;
    this.maxHP          = 100;
    this.playerHP       = 100;
    this.iframeDuration = 1000;
    this.axeSpeed       = 480;
    this.axeCooldown    = 350;
    this.axeLifespan    = 1500;

    this.playerXP      = 0;
    this.level         = 1;
    this.xpToNextLevel = 50;
    this.elapsedTime   = 0;

    this.criarFundo();
    this.criarJogador();
    this.criarControlos();
    this.configurarCamara();
    this.criarGrupos();
    this.criarColisoes();
    this.criarHUD();
    this.iniciarTimers();

    this.events.on('upgradeChosen', (key) => this.aplicarUpgrade(key));
  }

  // ---- SETUP (texturas já existem, vêm do PreloadScene) ----

  criarFundo() {
    this.add.tileSprite(0, 0, 2400, 2400, 'grelha').setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, 2400, 2400);
  }

  criarJogador() {
    this.player = this.physics.add.sprite(1200, 1200, 'heroi');
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
    this.cameras.main.setBounds(0, 0, 2400, 2400);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  criarGrupos() {
    this.enemies = this.physics.add.group();
    this.axes    = this.physics.add.group();
    this.gems    = this.physics.add.group();
  }

  criarColisoes() {
    this.physics.add.overlap(this.axes, this.enemies,
      (axe, enemy) => this.machadoAcerta(axe, enemy), null, this);
    this.physics.add.overlap(this.player, this.enemies,
      () => this.jogadorLevaDano(), null, this);
    this.physics.add.overlap(this.player, this.gems,
      (p, gem) => this.recolherGema(gem), null, this);
  }

  criarHUD() {
    const cx = this.cameras.main.centerX;

    this.timerText = this.add.text(cx, 16, '0:00', {
      fontFamily: 'monospace', fontSize: '20px', color: '#f2c14e',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.countdownText = this.add.text(cx, 46, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e8c87a',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.killsText = this.add.text(16, 16, `${t('abates')}: 0`, {
      fontFamily: 'monospace', fontSize: '15px', color: '#cfd3dc',
    }).setScrollFactor(0).setDepth(100);

    this.levelText = this.add.text(16, 36, `${t('nivel')} 1`, {
      fontFamily: 'monospace', fontSize: '15px', color: '#f2c14e',
    }).setScrollFactor(0).setDepth(100);

    this.add.text(16, 58, t('hp'), {
      fontFamily: 'monospace', fontSize: '12px', color: '#e03c3c',
    }).setScrollFactor(0).setDepth(100);
    this.hpBarBg = this.add.rectangle(40, 64, 120, 10, 0x6b1a1a).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.hpBar   = this.add.rectangle(40, 64, 120, 10, 0xe03c3c).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

    this.add.text(16, 76, t('xp'), {
      fontFamily: 'monospace', fontSize: '12px', color: '#f2c14e',
    }).setScrollFactor(0).setDepth(100);
    this.xpBarBg = this.add.rectangle(40, 82, 120, 10, 0x4a3800).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.xpBar   = this.add.rectangle(40, 82, 0,   10, 0xf2c14e).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
  }

  iniciarTimers() {
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.morreu || this.venceu) return;
        this.elapsedTime++;
        this.timerText.setText(this.formatarTempo(this.elapsedTime));

        const restam = GameScene.TEMPO_VITORIA - this.elapsedTime;
        if (restam <= 30 && restam > 0) this.countdownText.setText(`${t('valhalla_em')} ${restam}s!`);
        else if (restam <= 0) this.countdownText.setText('');

        if (this.elapsedTime === 45)  this.mostrarAnuncio(t('anuncio_lobos'));
        if (this.elapsedTime === 90)  this.mostrarAnuncio(t('anuncio_jotunn'));
        if (this.elapsedTime === 150) this.mostrarAnuncio(t('anuncio_30s'));

        if (this.elapsedTime >= GameScene.TEMPO_VITORIA) this.vencerJogo();
      },
    });

    const spawnLoop = () => {
      if (this.morreu || this.venceu) return;
      this.spawnOnda();
      const delay = Math.max(400, 900 - Math.floor(this.elapsedTime / 30) * 80);
      this.time.delayedCall(delay, spawnLoop);
    };
    this.time.delayedCall(1000, spawnLoop);
  }

  // ---- SPAWN ----

  spawnOnda() {
    const tipos = this.tiposDisponiveis();
    const tipo  = Phaser.Utils.Array.GetRandom(tipos);
    if (tipo === 'lobo') {
      const base = Phaser.Math.FloatBetween(0, Math.PI * 2);
      for (let i = -1; i <= 1; i++) this.spawnInimigo('lobo', base + i * 0.4);
    } else {
      this.spawnInimigo(tipo, Phaser.Math.FloatBetween(0, Math.PI * 2));
    }
  }

  tiposDisponiveis() {
    const t2 = ['draugr'];
    if (this.elapsedTime >= 45) t2.push('lobo');
    if (this.elapsedTime >= 90) t2.push('jotunn');
    return t2;
  }

  spawnInimigo(tipoKey, angulo) {
    const tipo = GameScene.ENEMY_TYPES[tipoKey];
    const x = this.player.x + Math.cos(angulo) * 620;
    const y = this.player.y + Math.sin(angulo) * 620;
    const e = this.enemies.create(x, y, tipo.texture);
    e.setCollideWorldBounds(true);
    e.hp = tipo.hp; e.speed = tipo.speed; e.tipoKey = tipoKey; e.xpValue = tipo.xp;
  }

  // ---- LÓGICA ----

  dispararMachado(tx, ty) {
    const m = this.axes.create(this.player.x, this.player.y, 'machado');
    m.setDepth(5);
    m.setAngularVelocity(720);
    this.physics.moveTo(m, tx, ty, this.axeSpeed);
    this.time.delayedCall(this.axeLifespan, () => { if (m.active) m.destroy(); });
  }

  machadoAcerta(machado, enemy) {
    machado.destroy();
    enemy.hp--;
    if (enemy.hp <= 0) {
      const { x, y, xpValue, tipoKey } = enemy;
      enemy.destroy();
      this.kills++;
      this.killsText.setText(`${t('abates')}: ${this.kills}`);
      this.particulasMorte(x, y, tipoKey);
      const n = (tipoKey === 'jotunn') ? 3 : 1;
      for (let i = 0; i < n; i++) {
        this.gems.create(x + Phaser.Math.Between(-12, 12), y + Phaser.Math.Between(-12, 12), 'gema');
      }
      this.ganharXP(xpValue || 10);
    } else {
      enemy.setTint(0xff5555);
      this.time.delayedCall(150, () => { if (enemy.active) enemy.clearTint(); });
      this.mostrarDano(enemy.x, enemy.y);
    }
  }

  recolherGema(gema) {
    gema.destroy();
    this.ganharXP(10);
  }

  ganharXP(amount) {
    this.playerXP += amount;
    this.atualizarXPBar();
    if (this.playerXP >= this.xpToNextLevel) this.subirNivel();
  }

  atualizarXPBar() {
    this.xpBar.width = 120 * Math.min(1, this.playerXP / this.xpToNextLevel);
  }

  subirNivel() {
    const excesso = this.playerXP - this.xpToNextLevel;
    this.level++;
    this.xpToNextLevel = 50 + (this.level - 1) * 30;
    this.playerXP      = Math.max(0, excesso);
    this.xpBar.width   = 0;
    this.levelText.setText(`${t('nivel')} ${this.level}`);

    this.cameras.main.flash(300, 242, 193, 78, false);

    const pool = Phaser.Utils.Array.Shuffle([...GameScene.POOL_UPGRADES]);
    this.scene.pause('GameScene');
    this.scene.launch('UpgradeScene', { level: this.level, upgrades: pool.slice(0, 3) });
  }

  aplicarUpgrade(key) {
    switch (key) {
      case 'velocidade': this.playerSpeed  += 30; break;
      case 'cadencia':   this.axeCooldown   = Math.max(100, this.axeCooldown - 80); break;
      case 'vida':
        this.maxHP    += 25;
        this.playerHP  = Math.min(this.playerHP + 25, this.maxHP);
        this.atualizarHPBar();
        break;
      case 'machado':  this.axeSpeed       += 80;  break;
      case 'protecao': this.iframeDuration += 400; break;
    }
  }

  jogadorLevaDano() {
    if (this.iFrames || this.morreu || this.venceu) return;
    this.playerHP -= 20;
    this.atualizarHPBar();
    this.cameras.main.shake(180, 0.012);
    if (this.playerHP <= 0) { this.morrerJogador(); return; }

    this.iFrames = true;
    this.tweens.add({
      targets: this.player,
      alpha: { from: 0.3, to: 1 },
      duration: 150,
      repeat: Math.floor(this.iframeDuration / 150),
      yoyo: true,
      onComplete: () => { this.player.setAlpha(1); this.iFrames = false; },
    });
  }

  atualizarHPBar() {
    this.hpBar.width = 120 * Math.max(0, this.playerHP / this.maxHP);
  }

  morrerJogador() {
    this.morreu = true;
    this.physics.pause();
    this.player.setTint(0xff4444);
    this.cameras.main.shake(400, 0.025);
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', { kills: this.kills, tempo: this.formatarTempo(this.elapsedTime) });
    });
  }

  vencerJogo() {
    this.venceu = true;
    this.physics.pause();
    this.cameras.main.flash(600, 242, 193, 78, false);
    this.mostrarAnuncio(t('valhalla_grito'));
    this.time.delayedCall(1200, () => {
      this.scene.start('VictoryScene', { kills: this.kills, tempo: this.formatarTempo(this.elapsedTime) });
    });
  }

  // ---- EFEITOS ----

  mostrarDano(x, y) {
    const txt = this.add.text(x, y - 10, '-1', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ff6666', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({ targets: txt, y: y - 50, alpha: 0, duration: 700, ease: 'Power2', onComplete: () => txt.destroy() });
  }

  particulasMorte(x, y, tipoKey) {
    const cor = tipoKey === 'jotunn' ? 0x7ab8cc : tipoKey === 'lobo' ? 0x8a8a9a : 0x4a5d3a;
    const num = tipoKey === 'jotunn' ? 10 : 6;
    for (let i = 0; i < num; i++) {
      const ang  = (i / num) * Math.PI * 2;
      const dist = Phaser.Math.Between(20, 50);
      const p    = this.add.circle(x, y, Phaser.Math.Between(2, 5), cor).setDepth(15);
      this.tweens.add({
        targets: p, x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist,
        alpha: 0, scaleX: 0, scaleY: 0, duration: Phaser.Math.Between(300, 500), ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  mostrarAnuncio(texto) {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const txt = this.add.text(cx, cy - 60, texto, {
      fontFamily: 'monospace', fontSize: '24px', color: '#f2c14e', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({ targets: txt, alpha: 0, y: cy - 120, duration: 2500, ease: 'Power2', onComplete: () => txt.destroy() });
  }

  formatarTempo(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // ---- LOOP ----

  update(time) {
    if (this.morreu || this.venceu) return;
    this.moverJogador();
    this.moverInimigos();
    this.tentarDisparar(time);
  }

  moverJogador() {
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx =  1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
    else if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy =  1;
    const len = Math.hypot(dx, dy) || 1;
    this.player.setVelocity((dx / len) * this.playerSpeed, (dy / len) * this.playerSpeed);
    this.player.setFlipX(this.input.activePointer.worldX < this.player.x);
  }

  moverInimigos() {
    this.enemies.getChildren().forEach((e) => {
      if (e.active) this.physics.moveToObject(e, this.player, e.speed || 70);
    });
  }

  tentarDisparar(time) {
    const ptr = this.input.activePointer;
    if (ptr.isDown && time > this.proximoDisparo) {
      this.dispararMachado(ptr.worldX, ptr.worldY);
      this.proximoDisparo = time + this.axeCooldown;
    }
  }
}