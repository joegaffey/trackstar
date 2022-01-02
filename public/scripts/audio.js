//Original code from https://www.redblobgames.com/x/1618-webaudio/

var context = new AudioContext();

function fill_one(t, env, state) {
  return 1.0;
}

function fill_phasor_power(t, env, state) {
  var phase = (t * env.freq) % 1.0;
  return Math.pow(phase, env.power);
}

function make_buffer(fill, env) {
  var count = context.sampleRate * 2;
  var buffer = context.createBuffer(1, count, context.sampleRate);

  var data = buffer.getChannelData(0 /* channel */);
  var state = {};
  var prev_random = 0.0;
  for (var i = 0; i < count; i++) {
    var t = i / context.sampleRate;
    data[i] = fill(t, env, state);
  }

  var source = context.createBufferSource();
  source.buffer = buffer;
  return source;
}

function fill_hihat(t, env, state) {
  var prev_random = state.prev_random || 0;
  var next_random = Math.random() * 2 - 1;
  var curr = (3*next_random - prev_random) / 2;
  prev_random = next_random;
  return curr;
}

var noise, constant, drive, gain1, gain2, gain3;

function rotor() {
  noise = make_buffer(fill_hihat, {});
  noise.loop = true;

  var filter1 = context.createBiquadFilter();
  filter1.type = "bandpass";
  filter1.frequency.value = 4000;
  filter1.Q.value = 1;
  noise.connect(filter1);

  gain1 = context.createGain();
  gain1.gain.value = 0.5;
  filter1.connect(gain1);

  constant = make_buffer(fill_one, {});
  constant.loop = true;
  gain2 = context.createGain();
  gain2.gain.value = 0.2;
  constant.connect(gain2);

  gain3 = context.createGain();
  gain3.gain.value = 0;
  gain1.connect(gain3);
  gain2.connect(gain3);

  var freq = 20;
  drive = make_buffer(fill_phasor_power, {power: 4, freq: freq});
  drive.loop = true;
  drive.connect(gain3.gain);

  gain3.connect(context.destination);
}

function restart() {
  stop();
  rotor();
  noise.start();
  drive.start();
  constant.start();
}

function rate(rate = 1) {
  if(noise) noise.playbackRate.value = rate;
  if(drive) drive.playbackRate.value = rate;
  if(constant) drive.playbackRate.value = rate;
}

function gain(level = 2) {
  if(gain1) gain1.gain.value = level * 0.5;
  if(gain2) gain2.gain.value = level * 0.2;
}

function stop() {
  if(noise) noise.stop();
  if(drive) drive.stop();
  if(constant) constant.stop();
}

const audio = {};

audio.init = function() {
  if(!context)
    context = new AudioContext();
}

audio.engine = {}
audio.engine.restart = function() {
  audio.init();
  audio.engine.stop();
  audio.engine.start();
}
audio.engine.stop = function() {
  if(noise) noise.stop();
  if(drive) drive.stop();
  if(constant) constant.stop();
}
audio.engine.start = function() {
  audio.init();
  audio.engine.stop();
  rotor(0.5, 0.2, 20);
  noise.start();
  drive.start();
  constant.start();
}
audio.engine.power = function(power) {
  rate(power * 3);
  gain(power / 20);
}