# Forgemon — a monster-crafting RPG

A prototype exploring a twist on the creature-battler genre: **you never capture monsters — you craft them.**

Fight wild Forgemon RPG-style (1-on-1, turn-based, like Pokémon). When a wild
monster faints, it *shatters into loot* — consumable items and **element
blocks**. Take those blocks to **the Forge** and craft brand-new monsters for
your party.

Built with **[Phaser 3](https://phaser.io)** (vendored in `lib/`, no build step).
All sprites are generated procedurally at runtime — no image assets ship.

## Play

Open `index.html` in a browser, or serve the folder:

```sh
cd forgemon
python3 -m http.server 8099
# visit http://localhost:8099
```

### Controls
- **Move:** Arrow keys / WASD
- Step into **tall grass** to find wild Forgemon.
- Step onto the **orange Forge tile** (or press **FORGE**) to craft.
- Step onto a **house door** to heal your party.
- **PARTY** button: inspect party, set your lead, use potions.
- **⚙ Settings** button: live tuning (see below).

## The core loop
1. **Battle** a wild Forgemon (1-on-1, type-effective moves).
2. On its faint it drops **blocks** (mostly its own element) + maybe a potion,
   and rarely a **Beast Core** / **Prime Shard**.
3. Visit the **Forge** and spend blocks to **craft** a new monster.
4. Build a party of up to 6 and take on the tougher deepwood to the south.

## Crafting — three modes, toggle live
Because the *feel* of crafting is the whole point, all three approaches are
implemented and switchable at runtime in **⚙ Settings** (or via
`CONFIG.CRAFT_MODE` in `src/config.js`):

| Mode | Flag value | How it works |
|------|-----------|--------------|
| **Fixed Recipes** | `recipes` | A set block combo yields a specific monster (e.g. 2× Ember → Emberling; 4× Ember + Beast Core → Cindrake). Collectible & predictable. |
| **Element + Quantity** | `element` | The *dominant* element you commit picks the species; *total* blocks set the level; a Beast Core unlocks the evolved form. Flexible. |
| **Slot Assembly** | `slots` | Place blocks into **ELEMENT / CORE / TRAIT** slots to assemble a monster. Element sets type, core sets body tier, trait leans the stats. Creative. |

The Settings screen also exposes the **encounter rate** and testing helpers
(+blocks, heal, reset) so the loop is quick to feel out.

## Elements & type chart
`Ember · Aqua · Terra · Volt · Umbra · Verdant` — each strong/weak against
others (e.g. Aqua beats Ember & Terra, Verdant beats Terra & Aqua). See
`src/data.js` (`EFFECT`).

## Code map
```
forgemon/
  index.html            entry — loads Phaser + all modules
  lib/phaser.min.js     vendored engine
  src/
    config.js           CONFIG flags (CRAFT_MODE, rates, colors)
    data.js             elements, blocks, species, moves, recipes, loot tables
    state.js            runtime state, inventory, the 3 crafting functions
    art.js              procedural sprite/tile generation
    ui.js               panel / button / text helpers
    scenes/
      BootScene.js      generate textures
      TitleScene.js     splash
      WorldScene.js     overworld, movement, encounters, forge/heal
      BattleScene.js    1-on-1 turn-based combat + loot on win
      CraftScene.js     the Forge (renders the active craft mode)
      PartyScene.js     party management
      SettingsScene.js  live tuning incl. the craft-mode flag
    main.js             Phaser bootstrap
```

This is an early prototype meant for exploring the crafting feel — balance,
content, and polish are intentionally light.
