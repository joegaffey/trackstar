class Track {
  
  constructor(config) {   
    this.isReverse = config.isReverse;
    this.isOpen = config.isOpen;
    this.points = config.points;
    this.width = config.width;
    this.borderWidth = config.borderWidth;
    this.pitBoxCount = config.pitBoxCount;
    this.starterGap = config.starterGap;
    this.bgTexture = config.bgTexture;
    this.physicsTexture = config.physicsTexture;
    this.trackTexture = config.trackTexture;
    this.bgSize = config.bgSize;
    this.bgIsTiled = config.bgIsTiled;
    this.gridPositions = config.gridPositions;
    this.shapes = config.shapes;
    this.textures = config.textures;
    this.scale = config.scale;
    this.margin = config.margin;    
  }
  
  toJSON() {
    return {
      isReverse:this.isReverse,
      isOpen:this.isOpen,
      points:this.points,
      width:this.width,
      borderWidth:this.borderWidth,
      pitBoxCount:this.pitBoxCount,
      starterGap:this.starterGap,
      bgTexture:this.bgTexture,
      physicsTexture:this.physicsTexture,
      trackTexture:this.trackTexture,
      bgSize:this.bgSize,
      bgIsTiled:this.bgIsTiled,
      gridPositions:this.gridPositions,
      shapes:this.shapes,
      textures:this.textures,
      scale:this.scale,
      margin:this.margin
    }
  }
  
  draw(scene) {
    this.drawRope(scene);
    this.drawFinishLine(scene);
    this.drawStartingPositions(scene);
    this.drawPhysicsTexture(scene);
  }
  
  getDimensions() {
    return new Phaser.Curves.Spline(this.points).getBounds();
  }
  
  drawPhysicsTexture(scene) {   
    const spline = new Phaser.Curves.Spline(this.points);
    this.bounds = spline.getBounds();
    
    const graphicsGen = scene.make.graphics({x: 0, y: 0, add: false});    
    
    graphicsGen.fillStyle(0x00ff00);
    graphicsGen.fillRect(this.bounds.x - this.margin, 
                         this.bounds.y - this.margin, 
                         this.bounds.width + this.margin * 2, 
                         this.bounds.height + this.margin * 2);    
    graphicsGen.fillStyle(0xffffff);
    graphicsGen.fillCircle(this.points[this.points.length -1].x, 
                           this.points[this.points.length -1].y, 
                           this.width / 2);
    graphicsGen.lineStyle(this.width, 0xffffff);

    spline.draw(graphicsGen, this.points.length * 16);
    
    graphicsGen.generateTexture('physics', 
                                this.bounds.width + this.margin * 2, 
                                this.bounds.height + this.margin * 2);
    graphicsGen.destroy();
  }
    
  drawGraphicsTextures(scene) {
    const graphicsGen = scene.make.graphics({x: 0, y: 0, add: false});
    graphicsGen.lineStyle(5, 0xffffff);
    graphicsGen.strokeRect(0, 0, 40, 50);
    graphicsGen.generateTexture('start', 40, 40);
    graphicsGen.clear();
    graphicsGen.fillStyle(0xffffff);
    graphicsGen.fillRect(0, 0, this.width, 10);    
    graphicsGen.generateTexture('finish', this.width, 20);
    graphicsGen.destroy(); 
  }
  
  drawRope(scene) {
    if(this.rope)
      this.rope.destroy();
    if(!this.graphics)
      this.graphics = scene.add.graphics();
    this.graphics.clear();
    this.graphics.depth = 10;
    this.graphics.fillStyle(0x444444, 0.5);
    this.graphics.fillCircle(this.points[0].x, this.points[0].y, this.width / 2);
    this.graphics.fillStyle(0x444444, 1);
    this.graphics.fillCircle(this.points[0].x, this.points[0].y, (this.width / 2) - 5);
    const spline = new Phaser.Curves.Spline(this.points);
    this.rope = scene.add.rope(0, 0, this.trackTexture, null, spline.getPoints(this.points.length * 16), true);  
    this.rope.depth = 14;
  }  
  
  drawFinishLine(scene) {
    if(this.fSprite)
      this.fSprite.destroy();
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap);
    let sp0 = this.points[0];
    let angle = Phaser.Math.Angle.BetweenPoints(sp0, startingPoints[1]);
    this.fSprite = scene.add.sprite(sp0.x, sp0.y, 'finish');
    this.fSprite.depth = 14;
    this.fSprite.rotation = angle;
    this.fSprite.angle -= 90;      
    this.fSprite.alpha = 0.5;      
    this.fSprite.setInteractive({ draggable: false });
      this.fSprite.on('pointerup', (pointer) => {
        this.isReverse = !this.isReverse;
        this.drawStartingPositions();
      });
  }
  
  drawStartingPositions(scene) {
    if(!this.startPositionSprites )
      this.startPositionSprites = scene.add.group();
    else
      this.startPositionSprites.clear(true, true);
    this.gridPositions = [];
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap);
    if(!this.isReverse)
      startingPoints = startingPoints.reverse();
    for(let i = 2; i < this.pitBoxCount; i++) {
      const p = startingPoints[i];
      const spSprite = scene.add.sprite(p.x, p.y, 'start');
      spSprite.depth = 20;
      const angle = Phaser.Math.Angle.BetweenPoints(p, startingPoints[i + 1]);
      spSprite.rotation = angle;
      spSprite.angle -= 90;      
      spSprite.setOrigin(0.5, 1);
      spSprite.alpha = 0.6;
      const offSet = (i % 2 == 0) ? this.width / 4  : this.width / -4;
      spSprite.x += Math.cos(spSprite.rotation) * offSet;
      spSprite.y += Math.sin(spSprite.rotation) * offSet;
      this.startPositionSprites.add(spSprite);
      this.gridPositions.push({x: spSprite.x, y: spSprite.y, angle: spSprite.angle});
    }
  }
}
