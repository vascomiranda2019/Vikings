import BootScene         from './scenes/BootScene.js';
import PreloadScene      from './scenes/PreloadScene.js';
import MenuScene         from './scenes/MenuScene.js';
import InstructionsScene from './scenes/InstructionsScene.js';
import GameScene         from './scenes/GameScene.js';
import UpgradeScene      from './scenes/UpgradeScene.js';
import GameOverScene     from './scenes/GameOverScene.js';
import VictoryScene      from './scenes/VictoryScene.js';

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
    arcade: { debug: false },
  },
  scene: [
    BootScene, PreloadScene, MenuScene, InstructionsScene,
    GameScene, UpgradeScene, GameOverScene, VictoryScene,
  ],
};

new Phaser.Game(config);