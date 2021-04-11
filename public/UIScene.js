class UIScene extends Phaser.Scene {
  
  constructor ()  {
    super({ key: 'UIScene', active: true });
    this.touches = { left: false, right: false, up: false, down: false };
    this.banner = true;
  }
  
  preload() {
    this.load.image('arrow', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Farrow.png?v=1617402036719');
  }

  create () {
    
    this.gamepad = {};    
    this.input.gamepad.once('down', function (pad, button, index) {
      console.log('Playing with ' + pad.id);
      this.gamepad = pad;      
    }, this);     
    
    const box = this.add.rectangle(80, 80, 100, 100, 0x000000);
    box.alpha = 0.6;
    this.uiSpeed = this.add.text(50, 50, '0', { font: '36px Helvetica', fill: '#aaaaaa' });
    this.add.text(50, 100, 'KMPH', { font: '16px Helvetica', fill: '#aaaaaa' });

    if(isMobile) {
      game.input.addPointer(1);    
      const w = window.innerWidth, h = window.innerHeight;
      this.up = this.add.image(w - 200, h - 350, 'arrow').setOrigin(0.5, 0.5);
      this.up.scaleX = this.up.scaleY = 0.2;
      this.up.alpha = 0.75;
      this.up.rotation = -1.57;
      
      this.down = this.add.image(w - 200, h - 200, 'arrow').setOrigin(0.5, 0.5);
      this.down.scaleX = this.down.scaleY = 0.2;
      this.down.alpha = 0.75;
      this.down.rotation = 1.57;
      
      this.left = this.add.image(200, h - 250, 'arrow').setOrigin(0.5, 0.5);
      this.left.scaleX = this.left.scaleY = 0.2;
      this.left.alpha = 0.75;
      this.left.flipX = true;
      
      this.right = this.add.image(350, h - 250, 'arrow').setOrigin(0.5, 0.5);
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
      if(key.code === "Minus") { mainCamera.zoom -= 0.1; }
      else if(key.code === "Equal") { mainCamera.zoom += 0.1; }
    });
  }
  
  update() {
    
    this.uiSpeed.setText(Math.round(car.velocity * 15));
    if (isMobile) {
      this.hideBanner();
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
    joyLeft = (this.gamepad.leftStick && this.gamepad.leftStick.x < 0) || this.gamepad.left || this.wasdKeys.left.isDown || this.arrowKeys.left.isDown || this.touches.left;
    joyRight = (this.gamepad.leftStick && this.gamepad.leftStick.x > 0) ||this.gamepad.right || this.wasdKeys.right.isDown || this.arrowKeys.right.isDown || this.touches.right;
    joyUp = this.gamepad.A || this.gamepad.R2 || this.wasdKeys.up.isDown || this.arrowKeys.up.isDown || this.touches.up;
    joyDown = this.gamepad.B || this.gamepad.L2 || this.wasdKeys.down.isDown || this.arrowKeys.down.isDown || this.touches.down;
    
    if(this.banner && joyUp) {
      this.hideBanner();
    }      
  }  
  
  hideBanner() {
    document.querySelector('.banner').classList.remove('initial');
    this.banner = false;
  }
}