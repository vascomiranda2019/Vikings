import { t } from '../i18n/i18n.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  init(data) {
    this.kills = data.kills || 0;
    this.tempo = data.tempo || '3:00';
    this.nivel = data.nivel || 1;
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    this._criarFundo(cx, cy, w, h);
    this._criarRaios(cx, cy);
    this._criarBrasasAscendentes(w, h);
    this._criarPainel(cx, cy);
    this._criarTitulo(cx, cy);
    this._criarStats(cx, cy);
    this._criarBotoes(cx, cy);
    this._criarDica(cx, cy);

    this.cameras.main.fadeIn(700, 242, 193, 78);

    this.input.keyboard.once('keydown-R', () => this.scene.start('GameScene'));
  }

  // ---- FUNDO ----

  _criarFundo(cx, cy, w, h) {
    // Imagem de Valhalla a cobrir o ecra inteiro
    const bg = this.add.image(cx, cy, 'valhala_bg');
    const escala = Math.max(w / bg.width, h / bg.height);
    bg.setScale(escala);

    // Overlay escuro para o texto se destacar por cima da imagem
    this.add.rectangle(cx, cy, w, h, 0x140d02, 0.55);

    // Luz dourada a vir do topo, como os portoes de Valhalla a abrirem-se
    const g = this.add.graphics();
    g.fillGradientStyle(0xf2c14e, 0xf2c14e, 0x140d02, 0x140d02, 0.22, 0.22, 0, 0);
    g.fillRect(0, 0, w, h * 0.6);
  }

  // ---- RAIOS DE LUZ ROTATIVOS ----

  _criarRaios(cx, cy) {
    const raios = this.add.graphics({ x: cx, y: cy - 150 });
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      raios.lineStyle(3, 0xf2c14e, 0.08);
      raios.lineBetween(0, 0, Math.cos(a) * 600, Math.sin(a) * 600);
    }
    this.tweens.add({ targets: raios, angle: 360, duration: 40000, repeat: -1, ease: 'Linear' });
  }

  // ---- BRASAS A SUBIR ----

  _criarBrasasAscendentes(w, h) {
    for (let i = 0; i < 30; i++) {
      this.time.delayedCall(i * 180, () => this._novaBrasa(w, h));
    }
  }

  _novaBrasa(w, h) {
    if (!this.scene.isActive('VictoryScene')) return;
    const size   = Phaser.Math.Between(1, 3);
    const startX = Phaser.Math.Between(20, w - 20);
    const dur    = Phaser.Math.Between(5000, 9000);
    const cor    = Phaser.Math.RND.pick([0xf2c14e, 0xffe27a, 0xffd27a]);
    const p = this.add.rectangle(startX, h + 10, size, size, cor, 0);

    this.tweens.add({
      targets: p,
      y: -10,
      x: startX + Phaser.Math.Between(-50, 50),
      alpha: { from: 0, to: Phaser.Math.FloatBetween(0.3, 0.7) },
      duration: dur,
      ease: 'Sine.easeOut',
      onComplete: () => { p.destroy(); this._novaBrasa(w, h); },
    });
  }

  // ---- PAINEL ----

  _criarPainel(cx, cy) {
    const painel = this.add.rectangle(cx, cy, 400, 460, 0x1c1404, 0.93)
      .setStrokeStyle(2, 0xf2c14e, 0.7)
      .setScale(0.9)
      .setAlpha(0);

    this.tweens.add({ targets: painel, scale: 1, alpha: 1, duration: 320, ease: 'Back.easeOut' });
  }

  // ---- TITULO ----

  _criarTitulo(cx, cy) {
    const titulo = this.add.text(cx, cy - 210, t('vitoria_titulo'), {
      fontFamily: 'monospace', fontSize: '26px', color: '#ffe27a',
      stroke: '#3a2400', strokeThickness: 5, align: 'center',
      wordWrap: { width: 350 },
    }).setOrigin(0.5).setAlpha(0);

    const sub = this.add.text(cx, cy - 172, t('vitoria_sub'), {
      fontFamily: 'monospace', fontSize: '13px', color: '#cba869', align: 'center',
      wordWrap: { width: 320 },
    }).setOrigin(0.5).setAlpha(0);

    const linha = this.add.rectangle(cx, cy - 142, 280, 1, 0xf2c14e, 0).setAlpha(0);

    this.tweens.add({
      targets: titulo, alpha: 1, y: cy - 200, duration: 320, delay: 140, ease: 'Cubic.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: titulo, scale: { from: 1, to: 1.04 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      },
    });
    this.tweens.add({ targets: sub, alpha: 1, duration: 320, delay: 240 });
    this.tweens.add({ targets: linha, alpha: 0.5, duration: 280, delay: 320 });
  }

  // ---- ESTATISTICAS ----

  _criarStats(cx, cy) {
    this._criarLinhaStat(cx, cy - 108, cy - 80, t('abates'), this.kills, '#ffe7a8', 30, 260);
    this._criarDivisor(cx, cy - 48, 360);

    this._criarLinhaStatTexto(cx, cy - 28, cy - 2, t('tempo_sobrevivido'), this.tempo, '#f2c14e', 26, 360);
    this._criarDivisor(cx, cy + 30, 460);

    this._criarLinhaStat(cx, cy + 50, cy + 76, t('nivel'), this.nivel, '#cba869', 22, 460);
  }

  _criarDivisor(cx, y, delay) {
    const linha = this.add.rectangle(cx, y, 220, 1, 0xf2c14e, 0).setAlpha(0);
    this.tweens.add({ targets: linha, alpha: 0.35, duration: 250, delay });
  }

  _criarLinhaStat(cx, yLabel, yValor, rotulo, valorFinal, cor, tamFonte, delay) {
    const label = this.add.text(cx, yLabel, rotulo.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '12px', color: '#a89058', letterSpacing: 1,
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

  _criarLinhaStatTexto(cx, yLabel, yValor, rotulo, texto, cor, tamFonte, delay) {
    const label = this.add.text(cx, yLabel, rotulo.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '12px', color: '#a89058', letterSpacing: 1,
    }).setOrigin(0.5).setAlpha(0);

    const valor = this.add.text(cx, yValor, texto, {
      fontFamily: 'monospace', fontSize: `${tamFonte}px`, color: cor, fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [label, valor], alpha: 1, duration: 250, delay });
  }

  // ---- BOTOES ----

  _criarBotoes(cx, cy) {
    this.criarBotao(cx, cy + 133, 230, 48, t('pausa_recomecar'), 0xf2c14e, 17, () => {
      this.scene.start('GameScene');
    }, 600);
    this.criarBotao(cx, cy + 186, 230, 42, t('pausa_terminar'), 0x8a7a52, 15, () => {
      this.scene.start('MenuScene');
    }, 700);
  }

  // ---- DICA ----

  _criarDica(cx, cy) {
    const dica = this.add.text(cx, cy + 220, t('reiniciar'), {
      fontFamily: 'monospace', fontSize: '11px', color: '#8a7a52',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: dica, alpha: 0.8, duration: 250, delay: 800,
      onComplete: () => {
        this.tweens.add({ targets: dica, alpha: { from: 0.8, to: 0.25 }, duration: 900, yoyo: true, repeat: -1 });
      },
    });
  }

  // ---- HELPER BOTAO (mesmo estilo do GameOverScene/PauseScene) ----

  criarBotao(x, y, larg, alt, texto, corBorda, tamFonte, aoClicar, delay = 0) {
    const corCSS = Phaser.Display.Color.IntegerToColor(corBorda).rgba;

    const bg = this.add.rectangle(x, y + 12, larg, alt, 0x140d02)
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
      bg.setFillColor(0x2a1f08);
      txt.setColor('#ffffff');
      this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 110, ease: 'Back.easeOut' });
    });
    bg.on('pointerout', () => {
      bg.setFillColor(0x140d02);
      txt.setColor(corCSS);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 110 });
    });
    bg.on('pointerdown', aoClicar);
  }
}
