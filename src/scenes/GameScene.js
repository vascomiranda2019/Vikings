import { t } from '../i18n/i18n.js';
import Player from '../entities/Player.js';
import Enemy  from '../entities/Enemy.js';
import Gem    from '../entities/Gem.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  static get TEMPO_VITORIA() { return 180; }

  static get POOL_UPGRADES() {
    return [
      { key: 'velocidade', nome: 'Sowilo', letra: 'S', descKey: 'upg_velocidade' },
      { key: 'cadencia',   nome: 'Tiwaz',  letra: 'T', descKey: 'upg_cadencia'  },
      { key: 'vida',       nome: 'Fehu',   letra: 'F', descKey: 'upg_vida'      },
      { key: 'machado',    nome: 'Kenaz',  letra: 'K', descKey: 'upg_machado'   },
      { key: 'protecao',   nome: 'Algiz',  letra: 'Z', descKey: 'upg_protecao'  },
    ];
  }

  create() {
    this.kills       = 0;
    this.venceu      = false;
    this.elapsedTime = 0;

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

  // ---- SETUP ----

  criarFundo() {
    this.add.tileSprite(0, 0, 2400, 2400, 'grelha').setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, 2400, 2400);
  }

  criarJogador() {
    this.player = new Player(this, 1200, 1200);
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
        if (this.player.morreu || this.venceu) return;
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
      if (this.player.morreu || this.venceu) return;
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
    const tipos = ['draugr'];
    if (this.elapsedTime >= 45) tipos.push('lobo');
    if (this.elapsedTime >= 90) tipos.push('jotunn');
    return tipos;
  }

  spawnInimigo(tipoKey, angulo) {
    const tipo = Enemy.TYPES[tipoKey];
    const x    = this.player.x + Math.cos(angulo) * 620;
    const y    = this.player.y + Math.sin(angulo) * 620;
    const e    = new Enemy(this, x, y, tipo.texture);
    this.enemies.add(e);
    e.init(tipoKey);
  }

  // ---- LÓGICA ----

  machadoAcerta(machado, enemy) {
    machado.destroy();
    const morreu = enemy.receberDano();
    if (morreu) {
      const { x, y, gemas } = enemy;
      enemy.particulasMorte();
      enemy.destroy();
      this.kills++;
      this.killsText.setText(`${t('abates')}: ${this.kills}`);
      this.largarGemas(x, y, gemas);
    } else {
      enemy.mostrarDano();
    }
  }

  // Larga 'quantidade' gemas no local do inimigo. Cada gema sorteia o seu
  // proprio tipo, por isso um jotunn deixa varias verdes e, com sorte, uma
  // azul ou dourada a mistura.
  largarGemas(x, y, quantidade) {
    for (let i = 0; i < quantidade; i++) {
      const g = new Gem(
        this,
        x + Phaser.Math.Between(-12, 12),
        y + Phaser.Math.Between(-12, 12)
      );
      this.gems.add(g);
    }
  }

  recolherGema(gema) {
    const xp = gema.xpValue || 5;
    gema.destroy();
    if (this.player.ganharXP(xp)) {
      this.player.subirNivel();
      this.levelText.setText(`${t('nivel')} ${this.player.level}`);
      this.cameras.main.flash(300, 242, 193, 78, false);
      const pool = Phaser.Utils.Array.Shuffle([...GameScene.POOL_UPGRADES]);
      this.scene.pause('GameScene');
      this.scene.launch('UpgradeScene', { level: this.player.level, upgrades: pool.slice(0, 3) });
    }
    this.atualizarXPBar();
    // Som de apanhar gema, quando tivermos audio:
    // this.sound.play('pickup');
  }

  aplicarUpgrade(key) {
    this.player.aplicarUpgrade(key);
    this.atualizarHPBar();
  }

  jogadorLevaDano() {
    if (this.player.levaDano(20)) {
      this.morrerJogador();
    } else {
      this.atualizarHPBar();
    }
  }

  atualizarHPBar() {
    this.hpBar.width = 120 * Math.max(0, this.player.hp / this.player.maxHP);
  }

  atualizarXPBar() {
    this.xpBar.width = 120 * Math.min(1, this.player.xp / this.player.xpToNextLevel);
  }

  morrerJogador() {
    this.physics.pause();
    this.player.setTint(0xff4444);
    this.cameras.main.shake(400, 0.025);
    const musica = this.cache.audio.exists('musica') ? this.sound.get('musica') : null;
    if (musica) this.tweens.add({ targets: musica, volume: 0, duration: 800 });
    this.time.delayedCall(800, () => {
      this.sound.stopAll();
      this.scene.start('GameOverScene', { kills: this.kills, tempo: this.formatarTempo(this.elapsedTime) });
    });
  }

  vencerJogo() {
    this.venceu = true;
    this.physics.pause();
    this.cameras.main.flash(600, 242, 193, 78, false);
    this.mostrarAnuncio(t('valhalla_grito'));
    const musica = this.cache.audio.exists('musica') ? this.sound.get('musica') : null;
    if (musica) this.tweens.add({ targets: musica, volume: 0, duration: 1200 });
    this.time.delayedCall(1200, () => {
      this.sound.stopAll();
      this.scene.start('VictoryScene', { kills: this.kills, tempo: this.formatarTempo(this.elapsedTime) });
    });
  }

  // ---- EFEITOS ----

  mostrarAnuncio(texto) {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const txt = this.add.text(cx, cy - 60, texto, {
      fontFamily: 'monospace', fontSize: '24px', color: '#f2c14e',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({
      targets: txt, alpha: 0, y: cy - 120, duration: 2500, ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  formatarTempo(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // ---- LOOP ----

  update(time) {
    if (this.player.morreu || this.venceu) return;
    this.player.mover(this.cursors, this.wasd);
    this.enemies.getChildren().forEach((e) => e.moverParaJogador(this.player));
    this.player.tentarDisparar(time, this.axes);
  }
}