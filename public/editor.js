const config = {
  type: Phaser.AUTO,
  backgroundColor: 0x444444,
  scale: {
    mode: Phaser.Scale.RESIZE
  },
  scene: [TrackBuilderScene, EditorUIScene]
};

const baseUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2F';

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
  margin: 1024
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
    .then(res => console.log('Track uploaded to server with id: ' + res.id));
}