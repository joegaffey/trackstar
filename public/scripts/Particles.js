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

    if(shouldEmit && !emitter.emitting) {
      emitter.start();
    } else if(!shouldEmit && emitter.emitting) {
      emitter.stop();
    }

    if(emitter.emitting) {
      emitter.frequency = Math.max(20, 120 - speed * 10);
      emitter.quantity = Math.ceil(speed * 1.5);
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
    let alphaConfig ={
      onEmit: (particle, key, t, value) => {
        const isSkidding = car.curveSkid || car.powerSkid || car.brakeSkid;
        if(car.surface.type === Physics.surface.TARMAC)
          return isSkidding ? 0.09 : 0.05;
        return car.surface.particleAlpha * 0.4;
      }
    };
    
    let config = {
      emitting: false,
      frequency: 200,
      maxParticles: 400,
      speed: {
        onEmit: (particle, key, t, value) => {
          return car.velocity;
        }
      },
      lifespan: {
        onEmit: (particle, key, t, value) => {
          return Math.max(100, car.velocity * 50);
        }
      },
      alpha: alphaConfig,
      tint: {
        onEmit: (particle, key, t, value) => {
          const isSkidding = car.curveSkid || car.powerSkid || car.brakeSkid;
          if(car.surface.type === Physics.surface.TARMAC)
            return isSkidding ? 0xFFFFFF : 0xBBAA88;
          if(car.surface.type === Physics.surface.GRASS)
            return 0x665533;
          return car.surface.particleColor;
        }
      },
      scale: { start: 0.3 * this.scene.renderScale,
               end: 1.5 * this.scene.renderScale },
      blendMode: 'ADD'
    }
    return config;
  }
}

export default Particles;
