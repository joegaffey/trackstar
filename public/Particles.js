class Particles {
    
  constructor(scene) {
    this.scene = scene;
    this.NONE = 0;
    this.USER = 1;
    this.ALL = 2;
    this.mode = this.ALL; //On for All cars by default
    this.emitters = [];    
  }
  
  addEmitter(car) {
    const particles = this.scene.add.particles('dust');
    particles.car = car;
    particles.setDepth(35);
    car.emitter = particles.createEmitter(this.getConfig(particles));
    car.emitter.startFollow(car.carSprite);
    this.emitters.push(car.emitter);
  }
  
  pause() {
    this.emitters.forEach(emitter => { emitter.pause(); });
  }
  
  resume() {
    this.emitters.forEach(emitter => { emitter.resume(); });
  }
  
  incrementMode() {
    this.mode++;
    if(this.mode > this.ALL) 
      this.mode = this.NONE;
    if(this.mode === this.NONE) {
      this.scene.car.emitter.stop();
      this.scene.AI.cars.forEach(car => { car.emitter.stop(); });
      this.scene.toast('Particles off');
    }
    else if(this.mode === this.USER) {
      this.scene.car.emitter.start();
      this.scene.AI.cars.forEach(car => { car.emitter.stop(); });
      this.scene.toast('Particles on - player');
    }
    else if(this.mode === this.ALL) {
      this.scene.car.emitter.start();
      this.scene.AI.cars.forEach(car => { car.emitter.start(); });
      this.scene.toast('Particles on - all');
    }
  }
  
  getConfig(particles) {
    let alphaConfig ={
      onEmit: (particle, key, t, value) => {
        if(particles.car.surface.type === Physics.surface.TARMAC && particles.car.isSkidding)  
          return 20 / particles.car.surface.particleAlpha;
        else
          return 200 / particles.car.surface.particleAlpha;  
      }
    };
    
    let config = {
      on: false,
      frequency: 50,
      maxParticles: 40,
      speed: {
        onEmit: (particle, key, t, value) => {
          return particles.car.velocity;
        }
      },
      lifespan: {
        onEmit: (particle, key, t, value) => {
          return particles.car.velocity * 100;
        }
      },
      alpha: alphaConfig,
      tint: {
        onEmit: (particle, key, t, value) => {
          return particles.car.surface.particleColor;
        }
      },
      scale: { start: 0.2 * this.scene.renderScale,
               end: 2 * this.scene.renderScale },
      blendMode: 'NORMAL'
    }
    return config;
  }
}
  
// let alphaConfig = {
//   onEmit: (particle, key, t, value) => {
//     if(this.car.surface.type === Physics.surface.TARMAC && this.car.isSkidding)  
//       return { start: 20 / this.car.surface.particleAlpha, end: 0, ease: 'Linear' };  
//     else
//       return { start: 200 / this.car.surface.particleAlpha, end: 0, ease: 'Linear' };  
//   }
// };
// let alphaConfig = { start: 1, end: 0, ease: 'Linear' };  
// let alphaConfig = {
//   onEmit: (particle, key, t, value) => {
//     if(this.car.surface.type === Physics.surface.TARMAC && this.car.isSkidding)  
//       return { start: 20 / this.car.surface.particleAlpha, end: 0, ease: 'Linear' };  
//     else
//       return { start: 200 / this.car.surface.particleAlpha, end: 0, ease: 'Linear' };  
//   }
// };
//     let alphaConfig ={
//       onEmit: (particle, key, t, value) => {
//         if(particles.car.surface.type === Physics.surface.TARMAC && particles.car.isSkidding)  
//           return 20 / particles.car.surface.particleAlpha;
//         else
//           return 200 / particles.car.surface.particleAlpha;  
//       }
//     };
// let alphaConfig = { start: 1, end: 0, ease: 'Linear' };
//     let config = {
//       on: false,
//       frequency: 50,
//       maxParticles: 40,
//       speed: {
//         onEmit: (particle, key, t, value) => {
//             return particles.car.velocity;
//         }
//       },
//       lifespan: {
//         onEmit: (particle, key, t, value) => {
//           return particles.car.velocity * 100;
//         }
//       },
//       alpha: alphaConfig,
//       tint: {
//         onEmit: (particle, key, t, value) => {
//           return particles.car.surface.particleColor;
//         }
//       },
//       scale: { start: 0.1 * this.mapScale * this.renderScale, 
//                end: 1 * this.mapScale * this.renderScale },
//       blendMode: 'NORMAL'
//     }