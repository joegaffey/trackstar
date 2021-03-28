const app = new PIXI.Application({ resizeTo: window });
document.body.appendChild(app.view);

let carSprite = {};
let mapSprite = {};

const graphics = new PIXI.Graphics();

app.loader.add('map', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fmap.jpg?v=1616936163121')
          .add('car', 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2Fpitstop_car_5.png?v=1616942278883');

app.loader.load((loader, resources) => {
  mapSprite = new PIXI.Sprite(resources.map.texture);
  mapSprite.x = app.renderer.width / 2;
  mapSprite.y = app.renderer.height / 2;
  mapSprite.anchor.x = 0.5;
  mapSprite.anchor.y = 0.5;
  app.stage.addChild(mapSprite);
  
  app.stage.addChild(graphics);

  carSprite = new PIXI.Sprite(resources.car.texture);
  carSprite.x = app.renderer.width / 2;
  carSprite.y = app.renderer.height / 2;
  carSprite.scale.x = carSprite.scale.y = 0.035;
  carSprite.scale.y *=-1;
  carSprite.rotation = -3.14159;
  carSprite.anchor.x = 0.5;
  carSprite.anchor.y = 0.5;
  app.stage.addChild(carSprite);
  
  const filter = new PIXI.Filter(myVertex, myFragment);
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
  
});

const maxPower = 0.2;
const maxReverse = 0.0375;
const powerFactor = 0.002;
const reverseFactor = 0.0005;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

const localCar = {
  x: app.renderer.width / 2,
  y: app.renderer.height / 2,
  xVelocity: 0,
  yVelocity: 0,
  power: 0,
  reverse: 0,
  angle: 0,
  angularVelocity: 0,
  isThrottling: false,
  isReversing: false
};

app.stage.position.x = app.renderer.width/2;
app.stage.position.y = app.renderer.height/2;
app.stage.scale.x = 1;
app.stage.scale.y = 1;

app.ticker.add(() => {
  updateCar(localCar);
  app.stage.pivot.x = carSprite.x;
  app.stage.pivot.y = carSprite.y;
});


const wasdKeys = {
  up: 87,
  down: 83,
  left: 65,
  right: 68
};

const keyActive = (key) => {
  return keysDown[wasdKeys[key]] || false;
};


function updateCar (car) {  
  const canTurn = car.power > 0.0025 || car.reverse;
  const pressingUp = keyActive('up');
  const pressingDown = keyActive('down');
  
  if (car.isThrottling !== pressingUp || car.isReversing !== pressingDown) {
    car.isThrottling = pressingUp;
    car.isReversing = pressingDown;
  }
  
  const turnLeft = canTurn && keyActive('left');
  const turnRight = canTurn && keyActive('right');

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

  car.x += car.xVelocity;
  car.y -= car.yVelocity;
  car.xVelocity *= drag;
  car.yVelocity *= drag;
  car.angle += car.angularVelocity;
  car.angularVelocity *= angularDrag;  
  
  carSprite.rotation = car.angle;
  carSprite.x = car.x;
  carSprite.y = car.y;  
  
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


const keysDown = {};

window.addEventListener('keydown', e => {
  keysDown[e.which] = true;
});

window.addEventListener('keyup', e => {
  keysDown[e.which] = false;
});


const myVertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

const myFragment = `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform vec2 shadowDirection;
uniform float floorY;

void main(void) {
    //1. get the screen coordinate
    vec2 screenCoord = vTextureCoord * inputSize.xy + outputFrame.xy;
    //2. calculate Y shift of our dimension vector
    vec2 shadow;
    //shadow coordinate system is a bit skewed, but it has to be the same for screenCoord.y = floorY
    float paramY = (screenCoord.y - floorY) / shadowDirection.y;
    shadow.y = paramY + floorY;
    shadow.x = screenCoord.x + paramY * shadowDirection.x;
    vec2 bodyFilterCoord = (shadow - outputFrame.xy) * inputSize.zw; // same as / inputSize.xy

    vec4 originalColor = texture2D(uSampler, vTextureCoord);
    vec4 shadowColor = texture2D(uSampler, bodyFilterCoord);
    shadowColor.rgb = vec3(0.0);
    shadowColor.a *= 0.5;

    // normal blend mode coefficients (1, 1-src_alpha)
    // shadow is destination (backdrop), original is source
    gl_FragColor = originalColor + shadowColor * (1.0 - originalColor.a);
}
`;
