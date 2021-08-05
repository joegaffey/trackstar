class HUDScene extends Phaser.Scene {
  
  constructor ()  {
    super({ key: 'HUDScene', active: true, visible: false });
    this.touches = { left: false, right: false, up: false, down: false };
    this.raceUpdateCounter = 0;
  }
  
  preload() {
    this.load.image('arrow', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Farrow.png?v=1617402036719');
  }

  create () {    
    this.scene.setVisible(false);
    
    this.gamepad = {};    
    this.input.gamepad.once('down', function (pad, button, index) {
      console.log('Playing with ' + pad.id);
      this.gamepad = pad;      
    }, this);     
    
    this.gameScene = this.scene.get('MainScene');
    
    const speedBox = this.add.rectangle(80, 80, 100, 100, 0x000000);
    speedBox.alpha = 0.6;
    this.uiSpeed = this.add.text(50, 50, '0', { font: '36px Helvetica', fill: '#aaaaaa' });
    this.add.text(50, 100, 'KMPH', { font: '16px Helvetica', fill: '#aaaaaa' });    
    
    const lapBox = this.add.rectangle(window.innerWidth - 80, 80, 100, 100, 0x000000);
    lapBox.alpha = 0.6;
    this.uiLap = this.add.text(window.innerWidth - 80, 70, '0/' + this.gameScene.race.lapsCount, { font: '36px Helvetica', fill: '#aaaaaa', align: 'center' });
    this.uiLap.setOrigin(0.5, 0.5);
    this.add.text(window.innerWidth - 110, 100, 'Lap', { font: '16px Helvetica', fill: '#aaaaaa' });

    const leadersBox = this.add.rectangle(30, window.innerHeight - 170, 200, 140, 0x000000);
    leadersBox.setOrigin(0, 0);
    leadersBox.alpha = 0.6;
    const text = ['1  ...', '2  ...', '3  ...', '4  ...', '5  ...'];
    this.add.text(40, window.innerHeight - 160, 'Race Leaders', { font: '16px Helvetica', fill: '#aaaaaa' });
    this.uiLeaders = this.add.text(40, window.innerHeight - 132, text, { font: '14px Helvetica', fill: '#aaaaaa', lineSpacing: 4 });
    this.uiLeaders.setOrigin(0, 0);
    
    if(isMobile) {
      game.input.addPointer(1);    
      const w = window.innerWidth, h = window.innerHeight;
      let baseline = h - 150;
      if(baseline < h / 2)
        baseline = (h / 2) + 100;
      this.up = this.add.image(w - 200, baseline, 'arrow').setOrigin(0.5, 0.5);
      this.up.scaleX = this.up.scaleY = 0.2;
      this.up.alpha = 0.75;
      this.up.rotation = -1.57;
      
      this.down = this.add.image(w - 350, baseline, 'arrow').setOrigin(0.5, 0.5);
      this.down.scaleX = this.down.scaleY = 0.2;
      this.down.alpha = 0.75;
      this.down.rotation = 1.57;
      
      this.left = this.add.image(200, baseline, 'arrow').setOrigin(0.5, 0.5);
      this.left.scaleX = this.left.scaleY = 0.2;
      this.left.alpha = 0.75;
      this.left.flipX = true;
      
      this.right = this.add.image(350, baseline, 'arrow').setOrigin(0.5, 0.5);
      this.right.scaleX = this.right.scaleY = 0.2;
      this.right.alpha = 0.75;
    }
    this.arrowKeys = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys({  
      up : Phaser.Input.Keyboard.KeyCodes.W,
      down : Phaser.Input.Keyboard.KeyCodes.S,
      left : Phaser.Input.Keyboard.KeyCodes.A,
      right : Phaser.Input.Keyboard.KeyCodes.D
    });
    this.input.keyboard.on('keydown', (key) =>  { 
      // console.log(key);
      if(this.gameScene.race.isStarting) 
        return;
           
      if(key.code === "Minus") { this.gameScene.camera.zoomOut(); }
      else if(key.code === "Equal") { this.gameScene.camera.zoomIn(); }
      else if(key.code === "Enter" || key.code === "Space") { this.gameScene.pause(); }
      else if(key.code === "BracketRight") { this.gameScene.camera.nextCar(); }
      else if(key.code === "BracketLeft") { this.gameScene.camera.previousCar(); }
      else if(key.code === "KeyI" && !this.gameScene.race.inProgress) { this.gameScene.addAICars(1); }
      else if(key.code === "KeyO" && !this.gameScene.race.inProgress) { this.gameScene.startRace(); }
      else if(key.code === "KeyP") { this.gameScene.toggleParticles(); }
      else if(key.code === "KeyT") { this.gameScene.toggleTyreMarks(); }
      else if(key.code === "KeyU") { this.gameScene.toggleAiDriver(); }
      else if(key.code === "KeyR") { this.gameScene.reset(); }
      else if(key.code === "KeyM") { this.gameScene.UI.mainMenu(); }
      else if(key.code === "KeyL") { this.gameScene.UI.toggleLeaderboard(); }
    });
    
    // this.text = this.add.text(10, 10, 'Debug', { font: '16px Courier', fill: '#00ff00' });
  }
  
  update() {    
    // this.text.text = 'FPS: ' + this.game.loop.actualFps;
    if(this.raceUpdateCounter < 0) {
      this.updateLeaders();
      this.updateLap();
      this.raceUpdateCounter = 60;
    }
    else 
      this.raceUpdateCounter--;
    
    this.uiSpeed.setText(Math.round(car.velocity * 15));
    if (isMobile) {
      this.touches = { left: false, right: false, up: false, down: false };    
    
      if(this.input.pointer1.isDown) {
        let x = this.input.pointer1.x, y = this.input.pointer1.y;
        if(Phaser.Math.Distance.Between(x, y, this.up.x, this.up.y) < 80) this.touches.up = true; 
        if(Phaser.Math.Distance.Between(x, y, this.down.x, this.down.y) < 80) this.touches.down = true; 
        if(Phaser.Math.Distance.Between(x, y, this.left.x, this.left.y) < 80) this.touches.left = true; 
        if(Phaser.Math.Distance.Between(x, y, this.right.x, this.right.y) < 80) this.touches.right = true;
      }
      if(this.input.pointer2.isDown) {
        let x = this.input.pointer2.x, y = this.input.pointer2.y;
        if(Phaser.Math.Distance.Between(x, y, this.up.x, this.up.y) < 80) this.touches.up = true; 
        if(Phaser.Math.Distance.Between(x, y, this.down.x, this.down.y) < 80) this.touches.down = true; 
        if(Phaser.Math.Distance.Between(x, y, this.left.x, this.left.y) < 80) this.touches.left = true; 
        if(Phaser.Math.Distance.Between(x, y, this.right.x, this.right.y) < 80) this.touches.right = true;
      }
      // console.log(touches);
    }
    controls.joyLeft = (this.gamepad.leftStick && this.gamepad.leftStick.x < 0) || this.gamepad.left || this.wasdKeys.left.isDown || this.arrowKeys.left.isDown || this.touches.left;
    controls.joyRight = (this.gamepad.leftStick && this.gamepad.leftStick.x > 0) ||this.gamepad.right || this.wasdKeys.right.isDown || this.arrowKeys.right.isDown || this.touches.right;
    controls.joyUp = this.gamepad.A || this.gamepad.R2 || this.wasdKeys.up.isDown || this.arrowKeys.up.isDown || this.touches.up;
    controls.joyDown = this.gamepad.B || this.gamepad.L2 || this.wasdKeys.down.isDown || this.arrowKeys.down.isDown || this.touches.down;
  }  
  
  updateLap() {
    const lap = this.gameScene.car.lap || 0;
    this.uiLap.setText(lap + '/' + this.gameScene.race.lapsCount)
  }
  
  updateLeaders() {
    const text = [];
    const leaders = this.gameScene.race.getLeaders(5);
    if(leaders.length === 0)
      return;
    leaders.forEach((leader, i) => {
      text.push((i +  1) + '.  ' + leader.driver);
    });    
    this.uiLeaders.setText(text);
  }  
  
  startlightsSequence() {
    this.lights = this.add.group();
    this.addLightColumn(0);    
  }
  
  endLightsSequence() {
    this.gameScene.race.start();
    this.lights.getChildren().forEach(light => { light.setFillStyle(0x00ff00); });
    setTimeout(() => { this.lights.destroy(true); }, 3000);
  }
  
  addLightColumn(i) {
    const x = this.scale.width / 2 - 80;
    const y = 100;
    this.lights.add(this.add.circle(x + 40 * i, y, 18, 0xff0000));
    this.lights.add(this.add.circle(x + 40 * i, y + 40, 18, 0xff0000));      
    setTimeout(() => {
      if(i < 4)
        this.addLightColumn(i + 1);
      else
        setTimeout(() => { this.endLightsSequence(); }, 1500);
    }, 1500);
  }
}