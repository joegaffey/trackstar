const keysDown = {};

window.addEventListener('keydown', e => {
  keysDown[e.which] = true;
});

window.addEventListener('keyup', e => {
  keysDown[e.which] = false;
});

const mouseDown = [false, false, false];

window.addEventListener('mousedown', e => {
  e.stopPropagation();
  mouseDown[e.button] = true;
});

window.addEventListener('mouseup', e => {
  e.stopPropagation();
  mouseDown[e.button] = false;
});

window.addEventListener('contextmenu', e => { 
  e.preventDefault(); 
  return false; 
});