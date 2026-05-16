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
        if(car.surface.type === Physics.surface.TARMAC && car.isSkidding)  
          return 20 / car.surface.particleAlpha;
        else
          return 200 / car.surface.particleAlpha;  
      }
    };
    
    let config = {
      emitting: false,
      frequency: 50,
      maxParticles: 40,
      speed: {
        onEmit: (particle, key, t, value) => {
          return car.velocity;
        }
      },
      lifespan: {
        onEmit: (particle, key, t, value) => {
          return car.velocity * 100;
        }
      },
      alpha: alphaConfig,
      tint: {
        onEmit: (particle, key, t, value) => {
          return car.surface.particleColor;
        }
      },
      scale: { start: 0.2 * this.scene.renderScale,
               end: 2 * this.scene.renderScale },
      blendMode: 'NORMAL'
    }
    return config;
  }
}

export default Particles;
