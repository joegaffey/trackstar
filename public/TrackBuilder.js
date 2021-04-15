class TrackBuilderScene extends Phaser.Scene {
  
  constructor () {
    super();
    this.showControls = true;
    this.margin = 1024;
    this.cpSize = 50;
    
    this.track = {
      isReverse: false,
      isOpen: true,
      points: [],
      width: 200,
      borderWidth: 20,
      pitBoxCount: 20,
      starterGap: 80,
      bgTexture: 'grass',
      trackTexture: 'track',
      bgSize: [2048, 2048],
      bgIsTiled: true,
      shapes: []
    }
  }

  preload () {
    const cdnUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2F';
    this.load.image('grass', `${cdnUrl}grass.jpg`);
    this.load.image('track', `${cdnUrl}track.png`);
    for(let i = 1; i < 20; i++) {
      this.load.image('car' + i, `${cdnUrl}pitstop_car_${i}.png`);  
    }
  }

  create () {
    this.editorUIScene = this.game.scene.scenes[1];
    this.generateTextures();
    
    this.graphics = this.add.graphics();
    this.splinePointSprites = this.add.group();    
    this.startPositionSprites = this.add.group();
    this.carSprites = this.add.group();
    this.cameras.main.zoom = 0.2;
    this.cameras.main.setOrigin(0.5, 0.5);
            
    this.scale.on('resize', this.resize, this);    
    this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);     
    
    this.background = this.add.tileSprite(0, 0, 2048, 2048, this.track.bgTexture).setOrigin(0, 0);
    
    this.input.keyboard.on('keydown', (key) =>  { 
      if(key.code === "Minus") { this.cameras.main.zoom -= 0.1; }
      else if(key.code === "Equal") { this.cameras.main.zoom += 0.1; }
    });
    
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      // if(deltaY > 0 && this.cameras.main.zoom > 0.1 || deltaY > 0 && this.cameras.main.zoom < 1)  
      if(deltaY > 0 || this.cameras.main.zoom > 0.1)  
        this.cameras.main.zoom += deltaY * 0.0001;
        // this.cameras.main.x = pointer.x - this.background.width / 2;
        // this.cameras.main.y = pointer.y - this.background.height / 2;
    });
    
    // @TODO background dragging
//     this.background.setInteractive({ draggable: true });
    
//     this.background.on('dragstart', (pointer) => {  
//       this.dragOn = true;
//       console.log(1)
//     });
    
//     this.background.on('dragend', (pointer) => {  
//       console.log(2)
//       setTimeout(() => {
//         this.dragOn = false;
//       }, 100);
//     });
    
//     this.background.on('drag', (pointer) => {  
//       console.log(3);
//       this.cameras.main.x = pointer.worldX;
//       this.cameras.main.y = pointer.worldY;
//     });       
    
    this.input.on('pointerup', (pointer) => {     
      if(this.track.isOpen && !this.dragOn)
        this.track.points.push(new Phaser.Math.Vector2(pointer.worldX, pointer.worldY));
      else if(this.shapePoints) {
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillPoints(this.shapePoints);
        this.shapePoints = null;
      }
      
      this.drawTrack();
      if(this.track.points.length > 1) {
        const spline = new Phaser.Curves.Spline(this.track.points);
        const bounds = spline.getBounds();
        this.background.x = bounds.x - this.margin;
        this.background.y = bounds.y - this.margin;
        this.background.width = bounds.width + this.margin * 2;
        this.background.height = bounds.height + this.margin * 2;
      }
    });
    
    this.input.on('pointerdown', (pointer) => {      
      if(this.shapeMode)
        this.shapePoints = [];
    });
    
    this.input.on('pointermove', (pointer) => {      
      if(this.shapePoints) {
        this.shapePoints.push(pointer.position);
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillCircle(pointer.worldX, pointer.worldY, 2 / this.cameras.main.zoom, 2 / this.cameras.main.zoom);
      }
    });
    
    
    // @TODO draw bitmaps for sand etc
//     var rt = this.make.renderTexture({ 
//       x: this.background.x, 
//       y: this.background.y,
//       width: this.background.width, 
//       height: this.background.height 
//     }).setOrigin(0, 0);    

