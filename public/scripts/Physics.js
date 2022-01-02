class Physics {  
  
  static maxPower = 0.2;
  static maxReverse = 0.05;//0.05;
  
  static powerFactor = 0.0005;//0.001;
  static reverseFactor = 0.01;//0.0005;
  static engineBrakingFactor = 0.0005;

  static drag = 0.95;
  static angularDrag = 0.9;//0.95;
  static turnSpeed = 0.002;//0.002

  static surface = {
    TARMAC: 0,
    KERBS: 1,  
    GRASS: 2,
    SAND: 3,
    DIRT: 4,
    BARRIER: 5
  }

  static grass = { 
    type: Physics.surface.GRASS,
    angularDrag: 0.97,
    drag: 0.935,
    skidMarkColor: 0x321A02,
    particleColor: 0x999966,
    particleAlpha: 0.5
  }

  static sand = { 
    type: Physics.surface.SAND,
    angularDrag: 0.85,
    drag: 0.90,
    skidMarkColor: 0xc2b280,
    particleColor: 0xc2b280,
    particleAlpha: 0.5
  }

  static tarmac = { 
    type: Physics.surface.TARMAC,
    angularDrag: 0.9,
    drag: 0.95,
    skidMarkColor: 0x333333,
    particleColor: 0xFFFFFF,
    particleAlpha: 1
  }
  
  static barrier = { 
    type: Physics.surface.BARRIER
  }
}