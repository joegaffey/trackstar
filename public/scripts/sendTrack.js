import { state } from './shared.js';

export function sendTrack() {
  const server = '.';
  fetch(`${server}/tracks`, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state.track.toJSON())
  }).then(res => res.json())
    .then(res => {
      console.log('Track uploaded to server with id: ' + res.id);
      window.location.replace('./game.html#' +  res.id);
    }).catch(error => {
      alert('Server unavailable');
    });
}
