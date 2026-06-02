
import GameScene    from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0c12',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }, // muda para true para ver caixas de colisao
  },
  // Ordem importa: a primeira cena arranca automaticamente
  scene: [GameScene, GameOverScene],
};

new Phaser.Game(config);