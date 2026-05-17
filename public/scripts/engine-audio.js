function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function ratio(value, min, max) {
  return clamp((value - min) / (max - min), 0, 1);
}

class DynamicAudioNode {
  constructor(gain, audio, rpm, volume) {
    this.gain = gain;
    this.audio = audio;
    this.rpm = rpm || 1000;
    this.volume = volume != null ? volume : 1.0;
  }
}

class EngineAudio {
  constructor() {
    this.samples = {};
    this.ready = false;
  }

  async init(context, masterGain, config) {
    this.ctx = context;
    this.masterGain = masterGain;
    this.config = config;
    this.samples = {};

    for (const key in config.sounds) {
      this.samples[key] = await this._loadSample(config.sounds[key]);
    }

    this.ready = true;
  }

  async _loadSample(soundConfig) {
    const source = this.ctx.createBufferSource();
    const res = await fetch(soundConfig.source);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    source.buffer = audioBuffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    return new DynamicAudioNode(gain, source, soundConfig.rpm, soundConfig.volume);
  }

  update(rpm, throttle, gearRatio) {
    if (!this.ready) return;

    const rpmStart = this.config.rpmCrossfadeStart || 3000;
    const rpmEnd = this.config.rpmCrossfadeEnd || 6500;
    const limiterVal = this.config.limiter || 12000;
    const softLimiter = this.config.softLimiter || limiterVal * 0.99;
    const rpmPitchFactor = this.config.rpmPitchFactor || 0.2;

    const xRpm = clamp((rpm - rpmStart) / (rpmEnd - rpmStart), 0, 1);
    const high = Math.cos((1.0 - xRpm) * 0.5 * Math.PI);
    const low = Math.cos(xRpm * 0.5 * Math.PI);

    const t = clamp(throttle, 0, 1);
    const xT = clamp((t - 0) / (1 - 0), 0, 1);
    const on = Math.cos((1.0 - xT) * 0.5 * Math.PI);
    const off = Math.cos(xT * 0.5 * Math.PI);

    const limiterGain = ratio(rpm, softLimiter * 0.93, limiterVal);

    const applySample = (key, gain, applyPitch) => {
      const s = this.samples[key];
      if (!s) return;
      if (applyPitch !== false) {
        s.audio.detune.value = (rpm - s.rpm) * rpmPitchFactor;
      }
      s.gain.gain.value = gain * s.volume * 0.125;
    };

    applySample('on_low', on * low);
    applySample('off_low', off * low);
    applySample('on_high', on * high);
    applySample('off_high', off * high);
    applySample('limiter', limiterGain, false);

    if (this.samples['tranny_on'] && this.samples['tranny_off']) {
      this.samples['tranny_on'].audio.detune.value = rpm * (gearRatio || 0) * 0.05 - 100;
      this.samples['tranny_on'].gain.gain.value = gearRatio > 0 ? on * (this.samples['tranny_on'].volume || 1.0) : 0;
      this.samples['tranny_off'].audio.detune.value = rpm * (gearRatio || 0) * 0.035 - 800;
      this.samples['tranny_off'].gain.gain.value = gearRatio > 0 ? off * (this.samples['tranny_off'].volume || 1.0) : 0;
    }
  }

  dispose() {
    for (const key in this.samples) {
      try { this.samples[key].audio.stop(); } catch (e) {}
      try { this.samples[key].audio.disconnect(); } catch (e) {}
      try { this.samples[key].gain.disconnect(); } catch (e) {}
    }
    this.samples = {};
    this.ready = false;
  }
}

const presets = {
  bac_mono: {
    limiter: 12000, softLimiter: 11500, rpmPitchFactor: 0.2,
    sounds: {
      on_low:   { source: './audio/BAC_Mono_onlow.wav',   rpm: 1000, volume: 0.4 },
      on_high:  { source: './audio/BAC_Mono_onhigh.wav',  rpm: 1000, volume: 0.4 },
      off_low:  { source: './audio/BAC_Mono_offlow.wav',  rpm: 1000, volume: 0.4 },
      off_high: { source: './audio/BAC_Mono_offveryhigh.wav', rpm: 1000, volume: 0.4 },
      limiter:  { source: './audio/limiter.wav',           rpm: 8000, volume: 0.3 },
      tranny_on:  { source: './audio/trany_power_high.wav', rpm: 0, volume: 0.3 },
      tranny_off: { source: './audio/tw_offlow_4.wav',      rpm: 0, volume: 0.15 },
    }
  },
  procar: {
    limiter: 12000, softLimiter: 11500, rpmPitchFactor: 0.2,
    sounds: {
      on_low:   { source: './audio/procar/on_low.wav',      rpm: 3200, volume: 0.6 },
      on_high:  { source: './audio/procar/on_midhigh.wav',  rpm: 8000, volume: 0.6 },
      off_low:  { source: './audio/procar/off_lower.wav',   rpm: 3400, volume: 0.6 },
      off_high: { source: './audio/procar/off_midhigh.wav', rpm: 8430, volume: 0.6 },
      limiter:  { source: './audio/limiter.wav',            rpm: 8000, volume: 0.1 },
    }
  },
  ferrari_458: {
    limiter: 12000, softLimiter: 11500, rpmPitchFactor: 0.2,
    sounds: {
      on_low:   { source: './audio/458/mid_res_2.wav',   rpm: 5300, volume: 1.5 },
      on_high:  { source: './audio/458/power_2.wav',     rpm: 7700, volume: 2.5 },
      off_low:  { source: './audio/458/off_midhigh.wav', rpm: 6900, volume: 1.4 },
      off_high: { source: './audio/458/off_higher.wav',  rpm: 7900, volume: 1.6 },
      limiter:  { source: './audio/458/limiter.wav',     rpm: 0,    volume: 1.8 },
    }
  },
};

export default EngineAudio;
export { presets };
