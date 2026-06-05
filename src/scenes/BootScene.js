import { carregarIdiomaGuardado } from '../i18n/i18n.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    carregarIdiomaGuardado();
    this.scene.start('PreloadScene');
  }
}