class TrackBuilder extends Phaser.Scene {
  
  constructor () {
    super();
    this.points = [];
    this.isOpen = true;
    this.margin = 1024;
    this.trackWidth = 200;
    this.trackBorderWidth = 8;
    this.cpSize = 30;
    this.startersCount = 20;
    this.starterGap = 50;
  }

  preload () {
    this.load.image('grass', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fgrass.jpg?v=1617915781926');
    this.load.image('track', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Ftrack1.png?v=1617921495645');
  }

  create () {
    this.generateTextures();
    
    this.graphics = this.add.graphics();
    this.splinePointSprites = this.add.group();    
    this.startPositionSprites = this.add.group();
    this.cameras.main.zoom = 0.2;
    this.cameras.main.setOrigin(0.5, 0.5);
        
    this.input.keyboard.on('keydown', (key) =>  { 
      if(key.code === "Minus") { this.cameras.main.zoom -= 0.1; }
      else if(key.code === "Equal") { this.cameras.main.zoom += 0.1; }
    });
    
    this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
      if(deltaY > 0 || this.cameras.main.zoom > 0.1)  
        this.cameras.main.zoom += deltaY * 0.0001;
        this.cameras.main.worldX = pointer.worldX;
        this.cameras.main.worldY = pointer.worldY;
    });
    
    this.scale.on('resize', this.resize, this);    
    this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);     
    
    this.background = this.add.tileSprite(0, 0, 2048, 2048, 'grass').setOrigin(0, 0);
    
    // @TODO background dragging
//     this.background.setInteractive({ draggable: true });
    
//     this.input.on('dragstart', (pointer, background) => {  
//       this.dragOn = true;
//       console.log(1)
//     });
    
//     this.input.on('dragend', (pointer, background) => {  
//       console.log(2)
//       setTimeout(() => {
//         this.dragOn = false;
//       }, 100);
//     });
    
//     this.input.on('drag', (pointer, background) => {  
//       console.log(3);
//     });       
    
    this.input.on('pointerup', (pointer, background) => {      
      if(this.isOpen && !this.dragOn)
        this.points.push(new Phaser.Math.Vector2(pointer.worldX, pointer.worldY));
      
      this.drawSpline();
      if(this.spline) {
        const bounds = this.spline.getBounds();
        this.background.x = bounds.x - this.margin;
        this.background.y = bounds.y - this.margin;
        this.background.width = bounds.width + this.margin * 2;
        this.background.height = bounds.height + this.margin * 2;
      }
    });
  }
  
  update () {
  }
  
  resize (gameSize, baseSize, displaySize, resolution) {
    console.log(resolution)
    var width = gameSize.width;
    var height = gameSize.height;
    this.cameras.resize(width, height);
  }  
  
  
  generateTextures() {
    const graphicsGen = this.make.graphics({x: 0, y: 0, add: false});
    graphicsGen.fillStyle(0xffffff);
    graphicsGen.fillCircle(this.cpSize / 2, this.cpSize / 2, this.cpSize / 2, this.cpSize / 2); 
    graphicsGen.generateTexture('ball', this.cpSize, this.cpSize);
    graphicsGen.clear();
    graphicsGen.lineStyle(8, 0xffffff);
    graphicsGen.strokeRect(0, 0, 40, 40);
    graphicsGen.generateTexture('start', 40, 12);
    graphicsGen.clear();
    graphicsGen.fillStyle(0xffffff, 0.8);
    graphicsGen.fillRect(0, 0, this.trackWidth, 10);    
    graphicsGen.generateTexture('finish', this.trackWidth, 20);
    graphicsGen.destroy();    
  }
    
  drawSpline() {
    this.graphics.depth = 10;
    this.graphics.clear();
    this.splinePointSprites.clear(true, true);
    if(this.points.length > 0) {
      this.graphics.fillStyle(0xaaaaaa, 1);
      this.graphics.fillCircle(this.points[0].x, this.points[0].y, this.trackWidth / 2 + this.trackBorderWidth / 2);
      this.graphics.fillStyle(0x666666, 1);
      this.graphics.fillCircle(this.points[0].x, this.points[0].y, this.trackWidth / 2);      
    }
    if(this.points.length > 1) {
      this.graphics.fillStyle(0xaaaaaa, 1);
      this.graphics.fillCircle(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y, this.trackWidth / 2 + this.trackBorderWidth / 2);
      this.graphics.fillStyle(0x666666, 1);
      this.graphics.fillCircle(this.points[this.points.length -1].x, this.points[this.points.length -1].y, this.trackWidth / 2);      
      this.spline = new Phaser.Curves.Spline(this.points);
      this.graphics.lineStyle(this.trackWidth + this.trackBorderWidth, 0xaaaaaa, 0.7);
      this.spline.draw(this.graphics, this.points.length * 16);
      this.graphics.lineStyle(this.trackWidth, 0x666666, 1);
      this.spline.draw(this.graphics, this.points.length * 16);
      this.graphics.lineStyle(4, 0xffffff, 1);
      this.spline.draw(this.graphics, this.points.length * 16);
    }
    this.graphics.fillStyle(0x00ff00, 1);

    this.points.forEach((point, i) => {
      let cpSprite = this.add.sprite(point.x, point.y, 'ball');
      cpSprite.i = i;
      if(i === 0)
        cpSprite.tint = 0xff0000;
      else if(i === this.points.length - 1)
        cpSprite.tint = 0x0000ff;
      else 
        cpSprite.tint = 0x00ff00;
      
      cpSprite.depth = 11;
      this.splinePointSprites.add(cpSprite);
      
      // @TODO fix for better hit area
      // const shape = new Phaser.Geom.Circle(0, 0, 100);
      // cpSprite.setInteractive(shape, Phaser.Geom.Circle.Contains);
      
//       cpSprite.setInteractive({
//         hitArea: shape,
//         // hitAreaCallback: callback,
//         draggable: true,
//         dropZone: false,
//         useHandCursor: false,
//         pixelPerfect: false,
//         alphaTolerance: 1
//       });
      
      cpSprite.setInteractive({ draggable: true });
      cpSprite.on('drag', (pointer, dragX, dragY) => {
          cpSprite.setPosition(dragX, dragY);
      });
      cpSprite.on('dragend', (pointer, dragX, dragY) => {
          this.points[cpSprite.i].x = cpSprite.x = pointer.worldX
          this.points[cpSprite.i].y = cpSprite.y = pointer.worldY;
          setTimeout(() => {
            cpSprite.destroy();
            this.dragOn = false;
            if(!this.isOpen) {
              this.finishTrack();
            }
          }, 200);
      });      
      cpSprite.on('pointerover', () => {
        cpSprite.setScale(2);
        this.dragOn = true;
      });
      cpSprite.on('pointerout', () => {
        cpSprite.setScale(1);
        setTimeout(() => {
          this.dragOn = false;
        }, 200);      
      });
      cpSprite.on('pointerup', () => {
        if(this.shift.isDown) {
          this.points.splice(cpSprite.i, 1);
          if(i === 0 || cpSprite.i == this.points.length)
            this.isOpen = true;
          cpSprite.destroy();
        }
        if(cpSprite.i === 0) {
          this.points.push(this.points[0]);
          this.finishTrack();
        }
      });
    });
  }
  
  finishTrack() {
    this.isOpen = false;
    this.drawFinishLine();
    this.drawStartingPositions();
  }
  
  drawFinishLine() {
    if(this.fSprite)
      this.fSprite.destroy();
    let startingPoints = this.spline.getDistancePoints(this.starterGap);
    let sp0 = this.points[0];
    let angle = Phaser.Math.Angle.BetweenPoints(sp0, startingPoints[1]);
    this.fSprite = this.add.sprite(sp0.x, sp0.y, 'finish');
    this.fSprite.depth = 12;
    this.fSprite.rotation = angle;
    this.fSprite.angle -= 90;      
  }
  
  drawStartingPositions() {
    this.startPositionSprites.clear(true, true);
    let startingPoints = this.spline.getDistancePoints(this.starterGap);
    for(let i = 2; i < this.startersCount; i++) {
      const p = startingPoints[i];
      const spSprite = this.add.sprite(p.x, p.y, 'start');
      spSprite.depth = 12;
      const angle = Phaser.Math.Angle.BetweenPoints(p, startingPoints[i + 1]);
      spSprite.rotation = angle;
      spSprite.angle -= 90;      
      const x = (i % 2 == 0) ? 1 : -1;
      spSprite.x += Math.cos(spSprite.rotation) * this.trackWidth / 4 * x;
      spSprite.y += Math.sin(spSprite.rotation) * this.trackWidth / 4 * x;
      this.startPositionSprites.add(spSprite);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE
  },
  scene: TrackBuilder  
};

