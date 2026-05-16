import Physics from './Physics.js';

class TyreMarks {
  
  constructor(scene) {
    this.NONE = 0;
    this.USER = 1;
    this.ALL = 2;
    this.mode = this.ALL;
    this.scene = scene;
    this.tiles = [];
    this.tileSize = 512;
  } 
  
  setup() {
    if(!this.scene.textures.exists('tyres')) {
      const g = this.scene.make.graphics({x: 0, y: 0, add: false});
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 12, 20);
      g.generateTexture('tyres', 12, 20);
      g.destroy();
      this.scene.cars.forEach(car => {
        if(car.tyresSprite) car.tyresSprite.setTexture('tyres');
      });
    }
    const tw = this.scene.bg.width;
    const th = this.scene.bg.height;
    const cols = Math.ceil(tw / this.tileSize);
    const rows = Math.ceil(th / this.tileSize);
    const isTiled = this.scene.track.bgIsTiled;

    for(let r = 0; r < rows; r++) {
      for(let c = 0; c < cols; c++) {
        const rt = this.scene.add.renderTexture(0, 0, this.tileSize, this.tileSize);
        rt.depth = 25;

        let sx, sy;
        if(isTiled) {
          sx = (c * this.tileSize + this.tileSize / 2) * this.scene.bgScale;
          sy = (r * this.tileSize + this.tileSize / 2) * this.scene.bgScale;
        } else {
          const half = tw / 2;
          sx = this.scene.bg.x + (c * this.tileSize + this.tileSize / 2 - half) * this.scene.bgScale;
          sy = this.scene.bg.y + (r * this.tileSize + this.tileSize / 2 - half) * this.scene.bgScale;
        }
        rt.setPosition(sx, sy);
        rt.setScale(this.scene.bgScale);
        rt.setOrigin(0.5, 0.5);

        this.tiles.push({rt, col: c, row: r});
      }
    }
  }
  
  reset() {
    this.tiles.forEach(t => t.rt.clear());
  }

  incrementMode() {
    this.mode++;
    if(this.mode > this.ALL)
      this.mode = this.NONE;
    if(this.mode === this.NONE) {
      this.tiles.forEach(t => t.rt.clear());
      this.scene.UI.toast('Tyre marks off');
    }
    else if(this.mode === this.USER)
      this.scene.UI.toast('Tyre marks on - player');
    else if(this.mode === this.ALL)
      this.scene.UI.toast('Tyre marks on - all');
  }
  
  draw() {
    if(this.mode === this.NONE) return;
    const isSkidding = car => car.curveSkid || car.powerSkid || car.brakeSkid;
    if(this.mode === this.ALL) {
      if(!this.scene.cars.some(isSkidding)) return;
    } else if(!isSkidding(this.scene.car)) return;
    const cars = this.mode === this.ALL ? this.scene.cars : [this.scene.car];
    const isTiled = this.scene.track.bgIsTiled;
    const draws = [];

    cars.forEach(car => {
      if(!car.curveSkid && !car.powerSkid && !car.brakeSkid) return;
      if(!car.tyresSprite) return;

      let texX, texY;
      if(isTiled) {
        texX = car.x / this.scene.bgScale;
        texY = car.y / this.scene.bgScale;
      } else {
        texX = car.x / this.scene.bgScale + this.scene.bg.width / 2;
        texY = car.y / this.scene.bgScale + this.scene.bg.width / 2;
      }

      const col = Math.floor(texX / this.tileSize);
      const row = Math.floor(texY / this.tileSize);
      const tile = this.tiles.find(t => t.col === col && t.row === row);
      if(!tile) return;

      car.tyresSprite.tint = 0x000000;
      car.tyresSprite.alpha = 0.01;
      if(car.surface.type !== Physics.surface.TARMAC) {
        car.tyresSprite.alpha = 0.2;
        car.tyresSprite.tint = car.surface.skidMarkColor;
      } else {
        if(car.curveSkid || car.brakeSkid)
          car.tyresSprite.alpha = 0.3;
        if(car.powerSkid && !car.curveSkid && !car.brakeSkid)
          car.tyresSprite.alpha = 0.1;
      }

      const key = tile.rt;
      if(!draws[key]) draws[key] = {rt: tile.rt, list: []};
      draws[key].list.push({sprite: car.tyresSprite, x: texX - col * this.tileSize, y: texY - row * this.tileSize});
    });

    Object.values(draws).forEach(group => {
      group.rt.beginDraw();
      group.list.forEach(d => group.rt.batchDraw(d.sprite, d.x, d.y));
      group.rt.endDraw();
    });
  }
}

export default TyreMarks;
