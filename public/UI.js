class UI {
  
  constructor(scene) {
    this.scene = scene;
    this.banner = true;
    this.init();
  }  
  
  init() {
    const resumeButton = document.querySelector('#resumeButton');
    resumeButton.onclick = () => { this.scene.pause(); };
    
    const restartButton = document.querySelector('#restartButton');
    restartButton.onclick = () => { 
      this.scene.reset();
      this.scene.pause(); 
      this.scene.startRace();
      if(!this.scene.race.inProgress)
        restartButton.innerText = 'Restart';
    };
    
    const menuButton = document.querySelector('#menuButton');
    menuButton.onclick = () => { 
      this.pauseMenu();
      this.mainMenu(); 
    };
    
    const hideMenuButton = document.querySelector('#hideMenuButton');
    hideMenuButton.onclick = () => { 
      this.mainMenu();
      this.pauseMenu()
    };    
    
    const controlsButton = document.querySelector('#controlsButton');
    controlsButton.onclick = () => { this.switchMenuContent('controls'); };
    
    const settingsButton = document.querySelector('#settingsButton');
    settingsButton.onclick = () => { this.switchMenuContent('settings'); };
    
    const perfButton = document.querySelector('#perfButton');
    perfButton.onclick = () => { this.switchMenuContent('performance'); };
    
    const raceButton = document.querySelector('#raceButton');
    raceButton.onclick = () => { this.switchMenuContent('race'); };  
    
    const closeResultsButton = document.querySelector('#closeResults');
    closeResultsButton.onclick = () => { this.hideLeaderboard('race'); };  
  }
  
  switchMenuContent(content) {
    Array.from(document.querySelectorAll('.menuContent')).forEach(el => {
      el.classList.remove('active');
    });
    document.querySelector('#' + content).classList.add('active');
  }
  
  toast(text) {
    const el = document.querySelector('#toast');
    el.innerText = text;
    el.classList.add('active');
    setTimeout(() => { 
      el.classList.remove('active');
    }, 3000);
  }
  
  loaderText(text) {
    document.querySelector('#loaderText').innerText = text;
  }
  
  pauseMenu() {
    const el = document.querySelector('#pauseMenu');
    el.classList.toggle('active');
  }
  
  mainMenu() {
    const el = document.querySelector('#mainMenu');
    el.classList.toggle('active');
  }
  
  hideSpinner() {
    document.querySelector('.spinner').style.display = 'none';
  }  
  
  showLeaderboard() {
    this.updateLeaders();
    const el = document.querySelector('#results');
    if(!el.classList.contains('active'))
      el.classList.add('active');
  }
  
  hideLeaderboard() {
    const el = document.querySelector('#results');
    el.classList.remove('active');
  }
  
  toggleLeaderboard() {
    this.updateLeaders();
    const el = document.querySelector('#results');
    el.classList.toggle('active');
  }
  
  updateLeaders() {
    const el = document.querySelector('#leadersList');
    el.innerHTML = '';
    let leaders = this.scene.race.getLeaders(this.scene.cars.length);
    leaders.forEach((car)=>{
      let li = document.createElement('li');
      li.innerText = car.driver;
      el.appendChild(li);
    });
  }
}