//     this.input.on('pointermove', (pointer) => {
//         if (!this.track.isOpen && pointer.isDown) {
//             rt.draw('ball', pointer.worldX, pointer.worldY);
//         }
//     });    
   
    this.input.keyboard.on('keydown', (key) =>  { 
      if(key.code === "KeyW" || key.code === "ArrowUp") { this.cameras.main.y -= 10; }
      else if(key.code === "KeyS" || key.code === "ArrowDown") { this.cameras.main.y += 10; }
      else if(key.code === "KeyA" || key.code === "ArrowLeft") { this.cameras.main.x -= 10; }
      else if(key.code === "KeyD" || key.code === "ArrowRight") { this.cameras.main.x += 10; }
    });
  }
  
  update () {
  }
  
  resize (gameSize, baseSize, displaySize, resolution) {
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
    graphicsGen.lineStyle(5, 0xffffff);
    graphicsGen.strokeRect(0, 0, 40, 50);
    graphicsGen.generateTexture('start', 40, 40);
    graphicsGen.clear();
    graphicsGen.fillStyle(0xffffff);
    graphicsGen.fillRect(0, 0, this.track.width, 10);    
    graphicsGen.generateTexture('finish', this.track.width, 20);
    graphicsGen.destroy();    
  }
    
  drawSpline() {
    this.graphics.depth = 10;
    if(this.track.points.length > 0) {
      this.graphics.fillStyle(0xaaaaaa, 1);
      this.graphics.fillCircle(this.track.points[0].x, this.track.points[0].y, this.track.width / 2 + this.track.borderWidth / 2);
      this.graphics.fillStyle(0x666666, 1);
      this.graphics.fillCircle(this.track.points[0].x, this.track.points[0].y, this.track.width / 2);      
    }
    if(this.track.points.length > 1) {
      this.graphics.fillStyle(0xaaaaaa, 1);
      this.graphics.fillCircle(this.track.points[this.track.points.length - 1].x, this.track.points[this.track.points.length - 1].y, this.track.width / 2 + this.track.borderWidth / 2);
      this.graphics.fillStyle(0x666666, 1);
      this.graphics.fillCircle(this.track.points[this.track.points.length -1].x, this.track.points[this.track.points.length -1].y, this.track.width / 2);      
      const spline = new Phaser.Curves.Spline(this.track.points);
      this.graphics.lineStyle(this.track.width + this.track.borderWidth, 0xaaaaaa, 0.7);
      spline.draw(this.graphics, this.track.points.length * 16);
      this.graphics.lineStyle(this.track.width, 0x666666, 1);
      spline.draw(this.graphics, this.track.points.length * 16);
    }
    
    // @TODO Interactive track graphics - click, drag behaviour
    // this.graphics.setInteractive({ draggable: false });
    // this.graphics.on('pointerup', () => {
    //   if(!this.track.isOpen) {
    //     this.showControls = !this.showControls;
    //     this.finishTrack();
    //   }
    // });
  }  
  
  closeLoop() {
    this.track.points.push(this.track.points[0]);
    this.track.isOpen = false;
    this.drawTrack();
  }
  
  drawTrack() {
    this.graphics.clear();
    this.splinePointSprites.clear(true, true);
    if(this.track.isOpen) 
      this.drawSpline();
    else {
      this.drawRope();
      this.drawFinishLine();
      this.drawStartingPositions();
      this.drawCars();
    }
    if(this.showControls)
      this.drawControls();
    else
      this.clearControls();
  }
  
  drawRope() {
    this.graphics.depth = 10;
    if(this.rope)
      this.rope.destroy();
    this.graphics.fillStyle(0x444444, 0.5);
    this.graphics.fillCircle(this.track.points[0].x, this.track.points[0].y, this.track.width / 2);
    this.graphics.fillStyle(0x444444, 1);
    this.graphics.fillCircle(this.track.points[0].x, this.track.points[0].y, (this.track.width / 2) - 5);
    const spline = new Phaser.Curves.Spline(this.track.points);
    this.rope = this.add.rope(0, 0, this.track.trackTexture, null, spline.getPoints(this.track.points.length * 16), true);  
    this.rope.depth = 14;
  }  
  
  drawFinishLine() {
    if(this.fSprite)
      this.fSprite.destroy();
    const spline = new Phaser.Curves.Spline(this.track.points);
    let startingPoints = spline.getDistancePoints(this.track.starterGap);
    let sp0 = this.track.points[0];
    let angle = Phaser.Math.Angle.BetweenPoints(sp0, startingPoints[1]);
    this.fSprite = this.add.sprite(sp0.x, sp0.y, 'finish');
    this.fSprite.depth = 14;
    this.fSprite.rotation = angle;
    this.fSprite.angle -= 90;      
    this.fSprite.alpha = 0.5;      
    this.fSprite.setInteractive({ draggable: false });
      this.fSprite.on('pointerup', (pointer) => {
        this.track.isReverse = !this.track.isReverse;
        this.drawStartingPositions();
      });
  }
  
  drawStartingPositions() {
    this.startPositionSprites.clear(true, true);
    const spline = new Phaser.Curves.Spline(this.track.points);
    let startingPoints = spline.getDistancePoints(this.track.starterGap);
    if(!this.track.isReverse)
      startingPoints = startingPoints.reverse();
    for(let i = 2; i < this.track.pitBoxCount; i++) {
      const p = startingPoints[i];
      const spSprite = this.add.sprite(p.x, p.y, 'start');
      spSprite.depth = 20;
      const angle = Phaser.Math.Angle.BetweenPoints(p, startingPoints[i + 1]);
      spSprite.rotation = angle;
      spSprite.angle -= 90;      
      spSprite.setOrigin(0.5, 1);
      spSprite.alpha = 0.6;
      const offSet = (i % 2 == 0) ? this.track.width / 4  : this.track.width / -4;
      spSprite.x += Math.cos(spSprite.rotation) * offSet;
      spSprite.y += Math.sin(spSprite.rotation) * offSet;
      this.startPositionSprites.add(spSprite);
    }
  }
  
  drawCars() {
    let i = 0;
    this.carSprites.clear(true, true);
    this.startPositionSprites.children.entries.forEach(sp => {
      const carSprite = this.add.sprite(sp.x, sp.y, 'car' + ++i);
      carSprite.scale = 0.08;
      carSprite.angle = sp.angle;
      carSprite.flipY = true;
      carSprite.depth = 25;
      this.carSprites.add(carSprite);
    });
  }
  
  clearControls() {
    if(this.controlGraphics)
      this.controlGraphics.clear();
    this.splinePointSprites.clear(true, true);
  }
  
  drawControls() {
    if(!this.controlGraphics)
      this.controlGraphics = this.add.graphics({x: 0, y: 0});
    this.controlGraphics.clear();
    this.controlGraphics.depth = 16;
    this.splinePointSprites.clear(true, true);
    const spline = new Phaser.Curves.Spline(this.track.points);
    this.track.points.forEach((point, i) => {
      this.addControlPoint(point, i);
    });
    this.controlGraphics.lineStyle(4, 0xffffff, 1);
    spline.draw(this.controlGraphics, this.track.points.length * 16);
  }
  
  addControlPoint(point, i) {
    let cpSprite = this.add.sprite(point.x, point.y, 'ball');
    cpSprite.i = i;
    if(i === 0)
      cpSprite.tint = 0xff0000;
    else if(i === this.track.points.length - 1)
      cpSprite.tint = 0x0000ff;
    else 
      cpSprite.tint = 0x00ff00;
    cpSprite.depth = 18;
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
        this.track.points[cpSprite.i].x = cpSprite.x = pointer.worldX
        this.track.points[cpSprite.i].y = cpSprite.y = pointer.worldY;
        setTimeout(() => {
          cpSprite.destroy();
          this.dragOn = false;
          if(!this.track.isOpen) {
            this.drawTrack();
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
        this.track.points.splice(cpSprite.i, 1);
        if(i === 0 || cpSprite.i == this.track.points.length -1) 
          this.track.isOpen = true;
        cpSprite.destroy();
        this.drawTrack();
      }
      if(cpSprite.i === 0) {
        this.closeLoop();
      }
    });
  }
}


