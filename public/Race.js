class Race {
  constructor(lapsCount, scene) {
    this.inProgress = false;  
    this.scene = scene;
    this.lapsCount = lapsCount;
    this.playerLap = 0;
    this.leaderLap = 0;
  }
  
  start() {
    this.inProgress = true;
  }
  
  end() {
    this.inProgress = false;
  }
  
  resume() {
    this.inProgress = true;  
  }
  
  pause() {
    this.inProgress = false;  
  }
  
  reset(lapsCount) {
    this.inProgress = false;
    if(lapsCount)
      this.lapsCount = lapsCount;
  }
    
  updatePositions() {
    const sorted = this.scene.cars.sort((a, b) => (a.lap * 9999 + a.nextWP > b.lap * 9999 + b.nextWP) ? 1 : -1);
    sorted.forEach((car, i) => {
      car.position = i;
    });
  }
  
  getLeaders(count) {
    this.updatePositions();
    const sorted = this.scene.cars.sort((a, b) => (a.position < b.position) ? 1 : -1);
    if(sorted.length <= count)
      return sorted;
    else 
      return sorted.slice(0, count);
  }
}