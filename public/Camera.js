class Camera {
  
  constructor(scene) {
    this.camFollow = 0;
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
    this.mainCam.startFollow(car.carSprite);
  }
  
  nextCar() {
    this.camFollow++;
    if(this.camFollow >= this.scene.cars.length)
      this.camFollow = 0;
    this.followCar(this.scene.cars[this.camFollow]);  
  }
  
  previousCar() {    
    this.camFollow--;
    if(this.camFollow < 0)
      this.camFollow = this.scene.cars.length - 1;
    this.followCar(this.scene.cars[this.camFollow]);
  }
}