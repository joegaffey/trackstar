import Physics from './Physics.js';

class Car {
  
  constructor(config) {
    this.driver = config.driver;
    this.x = config.x;
    this.y = config.y;
    this.angle = config.angle;
    this.angularVelocity = config.angularVelocity;
    this.surface = config.surface;
    this.minEngineSpeed = config.minEngineSpeed;
    this.maxEngineSpeed = config.maxEngineSpeed;
    this.engineSpeedFactor = config.engineSpeedFactor;
    this.engineSoundFactor = config.engineSoundFactor;
    this.scale = config.scale;
    this.texture = config.texture;
    
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.velocity = 0;
    this.power = 0;
    this.reverse = 0;
    this.angularVelocity = 0;
    this.isThrottling = false;
    this.isReversing = false;
    this.engineSpeed = this.minEngineSpeed;
    this.lap = 0;
    
    this.renderScale = 1;

    this.gearRatios = config.gearRatios || [1.8, 1.35, 1.0, 0.8, 0.65];
    this.finalDrive = config.finalDrive !== undefined ? config.finalDrive : 1.0;
    this.autoMode = true;
    this.currentGear = 0;
    this.shiftUpRPM = config.shiftUpRPM || 9000;
    this.shiftDownRPM = config.shiftDownRPM || 6800;
    this.shiftCooldown = 0;
  }
  
  get gearMultiplier() {
    if(this.currentGear === 0) return 0;
    return this.gearRatios[this.currentGear - 1] * this.finalDrive;
  }
  
  reset(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.angularVelocity = this.xVelocity = this.yVelocity = 0;
    this.power = 0;
    this.reverse = 0;
    this.lap = 0;
    this.isThrottling = false;
    this.isReversing = false;
    this.isTurningLeft = false;
    this.isTurningRight = false;
    this.currentGear = 0;
    this.autoMode = true;
    this.shiftCooldown = 0;
    this.engineSpeed = this.minEngineSpeed;
  }
  
  shiftUp() {
    if(this.currentGear < this.gearRatios.length) {
      this.currentGear++;
      this.shiftCooldown = 20;
    }
  }

  shiftDown() {
    if(this.currentGear > 1) {
      this.currentGear--;
      this.shiftCooldown = 20;
    }
  }
  
  throttle(input) {
    this.isThrottling = input;
  }
  
  brake(input) {
    this.isReversing = input;
  }
  
  steerLeft(input) {
    if(this.canTurn)
      this.isTurningLeft = input;
    else
      this.isTurningLeft = false;
  }
  
  steerRight(input) {
    if(this.canTurn) 
      this.isTurningRight = input;
    else
      this.isTurningRight = false;
  }

  crash() {
    this.xVelocity *= -1.1;
    this.yVelocity *= -1.1;
    this.power = 0;
  }
  
  collideCar(car) {
    this.xVelocity -= car.xVelocity / 2;
    this.yVelocity -= car.yVelocity / 2;
    this.collisionTimer = 30;
    this.throttle(false);
    
    car.xVelocity += this.xVelocity / 2;
    car.yVelocity += this.yVelocity / 2;
  }

  update() {
    this.updateEngine();
    this.updateGear();
    
    this.updatePower();
    this.canTurn = this.power > 0.005 || this.reverse > 0.005; 
    
    this.updateAngularVelocity();
    this.updateVelocity();
        
    this.curveSkid = this.angularVelocity < -0.015 || this.angularVelocity > 0.015;
    this.powerSkid = this.isThrottling && (this.power > 0.02 && this.velocity < 2);
    this.brakeSkid = this.reverse > 0.02 && (this.velocity > 3);

    this.x += this.xVelocity * this.renderScale * 4;
    this.y -= this.yVelocity * this.renderScale * 4;

    this.angle += this.angularVelocity;     
  }
  
