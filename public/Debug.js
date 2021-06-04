class Debug {
  
  constructor(scene) {
    this.scene = scene;
  }  
  
  physics() {
    this.physicsDebug = this.scene.add.image(0, 0, 'physics')
    if(this.scene.track.bgIsTiled)
      this.physicsDebug.setOrigin(0, 0);
    this.physicsDebug.alpha = 0.4;
    this.physicsDebug.depth = 45;
    this.physicsDebug.setScale(this.scene.bgScale);
  }
  
  racingLine() {
    const graphics = this.scene.add.graphics();   
    this.scene.AI.wayPoints.forEach(wp => { 
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(wp.x, wp.y, 20);
    });    
    graphics.depth = 60;
  }
  
  tyreMarks() {
    const graphics = this.scene.add.graphics();   
    graphics.lineStyle(20, 0xffffff, 1);
    const b = this.scene.tyreMarks.texture.getBounds();
    graphics.strokeRect(b.x, b.y, b.width, b.height);
    graphics.depth = 60;
  }
}