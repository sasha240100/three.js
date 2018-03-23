class ButtonDataParser extends DataParser {
  test(featureName) {
    return featureName === 'button';
  }

  parse(data, events) {
    // function onClick
    this._object = this.object;
    this._events = events;

    function onClick(e) {
      // console.log(e);
      if (e.target !== document.querySelector('#player canvas')) return;

      const object = this._object;
      const events = this._events;
      const raycaster = this.parser.raycaster;
      const mouse = this.parser.mouse;
      const camera = this.parser.camera;
      const scene = this.parser.scene;

      raycaster.setFromCamera(mouse, camera);

      const objects = [];

      object.traverse((obj) => {
        objects.push(obj);
      });

      const intersects = raycaster.intersectObjects(objects);

      if (intersects[0]) {
        events.emit('play');
        events.emit('end');
      }
    }

    const onClickCallback = onClick.bind(this);

    window.addEventListener('click', onClickCallback);

    this.destroy = () => {
      window.removeEventListener('click', onClickCallback);
    }
  }
}
