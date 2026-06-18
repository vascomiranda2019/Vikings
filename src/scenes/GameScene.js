import { t } from '../i18n/i18n.js';
import Player    from '../entities/Player.js';
import Enemy     from '../entities/Enemy.js';
import Gem       from '../entities/Gem.js';
import Companion from '../entities/Companion.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  static get TEMPO_VITORIA() { return 180; }
  static get MAX_CORVOS()    { return 2; }
  static get MAX_ORBITAIS()  { return 3; }

  static get POOL_UPGRADES() {
    return [
      { key: 'vida',       nome: 'Fehu',     letra: 'F', descKey: 'upg_vida'      },
      { key: 'machado',    nome: 'Kenaz',    letra: 'K', descKey: 'upg_machado'   },
      { key: 'animal',     nome: 'Ansuz',    letra: 'A', descKey: 'upg_animal'    },
      { key: 'orbital',    nome: 'Jera',     letra: 'J', descKey: 'upg_orbital'   },
      { key: 'escudo',     nome: 'Eihwaz',   letra: 'E', descKey: 'upg_escudo'    },
      { key: 'multishot',  nome: 'Wunjo',    letra: 'W', descKey: 'upg_multishot' },
      { key: 'perfuracao', nome: 'Thurisaz', letra: 'Þ', descKey: 'upg_perfuracao' },
      { key: 'iman',       nome: 'Laguz',    letra: 'L', descKey: 'upg_iman'      },
    ];
  }

  create() {
    this.kills        = 0;
    this.venceu       = false;
    this.elapsedTime  = 0;

    this.companions   = [];      // corvos aliados (max 2)
    this.orbitalCount = 0;       // quantos machados a girar (max 3)
    this.orbitalAngle = 0;       // angulo atual da rotacao
    this.orbitalSpeed = 0.005;   // velocidade da rotacao (sobe depois dos 3)

    this.criarFundo();
    this.criarDecoracoes();
    this.criarJogador();
    this.criarControlos();
    this.configurarCamara();
    this.criarGrupos();
    this.criarColisoes();
    this.criarHUD();
    this.iniciarTimers();

    this.mostrarAnuncio(t('anuncio_serpentes'));
    if (this.cache.audio.exists('snakes')) this.sound.play('snakes', { volume: 0.35 });

    // Apaga ouvintes antigos antes de registar, senao a cada reinicio do jogo
    // ficava mais um e cada runa era aplicada varias vezes (os corvos vinham
    // logo a 2, os orbitais a 3, etc.).
    this.events.off('upgradeChosen');
    this.events.on('upgradeChosen', (key) => this.aplicarUpgrade(key));
  }

  // ---- SETUP ----

  criarFundo() {
    this.add.tileSprite(0, 0, 2400, 2400, 'chao').setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, 2400, 2400);
  }

  // Espalha decoracoes pelo mundo. Arvores, bonecos de neve e cabanas tem
  // corpo de colisao (this.obstaculos); troncos sao so visuais.
  criarDecoracoes() {
    this.obstaculos = this.physics.add.staticGroup();
    const SPAWN = { x: 1200, y: 1200 };

    // Guarda tudo o que ja bloqueia, com um raio aproximado, para os proximos
    // nao nascerem demasiado perto. A FOLGA e o espaco livre minimo que tem
    // de sobrar entre dois obstaculos para o viking e ate o jotunn passarem.
    const colocados = [];
    const FOLGA = 100;

    // Tenta encontrar uma posicao longe do spawn e com folga de tudo o que ja
    // foi colocado. Devolve null se nao conseguir ao fim de varias tentativas.
    const procurarPosicao = (raio, distSpawn) => {
      for (let tent = 0; tent < 25; tent++) {
        const x = Phaser.Math.Between(100, 2320);
        const y = Phaser.Math.Between(100, 2320);
        if (Math.hypot(x - SPAWN.x, y - SPAWN.y) < distSpawn) continue;
        const livre = colocados.every(
          (o) => Math.hypot(x - o.x, y - o.y) > o.raio + raio + FOLGA
        );
        if (livre) return { x, y };
      }
      return null;
    };

    // Cabanas primeiro (sao grandes; ficam com os melhores sitios)
    for (let i = 0; i < 5; i++) {
      const pos = procurarPosicao(40, 400);
      if (!pos) continue;
      const c = this.obstaculos.create(pos.x, pos.y, 'cabin');
      c.setScale(Phaser.Math.FloatBetween(0.9, 1.1)).setDepth(2 + pos.y / 2400);
      c.refreshBody();
      colocados.push({ x: pos.x, y: pos.y, raio: 40 });
    }

    // Bonecos de neve
    const bonecos = ['snow0', 'snow1', 'snow2'];
    for (let i = 0; i < 25; i++) {
      const pos = procurarPosicao(16, 220);
      if (!pos) continue;
      const s = this.obstaculos.create(pos.x, pos.y, Phaser.Utils.Array.GetRandom(bonecos));
      s.setScale(Phaser.Math.FloatBetween(0.8, 1.1)).setDepth(2 + pos.y / 2400);
      s.refreshBody();
      colocados.push({ x: pos.x, y: pos.y, raio: 16 });
    }

    // Arvores (colisao so no tronco, mas espacadas para dar passagem)
    const arvores = ['tree0', 'tree1', 'tree2', 'tree3'];
    for (let i = 0; i < 140; i++) {
      const pos = procurarPosicao(9, 250);
      if (!pos) continue;
      const tree = this.obstaculos.create(pos.x, pos.y, Phaser.Utils.Array.GetRandom(arvores));
      tree.setScale(Phaser.Math.FloatBetween(0.7, 1.3)).setDepth(2 + pos.y / 2400);
      tree.body.setSize(12, 12);
      tree.body.setOffset((tree.width - 12) / 2, tree.height - 14);
      tree.refreshBody();
      colocados.push({ x: pos.x, y: pos.y, raio: 9 });
    }

    // Troncos (sem colisao — so decoracao, por isso nao precisam de folga)
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(100, 2320);
      const y = Phaser.Math.Between(100, 2320);
      if (Math.hypot(x - SPAWN.x, y - SPAWN.y) < 180) continue;
      this.add.image(x, y, 'log')
        .setScale(Phaser.Math.FloatBetween(0.8, 1.2))
        .setDepth(1 + y / 2400);
    }
  }

  criarJogador() {
    this.player = new Player(this, 1200, 1200);

    // Anel de escudo que aparece a volta do viking quando ele tem escudo.
    this.escudoVisual = this.add.circle(this.player.x, this.player.y, 24, 0x9fe0ff, 0)
      .setStrokeStyle(3, 0x9fe0ff, 0.9)
      .setDepth(8)
      .setVisible(false);
  }

  criarControlos() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Evita duplicar o ouvinte se a GameScene for reiniciada
    this.input.keyboard.off('keydown-ESC');
    this.input.keyboard.on('keydown-ESC', () => this.pausarJogo());
  }

  pausarJogo() {
    if (this.player.morreu || this.venceu) return;
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  configurarCamara() {
    this.cameras.main.setBounds(0, 0, 2400, 2400);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  criarGrupos() {
    this.enemies   = this.physics.add.group();
    this.axes      = this.physics.add.group();
    this.gems      = this.physics.add.group();
    this.orbitals  = this.physics.add.group();
    this.fireballs = this.physics.add.group();  // bolas de fogo dos corvos
  }

  criarColisoes() {
    this.physics.add.overlap(this.axes, this.enemies,
      (axe, enemy) => this.machadoAcerta(axe, enemy), null, this);
    this.physics.add.overlap(this.fireballs, this.enemies,
      (fb, enemy) => this.fireballAcerta(fb, enemy), null, this);
    this.physics.add.overlap(this.orbitals, this.enemies,
      (orb, enemy) => this.orbitalAcerta(orb, enemy), null, this);
    this.physics.add.overlap(this.player, this.enemies,
      () => this.jogadorLevaDano(), null, this);
    this.physics.add.overlap(this.player, this.gems,
      (p, gem) => this.recolherGema(gem), null, this);

    // Jogador e inimigos batem nos obstaculos (arvores, bonecos, cabanas)
    this.physics.add.collider(this.player, this.obstaculos);
    this.physics.add.collider(this.enemies, this.obstaculos);
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

    // Indicador de escudo (so se ve quando esta ativo).
    this.shieldText = this.add.text(16, 96, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#9fe0ff',
    }).setScrollFactor(0).setDepth(100);
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
    const tipos = ['serpente'];
    if (this.elapsedTime >= 45) tipos.push('lobo');
    if (this.elapsedTime >= 90) tipos.push('jotunn');
    return tipos;
  }

  spawnInimigo(tipoKey, angulo) {
    const tipo = Enemy.TYPES[tipoKey];
    const x    = this.player.x + Math.cos(angulo) * 620;
    const y    = this.player.y + Math.sin(angulo) * 620;
    // Se o tipo tiver varios visuais (os lobos), sorteia um deles; cada um
    // com a mesma probabilidade. Caso contrario usa a textura unica.
    const textura = tipo.texturas
      ? Phaser.Utils.Array.GetRandom(tipo.texturas)
      : tipo.texture;
    const e    = new Enemy(this, x, y, textura);
    this.enemies.add(e);
    e.init(tipoKey);
  }

  // ---- LÓGICA ----

  machadoAcerta(machado, enemy) {
    // Um machado nao acerta duas vezes no mesmo inimigo. Importante com a
    // perfuracao, senao enquanto o atravessa daria dano em todos os frames.
    if (!machado.jaAcertou) machado.jaAcertou = new Set();
    if (machado.jaAcertou.has(enemy)) return;
    machado.jaAcertou.add(enemy);

    this.acertarInimigo(enemy);

    // Se ainda tiver perfuracoes, atravessa; caso contrario desaparece.
    if (machado.golpesRestantes > 0) {
      machado.golpesRestantes--;
    } else {
      machado.destroy();
    }
  }

  fireballAcerta(fireball, enemy) {
    fireball.destroy();
    this.acertarInimigo(enemy);
  }

  // Os orbitais nao se destroem ao tocar; em vez disso cada inimigo fica
  // imune por uns instantes para nao levar dano em todos os frames.
  orbitalAcerta(orbital, enemy) {
    const agora = this.time.now;
    if (enemy.orbitalImmuneUntil && agora < enemy.orbitalImmuneUntil) return;
    enemy.orbitalImmuneUntil = agora + 350;
    this.acertarInimigo(enemy);
  }

  // Trata de um acerto num inimigo: tira vida e, se morrer, conta o abate,
  // faz as particulas e larga as gemas. Usado pelos machados, pelas bolas
  // de fogo e pelos orbitais.
  acertarInimigo(enemy) {
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
      this.garantirGemaAcessivel(g);
    }
  }

  // Se a gema calhar em cima de um obstaculo (cabana, boneco de neve, tronco
  // de arvore), empurra-a aos poucos na direcao do jogador ate sair de cima
  // dele. Assim nunca fica num sitio inalcancavel. Empurrar para o lado do
  // jogador e seguro porque o jogador nunca esta dentro de um obstaculo.
  garantirGemaAcessivel(gem) {
    if (!this.obstaculos) return;
    let tentativas = 0;
    while (tentativas < 16 && this.physics.overlap(gem, this.obstaculos)) {
      const ang = Phaser.Math.Angle.Between(gem.x, gem.y, this.player.x, this.player.y);
      gem.body.reset(gem.x + Math.cos(ang) * 14, gem.y + Math.sin(ang) * 14);
      tentativas++;
    }
  }

  recolherGema(gema) {
    const xp = gema.xpValue || 5;
    gema.destroy();
    if (this.player.ganharXP(xp)) {
      this.player.subirNivel();
      this.levelText.setText(`${t('nivel')} ${this.player.level}`);
      this.cameras.main.flash(300, 242, 193, 78, false);
      // So mostra runas que façam sentido para o estado atual do jogador.
      const pool = Phaser.Utils.Array.Shuffle([...this.runasDisponiveis()]);
      this.scene.pause('GameScene');
      this.scene.launch('UpgradeScene', { level: this.player.level, upgrades: pool.slice(0, 3) });
    }
    this.atualizarXPBar();
    // Som de apanhar gema, quando tivermos audio:
    // this.sound.play('pickup');
  }

  // Filtra o pool conforme o estado atual: o escudo so aparece se nao tiveres
  // nenhum, e o animal so ate ao limite de corvos. As restantes aparecem sempre
  // (a orbital mantem-se util porque, depois dos 3 machados, acelera a rotacao).
  runasDisponiveis() {
    return GameScene.POOL_UPGRADES.filter((u) => {
      if (u.key === 'escudo') return this.player.shield === 0;
      if (u.key === 'animal') return this.companions.length < GameScene.MAX_CORVOS;
      return true;
    });
  }

  aplicarUpgrade(key) {
    switch (key) {
      case 'animal':  this.adicionarCompanion(); break;
      case 'orbital': this.adicionarOrbital();   break;
      default:        this.player.aplicarUpgrade(key); // stats, escudo, multishot, perfuracao, iman
    }
    this.atualizarHPBar();
  }

  // Cria mais um corvo aliado ao pe do jogador, ate ao limite.
  adicionarCompanion() {
    if (this.companions.length >= GameScene.MAX_CORVOS) return;
    const c = new Companion(this, this.player.x, this.player.y);
    this.companions.push(c);
  }

  // Ate aos 3 machados, cada runa adiciona mais um. A partir dai, a mesma
  // runa passa a acelerar a rotacao em vez de acrescentar machados.
  adicionarOrbital() {
    if (this.orbitalCount < GameScene.MAX_ORBITAIS) {
      this.orbitalCount++;
      this.orbitals.clear(true, true);
      for (let i = 0; i < this.orbitalCount; i++) {
        const o = this.orbitals.create(this.player.x, this.player.y, 'machado');
        o.setDepth(6).setScale(0.9);
        if (o.body) o.body.setAllowGravity(false);
      }
    } else {
      this.orbitalSpeed += 0.0035;
    }
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
      this.scene.start('GameOverScene', { kills: this.kills, tempo: this.formatarTempo(this.elapsedTime), nivel: this.player.level });
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
      this.scene.start('VictoryScene', { kills: this.kills, tempo: this.formatarTempo(this.elapsedTime), nivel: this.player.level });
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

  update(time, delta) {
    if (this.player.morreu || this.venceu) return;
    this.player.mover(this.cursors, this.wasd);
    this.enemies.getChildren().forEach((e) => e.moverParaJogador(this.player));
    // Passa os inimigos para o disparo automatico mirar no mais proximo.
    this.player.tentarDisparar(time, this.axes, this.enemies);

    this.companions.forEach((c) => {
      c.seguir(this.player);
      c.tentarDisparar(time, this.enemies, this.fireballs);
    });

    this.atualizarOrbitais(delta);
    this.atualizarEscudo();
    this.atrairGemas();
  }

  // Faz os machados girarem a volta do jogador, espacados por igual.
  atualizarOrbitais(delta) {
    if (this.orbitalCount === 0) return;
    this.orbitalAngle += delta * this.orbitalSpeed;
    const raio   = 90;
    const filhos = this.orbitals.getChildren();
    filhos.forEach((o, i) => {
      const ang = this.orbitalAngle + (i / filhos.length) * Math.PI * 2;
      o.x = this.player.x + Math.cos(ang) * raio;
      o.y = this.player.y + Math.sin(ang) * raio;
      o.rotation += 0.3;
    });
  }

  // Mostra ou esconde o anel de escudo e o texto no HUD.
  atualizarEscudo() {
    const ativo = this.player.shield > 0;
    this.escudoVisual.setVisible(ativo);
    if (ativo) this.escudoVisual.setPosition(this.player.x, this.player.y);
    this.shieldText.setText(ativo ? t('escudo_hud') : '');
  }

  // Puxa para o jogador as gemas que estiverem dentro do alcance do iman.
  atrairGemas() {
    const range = this.player.magnetRange;
    if (range <= 0) return;
    this.gems.getChildren().forEach((gem) => {
      if (!gem.active) return;
      const d = Phaser.Math.Distance.Between(gem.x, gem.y, this.player.x, this.player.y);
      if (d < range) this.physics.moveToObject(gem, this.player, 320);
    });
  }
}