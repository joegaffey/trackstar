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
    this.engineSpeed = this.minEngineSpeed * this.engineSpeedFactor;
    this.lap = 0;
    
    this.renderScale = 1;
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
    // this.angle -= car.angle / 2;
    
    car.xVelocity += this.xVelocity / 2;
    car.yVelocity += this.yVelocity / 2;
    // car.angle *= this.angle;    
  }

  update() {
    this.updateEngine();
    
    this.updatePower();
    this.canTurn = this.power > 0.005 || this.reverse > 0.005; 
    
    this.updateAngularVelocity();
    this.updateVelocity();
        
    this.curveSkid = this.angularVelocity < -0.015 || this.angularVelocity > 0.015;
    this.powerSkid = this.isThrottling && (this.power > 0.02 && this.velocity < 2);
    this.brakeSkid = this.reverse > 0.02 && (this.velocity > 3);
    // if(this.curveSkid || this.powerSkid || this.brakeSkid)
    //   console.log('Skids: ' + this.curveSkid +  ' ' + this.powerSkid +  ' ' + this.brakeSkid)
    
    // if(this.powerSkid)
    //   this.angularVelocity *= 1.03;  
    // if(this.curveSkid)
    //   this.angularVelocity *= 1.05;  
    // if(this.brakeSkid)
    //   this.angularVelocity /= 1.01;  
    
    this.x += this.xVelocity * this.renderScale * 4;
    this.y -= this.yVelocity * this.renderScale * 4;
    this.angle += this.angularVelocity;    
     
    // console.log(this.x + ' ' + this.y)
  }
  
  updateEngine() {
    if(this.power * this.engineSpeedFactor < this.minEngineSpeed)
      this.engineSpeed = this.minEngineSpeed;
    else if(this.power * this.engineSpeedFactor > this.maxEngineSpeed)
      this.engineSpeed = this.maxEngineSpeed;
    else
      this.engineSpeed = this.power * this.engineSpeedFactor;
  }
  
  updatePower() {
    this.isThrottling ? this.power += Physics.powerFactor * this.isThrottling : this.power -= Physics.engineBrakingFactor;
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
    this.xVelocity += Math.sin(this.angle) * (this.power - this.reverse);
    this.yVelocity += Math.cos(this.angle) * (this.power - this.reverse);
    this.xVelocity *= this.surface.drag;
    this.yVelocity *= this.surface.drag;
    this.velocity = Math.abs(this.xVelocity)**2 + Math.abs(this.yVelocity)**2;
  }
}