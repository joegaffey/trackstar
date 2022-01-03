const config = {
  type: Phaser.AUTO,
  backgroundColor: 0x444444,
  scale: {
    mode: Phaser.Scale.RESIZE
  },
  scene: [TrackBuilderScene, EditorUIScene]
};

const baseUrl = '../assets/';

const track = new Track({
  isReverse: false,
  isOpen: true,
  points: [],
  width: 200,
  borderWidth: 20,
  pitBoxCount: 20,
  starterGap: 80,
  bgTexture: 'grass',
  trackTexture: 'track',
  bgSize: [2048, 2048],
  bgIsTiled: true,
  gridPositions: [],
  shapes: [],
  scale: 1,
  margin: 2048,
  trees:[]
});

const game = new Phaser.Game(config);

const server = '.';
      
function sendTrack() {
  fetch(`${server}/tracks`, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(track.toJSON())
  }).then(res => res.json())
    .then(res => {
    console.log('Track uploaded to server with id: ' + res.id);
    window.location.replace('./game.html#' +  res.id);
  }).catch(error => {
    alert('Server unavailable');
  });
}