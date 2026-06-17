import { carregarIdiomaGuardado } from '../i18n/i18n.js';
import { restaurarVolume }        from '../som.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    carregarIdiomaGuardado();
    restaurarVolume(this);
    this.scene.start('PreloadScene');
  }
}