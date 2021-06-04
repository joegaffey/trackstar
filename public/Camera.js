class Camera {
  
  constructor(scene) {
    this.camFollow = -1;
    this.scene = scene;
  }
  
  setup() {
    this.mainCam = this.scene.cameras.main;
    this.mainCam.zoom = 0.4;    
  }
  
  zoomIn() {
    this.mainCam.zoom += 0.1;
  }
  
  zoomOut() {
    this.mainCam.zoom -= 0.1;
  }
  
  followCar(car) {
    if(this.mainCam.car) 
      this.mainCam.car.hasCamera = false;
    car.hasCamera = true;
    this.mainCam.car = car;
    this.mainCam.startFollow(car.carSprite);
    this.camFollow = car.index - 1;
  }
  
  nextCar() {
    this.camFollow++;
    let car = this.scene.car;
    if(this.camFollow > -1 && this.camFollow < this.scene.AI.cars.length) 
      car = this.scene.AI.cars[this.camFollow]; 
    else 
      this.camFollow = -1; 
    this.followCar(car);      
  }
  
  previousCar() {    
    this.camFollow--;
    let car = this.scene.car;
    if(this.camFollow > -1 && this.camFollow < this.scene.AI.cars.length) 
      car = this.scene.AI.cars[this.camFollow]; 
    else if(this.camFollow < -1) {
      this.camFollow = this.scene.AI.cars.length - 1; 
      car = this.scene.AI.cars[this.camFollow]; 
    }
    this.followCar(car);      
  }
}