  updateGear() {
    if(this.shiftCooldown > 0) {
      this.shiftCooldown--;
      return;
    }
    if(this.currentGear > 0 && Math.sqrt(this.velocity) < 0.3 && !this.isThrottling && !this.isReversing) {
      this.currentGear = 0;
      this.engineSpeed = this.minEngineSpeed;
      return;
    }
    if(this.autoMode) {
      const speed = Math.sqrt(this.velocity);
      if(this.currentGear === 0 && this.isThrottling) {
        this.shiftUp();
      } else if(this.currentGear > 0 && this.currentGear < this.gearRatios.length) {
        const maxSpeedForGear = (this.shiftUpRPM - this.minEngineSpeed) / (this.gearMultiplier * 2000);
        if(speed > maxSpeedForGear) {
          this.shiftUp();
        }
      }
      if(this.currentGear > 1) {
        const minSpeedForGear = (this.shiftDownRPM - this.minEngineSpeed) / (this.gearMultiplier * 2000);
        if(speed < minSpeedForGear) {
          this.shiftDown();
        }
      }
    }
    if(this.currentGear > 1 && this.engineSpeed <= this.shiftDownRPM) {
      this.shiftDown();
    }
  }

  toggleAutoMode() {
    this.autoMode = !this.autoMode;
    if(this.autoMode && this.currentGear === 0) {
      this.currentGear = 1;
      this.shiftCooldown = 10;
    }
  }
  
  updateEngine() {
    if(this.currentGear > 0) {
      const speed = Math.abs(this.xVelocity) + Math.abs(this.yVelocity);
      this.engineSpeed = speed * this.gearMultiplier * 2000 + this.minEngineSpeed;
      this.engineSpeed = Math.max(this.minEngineSpeed, Math.min(this.maxEngineSpeed, this.engineSpeed));
      this.engineSpeed += this.power * this.engineSpeedFactor * 0.2;
    } else {
      this.engineSpeed = this.minEngineSpeed + this.power * this.engineSpeedFactor;
    }
    this.engineSpeed = Math.max(this.minEngineSpeed, Math.min(this.maxEngineSpeed, this.engineSpeed));
  }
  
  updatePower() {
    if(this.isThrottling) {
      this.power += Physics.powerFactor * this.isThrottling;
    } else if(this.currentGear > 0) {
      const gearRatio = this.gearMultiplier;
      const rpmRatio = this.engineSpeed / this.maxEngineSpeed;
      this.power -= Physics.engineBrakingFactor * Math.max(0.5, gearRatio) * rpmRatio;
    } else {
      this.power -= Physics.engineBrakingFactor * 0.3;
    }
    this.isReversing ? this.reverse += Physics.reverseFactor : this.reverse -= Physics.engineBrakingFactor;

    this.power = Math.max(0, Math.min(Physics.maxPower, this.power));
    this.reverse = Math.max(0, Math.min(Physics.maxReverse, this.reverse));
  }
  
  updateAngularVelocity() {
    const direction = this.power > this.reverse ? 1 : -1;
    if (this.isTurningLeft) {
      this.angularVelocity -= direction * Physics.turnSpeed * this.isTurningLeft;
    }
    if (this.isTurningRight) {
      this.angularVelocity += direction * Physics.turnSpeed * this.isTurningRight;
    }
    this.angularVelocity *= this.surface.angularDrag; 
  }
  
  updateVelocity() {
    const gearRatio = this.currentGear > 0 ? this.gearMultiplier : 0;
    this.xVelocity += Math.sin(this.angle) * (this.power * gearRatio - this.reverse);
    this.yVelocity += Math.cos(this.angle) * (this.power * gearRatio - this.reverse);
    const effectiveDrag = gearRatio > 0 ? this.surface.drag + (1 - gearRatio) * 0.08 : this.surface.drag;
    this.xVelocity *= effectiveDrag;
    this.yVelocity *= effectiveDrag;
    this.velocity = Math.abs(this.xVelocity)**2 + Math.abs(this.yVelocity)**2;
    if(gearRatio > 0) {
      const maxSpeed = (this.maxEngineSpeed - this.minEngineSpeed) / (gearRatio * 2000);
      const currentSpeed = Math.sqrt(this.velocity);
      if(currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        this.xVelocity *= scale;
        this.yVelocity *= scale;
        this.velocity = maxSpeed * maxSpeed;
      }
    }
  }
}

export default Car;