class EditorUIScene extends Phaser.Scene {
  
  constructor ()  {
    super({ key: 'UIScene', active: true });
  }
  
  preload() {
  }

  create () {    
    this.editorScene = this.game.scene.scenes[0];
    this.addControlPointsButton(0);
    this.addCloseLoopButton(1);
    this.addRaceButton(2);
  }
  
  update() {    
  }
  
  addControlPointsButton(position) {
    const box = this.add.rectangle(position * 130 + 20, 20, 125, 50, 0x000000).setOrigin(0,0);
    box.alpha = 0.6;
    this.controlsOnText = this.add.text(position * 130 + 35, 35, 'Controls Off', { font: '16px Helvetica', fill: '#aaaaaa' }).setOrigin(0,0);;
    box.setInteractive({ draggable: false });
    box.on('pointerup', (pointer) => {
      this.editorScene.showControls = !this.editorScene.showControls;
      if(this.editorScene.showControls)
        this.controlsOnText.setText('Controls Off');
      else
        this.controlsOnText.setText('Controls On');
      this.editorScene.drawTrack();
    });
  }
  
  addCloseLoopButton(position) {
    const box = this.add.rectangle(position * 130 + 20, 20, 125, 50, 0x000000).setOrigin(0,0);
    box.alpha = 0.6;
    const closeLoopText = this.add.text(position * 130 + 35, 35, 'Close Loop', { font: '16px Helvetica', fill: '#aaaaaa' }).setOrigin(0,0);;
    box.setInteractive({ draggable: false });
    box.on('pointerup', (pointer) => {
      if(this.editorScene.track.points.length > 4)
        this.editorScene.closeLoop();
      else
        alert('Not enough points! Click on the background.')
    });
  }
  
   addRaceButton(position) {
    const box = this.add.rectangle(position * 130 + 20, 20, 125, 50, 0x000000).setOrigin(0,0);
    box.alpha = 0.6;
    const closeLoopText = this.add.text(position * 130 + 35, 35, 'Go Race!', { font: '16px Helvetica', fill: '#aaaaaa' }).setOrigin(0,0);;
    box.setInteractive({ draggable: false });
    box.on('pointerup', (pointer) => {
      if(this.editorScene.points.length < 5)
        alert('Not enough points! Click on the background.');
      else if(this.editorScene.isOpen)
        alert('Can\'t race on an open circuit.');
      else
        alert('Coming soon :)');
    });
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: 0x444444,
  scale: {
    mode: Phaser.Scale.RESIZE
  },
  scene: [TrackBuilderScene, EditorUIScene]
};

let game = new Phaser.Game(config);


/* @TODO Look into ropes and bezier curves a bit more
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