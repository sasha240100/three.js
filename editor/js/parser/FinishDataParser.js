class FinishDataParser extends DataParser {
  test(featureName) {
    return featureName === 'animations' || featureName === 'button';
  }

  parse(data, events) {
    let object = this.object;
    const scene = this.parser.scene;

    // console.log(data);

    events.on('end', () => {
      if (data.action) {
        switch (data.action) {
          case 'url':
            const url = data.url;
            if (!url) return;

            const win = window.open(url, '_blank');
            win.focus();

            break;
          case 'clip_select':
            const name = data.clipSelect;
            if (!name) return;

            if (data.objectUUID) {
              object = scene.getObjectByProperty('uuid', data.objectUUID);
            }

            // Prevent from looping
            const finishData = Object.assign({}, object.userData.__editor.animations[name]);
            
            if (!finishData.trigger || finishData.trigger === 'none') {
              finishData.trigger = 'autostart';
            } else {
              finishData.clickListener = name;
            }
            // finishData.action = 'none';

            this.parser.animationFeature(object, finishData, name);

          default:

        }
      }
    });

    this.destroy = () => {
      events.off('end');
    };
  }
}
