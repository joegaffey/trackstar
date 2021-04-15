class Track {
  
  constructor(config, scene) {   
    this.isReverse = config.isReverse;
    this.isOpen = config.isOpen;
    this.points = config.points;
    this.width = config.width;
    this.borderWidth = config.borderWidth;
    this.pitBoxCount = config.pitBoxCount;
    this.starterGap = config.starterGap;
    this.bgTexture = config.bgTexture;
    this.trackTexture = config.trackTexture;
    this.bgSize = config.bgSize;
    this.bgIsTiled = config.bgIsTiled;
    this.gridPositions = config.gridPositions;
    this.shapes = config.shapes;    
    this.scene = scene;
    
    this.startPositionSprites = this.scene.add.group();
    this.graphics = this.scene.add.graphics();
  }
  
  draw() {
    this.drawRope();
    this.drawFinishLine();
    this.drawStartingPositions();
  }
  
  drawRope() {
    if(this.rope)
      this.rope.destroy();
    this.graphics.clear();
    this.graphics.depth = 10;
    this.graphics.fillStyle(0x444444, 0.5);
    this.graphics.fillCircle(this.points[0].x, this.points[0].y, this.width / 2);
    this.graphics.fillStyle(0x444444, 1);
    this.graphics.fillCircle(this.points[0].x, this.points[0].y, (this.width / 2) - 5);
    const spline = new Phaser.Curves.Spline(this.points);
    this.rope = this.scene.add.rope(0, 0, this.trackTexture, null, spline.getPoints(this.points.length * 16), true);  
    this.rope.depth = 14;
  }  
  
  drawFinishLine() {
    if(this.fSprite)
      this.fSprite.destroy();
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap);
    let sp0 = this.points[0];
    let angle = Phaser.Math.Angle.BetweenPoints(sp0, startingPoints[1]);
    this.fSprite = this.scene.add.sprite(sp0.x, sp0.y, 'finish');
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
  
  drawStartingPositions() {
    this.startPositionSprites.clear(true, true);
    this.gridPositions = [];
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap);
    if(!this.isReverse)
      startingPoints = startingPoints.reverse();
    for(let i = 2; i < this.pitBoxCount; i++) {
      const p = startingPoints[i];
      const spSprite = this.scene.add.sprite(p.x, p.y, 'start');
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
