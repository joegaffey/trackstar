class Car {
  
  constructor(config) {    
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
    
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.velocity = 0;
    this.power = 0;
    this.reverse = 0;
    this.angularVelocity = 0;
    this.isThrottling = false;
    this.isReversing = false;
    this.engineSpeed = this.minEngineSpeed * this.engineSpeedFactor;
  }

  crash() {
    this.xVelocity *= -1.1;
    this.yVelocity *= -1.1;
    this.power = 0;
  }

  update() {   
    if(this.power * this.engineSpeedFactor < this.minEngineSpeed)
      this.engineSpeed = this.minEngineSpeed;
    else if(this.power * this.engineSpeedFactor > this.maxEngineSpeed)
      this.engineSpeed = this.maxEngineSpeed;
    else
      this.engineSpeed = this.power * this.engineSpeedFactor;
    
    const canTurn = this.power > 0.0025 || this.reverse;
    const pressingUp = controls.joyUp;
    const pressingDown = controls.joyDown;

    if (this.isThrottling !== pressingUp || this.isReversing !== pressingDown) {
      this.isThrottling = pressingUp;
      this.isReversing = pressingDown;
    }

    const turnLeft = canTurn && controls.joyLeft;
    const turnRight = canTurn && controls.joyRight;

    if (this.isTurningLeft !== turnLeft) {
      this.isTurningLeft = turnLeft;
    }
    if (this.isTurningRight !== turnRight) {
      this.isTurningRight = turnRight;
    }
    
    if (this.isThrottling) {
      this.power += Physics.powerFactor * this.isThrottling;
    } 
    else {
      this.power -= Physics.engineBrakingFactor;
    }
    if (this.isReversing) {
      this.reverse += Physics.reverseFactor;
    } 
    else {
      this.reverse -= Physics.engineBrakingFactor;
    }

    this.power = Math.max(0, Math.min(Physics.maxPower, this.power));
    this.reverse = Math.max(0, Math.min(Physics.maxReverse, this.reverse));

    const direction = this.power > this.reverse ? 1 : -1;

    if (this.isTurningLeft) {
      this.angularVelocity -= direction * Physics.turnSpeed * this.isTurningLeft;
    }
    if (this.isTurningRight) {
      this.angularVelocity += direction * Physics.turnSpeed * this.isTurningRight;
    }

    this.xVelocity += Math.sin(this.angle) * (this.power - this.reverse);
    this.yVelocity += Math.cos(this.angle) * (this.power - this.reverse);
    
    this.velocity = Math.abs(this.xVelocity)**2 + Math.abs(this.yVelocity)** 2;
    
    this.x += this.xVelocity;
    this.y -= this.yVelocity;
    this.angle += this.angularVelocity;
    
    this.xVelocity *= this.surface.drag;
    this.yVelocity *= this.surface.drag;
    
    this.angularVelocity *= this.surface.angularDrag;    
    // console.log(this.x + ' ' + this.y)
        
    this.curveSkid = this.angularVelocity < -0.015 || this.angularVelocity > 0.015;
    this.powerSkid = this.isThrottling && (this.power > 0.02 && this.velocity < 2);
    this.brakeSkid = this.reverse > 0.02 && (this.velocity > 3);
    // if(this.curveSkid || this.powerSkid || this.brakeSkid)
    //   console.log('Skids: ' + this.curveSkid +  ' ' + this.powerSkid +  ' ' + this.brakeSkid)
  }
}