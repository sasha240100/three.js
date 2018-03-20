class TriggererDataParser extends DataParser {
  constructor(parser) {
    super(parser);
    this.listeners = [];
    this.clickListeners = [];
    this.activeClickListenerName = null;
    this.firstClickListenerName = null;

    function handleClickTouch(e) {
      if (this.activeClickListenerName || this.firstClickListenerName) {
        if (this.clickListeners[this.activeClickListenerName]) {
          this.clickListeners[this.activeClickListenerName || this.firstClickListenerName](e);
        } else {
          this.clickListeners[this.firstClickListenerName](e);
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

        const {target} = this.data();

        this.clickListeners[this.name] = (e) => {
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

        if (!this.firstClickListenerName) {
          this.firstClickListenerName = this.name;
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
      this.activeClickListenerName = data.clickListener;
    }
  }
}
