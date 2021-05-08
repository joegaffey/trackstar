let isMobile = false;

const controls = {
  joyUp: false,
  joyDown: false,
  joyLeft: false,
  joyRight: false
}

const baseUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2F';
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

function init() {
  if(!track) // Default track
    track = new Track({
      name: 'Mondello',
      isReverse: false,
      isOpen: false,
      points: [],
      scale: 1,
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
        y: 820,
        angle: -1.6        
      }],
      shapes: [],
      margin: 1024,
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
  
  car = new Car({
    x: track.gridPositions[0].x / track.scale,
    y: track.gridPositions[0].y / track.scale,
    angle: track.gridPositions[0].angle,
    surface: Physics.tarmac,
    minEngineSpeed: 3000,
    maxEngineSpeed: 12000,
    engineSpeedFactor: 60000,
    engineSoundFactor: 3500,
    scale: 0.02
  });

  const config = {
    type: Phaser.WEBGL,
    width: window.innerWidth,
    height: window.innerHeight,
    input: {
      gamepad: true
    },
    // fps: {
    //   target: 60,
    //   forceSetTimeOut: true
    // },
    scene: [MainScene, UIScene]
  }

  game = new Phaser.Game(config);
}