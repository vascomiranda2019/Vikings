export default class Gem extends Phaser.Physics.Arcade.Sprite {
  // Os tres tipos de gema e o XP que cada uma vale.
  static get TYPES() {
    return {
      pequena: { texture: 'gemaP', xp: 5  },
      media:   { texture: 'gemaM', xp: 15 },
      grande:  { texture: 'gemaG', xp: 40 },
    };
  }

  // Probabilidade de cada tipo sair. Os pesos sao relativos (aqui somam 100,
  // por isso leem-se como percentagem): a verde sai quase sempre, a azul de
  // vez em quando e a dourada raramente. Para reequilibrar mexe-se so aqui.
  static get DROP_TABLE() {
    return [
      { tipo: 'pequena', peso: 70 },
      { tipo: 'media',   peso: 25 },
      { tipo: 'grande',  peso: 5  },
    ];
  }

  // Sorteia um tipo pela tabela: soma os pesos, tira um numero ao calhas
  // dentro desse total e ve em que fatia caiu.
  static sortearTipo() {
    const tabela = Gem.DROP_TABLE;
    const total  = tabela.reduce((soma, g) => soma + g.peso, 0);
    let r = Phaser.Math.FloatBetween(0, total);
    for (const g of tabela) {
      if (r < g.peso) return g.tipo;
      r -= g.peso;
    }
    return tabela[0].tipo; // seguranca, nunca deve chegar aqui
  }

  constructor(scene, x, y) {
    const tipo = Gem.sortearTipo();
    const cfg  = Gem.TYPES[tipo];
    super(scene, x, y, cfg.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.xpValue = cfg.xp;
  }
}