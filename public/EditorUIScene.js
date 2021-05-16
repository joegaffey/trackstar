class EditorUIScene extends Phaser.Scene {
  
  constructor ()  {
    super({ key: 'UIScene', active: true });
  }
  
  preload() {
  }

  create () {    
    this.editorScene = this.scene.get('TrackBuilderScene');
    this.addTrackButton(0,0);
    this.addTreeButton(1,0);    
    this.addShapeButton(2,0);
    this.addPreviewButton(3, 0);
    this.addRaceButton(4,0);
    
    this.trackButtons = this.add.container(0, 0);
    this.addReverseButton(0, 1);
    this.addCloseLoopButton(1, 1);
        
    this.trackButton.setSelected(true);
  }
  
  update() {    
  }
  
  getButton(text, x, y) {
    const box = this.add.rectangle(x * 130 + 20, y * 55 + 20, 125, 50, 0x000000).setOrigin(0,0);
    box.alpha = 0.6;
    box.text = this.add.text(x * 130 + 35, y * 55 + 35, text, { font: '16px Helvetica', fill: '#aaaaaa' }).setOrigin(0,0);
    box.setInteractive({ draggable: false });
    box.setSelected = selected => {
      if(selected)
        box.fillColor = 0x333366;
      else
        box.fillColor = 0x000000;
    }
    return box;
  }
  
  addTrackButton(x, y) {
    this.trackButton = this.getButton('Track', x, y);
    this.trackButton.on('pointerup', (pointer) => {      
      if(this.editorScene.mode === this.editorScene.TREE_MODE) 
        this.treeButton.setSelected(false);
      this.editorScene.setMode(this.editorScene.TRACK_MODE);
      this.trackButton.setSelected(true);
      this.trackButtons.setVisible(true);
    });
  }
  
  addTreeButton(x, y) {
    this.treeButton = this.getButton('Trees', x, y);
    this.treeButton.on('pointerup', (pointer) => {      
      if(this.editorScene.mode === this.editorScene.TRACK_MODE) {
        this.trackButton.setSelected(false);
        this.trackButtons.setVisible(false);
      }
      this.editorScene.setMode(this.editorScene.TREE_MODE);
      this.treeButton.setSelected(true);
    });
  }
  
  addShapeButton(x, y) {
    this.shapeButton = this.getButton('Shapes', x, y);
    this.shapeButton.on('pointerup', (pointer) => {      
      alert('Coming Soon!');
    });
  }
  
  addPreviewButton(x, y) {
    this.previewButton = this.getButton('Preview', x, y);
    this.previewButton.on('pointerup', (pointer) => {      
      alert('Coming Soon!');
    });
  }
  
  addReverseButton(x, y) {
    this.shapeButton = this.getButton('Reverse', x, y);
    this.trackButtons.add(this.shapeButton);
    this.trackButtons.add(this.shapeButton.text);
    this.shapeButton.on('pointerup', (pointer) => {      
      this.editorScene.reverse();
    });
  }
  
  addCloseLoopButton(x, y) {
    this.closeLoopbutton = this.getButton('Close Loop', x, y);
    this.trackButtons.add(this.closeLoopbutton);
    this.trackButtons.add(this.closeLoopbutton.text);
    this.closeLoopbutton.on('pointerup', (pointer) => {
      if(this.editorScene.track.isOpen) {
        if(this.editorScene.track.points.length > 4)
          this.editorScene.closeLoop();
        else
          alert('Not enough track points!');
      }
    });
  }
  
  addRaceButton(x, y) {
    const button = this.getButton('Go Race!', x, y);
    button.on('pointerup', (pointer) => {
      if(this.editorScene.track.points.length < 5)
        alert('Not enough track points!');
      else if(this.editorScene.track.isOpen)
        alert('Can\'t race on an open circuit.');
      else {
        sendTrack();
      }
    });
  }
}