const maxPower = 0.2;
const maxReverse = 0.05;//0.05;
const powerFactor = 0.0005;//0.001;
const reverseFactor = 0.01;//0.0005;
const engineBrakingFactor = 0.0005;

const drag = 0.95;
const angularDrag = 0.9;//0.95;
const turnSpeed = 0.002;//0.002

const surface = {
  TARMAC: 0,
  KERBS: 1,  
  GRASS: 2,
  SAND: 3,
  DIRT: 4
}

const grass = { 
  type: surface.GRASS,
  angularDrag: 0.97,
  drag: 0.935,
  skidMarkColor: 0x321A02,
  particleColor: 0x999966,
  particleAlpha: 0.5
}

const sand = { 
  type: surface.SAND,
  angularDrag: 0.85,
  drag: 0.90,
  skidMarkColor: 0xc2b280,
  particleColor: 0xc2b280,
  particleAlpha: 0.5
}

const tarmac = { 
  type: surface.TARMAC,
  angularDrag: 0.9,
  drag: 0.95,
  skidMarkColor: 0x333333,
  particleColor: 0xFFFFFF,
  particleAlpha: 1
}

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
  isReversing: false,
  surface: tarmac
};

car.crash = () => {
  car.xVelocity *= -1.1;
  car.yVelocity *= -1.1;
  car.power = 0;
}

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
    car.power -= engineBrakingFactor;
  }
  if (car.isReversing) {
    car.reverse += reverseFactor;
  } 
  else {
    car.reverse -= engineBrakingFactor;
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
  car.angle += car.angularVelocity;
  
  car.xVelocity *= car.surface.drag;
  car.yVelocity *= car.surface.drag;
  car.angularVelocity *= car.surface.angularDrag;    
  // console.log(car.x + ' ' + car.y)
}

const config = {
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  // physics: {
  //   default: 'arcade',
  //   arcade: {
  //     fps: 60
  //   }
  // },
  input: {
    gamepad: true
  },
  scene: [MainScene, UIScene]
}

const game = new Phaser.Game(config);