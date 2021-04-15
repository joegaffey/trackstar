class EditorUIScene extends Phaser.Scene {
  
  constructor ()  {
    super({ key: 'UIScene', active: true });
  }
  
  preload() {
  }

  create () {    
    this.editorScene = this.game.scene.scenes[0];
    this.addControlPointsButton(0);
    this.addCloseLoopButton(1);
    this.addRaceButton(2);
  }
  
  update() {    
  }
  
  addControlPointsButton(position) {
    const box = this.add.rectangle(position * 130 + 20, 20, 125, 50, 0x000000).setOrigin(0,0);
    box.alpha = 0.6;
    this.controlsOnText = this.add.text(position * 130 + 35, 35, 'Controls Off', { font: '16px Helvetica', fill: '#aaaaaa' }).setOrigin(0,0);;
    box.setInteractive({ draggable: false });
    box.on('pointerup', (pointer) => {
      this.editorScene.showControls = !this.editorScene.showControls;
      if(this.editorScene.showControls)
        this.controlsOnText.setText('Controls Off');
      else
        this.controlsOnText.setText('Controls On');
      this.editorScene.drawTrack();
    });
  }
  
  addCloseLoopButton(position) {
    const box = this.add.rectangle(position * 130 + 20, 20, 125, 50, 0x000000).setOrigin(0,0);
    box.alpha = 0.6;
    const closeLoopText = this.add.text(position * 130 + 35, 35, 'Close Loop', { font: '16px Helvetica', fill: '#aaaaaa' }).setOrigin(0,0);;
    box.setInteractive({ draggable: false });
    box.on('pointerup', (pointer) => {
      if(this.editorScene.track.points.length > 4)
        this.editorScene.closeLoop();
      else
        alert('Not enough points! Click on the background.')
    });
  }
  
   addRaceButton(position) {
    const box = this.add.rectangle(position * 130 + 20, 20, 125, 50, 0x000000).setOrigin(0,0);
    box.alpha = 0.6;
    const closeLoopText = this.add.text(position * 130 + 35, 35, 'Go Race!', { font: '16px Helvetica', fill: '#aaaaaa' }).setOrigin(0,0);;
    box.setInteractive({ draggable: false });
    box.on('pointerup', (pointer) => {
      if(this.editorScene.track.points.length < 5)
        alert('Not enough points! Click on the background.');
      else if(this.editorScene.track.isOpen)
        alert('Can\'t race on an open circuit.');
      else
        alert('Coming soon :)');
    });
  }
}