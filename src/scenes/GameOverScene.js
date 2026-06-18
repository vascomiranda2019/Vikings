import { t } from '../i18n/i18n.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.kills = data.kills || 0;
    this.tempo = data.tempo || '0:00';
    this.nivel = data.nivel || 1;
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    this._criarFundo(cx, cy, w, h);
    this._criarCinzas(w, h);
    this._criarPainel(cx, cy);
    this._criarTitulo(cx, cy);
    this._criarStats(cx, cy);
    this._criarBotoes(cx, cy);
    this._criarDica(cx, cy);

    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.cameras.main.shake(220, 0.006);

    this.input.keyboard.once('keydown-R', () => this.scene.start('GameScene'));
  }

  // ---- FUNDO ----

  _criarFundo(cx, cy, w, h) {
    this.add.rectangle(cx, cy, w, h, 0x0d0707, 0.92);

    // Vinheta vermelha suave a vir do topo
    const g = this.add.graphics();
    g.fillGradientStyle(0x3a0a0a, 0x3a0a0a, 0x000000, 0x000000, 0.35, 0.35, 0, 0);
    g.fillRect(0, 0, w, h * 0.45);
  }

  // ---- CINZAS A CAIR ----

  _criarCinzas(w, h) {
    for (let i = 0; i < 26; i++) {
      this.time.delayedCall(i * 220, () => this._novaCinza(w, h));
    }
  }

  _novaCinza(w, h) {
    if (!this.scene.isActive('GameOverScene')) return;
    const size   = Phaser.Math.Between(1, 3);
    const startX = Phaser.Math.Between(20, w - 20);
    const dur    = Phaser.Math.Between(6000, 11000);
    const p = this.add.rectangle(startX, -10, size, size, 0x9a8a8a, 0);

    this.tweens.add({
      targets: p,
      y: h + 10,
      x: startX + Phaser.Math.Between(-60, 60),
      alpha: { from: 0, to: Phaser.Math.FloatBetween(0.2, 0.5) },
      duration: dur,
      ease: 'Sine.easeIn',
      onComplete: () => { p.destroy(); this._novaCinza(w, h); },
    });
  }

  // ---- PAINEL ----

  _criarPainel(cx, cy) {
    const painel = this.add.rectangle(cx, cy, 380, 460, 0x14100f, 0.93)
      .setStrokeStyle(2, 0x4a2a2a)
      .setScale(0.9)
      .setAlpha(0);

    this.tweens.add({ targets: painel, scale: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
  }

  // ---- TITULO ----

  _criarTitulo(cx, cy) {
    const titulo = this.add.text(cx, cy - 200, t('gameover_titulo'), {
      fontFamily: 'monospace', fontSize: '22px', color: '#e8c87a',
      stroke: '#000000', strokeThickness: 4, align: 'center',
      wordWrap: { width: 330 },
    }).setOrigin(0.5).setAlpha(0);

    const linha = this.add.rectangle(cx, cy - 152, 260, 1, 0xb85c3c, 0).setAlpha(0);

    this.tweens.add({ targets: titulo, alpha: 1, y: cy - 190, duration: 280, delay: 120, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: linha, alpha: 0.4, duration: 280, delay: 200 });
  }

  // ---- ESTATISTICAS ----

  _criarStats(cx, cy) {
    this._criarLinhaStat(cx, cy - 118, cy - 90, t('abates'), this.kills, '#cfd3dc', 30, 220);
    this._criarDivisor(cx, cy - 58, 320);

    this._criarLinhaStatTexto(cx, cy - 38, cy - 12, t('sobreviveste'), this.tempo, '#e8c87a', 26, 320);
    this._criarDivisor(cx, cy + 20, 420);

    this._criarLinhaStat(cx, cy + 40, cy + 66, t('nivel'), this.nivel, '#9fb8d8', 22, 420);
  }

  _criarDivisor(cx, y, delay) {
    const linha = this.add.rectangle(cx, y, 200, 1, 0x4a2a2a, 0).setAlpha(0);
    this.tweens.add({ targets: linha, alpha: 0.6, duration: 250, delay });
  }

  // Linha de stat com numero que conta a subir (kills, nivel).
  _criarLinhaStat(cx, yLabel, yValor, rotulo, valorFinal, cor, tamFonte, delay) {
    const label = this.add.text(cx, yLabel, rotulo.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '12px', color: '#7e8597', letterSpacing: 1,
    }).setOrigin(0.5).setAlpha(0);

    const valor = this.add.text(cx, yValor, '0', {
      fontFamily: 'monospace', fontSize: `${tamFonte}px`, color: cor, fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [label, valor], alpha: 1, duration: 250, delay });

    const contador = { v: 0 };
    this.tweens.add({
      targets: contador, v: valorFinal, duration: 500, delay: delay + 60, ease: 'Cubic.easeOut',
      onUpdate: () => valor.setText(`${Math.round(contador.v)}`),
    });
  }

  // Linha de stat com texto fixo (tempo ja vem formatado, nao ha o que contar).
  _criarLinhaStatTexto(cx, yLabel, yValor, rotulo, texto, cor, tamFonte, delay) {
    const label = this.add.text(cx, yLabel, rotulo.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '12px', color: '#7e8597', letterSpacing: 1,
    }).setOrigin(0.5).setAlpha(0);

    const valor = this.add.text(cx, yValor, texto, {
      fontFamily: 'monospace', fontSize: `${tamFonte}px`, color: cor, fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [label, valor], alpha: 1, duration: 250, delay });
  }

  // ---- BOTOES ----

  _criarBotoes(cx, cy) {
    this.criarBotao(cx, cy + 123, 220, 48, t('pausa_recomecar'), 0xf2c14e, 17, () => {
      this.scene.start('GameScene');
    }, 560);
    this.criarBotao(cx, cy + 176, 220, 42, t('pausa_terminar'), 0x6a7686, 15, () => {
      this.scene.start('MenuScene');
    }, 660);
  }

  // ---- DICA ----

  _criarDica(cx, cy) {
    const dica = this.add.text(cx, cy + 210, t('reiniciar'), {
      fontFamily: 'monospace', fontSize: '11px', color: '#5a6070',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: dica, alpha: 0.7, duration: 250, delay: 760,
      onComplete: () => {
        this.tweens.add({ targets: dica, alpha: { from: 0.7, to: 0.2 }, duration: 900, yoyo: true, repeat: -1 });
      },
    });
  }

  // ---- HELPER BOTAO (mesmo estilo da MenuScene/PauseScene) ----

  criarBotao(x, y, larg, alt, texto, corBorda, tamFonte, aoClicar, delay = 0) {
    const corCSS = Phaser.Display.Color.IntegerToColor(corBorda).rgba;

    const bg = this.add.rectangle(x, y + 12, larg, alt, 0x0c1120)
      .setStrokeStyle(2, corBorda)
      .setAlpha(0);
    const borda = this.add.rectangle(x, y + 12, larg - 6, alt - 6, 0x000000, 0)
      .setStrokeStyle(1, corBorda, 0.25)
      .setAlpha(0);

    const txt = this.add.text(x, y + 12, texto, {
      fontFamily: 'monospace', fontSize: `${tamFonte}px`,
      color: corCSS, fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [bg, borda, txt], alpha: 1, y: y, duration: 280, delay, ease: 'Cubic.easeOut' });

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillColor(0x172035);
      txt.setColor('#ffffff');
      this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 110, ease: 'Back.easeOut' });
    });
    bg.on('pointerout', () => {
      bg.setFillColor(0x0c1120);
      txt.setColor(corCSS);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 110 });
    });
    bg.on('pointerdown', aoClicar);
  }
}
