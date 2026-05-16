import * as Phaser from 'phaser';
import { state } from './shared.js';
import Track from './Track.js';
import TrackBuilderScene from './TrackBuilderScene.js';
import EditorUIScene from './EditorUIScene.js';

Object.assign(window, { Phaser });

const config = {
  type: Phaser.AUTO,
  backgroundColor: 0x444444,
  scale: {
    mode: Phaser.Scale.RESIZE
  },
  scene: [TrackBuilderScene, EditorUIScene]
};

state.baseUrl = '../assets/';

state.track = new Track({
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

state.game = new Phaser.Game(config);
