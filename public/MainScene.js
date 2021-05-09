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
    
    this.load.image('car', this.baseUrl + 'pitstop_car_5.png');
    this.load.image('tyres', this.baseUrl + 'tyres.png');
    this.load.image('dust', this.baseUrl + 'dust.png');
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
        
    this.car.x = this.track.gridPositions[0].x / this.track.scale;
    this.car.y = this.track.gridPositions[0].y / this.track.scale;
    this.car.angle = this.track.gridPositions[0].angle * Math.PI / 180;
    
    this.tyresSprite = this.add.sprite(0, 0, 'tyres');
    this.tyresSprite.setOrigin(0.5, 0.5);
    this.tyresSprite.scaleX = this.tyresSprite.scaleY = this.car.scale;
    this.tyresSprite.flipY = true;
    
    this.shadow = this.add.sprite(0, 0, 'car');
    this.shadow.setOrigin(0.8, 0.6);
    this.shadow.scaleX = this.shadow.scaleY = this.car.scale;
    this.shadow.flipY = true;
    this.shadow.tint = 0x000000;
    this.shadow.alpha = 0.4;
    this.shadow.depth = 28;

    this.carSprite = this.add.sprite(0, 0, 'car');
    this.carSprite.setOrigin(0.5, 0.5);
    this.carSprite.scaleX = this.carSprite.scaleY = this.car.scale;
    this.carSprite.flipY = true;
    this.carSprite.depth = 30;    
    
    this.engineSound = this.sound.add('engine');
    this.engineSound.rate = this.car.minEngineSpeed / this.car.engineSoundFactor;
    this.engineSound.play({loop: true, volume: 0.1});
    
    this.cameras.main.startFollow(this.carSprite); 
    
    this.carEmitter = this.getCarEmitter();
    this.carEmitter.startFollow(this.carSprite);
    
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
  }
  
  debugPhysics() {
    this.physicsDebug = this.add.image(0, 0, 'physics')
    if(this.track.bgIsTiled)
      this.physicsDebug.setOrigin(0, 0);
    this.physicsDebug.alpha = 0.4;
    this.physicsDebug.depth = 45;
    this.physicsDebug.scaleX = this.physicsDebug.scaleY = this.track.scale;
  }

  update(time, delta) {
    // this.frameTime += delta
    // if(this.frameTime < 16.5) 
    //   return;
    // else 
    //   this.frameTime = 0;
    
    let px = (this.carSprite.x / this.map.scale);
    let py = (this.carSprite.y / this.map.scale);
    
    if(!this.track.bgIsTiled) {
      px += (this.map.width / 2);
      py += (this.map.height / 2);
    }
      
    const surfacePhysicsPixel = this.textures.getPixel(px, py, 'physics');

    if(surfacePhysicsPixel) {
      if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 255)
        this.car.surface = Physics.tarmac;
      else if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 0)
        this.car.surface = Physics.sand;
      else if(surfacePhysicsPixel.r == 0 &&  surfacePhysicsPixel.g == 0 && surfacePhysicsPixel.b == 0)
        this.car.crash();
      else
        this.car.surface = Physics.grass;
      // console.log(this.car.surface)
    }
    else 
      this.car.surface = Physics.tarmac;
    
    this.car.update();
    
    this.engineSound.rate = this.car.engineSpeed / this.car.engineSoundFactor;
        
    this.tyresSprite.tint = 0x000000;
    if(this.car.surface.type !== Physics.surface.TARMAC) {    
      this.tyresSprite.alpha = 0.2;
      this.tyresSprite.tint = this.car.surface.skidMarkColor;
    } 
    else { 
      this.tyresSprite.alpha = 0.01;
      if(this.car.curveSkid || this.car.brakeSkid) {
        this.tyresSprite.alpha = 0.3;
      }
      if(this.car.powerSkid)
        this.tyresSprite.alpha = 0.1;
    }
    if(this.track.bgIsTiled) {
      this.rtTyreMarks.draw(
        this.tyresSprite, 
        this.car.x * this.track.scale,
        this.car.y * this.track.scale
      );
    }
    else {
      this.rtTyreMarks.draw(
        this.tyresSprite, 
        this.car.x + (this.map.width / 2),
        this.car.y + (this.map.width / 2)
      );
    }
    
    this.carSprite.rotation = this.tyresSprite.rotation = this.shadow.rotation =  this.car.angle;
    this.carSprite.x = this.tyresSprite.x = this.shadow.x = this.car.x * this.track.scale;
    this.carSprite.y = this.tyresSprite.y = this.shadow.y = this.car.y * this.track.scale;  
  }
  
  getCarEmitter() {
    const particles = this.add.particles('dust');
    particles.setDepth(35);
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
      alpha: {
        onEmit: (particle, key, t, value) => {
          if(this.car.surface.type === Physics.surface.TARMAC && this.car.isSkidding)  
            return 20 / this.car.surface.particleAlpha;
          else
            return 200 / this.car.surface.particleAlpha;  
        }
      },
      tint: {
        onEmit: (particle, key, t, value) => {
          return this.car.surface.particleColor;
        }
      },
      // angle: {
      //   onEmit: function (particle, key, t, value)  {
      //     return Math.sin(car.angle)  * 360;
      //   }
      // },
      scale: { start: 0.1 * this.track.scale, end: 1.0 * this.track.scale },
      blendMode: 'NORMAL'
    });
  }
}