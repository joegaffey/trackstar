import EngineAudio, { presets } from './engine-audio.js';

var context, masterGain;
var layers = {};
var currentPreset = 'procar';

function fill_noise(t) { return Math.random() * 2 - 1; }

function makeBuffer(fill, env) {
  var count = context.sampleRate * 2;
  var buf = context.createBuffer(1, count, context.sampleRate);
  var d = buf.getChannelData(0);
  for(var i = 0; i < count; i++) d[i] = fill(i / context.sampleRate, env || {});
  var s = context.createBufferSource();
  s.buffer = buf;
  return s;
}

function stopSource(s) { try{ s.stop(); }catch(e){} try{ s.disconnect(); }catch(e){} }

function addLayer(name, filterType, freq, Q) {
  var src = makeBuffer(fill_noise); src.loop = true;
  var f = context.createBiquadFilter();
  f.type = filterType; f.frequency.value = freq;
  if(Q !== undefined) f.Q.value = Q;
  var g = context.createGain(); g.gain.value = 0;
  src.connect(f); f.connect(g); g.connect(masterGain);
  layers[name] = { src: src, filter: f, gain: g };
}

function removeLayer(name) {
  var l = layers[name];
  if(!l) return;
  stopSource(l.src); try{ l.filter.disconnect(); }catch(e){} try{ l.gain.disconnect(); }catch(e){}
  delete layers[name];
}

var engineAudio;

const audio = {};

audio.init = function() {
  if(context) return;
  context = new AudioContext();
  context.resume();
  masterGain = context.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(context.destination);
}

audio.start = function() {
  audio.init();

  if(engineAudio) {
    engineAudio.dispose();
    engineAudio = null;
  }

  engineAudio = new EngineAudio();
  engineAudio.init(context, masterGain, presets[currentPreset]);

  removeLayer('tire'); removeLayer('wind'); removeLayer('road');
  addLayer('tire', 'lowpass', 3000);
  addLayer('wind', 'bandpass', 2000, 0.5);
  addLayer('road', 'lowpass', 250);
  Object.keys(layers).forEach(function(k){ layers[k].src.start(); });
}

audio.stop = function() {
  if(engineAudio) {
    engineAudio.dispose();
    engineAudio = null;
  }
  Object.keys(layers).forEach(removeLayer);
}

audio.update = function(speed, surfaceType, isSkidding, engineSpeed, throttle, gearRatio) {
  var sqSpeed = Math.sqrt(speed);

  if(engineAudio) {
    engineAudio.update(engineSpeed, throttle, gearRatio);
  }

  if(layers.wind) {
    layers.wind.gain.gain.value = Math.min(0.15, sqSpeed * 0.0075);
    layers.wind.filter.frequency.value = 1000 + sqSpeed * 100;
  }
  if(layers.road) {
    var roadVol, roadFreq;
    if(surfaceType === 2) {
      roadVol = Math.min(0.825, 0.3 + sqSpeed * 0.0375);
      roadFreq = 150 + sqSpeed * 10;
    } else if(surfaceType === 3 || surfaceType === 4) {
      roadVol = Math.min(0.3, 0.075 + sqSpeed * 0.015);
      roadFreq = 120 + sqSpeed * 10;
    } else {
      roadVol = Math.min(0.18, sqSpeed * 0.009);
      roadFreq = 150 + sqSpeed * 15;
    }
    roadVol *= Math.min(1, sqSpeed * 3);
    layers.road.gain.gain.value = roadVol;
    layers.road.filter.frequency.value = roadFreq;
  }
  if(layers.tire) {
    var skid = isSkidding ? 1 : 0;
    layers.tire.gain.gain.value = skid * Math.min(0.6, 0.06 + sqSpeed * 0.024);
    layers.tire.filter.frequency.value = 800 + sqSpeed * 80;
  }
};

audio.setCarSound = function(name) {
  if(!presets[name]) return;
  currentPreset = name;
  if(engineAudio) {
    engineAudio.dispose();
    engineAudio = new EngineAudio();
    engineAudio.init(context, masterGain, presets[name]);
  }
};

window.audio = audio;
export default audio;

audio.beep = function(freq, duration, vol) {
  audio.init();
  var osc = context.createOscillator();
  osc.type = 'square';
  osc.frequency.value = freq;
  var g = context.createGain();
  g.gain.value = vol || 0.15;
  osc.connect(g); g.connect(masterGain);
  osc.start(); osc.stop(context.currentTime + duration);
};
