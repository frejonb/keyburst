// ============================================================
//  BootScene — generate all procedural textures, then Title
// ============================================================
class BootScene extends Phaser.Scene {
  constructor(){ super('Boot'); }
  create(){
    // monsters
    for(const id in SPECIES) ART.monsterTexture(this, 'mon_'+id, id);
    // blocks
    for(const id in BLOCKS) ART.blockTexture(this, 'blk_'+id, id);
    // player + tiles
    ART.playerTexture(this, 'player');
    ART.tileTextures(this);
    ART.fxTextures(this);
    newGame();
    this.scene.start('Title');
  }
}
window.BootScene = BootScene;
