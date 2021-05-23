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
    
    this.setupCar(this.car, 0);
    
    this.aiCars = [];        
    // this.addAICars(12);        
        
    this.engineSound = this.sound.add('engine');
    this.engineSound.rate = this.car.minEngineSpeed / this.car.engineSoundFactor;
    this.engineSound.play({loop: true, volume: 0.1});
    
    this.cameras.main.startFollow(this.car.carSprite); 
    this.camFollow = -1;
    // this.cameras.main.startFollow(this.aiCars[1].carSprite); 
    
    this.carEmitter = this.getCarEmitter();
    this.carEmitter.startFollow(this.car.carSprite);
    
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
    
    if(this.track.points.length > 0)
      this.startRace();
    
    this.frameSkip = 0;
    this.frameCount = 0;    
  }
  
  addAICars(count) {
    for(let i = 1; i <= count; i++)
      this.aiCars.push(this.setupCar(this.getCar(i), i));        
  }
  
  setupCar(car, i) {
    car.x = this.track.gridPositions[i].x / this.track.scale;
    car.y = this.track.gridPositions[i].y / this.track.scale;
    car.angle = this.track.gridPositions[i].angle * Math.PI / 180;
    
    car.tyresSprite = this.add.sprite(0, 0, 'tyres');
    car.tyresSprite.setOrigin(0.5, 0.5);
    car.tyresSprite.scaleX = car.tyresSprite.scaleY = car.scale;
    car.tyresSprite.flipY = true;
    
    car.shadow = this.add.sprite(0, 0, 'car1');
    car.shadow.setOrigin(0.8, 0.6);
    car.shadow.scaleX = car.shadow.scaleY = car.scale;
    car.shadow.flipY = true;
    car.shadow.tint = 0x000000;
    car.shadow.alpha = 0.4;
    car.shadow.depth = 28;

    car.carSprite = this.add.sprite(0, 0, car.texture);
    car.carSprite.setOrigin(0.5, 0.5);
    car.carSprite.scaleX = car.carSprite.scaleY = car.scale;
    car.carSprite.flipY = true;
    car.carSprite.depth = 30; 
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
  
  getCarEmitter() {
    const particles = this.add.particles('dust');
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
        if(this.car.surface.type === Physics.surface.TARMAC && this.car.isSkidding)  
          return 20 / this.car.surface.particleAlpha;
        else
          return 200 / this.car.surface.particleAlpha;  
      }
    };
    
    // let alphaConfig = { start: 1, end: 0, ease: 'Linear' };
    
    return particles.createEmitter({
      frequency: 50,
      maxParticles: 40,
      speed: {
        onEmit: (particle, key, t, value) => {
            return this.car.velocity;
        }
      },
      lifespan: {
        onEmit: (particle, key, t, value) => {
          return this.car.velocity * 100;
        }
      },
      alpha: alphaConfig,
      tint: {
        onEmit: (particle, key, t, value) => {
          return this.car.surface.particleColor;
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
    if(this.camFollow === -1)
      this.cameras.main.startFollow(this.car.carSprite);
    else if(this.camFollow >= 0)
      this.cameras.main.startFollow(this.aiCars[this.camFollow].carSprite); 
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
        
    this.car.brake(controls.joyDown);
    this.car.throttle(controls.joyUp);
    this.car.steerLeft(controls.joyLeft);
    this.car.steerRight(controls.joyRight);
    
    let recalc = false;
    this.frameCount++;
    if(this.frameCount >= this.frameSkip) {
      recalc = true;
      this.frameCount = 0;
    }
    
    this.updateCar(this.car, recalc);
        
    if(this.racing) {
      this.aiCars.forEach(car => {
        if(recalc)
          this.drive(car);
        this.updateCar(car, recalc);
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
    if(this.paused)
      this.paused = false;
    else
      this.paused = true;
  }
  
  drive(car) {
    let wp = this.wayPoints[car.nextWP];
    const dist = Phaser.Math.Distance.Between(car.x * this.track.scale, car.y * this.track.scale, wp.x, wp.y);
    
    if(dist < 500) {
      car.nextWP++;
      if(car.nextWP >= this.wayPoints.length)
        car.nextWP = 0;
    }
    
    let angleToWP = Phaser.Math.Angle.CounterClockwise(Phaser.Math.Angle.Between(car.x * this.track.scale, car.y * this.track.scale, wp.x, wp.y));
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
    else if(Math.abs(car.angularVelocity) < 0.01) {
      car.throttle(true);
      car.brake(false);
    }
    else {
      car.throttle(false);
      car.brake(false);
    }
  }
  
  updateCar(car, recalc) {
    let px = (car.carSprite.x / this.map.scale);
    let py = (car.carSprite.y / this.map.scale);
    
    if(!this.track.bgIsTiled) {
      px += (this.map.width / 2);
      py += (this.map.height / 2);
    }
      
    if(recalc)
      this.setSurface(car, px, py);     
    car.update(recalc);    
    this.engineSound.rate = car.engineSpeed / car.engineSoundFactor;      
    
    this.updateCarSprite(car);    
  }
  
  updateCarSprite(car) {
    car.carSprite.rotation = car.tyresSprite.rotation = car.shadow.rotation =  car.angle;
    car.carSprite.x = car.tyresSprite.x = car.shadow.x = car.x * this.track.scale;
    car.carSprite.y = car.tyresSprite.y = car.shadow.y = car.y * this.track.scale;  
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
        car.x * this.track.scale,
        car.y * this.track.scale
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