//https://blog.bullgare.com/2019/03/simple-way-to-detect-browsers-fps-via-js/
let fps;
let times = [];
function fpsLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    fpsLoop();
  });
}
fpsLoop();

let isMobile = false;

const controls = {
  joyUp: false,
  joyDown: false,
  joyLeft: false,
  joyRight: false
}

const baseUrl = './assets/';
const gameServer = '.';

let track = null;
let car = null;
let game = null;

let trackId = window.location.hash.slice(1);

async function getTrackData(trackId) {
  try {
    const response = await fetch(`${gameServer}/tracks/${trackId}`);
    const trackData = await response.json();
    return trackData;
  }
  catch(e) {
    return null; 
  }  
}

if(trackId) {
  if(trackId === '1')
    trackId = 'test.json';
  console.log('Loading track: ' + trackId);
  getTrackData(trackId).then(trackData => {
    if(trackData) {
      track = new Track(trackData);
      init();
    }
    else {
      console.log('Failed to load track: ' + trackId);
      alert(`Track ${trackId} is not available! Loading default track.`);
      init();
    }
  });
}
else 
  init();

function getDefaultTrack() {
  return new Track({
    name: 'Mondello',
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
      x: 0,
      y: 4950,
      angle: -90
    }],
    shapes: [],
    margin: 1024,
    textures: {
      // small: {
      //   scale: 3,
      //   map: baseUrl + 'mondello_international_small.jpg',
      //   physics: baseUrl + 'mondello_international_physics_small.png'
      // },
      // regular: {
      //   scale: 6,
      //   map: baseUrl + 'mondello_international.jpg',
      //   physics: baseUrl + 'mondello_international_physics.png'
      // },
      smallScale: 3,
      regularScale: 6,
      map: {      
        regular: baseUrl + 'maps/mondello_international.jpg',
        small: baseUrl + 'maps/mondello_international_small.jpg'
      },
      physics: {
        regular: baseUrl + 'maps/mondello_international_physics.png',
        small: baseUrl + 'maps/mondello_international_physics_small.png'
      }
    }
  });
}

function init() {
  if(!track) {
    track = getDefaultTrack();
  }
  
  car = new Car({
    driver: 'Player',
    surface: Physics.tarmac,
    minEngineSpeed: 3000,
    maxEngineSpeed: 12000,
    engineSpeedFactor: 60000,
    engineSoundFactor: 3500,
    texture: 'car5',
    scale: 0.08
  });

  const config = {
    type: Phaser.WEBGL,
    width: window.innerWidth,
    height: window.innerHeight,
    multiTexture: true,
    input: {
      gamepad: true
    },
    // Causes perf issues
    // fps: {  
    //   target: 60,
    //   forceSetTimeOut: true
    // },
    scene: [MainScene, HUDScene]    
  }

  game = new Phaser.Game(config);
}