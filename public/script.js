const maxPower = 0.2;
const maxReverse = 0.05;//0.05;
const powerFactor = 0.0005;//0.001;
const reverseFactor = 0.01;//0.0005;

const drag = 0.95;
const angularDrag = 0.9;//0.95;
const turnSpeed = 0.002;//0.002

let carSprite;
let shadow;
let engine;
let engineSound = {};
let minEngineSpeed = 3;
let maxEngineSpeed = 12;
let revFactor = 75;
let mapScale = 1;
let carScale = 1
let isMobile = false;
let joyUp, joyDown, joyLeft, joyRight = false;
let mainCamera;

const car = {
  x: -334 / mapScale,
  y: 1148 / mapScale,
  xVelocity: 0,
  yVelocity: 0,
  power: 0,
  reverse: 0,
  angle: -1.6,
  angularVelocity: 0,
  isThrottling: false,
  isReversing: false
};

function updateCar() {  
  
  if(car.power * revFactor > minEngineSpeed)
    engine.rate = car.power * revFactor;
  
  const canTurn = car.power > 0.0025 || car.reverse;
  const pressingUp = joyUp;
  const pressingDown = joyDown;
  
  if (car.isThrottling !== pressingUp || car.isReversing !== pressingDown) {
    car.isThrottling = pressingUp;
    car.isReversing = pressingDown;
  }
  
  const turnLeft = canTurn && joyLeft;
  const turnRight = canTurn && joyRight;

  if (car.isTurningLeft !== turnLeft) {
    car.isTurningLeft = turnLeft;
  }
  if (car.isTurningRight !== turnRight) {
    car.isTurningRight = turnRight;
  }
  
  if (car.isThrottling) {
    car.power += powerFactor * car.isThrottling;
  } 
  else {
    car.power -= powerFactor;
  }
  if (car.isReversing) {
    car.reverse += reverseFactor;
  } 
  else {
    car.reverse -= reverseFactor;
  }
  
  if(car.power * revFactor > minEngineSpeed)
    engineSound.speed = car.power * revFactor;

  car.power = Math.max(0, Math.min(maxPower, car.power));
  car.reverse = Math.max(0, Math.min(maxReverse, car.reverse));

  const direction = car.power > car.reverse ? 1 : -1;
  
  if (car.isTurningLeft) {
    car.angularVelocity -= direction * turnSpeed * car.isTurningLeft;
  }
  if (car.isTurningRight) {
    car.angularVelocity += direction * turnSpeed * car.isTurningRight;
  }

  car.xVelocity += Math.sin(car.angle) * (car.power - car.reverse);
  car.yVelocity += Math.cos(car.angle) * (car.power - car.reverse);
  
  car.velocity = Math.abs(car.xVelocity)**2 + Math.abs(car.yVelocity)**2;
  
  car.x += car.xVelocity;
  car.y -= car.yVelocity;
  car.xVelocity *= drag;
  car.yVelocity *= drag;
  car.angle += car.angularVelocity;
  car.angularVelocity *= angularDrag;  

  carSprite.rotation = shadow.rotation =  car.angle;
  carSprite.x = shadow.x = car.x;
  carSprite.y = shadow.y = car.y;  
  
  // console.log(car.x + ' ' + car.y)
}

class MainScene extends Phaser.Scene {
  
  constructor() {
    super({key: 'MainScene', active: true});
    this.mapUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fmap.jpg?v=1616936163121';
  }

  preload () {
    isMobile = !game.device.os.desktop && game.device.input.touch;
    if(isMobile) {
      this.mapUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fmap_small.jpg?v=1617031366035';
      mapScale = 4;
      carScale = 1;
    }
    this.load.image('map', this.mapUrl);
    this.load.image('car', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fpitstop_car_5.png?v=1616942278883');
    this.load.image('dust', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fdust.png?v=1617615529526');
    this.load.audio('engine', ['https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fengine.wav?v=1616964690904']);
  }

  create () {
    this.map = this.add.image(0, 0, 'map');
    this.map.scaleX = this.map.scaleY = mapScale;

    shadow = this.add.sprite(0, 0, 'car');
    shadow.setOrigin(0.8, 0.6)
    shadow.scaleX = shadow.scaleY = 0.03 * carScale;
    shadow.flipY = true;
    shadow.tint = 0x000000;
    shadow.alpha = 0.4;

    carSprite = this.add.sprite(0, 0, 'car');
    carSprite.scaleX = carSprite.scaleY = 0.03 * carScale;
    carSprite.flipY = true;
    carSprite.depth = 10;

    engine = this.sound.add('engine');
    engine.rate = minEngineSpeed;
    engine.play({loop: true, volume: 0.1});

    this.cameras.main.startFollow(carSprite);    
    this.cameras.main.zoom = 1;
    mainCamera = this.cameras.main;
    
    var particles = this.add.particles('dust');
    var emitter = particles.createEmitter({
        speed: {
            onEmit: function (particle, key, t, value) {
                return car.velocity;
            }
        },
        lifespan: {
            onEmit: function (particle, key, t, value)  {
              return car.velocity * 100;
            }
        },
        alpha: {
            onEmit: function (particle, key, t, value) {
              if(car.isSkidding)  
                return 200;
              else
                return 1000;  
            }
        },
        scale: { start: 0.1, end: 1.0 },
        blendMode: 'NORMAL'
    });

    emitter.startFollow(carSprite);
  }

  update () {    
    updateCar();

    const curveSkid = car.angularVelocity < -0.015 || car.angularVelocity > 0.015;
    const powerSkid = car.isThrottling && (car.power > 0.02 && car.velocity < 2);
    const brakeSkid = car.reverse > 0.02 && (car.velocity > 3);
    
    car.isSkidding = curveSkid || powerSkid || brakeSkid

    if(car.isSkidding) {    
      this.add.rectangle(car.x - Math.cos(car.angle + 3 * Math.PI / 2) * 3 + Math.cos(car.angle + 2 * Math.PI / 2) * 3, 
                        car.y - Math.sin(car.angle + 3 * Math.PI / 2) * 3 + Math.sin(car.angle + 2 * Math.PI / 2) * 3, 2, 2, 0x333333);
      this.add.rectangle(car.x - Math.cos(car.angle + 3 * Math.PI / 2) * 3 + Math.cos(car.angle + 4 * Math.PI / 2) * 3, 
                        car.y - Math.sin(car.angle + 3 * Math.PI / 2) * 3 + Math.sin(car.angle + 4 * Math.PI / 2) * 3, 2, 2, 0x333333);
    }
  }
}

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
    joyLeft = this.wasdKeys.left.isDown || this.arrowKeys.left.isDown || this.touches.left;
    joyRight = this.wasdKeys.right.isDown || this.arrowKeys.right.isDown || this.touches.right;
    joyUp = this.wasdKeys.up.isDown || this.arrowKeys.up.isDown || this.touches.up;
    joyDown = this.wasdKeys.down.isDown || this.arrowKeys.down.isDown || this.touches.down;
    
    if(this.banner && joyUp) {
      this.hideBanner();
    }      
  }  
  
  hideBanner() {
    document.querySelector('.banner').classList.remove('initial');
    this.banner = false;
  }
}

var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [MainScene, UIScene]
};

const game = new Phaser.Game(config);