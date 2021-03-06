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
    this.margin = config.margin;    
    this.trees = config.trees;
    
    this.renderScale = 1;
    this.wayPoints = [];
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
      margin:this.margin,
      trees:this.trees
    }
  }
   
  closestWP(car) {
    let dist = 99999;
    let closestWP = 0;
    this.wayPoints.forEach((wp, i) => {
      let newDist = Phaser.Math.Distance.Between(car.x, car.y, wp.x, wp.y);
      if(newDist < dist) {
        dist = newDist;   
        closestWP = i + 2; // Look ahead a couple of points
      }
    });
    if(closestWP >= this.wayPoints.length)
      closestWP = 0;
    return closestWP;
  }
  
  drawFinal() {
    this.adjustRenderScale();
    this.drawGraphics();
    this.drawPhysicsTexture();
  }
  
  adjustRenderScale() {
    this.points.forEach(point => { point.x *= this.renderScale; point.y *= this.renderScale; });
    this.trees.forEach(tree => { tree.x *= this.renderScale; tree.y *= this.renderScale; });
                        
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
  }  
  
  /////////////////////////////// Physics Functions //////////////////////////////////////////////////
  
  getSurface(px, py) {
    let surface = Physics.tarmac;
    
    // Old way - worse perf on FF
    // const surfacePhysicsPixel = this.scene.textures.getPixel(px, py, 'physics');
    
    const surfacePhysicsPixel = this.canvas.getPixel(px, py);
    // console.log(surfacePhysicsPixel)

    if(surfacePhysicsPixel) {
      if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 255)
        surface = Physics.tarmac;
      else if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 0)
        surface = Physics.sand;
      else if(surfacePhysicsPixel.r == 0 &&  surfacePhysicsPixel.g == 0 && surfacePhysicsPixel.b == 0)
        surface = Physics.barrier;
      else
        surface = Physics.grass;

    }
    // console.log(surface)
    return surface;
  }
    
  drawPhysicsTexture() {   
    
    const w = Math.floor(this.bounds.width) + this.margin * 2;
    const h = Math.floor(this.bounds.height) + this.margin * 2;
    
    const graphicsGen = this.scene.make.graphics({x: 0, y: 0, add: false});    
    graphicsGen.fillStyle(0x00ff00);
    graphicsGen.fillRect(0, 0, w, h);    
    graphicsGen.fillStyle(0xffffff);
    graphicsGen.fillCircle(this.points[this.points.length -1].x, 
                           this.points[this.points.length -1].y, 
                           this.width / 2 * this.renderScale);
    graphicsGen.lineStyle(this.width * this.renderScale, 0xffffff);

    const spline = new Phaser.Curves.Spline(this.points);
    spline.draw(graphicsGen, this.points.length * 16);
    
    graphicsGen.fillStyle(0x000000);
    this.trees.forEach(tree => {
      graphicsGen.fillCircle(tree.x, tree.y, 100 * this.renderScale);
    });
    
    graphicsGen.generateTexture('pre_physics', w, h);
    graphicsGen.destroy();
    
    // Alt code using render texture
    // const rt = this.scene.add.renderTexture(0, 0, w, h);
    // rt.draw(graphicsGen, 0, 0);
    // rt.saveTexture('physics');
    // rt.destroy();
  }
  
  finalizePhysics() {
    const src = this.scene.textures.get('pre_physics').getSourceImage();
    this.canvas = this.scene.textures.createCanvas('physics', src.width, src.height).draw(0, 0, src);
    this.scene.textures.remove('pre_physics');
  }
  
  
  /////////////////////////////// Graphics Functions //////////////////////////////////////////////////
   
  drawGraphics() {    
    const spline = new Phaser.Curves.Spline(this.points);
    this.bounds = spline.getBounds();
    this.drawGraphicsTextures();      
    this.drawMapTexture();  
  }
  
  drawGraphicsTextures() {
    const graphicsGen = this.scene.make.graphics({x: 0, y: 0, add: false});
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
    graphicsGen.clear();
    
    const h = this.width * this.renderScale;
    const hh = h / 2;
    const step = h / 100;
    const tintStep = 1 / 100;
    
    graphicsGen.fillStyle(0x666666);
    graphicsGen.fillRect(0, 0, 20, h);    
    for(let i = 0; i * step < hh; i++) {
      graphicsGen.fillStyle(0x000000, 0.5 - i * tintStep);
      graphicsGen.fillRect(0, i * step, 20, step);
    }
    for(let i = 0; i * step < hh; i++) {
      graphicsGen.fillStyle(0x000000, i * tintStep);
      graphicsGen.fillRect(0, hh + i * step, 20, step);
    }    
    graphicsGen.generateTexture('track', 20, h);
    graphicsGen.clear();
    
    graphicsGen.destroy(); 
  }  
 
  drawMapTexture() {
    const rt = this.scene.add.renderTexture(0, 0,
                                        this.bounds.width + this.margin * 2, 
                                        this.bounds.height + this.margin * 2);
    
    const graphics = this.scene.make.graphics({x: 0, y: 0, add: false});   
    this.drawKerbs(graphics);
    rt.draw(graphics, 0, 0);
    graphics.clear();
    this.drawRope(graphics, rt);
    this.drawFinishLine(rt);
    this.drawStartingPositions(rt);
    this.drawTrees(rt);    
    rt.saveTexture('map');
    rt.destroy();
    
    const map = this.scene.add.image(0, 0, 'map');
    map.setOrigin(0, 0);
    map.depth = 20;
    graphics.destroy();
  }
  
  drawRope(graphics, rt) {
    graphics.fillStyle(0x444444, 0.5);
    graphics.fillCircle(this.points[0].x, this.points[0].y, this.width / 2 * this.renderScale);
    graphics.fillStyle(0x444444, 1);
    graphics.fillCircle(this.points[0].x, this.points[0].y, (this.width / 2 * this.renderScale) - 5);
    rt.draw(graphics, 0, 0);
    const spline = new Phaser.Curves.Spline(this.points);
    this.rope = this.scene.add.rope(0, 0, this.trackTexture, null, spline.getPoints(this.points.length * 16), true);  
    rt.draw(this.rope, 0, 0);
    this.rope.destroy();
  }  
  
  drawKerbs(graphics) {
    const spline = new Phaser.Curves.Spline(this.points);
    const edges = spline.getDistancePoints(30 * this.renderScale);
    
    edges.forEach((edge, i) => {
      if(i % 2 == 0)
        graphics.lineStyle((this.width + 20) * this.renderScale, 0xcc0000);
      else
        graphics.lineStyle((this.width + 20) * this.renderScale, 0xcccccc);
      if(i < edges.length - 1) {
        graphics.lineBetween(edges[i].x, edges[i].y, edges[i + 1].x, edges[i + 1].y);
      }
    })
  }
  
  drawTrees(rt) {
    this.trees.forEach(tree => {
      const image = this.scene.add.image(tree.x, tree.y, 'tree' + tree.i);
      image.setScale(3 * this.renderScale);
      image.angle = Math.ceil(tree.angle);
      image.depth = 60;
      rt.draw(image, tree.x, tree.y);
      image.destroy();
    });
  }
  
  drawFinishLine(rt) {
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap * this.renderScale);
    let sp0 = this.points[0];
    let angle = Phaser.Math.Angle.BetweenPoints(sp0, startingPoints[1]);
    const image = this.scene.add.image(sp0.x, sp0.y, 'finish');
    image.depth = 14;
    image.rotation = angle;
    image.angle -= 90;      
    image.alpha = 1;      
    image.setScale(this.renderScale);
    rt.draw(image, sp0.x, sp0.y);
    image.destroy();
  }
    
  drawStartingPositions(rt) {
    this.gridPositions = [];
    const spline = new Phaser.Curves.Spline(this.points);
    let startingPoints = spline.getDistancePoints(this.starterGap * this.renderScale);
    if(!this.isReverse)
      startingPoints = startingPoints.reverse();
    for(let i = 2; i < this.pitBoxCount; i++) {
      const p = startingPoints[i];
      const image = this.scene.add.image(p.x, p.y, 'start');
      image.depth = 20;
      const angle = Phaser.Math.Angle.BetweenPoints(p, startingPoints[i + 1]);
      image.rotation = angle;
      image.angle -= 90;      
      image.setOrigin(0.5, 1);
      image.alpha = 0.6;
      image.setScale(this.renderScale);
      const offSet = (i % 2 == 0) ? this.width / 4 : this.width / -4;
      image.x += Math.cos(image.rotation) * offSet * this.renderScale;
      image.y += Math.sin(image.rotation) * offSet * this.renderScale;
      this.gridPositions.push({x: image.x, y: image.y, angle: image.angle});
      rt.draw(image, image.x, image.y);
      image.destroy();    
    }
  }  
}