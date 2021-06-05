class HUDScene extends Phaser.Scene {
  
  constructor ()  {
    super({ key: 'UIScene', active: true, visible: false });
    this.touches = { left: false, right: false, up: false, down: false };
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
    
    const box = this.add.rectangle(80, 80, 100, 100, 0x000000);
    box.alpha = 0.6;
    this.uiSpeed = this.add.text(50, 50, '0', { font: '36px Helvetica', fill: '#aaaaaa' });
    this.add.text(50, 100, 'KMPH', { font: '16px Helvetica', fill: '#aaaaaa' });

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
      if(key.code === "Minus") { this.gameScene.camera.zoomOut(); }
      else if(key.code === "Equal") { this.gameScene.camera.zoomIn(); }
      else if(key.code === "Enter" || key.code === "Space") { this.gameScene.pause(); }
      else if(key.code === "BracketRight") { this.gameScene.camera.nextCar(); }
      else if(key.code === "BracketLeft") { this.gameScene.camera.previousCar(); }
      else if(key.code === "KeyI") { this.gameScene.addAICars(1); }
      else if(key.code === "KeyO") { this.gameScene.startRace(); }
      else if(key.code === "KeyP") { this.gameScene.toggleParticles(); }
      else if(key.code === "KeyT") { this.gameScene.toggleTyreMarks(); }
      else if(key.code === "KeyU") { this.gameScene.toggleAiDriver(); }
      else if(key.code === "KeyR") { this.gameScene.reset(); }
      else if(key.code === "KeyM") { this.gameScene.UI.mainMenu(); }
    });
    
    // this.text = this.add.text(10, 10, 'Debug', { font: '16px Courier', fill: '#00ff00' });
  }
  
  update() {    
    // this.text.text = 'FPS: ' + this.game.loop.actualFps;

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
}