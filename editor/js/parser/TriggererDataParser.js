class TriggererDataParser extends DataParser {
  constructor(parser) {
    super(parser);
    this.listeners = [];
    this.clickListeners = {};
    this.activeClickListenerName = [];
    this.firstClickListenerName = [];

    function handleClickTouch(e) {
      for (let targetName in this.clickListeners) {
        if (this.activeClickListenerName[targetName] || this.firstClickListenerName[targetName]) {
          if (this.clickListeners[targetName][this.activeClickListenerName[targetName]]) {
            this.clickListeners[targetName][this.activeClickListenerName[targetName] || this.firstClickListenerName[targetName]](e);
          } else {
            this.clickListeners[targetName][this.firstClickListenerName[targetName]](e);
          }
        }
      }
    }

    window.addEventListener('click', handleClickTouch.bind(this));

    this.destroy = () => {
      this.listeners.forEach(listener => {
  			window.removeEventListener('click', handleClickTouch);
  		});
    }
  }

  test(featureName) {
    return featureName === 'animations';
  }

  destroy() {}

  parse(data, events) {
    const object = this.object;
    const action = this.action;
    const mixer = this.mixer;
    const raycaster = this.parser.raycaster;
    const mouse = this.parser.mouse;
    const camera = this.parser.camera;
    const scene = this.parser.scene;

    let hasAnimation = true;

    const {target} = this.data();
    const targetName = target || object.name || '__default';

    switch (this.data('trigger')) {
      case 'autostart':
        if (object.material) {
          object.material.morphTargets = true;
          object.material.skinning = true;
        }

        mixer.stopAllAction();
        action.play();
        events.emit('play');
        break;
      case 'click':
        if (object.material) {
          object.material.morphTargets = true;
          object.material.skinning = true;
        }

        if (!this.clickListeners[targetName])
          this.clickListeners[targetName] = {};

        this.clickListeners[targetName][this.name] = (e) => {
          if (e.target !== document.querySelector('#player canvas')) return;

          raycaster.setFromCamera(mouse, camera);

          var objects = [];

          (target ? scene.getObjectByName(target) : object)
            .traverse((obj) => {
              objects.push(obj);
            })

          var intersects = raycaster.intersectObjects(objects);

          if (intersects[0]) {
            mixer.stopAllAction();
            action.play().reset();
            events.emit('play');
          }
        }

        if (!this.firstClickListenerName[targetName]) {
          this.firstClickListenerName[targetName] = this.name;
        }

        break;

      case 'none':
        hasAnimation = false;
        break;
      default:
        if (object.material) {
          object.material.morphTargets = true;
          object.material.skinning = true;
        }

        mixer.stopAllAction();
        action.play();
        events.emit('play');
    }

    function update() {
      requestAnimationFrame(update);
      mixer.update(1/60);
    }

    if (hasAnimation) update();

    action.getMixer().addEventListener('finished', (e) => {
      if (e.action === action)
        events.emit('end');
    });

    if (data.clickListener) {
      this.activeClickListenerName[targetName] = data.clickListener;
    }
  }
}
