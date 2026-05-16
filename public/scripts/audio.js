var context, masterGain;
var layers = {};

function fill_noise(t) { return Math.random() * 2 - 1; }
function fill_sine(t, env) { var p = (t * env.freq) % 1.0; return Math.sin(p * Math.PI * 2) * 0.5 + 0.5; }
function fill_engine(t, env) { var p = (t * env.freq) % 1.0, a = p * Math.PI * 2; return Math.sin(a) + Math.sin(a * 2) * 0.15; }

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

var engine;

function buildEngine() {
  var noise = makeBuffer(fill_noise); noise.loop = true;
  var constant = makeBuffer(function(t){ return 1.0; }); constant.loop = true;
  var drive = makeBuffer(fill_sine, {freq: 20}); drive.loop = true;

  var noiseFilter = context.createBiquadFilter();
  noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 4000; noiseFilter.Q.value = 1;
  noise.connect(noiseFilter);
  var noiseGain = context.createGain(); noiseGain.gain.value = 0.13;
  noiseFilter.connect(noiseGain);

  var constantGain = context.createGain(); constantGain.gain.value = 0.05;
  constant.connect(constantGain);

  var sum = context.createGain(); sum.gain.value = 0;
  noiseGain.connect(sum);
  constantGain.connect(sum);

  var driveGain = context.createGain(); driveGain.gain.value = 0.5;
  drive.connect(driveGain); driveGain.connect(sum.gain);

  sum.connect(masterGain);

  engine = { noise: noise, constant: constant, drive: drive,
    noiseFilter: noiseFilter, noiseGain: noiseGain,
    constantGain: constantGain, driveGain: driveGain, sum: sum,
    sources: [noise, constant, drive] };
}

function disposeEngine() {
  if(engine && engine.sources) engine.sources.forEach(stopSource);
  ['noiseFilter','noiseGain','constantGain','driveGain','sum'].forEach(function(k){
    try{ if(engine && engine[k]) engine[k].disconnect(); }catch(e){}
  });
  engine = null;
}

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
  disposeEngine();
  buildEngine();
  engine.sources.forEach(function(s){ s.start(); });

  removeLayer('tire'); removeLayer('wind'); removeLayer('road');
  addLayer('tire', 'lowpass', 3000);
  addLayer('wind', 'bandpass', 2000, 0.5);
  addLayer('road', 'lowpass', 250);
  Object.keys(layers).forEach(function(k){ layers[k].src.start(); });
}

audio.stop = function() {
  disposeEngine();
  Object.keys(layers).forEach(removeLayer);
}

audio.update = function(speed, surfaceType, isSkidding, engineSpeed) {
  var power = engineSpeed / 3500;
  var rate = Math.max(0.1, power * 3);
  var sqSpeed = Math.sqrt(speed);

  if(engine) {
    if(engine.noise) engine.noise.playbackRate.value = rate;
    if(engine.drive) engine.drive.playbackRate.value = rate;
    if(engine.noiseGain) engine.noiseGain.gain.value = power * 0.025;
    if(engine.constantGain) engine.constantGain.gain.value = power * 0.01;
  }

  if(layers.wind) {
    layers.wind.gain.gain.value = Math.min(0.1, sqSpeed * 0.005);
    layers.wind.filter.frequency.value = 1000 + sqSpeed * 100;
  }
  if(layers.road) {
    var roadVol, roadFreq;
    if(surfaceType === 2) {
      roadVol = Math.min(0.55, 0.2 + sqSpeed * 0.025);
      roadFreq = 150 + sqSpeed * 10;
    } else if(surfaceType === 3 || surfaceType === 4) {
      roadVol = Math.min(0.2, 0.05 + sqSpeed * 0.01);
      roadFreq = 120 + sqSpeed * 10;
    } else {
      roadVol = Math.min(0.12, sqSpeed * 0.006);
      roadFreq = 150 + sqSpeed * 15;
    }
    roadVol *= Math.min(1, sqSpeed * 3);
    layers.road.gain.gain.value = roadVol;
    layers.road.filter.frequency.value = roadFreq;
  }
  if(layers.tire) {
    var skid = isSkidding ? 1 : 0;
    layers.tire.gain.gain.value = skid * Math.min(0.2, 0.02 + sqSpeed * 0.008);
    layers.tire.filter.frequency.value = 800 + sqSpeed * 80;
  }
};

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