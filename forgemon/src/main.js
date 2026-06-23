// ============================================================
//  FORGEMON — Phaser bootstrap
// ============================================================
window.addEventListener('load', ()=>{
  const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: 'game',
    backgroundColor: '#0e0c1a',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, TitleScene, WorldScene, BattleScene, CraftScene, PartyScene, SettingsScene],
  };
  window.game = new Phaser.Game(config);
});
