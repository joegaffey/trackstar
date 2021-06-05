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
    controlsButton.onclick = () => { 
      Array.from(document.querySelectorAll('.menuContent')).forEach(el => {
        el.classList.remove('active');
      });
      document.querySelector('#controls').classList.add('active');
    };   
    
    const settingsButton = document.querySelector('#settingsButton');
    settingsButton.onclick = () => { 
      Array.from(document.querySelectorAll('.menuContent')).forEach(el => {
        el.classList.remove('active');
      });
      document.querySelector('#settings').classList.add('active');
    };    
  }
  
  toast(text) {
    const el = document.querySelector('#toast');
    el.innerText = text;
    el.classList.add('active');
    setTimeout(() => { 
      el.classList.remove('active');
    }, 3000);
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
}