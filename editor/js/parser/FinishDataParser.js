class FinishDataParser extends DataParser {
  test(featureName) {
    return featureName === 'animations';
  }

  parse(data, events) {
    const object = this.object;

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

            // Prevent from looping
            const finishData = Object.create(object.userData.__editor.animations[name]);
            finishData.clickListener = name;
            // finishData.action = 'none';

            this.parser.animationFeature(object, finishData, name);

          default:

        }
      }
    });
  }
}
