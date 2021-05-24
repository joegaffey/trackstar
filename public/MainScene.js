class MainScene extends Phaser.Scene {
  
  constructor() {
    super({key: 'MainScene', active: true});    
    this.track = track;
    this.car = car;
    this.baseUrl = baseUrl;
  }

  preload() {
    this.isMobile = isMobile = !game.device.os.desktop && game.device.input.touch;
    
    this.mapKey = this.track.bgTexture;
    this.physicsKey = this.track.physicsTexture;
    
    if(this.track.bgIsTiled) {
      this.load.image('grass', `${this.baseUrl}grass.jpg`);
      this.load.image('track', `${this.baseUrl}track.png`);
    }
    else {
      if(this.isMobile) {
        this.mapUrl = this.track.textures[this.mapKey].small;
        this.physicsUrl = this.track.textures[this.physicsKey].small;
        this.track.scale = 4;
      }
      else {
        this.mapUrl = this.track.textures[this.mapKey].regular;
        this.physicsUrl = this.track.textures[this.physicsKey].regular;
      }
      this.load.image('map', this.mapUrl);
      this.load.image('physics', this.physicsUrl);
    }
    
    this.load.image('tyres', this.baseUrl + 'tyres.png');
    this.load.image('dust', this.baseUrl + 'dust.png');
    for(let i = 1; i < 14; i++) {
      this.load.image('tree' + i, `${this.baseUrl}tree${i}.png`);  
    }
    for(let i = 1; i < 14; i++) {
      this.load.image('tree' + i, `${this.baseUrl}tree${i}.png`);  
    }
    for(let i = 1; i < 20; i++) {
      this.load.image('car' + i, `${this.baseUrl}pitstop_car_${i}.png`);  
    }
    this.load.audio('engine', [this.baseUrl + 'engine.mp3']);
  }

  create() {    
    if(this.track.bgIsTiled) {
      this.car.scale = 0.08;
      this.track.drawFinal(this);
      
      this.map = this.add.tileSprite(this.track.bounds.x - this.track.margin, 
                                     this.track.bounds.y - this.track.margin, 
                                     this.track.bounds.width + this.track.margin * 2, 
                                     this.track.bounds.height + this.track.margin * 2, 
                                     this.track.bgTexture);
      this.map.setOrigin(0, 0);
      this.cameras.main.zoom = 0.4;      
    }    
    else {
      this.cameras.main.zoom = 1.4;
      this.map = this.add.image(0, 0, 'map');
    }
    
    // this.debugPhysics(); 
    
    this.emittters = [];
    this.setupCar(this.car, 0);
    this.aiCars = [];        
        
    this.engineSound = this.sound.add('engine');
    this.engineSound.rate = this.car.minEngineSpeed / this.car.engineSoundFactor;
    this.engineSound.play({loop: true, volume: 0.1});
    
    this.cameras.main.startFollow(this.car.carSprite); 
    this.camFollow = -1;
    
    this.rtTyreMarks = this.make.renderTexture({ 
      x: 0, y: 0,
      width: this.map.width, 
      height: this.map.height,
      depth: 25
    })
    if(this.track.bgIsTiled)
      this.rtTyreMarks.setOrigin(0, 0);
    else
      this.rtTyreMarks.setOrigin(0.5, 0.5);
    
    this.frameSkip = 0;
    this.frameCount = 0;    
  }
  
  addAICars(count) {
    for(let i = 1; i <= count; i++) {
      if(this.track.gridPositions.length > this.aiCars.length + 1)
        this.aiCars.push(this.setupCar(this.getCar(this.aiCars.length + 1), this.aiCars.length + 1));        
      else
        alert('No free pit boxes');
    }
  }
  
  setupCar(car, i) {
    car.index = i;
    car.x = this.track.gridPositions[i].x;
    car.y = this.track.gridPositions[i].y;
    car.angle = this.track.gridPositions[i].angle * Math.PI / 180;
    
    car.tyresSprite = this.add.sprite(car.x, car.y, 'tyres');
    car.tyresSprite.setOrigin(0.5, 0.5);
    car.tyresSprite.scaleX = car.tyresSprite.scaleY = car.scale;
    car.tyresSprite.flipY = true;
    car.tyresSprite.rotation = car.angle;
    
    car.shadow = this.add.sprite(car.x, car.y, 'car1');
    car.shadow.setOrigin(0.8, 0.6);
    car.shadow.scaleX = car.shadow.scaleY = car.scale;
    car.shadow.flipY = true;
    car.shadow.tint = 0x000000;
    car.shadow.alpha = 0.4;
    car.shadow.depth = 28;
    car.shadow.rotation = car.angle;

    car.carSprite = this.add.sprite(car.x, car.y, car.texture);
    car.carSprite.setOrigin(0.5, 0.5);
    car.carSprite.scaleX = car.carSprite.scaleY = car.scale;
    car.carSprite.flipY = true;
    car.carSprite.depth = 30; 
    car.carSprite.rotation = car.angle;
    
    car.carEmitter = this.getCarEmitter(car);
    car.carEmitter.startFollow(car.carSprite);
    this.emittters.push(car.carEmitter);
        
    car.trackScale = this.track.scale;
    return car;
  }
  
  getCar(index) {
    return new Car({
      surface: Physics.tarmac,
      minEngineSpeed: 3000,
      maxEngineSpeed: 12000,
      engineSpeedFactor: 60000,
      engineSoundFactor: 3500,
      texture: 'car' + index,
      scale: this.car.scale
    });
  }
  
  debugPhysics() {
    this.physicsDebug = this.add.image(0, 0, 'physics')
    if(this.track.bgIsTiled)
      this.physicsDebug.setOrigin(0, 0);
    this.physicsDebug.alpha = 0.4;
    this.physicsDebug.depth = 45;
    this.physicsDebug.scaleX = this.physicsDebug.scaleY = this.track.scale;
  }
  
  startRace() {
    if(!this.track.points.length > 0)
      return;
    
    let spline = new Phaser.Curves.Spline(this.track.points);
    this.bounds = spline.getBounds();    
    this.track.points.forEach(point => {
      point.x -= this.bounds.x - this.track.margin;
      point.y -= this.bounds.y - this.track.margin;
    })
    
    spline = new Phaser.Curves.Spline(this.track.points);
    this.wayPoints = spline.getDistancePoints(200);
    this.aiCars.forEach(car => car.nextWP = 0); 
    this.racing = true;
    // this.debugRacingLine();
  }
  
  debugRacingLine() {
    const graphics = this.add.graphics();   
    this.wayPoints.forEach(wp => { 
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(wp.x, wp.y, 20);
    });    
    graphics.depth = 60;
  }
  
  diff(num1, num2) {
    if (num1 > num2)
      return num1 - num2
    else 
      return num2 - num1
  }
  
  getCarEmitter(car) {
    const particles = this.add.particles('dust');
    particles.car = car;
    particles.setDepth(35);
    
    // let alphaConfig = {
    //   onEmit: (particle, key, t, value) => {
    //     if(this.car.surface.type === Physics.surface.TARMAC && this.car.isSkidding)  
    //       return { start: 20 / this.car.surface.particleAlpha, end: 0, ease: 'Linear' };  
    //     else
    //       return { start: 200 / this.car.surface.particleAlpha, end: 0, ease: 'Linear' };  
    //   }
    // };
    
    let alphaConfig ={
      onEmit: (particle, key, t, value) => {
        if(particles.car.surface.type === Physics.surface.TARMAC && particles.car.isSkidding)  
          return 20 / particles.car.surface.particleAlpha;
        else
          return 200 / particles.car.surface.particleAlpha;  
      }
    };
    
    // let alphaConfig = { start: 1, end: 0, ease: 'Linear' };
    
    return particles.createEmitter({
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
      scale: { start: 0.1 * this.track.scale, end: 0.5 * this.track.scale },
      blendMode: 'NORMAL'
    });
  }
  
  camNext() {
    this.camFollow++;
    if(this.camFollow < this.aiCars.length)
      this.cameras.main.startFollow(this.aiCars[this.camFollow].carSprite); 
    else {
      this.camFollow = -1;
      this.cameras.main.startFollow(this.car.carSprite); 
    }
  }
  
  camPrev() {
    this.camFollow--;
    if(this.camFollow === -1) {
      this.cameras.main.startFollow(this.car.carSprite);
    }
    else if(this.camFollow >= 0) {
      this.cameras.main.startFollow(this.aiCars[this.camFollow].carSprite); 
    }
    else {
      this.camFollow = this.aiCars.length -1;
      this.cameras.main.startFollow(this.aiCars[this.camFollow].carSprite); 
    }
  }
  
/////////////////////////////////////////////////////////////////// Main loop ///////////////////////////////////////////////////////////////////////////////
  
  update(time, delta) {
    
    // this.frameTime += delta
    // if(this.frameTime < 16.5) 
    //   return;
    // else 
    //   this.frameTime = 0;
    
    if(this.paused)
      return;    
    
    this.aiCars.forEach(car1 => {
      car1.warning = false;
      this.aiCars.forEach(car2 => {
        if(car1 !== car2 && car1.nextWP && car2.nextWP && car1.nextWP === car2.nextWP) {
          const dist1 = Phaser.Math.Distance.Between(car1.x, car1.y, car2.x, car2.y);
          const dist2 = Phaser.Math.Distance.Between(car1.x, car1.y,  this.wayPoints[car1.nextWP].x,  this.wayPoints[car1.nextWP].y);
          const dist3 = Phaser.Math.Distance.Between(car2.x, car2.y,  this.wayPoints[car1.nextWP].x,  this.wayPoints[car1.nextWP].y);
          if(dist1 < 100) {
            if(dist2 > dist3)
              car1.warning = true;     
            else
              car2.warning = true;
          }
        }          
      });  
    });    
        
    this.car.brake(controls.joyDown);
    this.car.throttle(controls.joyUp);
    this.car.steerLeft(controls.joyLeft);
    this.car.steerRight(controls.joyRight);
    
    this.updateCar(this.car);
        
    if(this.racing) {
      this.aiCars.forEach(car => {
        this.drive(car);
        this.updateCar(car);
      });
    }
    
    //Performance fix needed
    if(!this.aiCars.length > 0) {
      this.rtTyreMarks.beginDraw();
      this.drawSkidmarks(this.car);   
      this.aiCars.forEach(car => {
        this.drawSkidmarks(car);   
      });
      this.rtTyreMarks.endDraw();
    }
  }
  
  pause() {
    if(this.paused) {
      this.paused = false;
      this.resumeEmitters();
      this.engineSound.resume();
    }
    else {
      this.paused = true; 
      this.pauseEmitters();
      this.engineSound.pause();
    }
  }
  
  resumeEmitters() {
    this.emittters.forEach(emitter => { emitter.resume(); });
  }
  
  pauseEmitters() {
    this.emittters.forEach(emitter => { emitter.pause(); });
  }
  
  drive(car) {
    let wp = this.wayPoints[car.nextWP];
    const dist = Phaser.Math.Distance.Between(car.x, car.y, wp.x, wp.y);

    
    if(dist < 500) {
      car.nextWP++;
      if(car.nextWP >= this.wayPoints.length)
        car.nextWP = 0;
    }
    
    const angleToWP = Phaser.Math.Angle.CounterClockwise(Phaser.Math.Angle.Between(car.x, car.y, wp.x, wp.y));
    const angleCar = Phaser.Math.Angle.CounterClockwise(car.angle - Math.PI / 2);
    
    let diff = Math.abs(angleToWP - angleCar);
    if(diff > 3)
      return;
    
    let steerNeeded = diff > 0.1;
    
    if(steerNeeded && angleToWP > angleCar) {
      car.steerLeft(true);
      car.steerRight(false);
    }
    else if(steerNeeded && angleToWP < angleCar) {
      car.steerLeft(false);
      car.steerRight(true);
    }
    else {
      car.steerLeft(false);
      car.steerRight(false);      
    }
    
    if(Math.abs(car.angularVelocity) > 0.02 && car.velocity > 0) {
      car.throttle(false);
      car.brake(true);      
    }
    else if(!car.warning && Math.abs(car.angularVelocity) < 0.01) {
      car.throttle(true);
      car.brake(false);
    }
    else {
      car.throttle(false);
      car.brake(false);
    }
  }
  
  updateCar(car) {
    let px = (car.carSprite.x / this.map.scale);
    let py = (car.carSprite.y / this.map.scale);
    
    if(!this.track.bgIsTiled) {
      px += (this.map.width / 2);
      py += (this.map.height / 2);
    }
      
    this.setSurface(car, px, py);     
    car.update();    
    if(this.camFollow === car.index - 1)
      this.engineSound.rate = car.engineSpeed / car.engineSoundFactor;      
    
    this.updateCarSprite(car);    
  }
  
  updateCarSprite(car) {
    car.carSprite.rotation = car.tyresSprite.rotation = car.shadow.rotation = car.angle;
    car.carSprite.x = car.tyresSprite.x = car.shadow.x = car.x;
    car.carSprite.y = car.tyresSprite.y = car.shadow.y = car.y;  
  }
  
  drawSkidmarks(car) {
    car.tyresSprite.tint = 0x000000;
    if(car.surface.type !== Physics.surface.TARMAC) {    
      car.tyresSprite.alpha = 0.2;
      car.tyresSprite.tint = car.surface.skidMarkColor;
    } 
    else { 
      car.tyresSprite.alpha = 0.01;
      if(car.curveSkid || car.brakeSkid) {
        car.tyresSprite.alpha = 0.3;
      }
      if(car.powerSkid)
        car.tyresSprite.alpha = 0.1;
    }
    if(this.track.bgIsTiled) {
      this.rtTyreMarks.batchDraw(
        car.tyresSprite, 
        car.x,
        car.y
      );
    }
    else {
      this.rtTyreMarks.batchDraw(
        car.tyresSprite, 
        car.x + (this.map.width / 2),
        car.y + (this.map.width / 2)
      );
    }
  }
  
  setSurface(car, px, py) {
    const surfacePhysicsPixel = this.textures.getPixel(px, py, 'physics');

    if(surfacePhysicsPixel) {
      if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 255)
        car.surface = Physics.tarmac;
      else if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 0)
        car.surface = Physics.sand;
      else if(surfacePhysicsPixel.r == 0 &&  surfacePhysicsPixel.g == 0 && surfacePhysicsPixel.b == 0)
        car.crash();
      else
        car.surface = Physics.grass;
      // console.log(car.surface)
    }
    else 
      car.surface = Physics.tarmac;
  }
}