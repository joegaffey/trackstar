class MainScene extends Phaser.Scene {
  
  constructor() {
    super({key: 'MainScene', active: true});
    
    this.mapKey = track.bgTexture;
    this.physicsKey = track.physicsTexture;    
    this.mapUrl = track.textures[this.mapKey].regular;
    this.physicsUrl = track.textures[this.physicsKey].regular;
  }

  preload () {
    isMobile = !game.device.os.desktop && game.device.input.touch;
    if(isMobile) {
      this.mapUrl = track.textures[this.mapKey].small;
      this.physicUrl = track.textures[this.physicsKey].small;
      mapScale = 4;
      carScale = 1;
    }
    
    const baseUrl = 'https://cdn.glitch.com/181bb66d-bf97-4454-bcc6-867ac28e67cc%2F';    
    this.load.image('map', this.mapUrl);
    this.load.image('physics', this.physicsUrl);
    this.load.image('car', baseUrl + 'pitstop_car_5.png');
    this.load.image('tyres', baseUrl + 'tyres.png');
    this.load.image('dust', baseUrl + 'dust.png');
    this.load.audio('engine', [baseUrl + 'engine.wav']);
  }

  create () {    
    this.map = this.add.image(0, 0, 'map');
    this.map.scaleX = this.map.scaleY = mapScale;    

    this.tyresSprite = this.add.sprite(0, 0, 'tyres');
    this.tyresSprite.scaleX = this.tyresSprite.scaleY = 0.025 * carScale;
    this.tyresSprite.flipY = true;
    
    this.shadow = this.add.sprite(0, 0, 'car');
    this.shadow.setOrigin(0.8, 0.6);
    this.shadow.scaleX = this.shadow.scaleY = 0.025 * carScale;
    this.shadow.flipY = true;
    this.shadow.tint = 0x000000;
    this.shadow.alpha = 0.4;

    this.carSprite = this.add.sprite(0, 0, 'car');
    this.carSprite.scaleX = this.carSprite.scaleY = 0.025 * carScale;
    this.carSprite.flipY = true;
    this.carSprite.depth = 10;
    
    engine = this.sound.add('engine');
    engine.rate = minEngineSpeed;
    engine.play({loop: true, volume: 0.1});

    this.cameras.main.startFollow(this.carSprite);    
    this.cameras.main.zoom = 1;
    mainCamera = this.cameras.main;
    
    this.carEmitter = this.getCarEmitter();
    this.carEmitter.startFollow(this.carSprite);
    
    this.rtTyreMarks = this.make.renderTexture({ x: this.map.width / -2, y: this.map.height / -2, width: this.map.width, height: this.map.height }).setOrigin(0, 0);  
  }

  update () {    
    // Fix for mobile needed
    const surfacePhysicsPixel = this.textures.getPixel(this.carSprite.x + (this.map.width / 2), this.carSprite.y + (this.map.height / 2), 'physics');
    this.surfaceGraphicsPixel = this.textures.getPixel(this.carSprite.x + (this.map.width / 2), this.carSprite.y + (this.map.height / 2), 'map');
    
    if(!isMobile && surfacePhysicsPixel) {
      if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 255)
        car.surface = tarmac;
      else if(surfacePhysicsPixel.r == 255 &&  surfacePhysicsPixel.g == 255 && surfacePhysicsPixel.b == 0)
        car.surface = sand;
      else if(surfacePhysicsPixel.r == 0 &&  surfacePhysicsPixel.g == 0 && surfacePhysicsPixel.b == 0)
        car.crash();
      else
        car.surface = grass;
    }
    else 
      car.surface = tarmac;
    updateCar();
    
    const curveSkid = car.angularVelocity < -0.015 || car.angularVelocity > 0.015;
    const powerSkid = car.isThrottling && (car.power > 0.02 && car.velocity < 2);
    const brakeSkid = car.reverse > 0.02 && (car.velocity > 3);
    
    this.tyresSprite.tint = 0x000000;
    if(car.surface.type !== surface.TARMAC) {    
      this.tyresSprite.alpha = 0.2;
      this.tyresSprite.tint = car.surface.skidMarkColor;
    } 
    else { 
      this.tyresSprite.alpha = 0.01;
      if(curveSkid || brakeSkid) {
        this.tyresSprite.alpha = 0.3;
      }
      if(powerSkid)
        this.tyresSprite.alpha = 0.1;
    }
    this.rtTyreMarks.draw(this.tyresSprite, car.x + (this.map.width / 2), car.y + (this.map.height / 2));
    
    this.carSprite.rotation = this.tyresSprite.rotation = this.shadow.rotation =  car.angle;
    this.carSprite.x = this.tyresSprite.x = this.shadow.x = car.x;
    this.carSprite.y = this.tyresSprite.y = this.shadow.y = car.y;  
  }
  
  getCarEmitter() {
    const particles = this.add.particles('dust');
    return particles.createEmitter({
      frequency: 50,
      maxParticles: 40,
      speed: {
        onEmit: function (particle, key, t, value) {
            return car.velocity;
        }
      },
      lifespan: {
        onEmit: function (particle, key, t, value)  {
          return car.velocity * 100;
        }
      },
      alpha: {
        onEmit: function (particle, key, t, value) {
          if(car.surface.type === surface.TARMAC && car.isSkidding)  
            return 20 / car.surface.particleAlpha;
          else
            return 200 / car.surface.particleAlpha;  
        }
      },
      tint: {
        onEmit: function (particle, key, t, value)  {
          return car.surface.particleColor;
        }
      },
      // angle: {
      //   onEmit: function (particle, key, t, value)  {
      //     return Math.sin(car.angle)  * 360;
      //   }
      // },
      scale: { start: 0.1, end: 1.0 },
      blendMode: 'NORMAL'
    });
  }
}