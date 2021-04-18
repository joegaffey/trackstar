let mapScale = 1;
let carScale = 0.75
let isMobile = false;

const controls = {
  joyUp: false,
  joyDown: false,
  joyLeft: false,
  joyRight: false
}

const baseUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2F';

const track = new Track({
  isReverse: false,
  isOpen: false,
  points: [],
  width: 200,
  borderWidth: 20,
  pitBoxCount: 20,
  starterGap: 80,
  bgTexture: 'map',
  physicsTexture: 'physics',
  bgSize: [0, 0],
  bgIsTiled: false,
  gridPositions: [{
    x: -334,
    y: 1100,
    angle: -1.6        
  }],
  shapes: [],
  textures: {
    map: {      
      regular: baseUrl + 'mondello_international.jpg',
      small: baseUrl + 'mondello_international_small.jpg'
    },
    physics: {
      regular: baseUrl + 'mondello_international_physics.png',
      small: baseUrl + 'mondello_international_physics_small.png'
    }
  }
});

const car = new Car({
  x: track.gridPositions[0].x / mapScale,
  y: track.gridPositions[0].y / mapScale,
  xVelocity: 0,
  yVelocity: 0,
  power: 0,
  reverse: 0,
  angle: -1.6,
  angularVelocity: 0,
  isThrottling: false,
  isReversing: false,
  surface: Physics.tarmac,
  minEngineSpeed: 3000,
  maxEngineSpeed: 12000,
  engineSpeedFactor: 60000
});

const config = {
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  input: {
    gamepad: true
  },
  scene: [MainScene, UIScene]
}

const game = new Phaser.Game(config);