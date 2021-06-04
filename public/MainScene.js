class MainScene extends Phaser.Scene {
  
  constructor() {
    super({key: 'MainScene', active: true});    
    
    this.track = track;
    this.car = car;
    this.baseUrl = baseUrl;
    this.renderScale = 1;
    
    this.particles = new Particles(this);
    this.tyreMarks = new TyreMarks(this);
    this.camera = new Camera(this);
    this.debug = new Debug(this);
    this.AI = new AI();    
  }  
  
//////////////////////////////////////////// Preload phase ////////////////////////////////////////////

  preload() {
    this.isMobile = isMobile = !game.device.os.desktop && game.device.input.touch;
    this.loadBackgroundImage();
        
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
  
  loadBackgroundImage() {
    this.bgKey = this.track.bgTexture;
    this.physicsKey = this.track.physicsTexture;
    
    if(this.track.bgIsTiled) {
      this.load.image('grass', `${this.baseUrl}grass.jpg`);
    }
    else {
      if(this.isMobile) {
        this.bgUrl = this.track.textures[this.bgKey].small;
        this.physicsUrl = this.track.textures[this.physicsKey].small;
      }
      else {
        this.bgUrl = this.track.textures[this.bgKey].regular;
        this.physicsUrl = this.track.textures[this.physicsKey].regular;
      }   
      this.load.image('bg', this.bgUrl);
      this.load.image('physics', this.physicsUrl);
    }    
  }
  
//////////////////////////////////////////// Setup phase ////////////////////////////////////////////

  create() {     
    
    this.addBackgroundImage();
    this.setBackgroundScale();
    
    if(this.isMobile) {
      this.renderScale = 0.4;
      this.particles.mode = this.particles.NONE;
      this.tyreMarks.mode = this.tyreMarks.NONE;
    }   
    
    this.bg.setScale(this.bgScale);
    
    this.track.renderScale = this.renderScale;        
    this.camera.setup();
    
    this.setupCar(this.car, 0);
    if(this.particles.mode > 0)
      this.car.emitter.start();
        
    this.addEngineSound();
    
    this.camera.followCar(this.car);
    
    this.tyreMarks.setup();
         
    this.hideSpinner();
    
    // this.debug.tyreMarks();
    // this.debug.physics(); 
  }
  
  addEngineSound() {
    this.engineSound = this.sound.add('engine');
    // this.engineSound.addMarker({ name: 'clip', start: 1, duration: 1, config: {} });
    this.engineSound.rate = this.car.minEngineSpeed / this.car.engineSoundFactor;
    // this.engineSound.detune = 50;
    // this.engineSound.play('clip', { loop: true, delay: 0, volume: 0.1 });
    // this.engineSound.play({ loop: true, seek: 0.1, duration: 1, delay: 0, volume: 0.1 });
    this.engineSound.play({ loop: true, delay: 0, volume: 0.1 });
  }
  
  addBackgroundImage() {
    if(this.track.bgIsTiled) {
      this.track.drawFinal(this);
      
      this.bg = this.add.tileSprite(this.track.bounds.x - this.track.margin, 
                                     this.track.bounds.y - this.track.margin, 
                                     this.track.bounds.width + this.track.margin * 2, 
                                     this.track.bounds.height + this.track.margin * 2, 
                                     this.track.bgTexture);
      this.bg.setTileScale(2);
      this.bg.setOrigin(0, 0);
    }    
    else {
      this.bg = this.add.image(0, 0, 'bg');
    }
  }
  
  setBackgroundScale() {
    this.bgScale = 1;
    if(!this.track.bgIsTiled) {
      if(this.isMobile) 
        this.bgScale = this.track.textures.smallScale;
      else
        this.bgScale = this.track.textures.regularScale;
    }
  }

  setupCar(car, i) {
    car.index = i;
    car.x = this.track.gridPositions[i].x * this.renderScale;
    car.y = this.track.gridPositions[i].y * this.renderScale;
    car.angle = this.track.gridPositions[i].angle * Math.PI / 180;
    
    car.tyresSprite = this.add.sprite(car.x, car.y, 'tyres');
    car.tyresSprite.setOrigin(0.5, 0.5);
    car.tyresSprite.scaleX = car.tyresSprite.scaleY = car.scale * this.renderScale / this.bgScale;
    car.tyresSprite.flipY = true;
    car.tyresSprite.rotation = car.angle;
    
    car.shadow = this.add.sprite(car.x, car.y, 'car1');
    car.shadow.setOrigin(0.8, 0.6);
    car.shadow.scaleX = car.shadow.scaleY = car.scale * this.renderScale;
    car.shadow.flipY = true;
    car.shadow.tint = 0x000000;
    car.shadow.alpha = 0.4;
    car.shadow.depth = 28;
    car.shadow.rotation = car.angle;

    car.carSprite = this.add.sprite(car.x, car.y, car.texture);
    car.carSprite.setOrigin(0.5, 0.5);
    car.carSprite.scaleX = car.carSprite.scaleY = car.scale * this.renderScale;
    car.carSprite.flipY = true;
    car.carSprite.depth = 30; 
    car.carSprite.rotation = car.angle;
    
    this.particles.addEmitter(car);    
    return car;
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
    
    this.AI.updateCars();
        
    this.car.brake(controls.joyDown);
    this.car.throttle(controls.joyUp);
    this.car.steerLeft(controls.joyLeft);
    this.car.steerRight(controls.joyRight);
    
    this.updateCar(this.car);
        
    if(this.racing) {
      this.AI.cars.forEach(car => {
        this.AI.drive(car);
        this.updateCar(car);
      });
    }    
    this.tyreMarks.draw();
  }
  
  updateCar(car) {
    let px = (car.x / this.bgScale);
    let py = (car.y / this.bgScale);
    
    if(!this.track.bgIsTiled) {
      px += (this.bg.width / 2);
      py += (this.bg.height / 2);
    }
      
    this.updateCarSurface(car, px, py);     
    car.update();    
    if(car.hasCamera)
      this.engineSound.rate = car.engineSpeed / car.engineSoundFactor;
    
    this.updateCarSprite(car);    
  }
  
  updateCarSprite(car) {
    car.carSprite.rotation = car.shadow.rotation = car.tyresSprite.rotation = car.angle;
    car.carSprite.x = car.shadow.x = car.tyresSprite.x = car.x;
    car.carSprite.y = car.shadow.y = car.tyresSprite.y = car.y;  
  }
  
  updateCarSurface(car, px, py) {
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

//////////////////////////////////////////// Game controls ////////////////////////////////////////////
  
  pause() {
    if(this.paused) {
      this.paused = false;
      this.particles.resume();
      this.engineSound.resume();
    }
    else {
      this.paused = true; 
      this.particles.pause();
      this.engineSound.pause();
      this.toast('Paused');
    }
  }
  
  toggleTyreMarks() {
    this.tyreMarks.incrementMode();
  }
  
  toggleParticles() {
    this.particles.incrementMode();
  }
  
  addAICars(count) {
    for(let i = 1; i <= count; i++) {
      if(this.track.gridPositions.length > this.AI.cars.length + 1) {
        const car = this.setupCar(this.makeCar(this.AI.cars.length + 1), this.AI.cars.length + 1);  
        if(this.particles.mode === this.particles.ALL)
          this.car.emitter.start();
        this.AI.cars.push(car);        
      }
      else
        this.toast('No free pit boxes');
    }
  }
  
  makeCar(index) {
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
  
  startRace() {
    if(!this.track.points.length > 0) return;
    
    let spline = new Phaser.Curves.Spline(this.track.points);
    this.bounds = spline.getBounds();    
    this.track.points.forEach(point => {
      point.x -= this.bounds.x - this.track.margin;
      point.y -= this.bounds.y - this.track.margin;
    })
    
    spline = new Phaser.Curves.Spline(this.track.points);
    this.AI.wayPoints = spline.getDistancePoints(200);
    this.AI.cars.forEach(car => car.nextWP = 0); 
    this.racing = true;
    // this.debug.racingLine();
    
    this.toast('Go!!!');
  }
  
  toast(text) {
    const el = document.querySelector('#toast');
    el.innerText = text;
    el.classList.add("active");
    setTimeout(() => { 
      el.classList.remove("active");
    }, 3000);
  }
  
  hideSpinner() {
    document.querySelector('.spinner').style.display = 'none';
  }
}