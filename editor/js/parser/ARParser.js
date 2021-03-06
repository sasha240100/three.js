let destroyableEvents = [];

class ARParser {
  static Events() {
    const ev = new Events();
    destroyableEvents.push(ev);

    return ev;
  }

  constructor(dom) {
  	this.raycaster = new THREE.Raycaster();
  	this.mouse = new THREE.Vector2();
    this.activeData = null;
    this.destroyers = [];

  	window.addEventListener('mousemove', (event) => {
  		const rect = dom.getBoundingClientRect();

  		this.mouse.x = ( (event.clientX - rect.left) / dom.clientWidth ) * 2 - 1;
  		this.mouse.y = - ( (event.clientY - rect.top) / dom.clientHeight ) * 2 + 1;
  	}, false );

    this.parsers = [
      new ButtonDataParser(this),
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
      this.featureStack(object, 'animations', this.animationFeature.bind(this));
      this.featureObject(object, 'button', this.buttonFeature.bind(this));
    });
  }

  destroy() {
    this.parsers.forEach(parser => {
      if (parser.destroy)
        parser.destroy();
    });
  }

  checkFeatureExist(object, featureName) {
    return (
      object.userData
      && object.userData.__editor
      && object.userData.__editor[featureName]
    );
  }

  /*
   *  featureName: {
   *    data[0]: data[1]
   *  }
   */
  featureStack(object, featureName, featureParser) {
    if (this.checkFeatureExist(object, featureName)) {
      Object.entries(object.userData.__editor[featureName]).forEach((data) => {
        featureParser(object, data[1], data[0]);
      });
    }
  }

  /*
   *  featureName: data
   */
  featureObject(object, featureName, featureParser) {
    if (this.checkFeatureExist(object, featureName)) {
      featureParser(object, object.userData.__editor[featureName]);
    }
  }

  runParsers(featureName, args, methodName = 'parse') {
    this.parsers.forEach(parser => {
      if (parser.test(featureName) && parser[methodName]) {
        parser.featureName = featureName;
        parser[methodName](...(args || []));

        if (parser.destroy)
          this.destroyers.push(parser.destroy.bind(parser));
      }
    });
  }

  animationFeature(object, data, name) { // name = optional
    this.activeObject = object;
    this.activeName = name;
    this.activeMixer = new THREE.AnimationMixer();
    this.activeClip = this.getClipFromObject(object, data.alias || name);
    this.activeData = data;

    if (!this.activeClip) return;

    const events = ARParser.Events();

    this.runParsers('animations', [], 'parseBeforeAction');
    this.activeAction = this.activeClip && this.activeMixer.clipAction(this.activeClip, object);
    this.runParsers('animations', [data, events]);
  }

  buttonFeature(object, data) { // name = optional
    this.activeObject = object;
    this.activeData = data;
    const events = ARParser.Events();

    this.runParsers('button', [data, events]);

    // events.emit('play');
  }

  destroy() {
    this.destroyers.forEach(destroy => destroy());
    this.destroyers = [];
  }
}