let game = new Phaser.Game(config);


/*
  drawRope() {
   if(this.points.length > 1) {
      if(this.rope)
        this.rope.destroy();
      this.rope = this.add.rope(0, 0, 'track', null, this.points, true);
    }
  }  
  
  drawBezier(pointer) {
    this.graphics.depth = 10;
    this.graphics.fillStyle(0xff0000, 1);
    this.graphics.lineStyle(4, 0x000000, 1);
    
    if(this.points.length === 1)
        this.path = this.add.path(pointer.x, pointer.y);
    
    let pSprite = this.add.sprite(pointer.x, pointer.y, 'ball');
    pSprite.tint = 0xff0000;
    pSprite.depth = 11;
    // this.input.setDraggable(pSprite);

    let p = new Phaser.Math.Vector2(pointer.x, pointer.y);

    if(this.lastPoint) {
      let cps = this.getControlPoints(this.lastPoint, p, 2);
      // this.path.quadraticBezierTo(pointer.x, pointer.y, cps[1].x, cps[1].y);
      this.path.cubicBezierTo(this.lastPoint, cps[0], cps[1], p);

    }
    this.path.draw(this.graphics);
    this.lastPoint = new Phaser.Math.Vector2(pointer.x, pointer.y);

    this.path.curves.forEach(curve => {
      let cp0Sprite = this.add.sprite(curve.p0.x, curve.p0.y, 'ball'); cp0Sprite.tint = 0xff0000;
      let cp1Sprite = this.add.sprite(curve.p1.x, curve.p1.y, 'ball'); cp1Sprite.tint = 0xff0000;
      let cp2Sprite = this.add.sprite(curve.p2.x, curve.p2.y, 'ball'); cp2Sprite.tint = 0x0ff000;
      let cp3Sprite = this.add.sprite(curve.p3.x, curve.p3.y, 'ball'); cp3Sprite.tint = 0x0000ff;
      // this.input.setDraggable(cpSprite);
      cp0Sprite.depth = cp1Sprite.depth = cp2Sprite.depth = cp3Sprite.depth = 11;
      this.input.on('drag', (pointer, cpSprite, dragX, dragY) => {
        cpSprite.x = dragX;
        cpSprite.y = dragY;
      });        
    });
  }
  
  getControlPoints(startP, endP, splits) {
    let curve = new Phaser.Curves.Line(startP, endP);
    let points = curve.getPoints(splits);
    return points;
  } 
  */