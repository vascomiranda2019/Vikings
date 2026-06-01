
const WORLD_SIZE = 2400;   // tamanho do mundo em pixels 
const PLAYER_SPEED = 220;  // velocidade do jogador


class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene'); // nome da cena, usamos para mudar de cena mais tarde
  }

  // create() corre uma vez quando a cena arranca.
  create() {
    this.criarFundo();
    this.criarJogador();
    this.criarControlos();
    this.configurarCamara();
    this.criarTextoAjuda();
  }


  criarFundo() {
    
    const tamanho = 64;
    const g = this.add.graphics();
    g.fillStyle(0x12131a, 1);            
    g.fillRect(0, 0, tamanho, tamanho);
    g.lineStyle(1, 0x1e2233, 1);         
    g.strokeRect(0, 0, tamanho, tamanho);
    g.generateTexture('grelha', tamanho, tamanho);
    g.destroy();

    // tileSprite repete a textura por todo o mundo
    this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'grelha')
      .setOrigin(0, 0);

    // Limites físicos do mundo 
    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  }

  // --- Jogador: placeholder gerado por código ---
  criarJogador() {
    // Geramos uma textura simples para o herói 
    const g = this.add.graphics();
    g.fillStyle(0x2b3b55, 1);            // corpo
    g.fillRoundedRect(0, 0, 28, 34, 6);
    g.fillStyle(0xd9a441, 1);            // "elmo"/cabeça dourada
    g.fillRoundedRect(4, 0, 20, 12, 4);
    g.generateTexture('heroi', 28, 34);
    g.destroy();

    // Sprite com física Arcade, no centro do mundo
    this.player = this.physics.add.sprite(WORLD_SIZE / 2, WORLD_SIZE / 2, 'heroi');
    this.player.setCollideWorldBounds(true); // bate nas bordas do mundo
  }

  // --- Controlos: setas + WASD ---
  criarControlos() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  // --- Câmara segue o jogador, sem sair do mundo ---
  configurarCamara() {
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1); // suave
  }

 
  criarTextoAjuda() {
    this.add.text(16, 16, 'Move-te com WASD ou as setas', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#cfd3dc',
    }).setScrollFactor(0); 
  }

  // update() corre a cada frame.
  update() {
    // Lê o input 
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown)  dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown)     dy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

    // Normaliza a diagonal 
    const comprimento = Math.hypot(dx, dy) || 1;
    this.player.setVelocity(
      (dx / comprimento) * PLAYER_SPEED,
      (dy / comprimento) * PLAYER_SPEED
    );

    // Vira o sprite consoante a direção 
    if (dx < 0) this.player.setFlipX(true);
    else if (dx > 0) this.player.setFlipX(false);
  }
}

const config = {
  type: Phaser.AUTO,            // WebGL se possível, senão Canvas
  parent: 'game',              // a <div id="game">
  backgroundColor: '#0b0c12',
  pixelArt: true,              // mantém pixel art nítida (útil depois)
  scale: {
    mode: Phaser.Scale.RESIZE, // ocupa a janela toda
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,            // mete a true para ver as caixas de colisão
    },
  },
  scene: [GameScene],
};

// Arranca o jogo
const game = new Phaser.Game(config);