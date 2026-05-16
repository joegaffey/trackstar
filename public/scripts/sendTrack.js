import { state } from './shared.js';

export function sendTrack() {
  localStorage.setItem('trackstar-track', JSON.stringify(state.track.toJSON()));
  window.location.href = './game.html#local';
}
