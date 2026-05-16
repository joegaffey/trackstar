import Physics from './Physics.js';

class Particles {
    
  constructor(scene) {
    this.scene = scene;
    this.NONE = 0;
    this.USER = 1;
    this.ALL = 2;
    this.mode = this.ALL;
    this.emitters = [];    
  }
  
  reset() {
    this.emitters.forEach(em => {
      em.destroy();      
    });
    this.emitters = [];
  }
  
  addEmitter(car) {
    car._pc = { speed: 0, lifespan: 100, alpha: 0.05, tint: 0xBBAA88 };
    const emitter = this.scene.add.particles(0, 0, 'dust', this.getConfig(car));
    emitter.car = car;
    emitter.setDepth(35);
    emitter.startFollow(car.carSprite);
    this.emitters.push(emitter);
    car.emitter = emitter;
  }
  
  pause() {
    this.emitters.forEach(emitter => { emitter.stop(); });
  }
  
  resume() {
    this.emitters.forEach(emitter => { emitter.start(); });
  }

  update(car) {
    const emitter = car.emitter;
    const speed = Math.sqrt(car.velocity);
    const shouldEmit = speed > 0.3;
    const shouldStop = speed < 0.1;

    if(shouldEmit && !emitter.emitting) {
      emitter.start();
    } else if(shouldStop && emitter.emitting) {
      emitter.stop();
    }

    if(emitter.emitting) {
      const freq = Math.max(20, 120 - speed * 10);
      if(freq !== emitter.frequency) emitter.frequency = freq;
      const qty = Math.ceil(speed * 1.5);
      if(qty !== emitter.quantity) emitter.quantity = qty;
      const pc = car._pc;
      pc.speed = car.velocity;
      pc.lifespan = Math.max(100, car.velocity * 50);
      if(car.surface.type === Physics.surface.TARMAC) {
        const isSkidding = car.curveSkid || car.powerSkid || car.brakeSkid;
        pc.alpha = isSkidding ? 0.09 : 0.05;
        pc.tint = isSkidding ? 0xFFFFFF : 0xBBAA88;
      } else if(car.surface.type === Physics.surface.GRASS) {
        pc.alpha = car.surface.particleAlpha * 0.4;
        pc.tint = 0x665533;
      } else {
        pc.alpha = car.surface.particleAlpha * 0.4;
        pc.tint = car.surface.particleColor;
      }
    }
  }

  incrementMode() {
    this.mode++;
    if(this.mode > this.ALL) 
      this.mode = this.NONE;
    if(this.mode === this.NONE) {
      this.scene.car.emitter.stop();
      this.scene.cars.forEach(car => { car.emitter.stop(); });
      this.scene.UI.toast('Particles off');
    }
    else if(this.mode === this.USER) {
      this.scene.car.emitter.start();
      this.scene.cars.forEach(car => { car.emitter.stop(); });
      this.scene.UI.toast('Particles on - player');
    }
    else if(this.mode === this.ALL) {
      this.scene.car.emitter.start();
      this.scene.cars.forEach(car => { car.emitter.start(); });
      this.scene.UI.toast('Particles on - all');
    }
  }
  
  getConfig(car) {
    let config = {
      emitting: false,
      frequency: 200,
      maxParticles: 400,
      speed: { onEmit: () => car._pc.speed },
      lifespan: { onEmit: () => car._pc.lifespan },
      alpha: { onEmit: () => car._pc.alpha },
      tint: { onEmit: () => car._pc.tint },
      scale: { start: 0.3 * this.scene.renderScale,
               end: 1.5 * this.scene.renderScale },
      blendMode: 'ADD'
    }
    return config;
  }
}

export default Particles;
