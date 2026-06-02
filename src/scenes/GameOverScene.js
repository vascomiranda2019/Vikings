
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  // init() recebe os dados passados pelo scene.start()
  init(data) {
    this.kills = data.kills || 0;
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const w  = this.cameras.main.width;
    const h  = this.cameras.main.height;

    // Fundo escuro semi-transparente
    this.add.rectangle(cx, cy, w, h, 0x000000, 0.78);

    // Titulo
    this.add.text(cx, cy - 100, 'Não chegaste a Valhalla', {
      fontFamily: 'monospace',
      fontSize: '34px',
      color: '#e8c87a',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Numero de abates
    this.add.text(cx, cy - 20, `Abates: ${this.kills}`, {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#cfd3dc',
    }).setOrigin(0.5);

    // Instrucao de reinicio
    const instrucao = this.add.text(cx, cy + 60, 'Prima R para recomeçar', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#7e8597',
    }).setOrigin(0.5);

    // Anima a instrucao a piscar (chama atencao)
    this.tweens.add({
      targets: instrucao,
      alpha: { from: 1, to: 0.3 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Tecla R reinicia o jogo
    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('GameScene');
    });
  }
}