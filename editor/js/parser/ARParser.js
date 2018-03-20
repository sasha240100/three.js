class ARParser {
  constructor(dom) {
  	this.raycaster = new THREE.Raycaster();
  	this.mouse = new THREE.Vector2();
    this.activeData = null;

  	window.addEventListener( 'mousemove', (event) => {
  		const rect = dom.getBoundingClientRect();

  		this.mouse.x = ( (event.clientX - rect.left) / dom.clientWidth ) * 2 - 1;
  		this.mouse.y = - ( (event.clientY - rect.top) / dom.clientHeight ) * 2 + 1;
  	}, false );

    this.parsers = [
      new AliasDataParser(this),
      new ActionDataParser(this),
      new AudioDataParser(this),
      new FinishDataParser(this),
      new TriggererDataParser(this)
    ];
  }

  getClipFromObject(object, clipName) {
    return (
      object
      && object.animations
      && object.animations.find(clip => clip.name === clipName)
    ) || (
      object
      && object.geometry
      && object.geometry.animations
      && object.geometry.animations.find(clip => clip.name === clipName)
    ) || (
      this.scene
      && this.scene.animations
      && this.scene.animations.find(clip => clip.name === clipName)
    );
  }

  initialize(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    scene.traverse(object => {
      this.featureStack(object, 'animations');
    });
  }

  destroy() {
    this.parsers.forEach(parser => {
      if (parser.destroy)
        parser.destroy();
    });
  }

  featureStack(object, featureName) {
    if (
      object.userData
      && object.userData.__editor
      && object.userData.__editor[featureName]
    ) {
      Object.entries(object.userData.__editor[featureName]).forEach((data) => {
        this.animationFeature(object, data[1], data[0]);
      });
    }
  }

  animationFeature(object, data, name) { // name = optional
    this.activeObject = object;
    this.activeName = name;
    this.activeMixer = new THREE.AnimationMixer();
    this.activeClip = this.getClipFromObject(object, data.alias || name);
    this.activeData = data;

    const events = new Events();

    this.parsers.forEach(parser => {
      if (parser.test('animations') && parser.parseBeforeAction)
        parser.parseBeforeAction();
    });

    this.activeAction = this.activeClip && this.activeMixer.clipAction(this.activeClip, object);

    this.parsers.forEach(parser => {
      if (parser.test('animations') && parser.parse)
        parser.parse(data, events);
    });
  }
}
