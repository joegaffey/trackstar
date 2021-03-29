const app = new PIXI.Application({ resizeTo: window });
document.body.appendChild(app.view);

let carSprite = {};
let mapSprite = {};
let engineSound = {};
let minEngineSpeed = 2.8;
let maxEngineSpeed = 10;
let revFactor = 45;
let mapScale = 1;
let carScale = 1;
let isMobile = false;

const graphics = new PIXI.Graphics();

let mapUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fmap.jpg?v=1616936163121';

if(PIXI.utils.isMobile.any) {
  isMobile = true;
  //Mobile fix for gl.getParameter(gl.MAX_TEXTURE_SIZE) 
  mapUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fmap_small.jpg?v=1617031366035';
  mapScale = 4;
  carScale = 1;
  if(screen.lockOrientation)
    screen.lockOrientation('portrait');
  if(screen.orientation.lock)
    screen.orientation.lock('portrait');
}

app.loader.add('map', mapUrl)
          .add('car', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fpitstop_car_5.png?v=1616942278883')
          .add('engine', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fengine.wav?v=1616964690904');
          // .add('engine', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Floop_5.wav?v=1616970419514');
      
app.loader.load((loader, resources) => {
  
  addMapSprite(resources.map.texture);
  //app.stage.addChild(graphics);
  addCarSprite(resources.car.texture);  
  
  if(isMobile) {
    hideBanner();
    banner = false;
    document.querySelector('.buttons').style.visibility = 'visible';
  }
  
  // https://pixijs.io/examples/#/filters-advanced/pixie-shadow-filter.js
  const filter = new PIXI.Filter(shadowVertex, shadowFragment);
  // first is the horizontal shift, positive is to the right
  // second is the same as scaleY
  filter.uniforms.shadowDirection = [0.1, 1.4];
  filter.uniforms.floorY = 0.0;
  // how big is max shadow shift to the side?
  // try to switch that off ;)
  filter.padding = 100;

  carSprite.filters = [filter];

  app.ticker.add(() => {
      // take ground Y in screen coords to uniforms
      filter.uniforms.floorY = carSprite.toGlobal(new PIXI.Point(0, 0)).y;
  });
  
  engineSound = resources.engine.sound;  
  engineSound.speed = minEngineSpeed;
  engineSound.volume = 0.1;
  engineSound.loop = true;
  engineSound.play();
});

function addMapSprite(texture) {
  mapSprite = new PIXI.Sprite(texture);
  mapSprite.x = app.renderer.width / 2;
  mapSprite.y = app.renderer.height / 2;
  mapSprite.scale.x = mapSprite.scale.y = mapScale;
  mapSprite.anchor.x = 0.5;
  mapSprite.anchor.y = 0.5;
  app.stage.addChild(mapSprite);
}

function addCarSprite(texture) {
  carSprite = new PIXI.Sprite(texture);
  carSprite.x = app.renderer.width / 2;
  carSprite.y = app.renderer.height / 2;
  carSprite.scale.x = carSprite.scale.y = 0.035 * carScale;
  carSprite.scale.y *=-1;
  carSprite.rotation = -3.14159;
  carSprite.anchor.x = 0.5;
  carSprite.anchor.y = 0.5;
  app.stage.addChild(carSprite);
}

const maxPower = 0.2;
const maxReverse = 0.05;//0.05;
const powerFactor = 0.001;
const reverseFactor = 0.01;//0.0005;

const drag = 0.95;
const angularDrag = 0.9;//0.95;
const turnSpeed = 0.002;//0.002

const playerCar = {
  x: app.renderer.width / 2 - 30,
  y: app.renderer.height / 2 - 100,
  xVelocity: 0,
  yVelocity: 0,
  power: 0,
  reverse: 0,
  angle: 0.15,
  angularVelocity: 0,
  isThrottling: false,
  isReversing: false
};

app.stage.position.x = app.renderer.width / 2;
app.stage.position.y = app.renderer.height / 2;
app.stage.scale.x = 1;
app.stage.scale.y = 1;

app.ticker.add(() => {
  updateCar(playerCar);
  app.stage.pivot.x = carSprite.x;
  app.stage.pivot.y = carSprite.y;
});

const wasdKeys = {
  up: 87,
  down: 83,
  left: 65,
  right: 68
};

let banner = true;
const keyActive = (key) => {
  let active = keysDown[wasdKeys[key]];
  if(active && banner) {
    hideBanner();
  }
  return active || false;
};

function hideBanner() {
  document.querySelector('.controls').classList.remove('initial');
  banner = false;
}

const mouseSteeringEnabled = false;

function updateCar (car) {  
  const canTurn = car.power > 0.0025 || car.reverse;
  const pressingUp = keyActive('up') || mouseDown[0] || touches[2]; 
  const pressingDown = keyActive('down') || mouseDown[2] || touches[3]; 
  
  if (car.isThrottling !== pressingUp || car.isReversing !== pressingDown) {
    car.isThrottling = pressingUp;
    car.isReversing = pressingDown;
  }
  
  const turnLeft = canTurn && (keyActive('left') || touches[0] || (mouseSteeringEnabled && mouseSteer < 0.5));
  const turnRight = canTurn && (keyActive('right') || touches[1] || (mouseSteeringEnabled && mouseSteer > 0.5));

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
    if(mouseSteeringEnabled)
      car.angularVelocity *= (1 - mouseSteer);
  }
  if (car.isTurningRight) {
    car.angularVelocity += direction * turnSpeed * car.isTurningRight;
    if(mouseSteeringEnabled)
      car.angularVelocity *= mouseSteer;
  }

  car.xVelocity += Math.sin(car.angle) * (car.power - car.reverse);
  car.yVelocity += Math.cos(car.angle) * (car.power - car.reverse);

  car.x += car.xVelocity;
  car.y -= car.yVelocity;
  car.xVelocity *= drag;
  car.yVelocity *= drag;
  car.angle += car.angularVelocity;
  car.angularVelocity *= angularDrag;  
  
  carSprite.rotation = car.angle;
  carSprite.x = car.x;
  carSprite.y = car.y;  
  
// Wheel tracks - Very bad performance - need to find a better way - maybe rendertexture
//   if ((car.power > 0.0025) || car.reverse) {
//     if (((maxReverse === car.reverse) || (maxPower === car.power)) && Math.abs(car.angularVelocity) < 0.002) {
//       return;
//     }
    
//     graphics.beginFill(0x444444);
//     graphics.drawRect(car.x - Math.cos(car.angle + 3 * Math.PI / 2) * 3 + Math.cos(car.angle + 2 * Math.PI / 2) * 3, 
//                       car.y - Math.sin(car.angle + 3 * Math.PI / 2) * 3 + Math.sin(car.angle + 2 * Math.PI / 2) * 3, 2, 2);
//     graphics.drawRect(car.x - Math.cos(car.angle + 3 * Math.PI / 2) * 3 + Math.cos(car.angle + 4 * Math.PI / 2) * 3, 
//                       car.y - Math.sin(car.angle + 3 * Math.PI / 2) * 3 + Math.sin(car.angle + 4 * Math.PI / 2) * 3, 2, 2);
//     graphics.endFill();
//   }
}

let mouseSteer = 0;

window.addEventListener('mousemove', e => { 
  mouseSteer = 1 / (app.renderer.width / e.clientX);
});