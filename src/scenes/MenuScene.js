import { obterIdioma, definirIdioma, t } from '../i18n/i18n.js';
import { guardarVolume } from '../som.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    this.iniciarMusica();
    this._criarFundo(cx, cy, w, h);
    this._criarRunasLaterais(cx, cy, w, h);
    this._criarEmblemaCentral(cx, cy, h);
    this._criarTitulo(cx, cy);
    this._criarBotoes(cx, cy);
    this._criarSeletorIdioma(cx, cy + 140);
    this._criarToggleSom(cx, cy + 175);
    this._criarBrasa(w, h);

    this.cameras.main.fadeIn(700, 0, 0, 0);
  }

  // ---- FUNDO ----

  _criarFundo(cx, cy, w, h) {
    // Imagem de fundo a cobrir o ecra inteiro
    const bg = this.add.image(cx, cy, 'menu_bg');
    const escala = Math.max(w / bg.width, h / bg.height);
    bg.setScale(escala);

    // Overlay escuro — 45% de opacidade para o texto respirar
    this.add.rectangle(cx, cy, w, h, 0x000000, 0.45);

    // Vinheta: gradiente a escurecer as bordas
    // fillGradientStyle(cor x4, alpha_TL, alpha_TR, alpha_BL, alpha_BR)
    const g = this.add.graphics();
    // Lateral esquerda (escuro à esquerda, transparente à direita)
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.65, 0, 0.65, 0);
    g.fillRect(0, 0, w * 0.25, h);
    // Lateral direita (transparente à esquerda, escuro à direita)
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.65, 0, 0.65);
    g.fillRect(w * 0.75, 0, w * 0.25, h);
    // Topo (escuro em cima, transparente em baixo)
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.6, 0.6, 0, 0);
    g.fillRect(0, 0, w, h * 0.22);
    // Base (transparente em cima, escuro em baixo)
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.6, 0.6);
    g.fillRect(0, h * 0.78, w, h * 0.22);
  }

  // ---- RUNAS LATERAIS ----

  _criarRunasLaterais(cx, cy, w, h) {
    const chars = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');

    const spawnar = (x, side) => {
      for (let i = 0; i < 7; i++) {
        const char = chars[(i + side * 7) % chars.length];
        const runa = this.add.text(x, h * 0.1 + i * (h * 0.12), char, {
          fontFamily: 'monospace', fontSize: '28px', color: '#f2c14e',
        }).setOrigin(0.5).setAlpha(0.08);

        this.tweens.add({
          targets: runa,
          alpha: { from: 0.04, to: 0.22 },
          duration: 1600 + i * 450,
          yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut',
          delay: i * 260 + side * 180,
        });
      }
    };

    spawnar(38, 0);
    spawnar(w - 38, 1);
  }

  // ---- EMBLEMA VEGVISIR ----

  _criarEmblemaCentral(cx, cy, h) {
    const emblemaY = cy - Math.min(210, h * 0.34);
    const scale    = Math.min(1, h / 560);

    const container = this.add.container(cx, emblemaY);
    const logo = this.add.image(0, 0, 'logo_menu').setScale(scale);
    container.add(logo);

    // Rotacao lenta
    this.tweens.add({
      targets: container,
      angle: 360,
      duration: 55000,
      repeat: -1,
      ease: 'Linear',
    });

    // Pulso subtil
    this.tweens.add({
      targets: container,
      alpha: { from: 0.72, to: 1 },
      scale: { from: 0.97, to: 1.03 },
      duration: 3200,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ---- TITULO ----

  _criarTitulo(cx, cy) {
    const titY = cy - 108;

    // Linhas decorativas ao lado do titulo
    const g = this.add.graphics();
    g.lineStyle(1, 0xf2c14e, 0.3);
    g.lineBetween(cx - 230, titY + 38, cx - 10, titY + 38);
    g.lineBetween(cx + 10,  titY + 38, cx + 230, titY + 38);
    // Losangos nas extremidades
    g.fillStyle(0xf2c14e, 0.5);
    const d = (x, y) => {
      g.fillTriangle(x - 6, y, x, y - 5, x + 6, y);
      g.fillTriangle(x - 6, y, x, y + 5, x + 6, y);
    };
    d(cx - 225, titY + 38);
    d(cx + 225, titY + 38);

    // Titulo principal
    const titulo = this.add.text(cx, titY, t('titulo'), {
      fontFamily: '"Cinzel Decorative", "Cinzel", Georgia, serif',
      fontSize: '40px', color: '#f2c14e',
      stroke: '#150800', strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0);

    // Subtitulo
    const sub = this.add.text(cx, titY + 56, t('subtitulo'), {
      fontFamily: 'monospace', fontSize: '14px',
      color: '#8a96ae', letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: titulo, alpha: 1, duration: 1100, delay: 250, ease: 'Power2' });
    this.tweens.add({ targets: sub,    alpha: 1, duration: 1100, delay: 600, ease: 'Power2' });
  }

  // ---- BOTOES ----

  _criarBotoes(cx, cy) {
    this.criarBotao(cx, cy + 12, 235, 52, t('jogar'), 0xf2c14e, 22, () => {
      if (this.cache.audio.exists('musica') && !this.sound.get('musica')?.isPlaying) {
        this.sound.play('musica', { loop: true, volume: 0.18 });
      }
      this.cameras.main.fade(350, 0, 0, 0);
      this.time.delayedCall(350, () => this.scene.start('GameScene'));
    });

    this.criarBotao(cx, cy + 76, 235, 44, t('instrucoes'), 0x6a7686, 15, () => {
      this.scene.start('InstructionsScene');
    });
  }

  // ---- PARTICULAS DE BRASA ----

  _criarBrasa(w, h) {
    for (let i = 0; i < 22; i++) {
      this.time.delayedCall(i * 280, () => { this._novaParticula(w, h); });
    }
  }

  _novaParticula(w, h) {
    if (!this.scene.isActive('MenuScene')) return;
    const size = Phaser.Math.Between(1, 3);
    const startX = Phaser.Math.Between(40, w - 40);
    const dur    = Phaser.Math.Between(5000, 9500);
    const p = this.add.rectangle(startX, h + 4, size, size, 0xf2c14e, 0);

    this.tweens.add({
      targets: p,
      y: Phaser.Math.Between(-10, h * 0.35),
      x: startX + Phaser.Math.Between(-70, 70),
      alpha: { from: 0, to: Phaser.Math.FloatBetween(0.25, 0.65) },
      duration: dur,
      ease: 'Sine.easeOut',
      onComplete: () => {
        p.destroy();
        this._novaParticula(w, h);
      },
    });
  }

  // ---- MUSICA ----

  iniciarMusica() {
    if (!this.cache.audio.exists('musica')) {
      console.warn('[AUDIO] musica não está no cache — verifica o caminho do ficheiro');
      return;
    }
    const tocar = () => {
      if (!this.sound.get('musica')?.isPlaying) {
        this.sound.play('musica', { loop: true, volume: 0.18 });
      }
    };
    if (this.sound.locked) {
      this.sound.once('unlocked', tocar);
    } else {
      tocar();
    }
  }

  // ---- HELPER BOTAO ----

  criarBotao(x, y, larg, alt, texto, corBorda, tamFonte, aoClicar) {
    const corCSS = Phaser.Display.Color.IntegerToColor(corBorda).rgba;

    const bg = this.add.rectangle(x, y, larg, alt, 0x0c1120)
      .setStrokeStyle(2, corBorda);
    // Borda interior subtil
    this.add.rectangle(x, y, larg - 6, alt - 6, 0x000000, 0)
      .setStrokeStyle(1, corBorda, 0.25);

    const txt = this.add.text(x, y, texto, {
      fontFamily: 'monospace', fontSize: `${tamFonte}px`,
      color: corCSS, fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillColor(0x172035);
      txt.setColor('#ffffff');
      this.tweens.add({ targets: [bg, txt], scaleX: 1.06, scaleY: 1.06, duration: 110, ease: 'Back.easeOut' });
    });
    bg.on('pointerout', () => {
      bg.setFillColor(0x0c1120);
      txt.setColor(corCSS);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 110 });
    });
    bg.on('pointerdown', aoClicar);
  }

  // ---- BARRA DE VOLUME ----

  _criarToggleSom(cx, y) {
    const TRACK_W = 120;
    const TRACK_H = 8;
    const iconX   = cx - 52;
    const trackLX = cx - 34;
    const trackCX = trackLX + TRACK_W / 2;

    this.add.text(cx - 72, y, t('som') + ':', {
      fontFamily: 'monospace', fontSize: '13px', color: '#565e70',
    }).setOrigin(1, 0.5);

    let volAnterior = this.sound.volume > 0 ? this.sound.volume : 0.7;

    const obterCorAtiva  = () => this.sound.volume > 0 ? 0xf2c14e : 0x3a4455;
    const obterIcone     = () => this.sound.volume > 0 ? '♪' : '✕';
    const obterCorIcone  = () => this.sound.volume > 0 ? '#f2c14e' : '#4a5060';

    const icone = this.add.text(iconX, y, obterIcone(), {
      fontFamily: 'monospace', fontSize: '18px', color: obterCorIcone(),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Pista de fundo
    this.add.rectangle(trackCX, y, TRACK_W, TRACK_H, 0x2a3040).setOrigin(0.5);

    // Preenchimento dinamico
    const fill   = this.add.rectangle(trackLX, y, 0, TRACK_H, 0xf2c14e).setOrigin(0, 0.5);
    // Handle
    const handle = this.add.rectangle(trackLX, y, 8, 20, 0xf2c14e).setOrigin(0.5);
    // Hitbox invisivel para capturar clicks/drag em toda a pista
    const hitbox = this.add.rectangle(trackCX, y, TRACK_W, 24, 0, 0)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    const atualizar = (vol) => {
      vol = Phaser.Math.Clamp(vol, 0, 1);
      this.sound.setVolume(vol);
      guardarVolume(vol);
      fill.width = TRACK_W * vol;
      handle.x   = trackLX + TRACK_W * vol;
      fill.setFillStyle(obterCorAtiva());
      handle.setFillStyle(obterCorAtiva());
      icone.setText(obterIcone());
      icone.setColor(obterCorIcone());
    };

    atualizar(this.sound.volume);

    let arrastando = false;
    const calcVol = (px) => Phaser.Math.Clamp((px - trackLX) / TRACK_W, 0, 1);

    hitbox.on('pointerdown', (pointer) => {
      arrastando = true;
      const v = calcVol(pointer.x);
      if (v > 0) volAnterior = v;
      atualizar(v);
    });
    this.input.on('pointermove', (pointer) => {
      if (!arrastando) return;
      const v = calcVol(pointer.x);
      if (v > 0) volAnterior = v;
      atualizar(v);
    });
    this.input.on('pointerup', () => { arrastando = false; });

    icone.on('pointerdown', () => {
      if (this.sound.volume > 0) {
        volAnterior = this.sound.volume;
        atualizar(0);
      } else {
        atualizar(volAnterior > 0 ? volAnterior : 0.7);
      }
    });
  }

  // ---- SELETOR DE IDIOMA ----

  _criarSeletorIdioma(cx, y) {
    this.add.text(cx - 72, y, t('idioma') + ':', {
      fontFamily: 'monospace', fontSize: '13px', color: '#565e70',
    }).setOrigin(1, 0.5);

    const atual = obterIdioma();
    const linguas = [{ codigo: 'pt', label: 'PT' }, { codigo: 'en', label: 'EN' }];

    linguas.forEach((lingua, i) => {
      const lx    = cx - 28 + i * 60;
      const ativo = atual === lingua.codigo;
      const btn   = this.add.text(lx, y, lingua.label, {
        fontFamily: 'monospace', fontSize: '16px',
        color: ativo ? '#f2c14e' : '#3e4455',
        fontStyle: ativo ? 'bold' : 'normal',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      if (ativo) {
        this.add.rectangle(lx, y + 13, 22, 2, 0xf2c14e, 0.7);
      }

      btn.on('pointerdown', () => {
        definirIdioma(lingua.codigo);
        this.scene.restart();
      });
    });
  }
}
