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
    this.trees = config.trees;
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
      margin:this.margin,
      trees:this.trees
    }
  }
  
  draw(scene) {    
    const spline = new Phaser.Curves.Spline(this.points);
    this.bounds = spline.getBounds();
    this.drawGraphicsTextures(scene);      
    this.drawMapTexture(scene);  
  }
  
  drawFinal(scene) {
    const spline = new Phaser.Curves.Spline(this.points);
    this.bounds = spline.getBounds();    
    this.points.forEach(point => {
      point.x -= this.bounds.x - this.margin;
      point.y -= this.bounds.y - this.margin;
    })
    this.trees.forEach(tree => {
      tree.x -= this.bounds.x - this.margin;
      tree.y -= this.bounds.y - this.margin;
    })
    this.draw(scene);
    this.drawPhysicsTexture(scene);
  }
    
  drawPhysicsTexture(scene) {   
    const graphicsGen = scene.make.graphics({x: 0, y: 0, add: false});    
    graphicsGen.fillStyle(0x00ff00);
    graphicsGen.fillRect(0, 0, 
                         this.bounds.width + this.margin * 2, 
                         this.bounds.height + this.margin * 2);    
    graphicsGen.fillStyle(0xffffff);
    graphicsGen.fillCircle(this.points[this.points.length -1].x, 
                           this.points[this.points.length -1].y, 
                           this.width / 2);
    graphicsGen.lineStyle(this.width, 0xffffff);

    const spline = new Phaser.Curves.Spline(this.points);
    spline.draw(graphicsGen, this.points.length * 16);
    
    graphicsGen.fillStyle(0x000000);
    this.trees.forEach(tree => {
      graphicsGen.fillCircle(tree.x, tree.y, 100);
    });
    
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
    graphicsGen.fillStyle(0xcccccc);
    graphicsGen.fillRect(0, 0, this.width + 25, 45);    
    graphicsGen.fillStyle(0x333333);
    const boxSize = 15;
    let drawBox = true;
    for(let i = 0; i < 30; i++) {
      drawBox = !drawBox;
      for(let j = 0; j <= 3; j++) {
        if(drawBox)
          graphicsGen.fillRect(i * boxSize, j * boxSize, boxSize, boxSize);    
        drawBox = !drawBox;
      }
    }
    graphicsGen.generateTexture('finish', this.width + 25, 45);
    graphicsGen.destroy(); 
  }  
 
  drawMapTexture(scene) {
    const rt = scene.add.renderTexture(0, 0,
                                        this.bounds.width + this.margin * 2, 
                                        this.bounds.height + this.margin * 2);
    
    const graphics = scene.make.graphics({x: 0, y: 0, add: false});   
    this.drawKerbs(graphics);
    rt.draw(graphics, 0, 0);
    graphics.clear();
    this.drawRope(scene, graphics, rt);
    this.drawFinishLine(scene, rt);
    this.drawStartingPositions(scene, rt);
    this.drawTrees(scene, rt);    
    rt.saveTexture('map');
    rt.destroy();
    
    const map = scene.add.image(0, 0, 'map');
    map.setOrigin(0, 0);
    map.depth = 20;
    graphics.destroy();
  }
  
  drawRope(scene, graphics, rt) {
    graphics.fillStyle(0x444444, 0.5);
    graphics.fillCircle(this.points[0].x, this.points[0].y, this.width / 2);
    graphics.fillStyle(0x444444, 1);
    graphics.fillCircle(this.points[0].x, this.points[0].y, (this.width / 2) - 5);
    rt.draw(graphics, 0, 0);
    const spline = new Phaser.Curves.Spline(this.points);
    this.rope = scene.add.rope(0, 0, this.trackTexture, null, spline.getPoints(this.points.length * 16), true);  
    rt.draw(this.rope, 0, 0);
    this.rope.destroy();
  }  
  
  drawKerbs(graphics) {
    const spline = new Phaser.Curves.Spline(this.points);
    const edges = spline.getDistancePoints(30);
    
    edges.forEach((edge, i) => {
      if(i % 2 == 0)
        graphics.lineStyle(this.width + 20, 0xff0000);
      else
        graphics.lineStyle(this.width + 20, 0xffffff);
      if(i < edges.length - 1) {
        graphics.lineBetween(edges[i].x, edges[i].y, edges[i + 1].x, edges[i + 1].y);
      }
    })
  }
  
  drawTrees(scene, rt) {
    this.trees.forEach(tree => {
      const image = scene.add.image(tree.x, tree.y, 'tree' + tree.i);
      image.setScale(3);
      image.angle = Math.ceil(tree.angle);
      image.depth = 60;
      rt.draw(image, tree.x, tree.y);
      image.destroy();
    });
  }
  
  drawFinishLine(scene, rt) {
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap);
    let sp0 = this.points[0];
    let angle = Phaser.Math.Angle.BetweenPoints(sp0, startingPoints[1]);
    const image = scene.add.image(sp0.x, sp0.y, 'finish');
    image.depth = 14;
    image.rotation = angle;
    image.angle -= 90;      
    image.alpha = 1;      
    rt.draw(image, sp0.x, sp0.y);
    image.destroy();
  }
    
  drawStartingPositions(scene, rt) {
    this.gridPositions = [];
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap);
    if(!this.isReverse)
      startingPoints = startingPoints.reverse();
    for(let i = 2; i < this.pitBoxCount; i++) {
      const p = startingPoints[i];
      const image = scene.add.image(p.x, p.y, 'start');
      image.depth = 20;
      const angle = Phaser.Math.Angle.BetweenPoints(p, startingPoints[i + 1]);
      image.rotation = angle;
      image.angle -= 90;      
      image.setOrigin(0.5, 1);
      image.alpha = 0.6;
      const offSet = (i % 2 == 0) ? this.width / 4  : this.width / -4;
      image.x += Math.cos(image.rotation) * offSet;
      image.y += Math.sin(image.rotation) * offSet;
      this.gridPositions.push({x: image.x, y: image.y, angle: image.angle});
      rt.draw(image, image.x, image.y);
      image.destroy();    
    }
  }  
}