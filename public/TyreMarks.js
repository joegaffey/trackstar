class TyreMarks {
  
  constructor(scene) {
    this.NONE = 0;
    this.USER = 1;
    this.ALL = 2;
    this.mode = this.USER; //User car only by default
    this.scene = scene;
  } 
  
  setup() {
    this.texture = this.scene.make.renderTexture({ 
      x: 0, y: 0,
      width: this.scene.bg.width, 
      height: this.scene.bg.height,
      depth: 25
    });
    
    if(this.scene.track.bgIsTiled)
      this.texture.setOrigin(0, 0);
    else
      this.texture.setOrigin(0.5, 0.5);
    
    this.texture.setScale(this.scene.bgScale);
  }
  
  incrementMode() {
    this.mode++;
    if(this.mode > this.ALL)
      this.mode = this.NONE;
    if(this.mode === this.NONE)
      this.scene.toast('Tyre marks off');
    else if(this.mode === this.USER)
      this.scene.toast('Tyre marks on - player');
    else if(this.mode === this.ALL)
      this.scene.toast('Tyre marks on - all');
  }
  
  draw() {
    if(this.mode !== this.NONE) {
      this.texture.beginDraw();
      if(this.mode === this.ALL || 
         this.mode === this.USER) {
        this.drawCar(this.scene.car);   
      }
      if(this.mode === this.ALL) {
        this.scene.AI.cars.forEach(car => {
          this.drawCar(car);   
        });
      }
      this.texture.endDraw();
    }
  }
    
  drawCar(car) {
    car.tyresSprite.tint = 0x000000;
    if(car.surface.type !== Physics.surface.TARMAC) {    
      car.tyresSprite.alpha = 0.2;
      car.tyresSprite.tint = car.surface.skidMarkColor;
    } 
    else { 
      car.tyresSprite.alpha = 0.01;
      if(car.curveSkid || car.brakeSkid) {
        car.tyresSprite.alpha = 0.3;
      }
      if(car.powerSkid)
        car.tyresSprite.alpha = 0.1;
    }
    if(this.scene.track.bgIsTiled) {
      this.texture.batchDraw(
        car.tyresSprite, 
        car.x,
        car.y
      );
    }
    else {
      this.texture.batchDraw(
        car.tyresSprite, 
        car.x / this.scene.bgScale + (this.scene.bg.width / 2),
        car.y / this.scene.bgScale + (this.scene.bg.width / 2)
      );
    }
  }
}