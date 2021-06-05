class AI {
  
  constructor() {
    this.cars = [];
    this.wayPoints = [];
  }
  
  drive(car) {
    if(car.collisionTimer > 0) {
      car.collisionTimer--;
      return;
    }
    
    if(!car.nextWP)
      car.nextWP = this.closestWP(car) || 0;
    
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
  
  closestWP(car) {
    let dist = 99999;
    let closestWP = 0;
    this.wayPoints.forEach((wp, i) => {
      let newDist = Phaser.Math.Distance.Between(car.x, car.y, wp.x, wp.y);
      if(newDist < dist) {
        dist = newDist;   
        closestWP = i + 2; // Look ahead a couple of points
      }
    });
    if(closestWP >= this.wayPoints.length)
      closestWP = 0;
    return closestWP;
  }
  
  reset() {
    this.cars.forEach(car => {
      if(car.isPlayer) 
        car.isAI = false;
      else {
        car.carSprite.destroy();
        car.shadow.destroy();
        car.tyresSprite.destroy();
        car = null;
      }
    });
    this.cars = [];
  }  
  
  updateCars() {
    this.cars.forEach(car1 => {
      car1.warning = false;
      this.cars.forEach(car2 => {
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
          // if(dist1 < 50) {
          //   if(dist2 >= dist3)
          //     car1.collideCar(car2);     
          //   else
          //     car2.collideCar(car1);            
          // }
        }          
      });  
    });    
  }
}