const context = THREE.AudioContext.getContext();

// TODO: add destroy()
class AudioDataParser extends DataParser {
  test(featureName) {
    return featureName === 'animations' || featureName === 'button';
  }

  parse(data, events) {
    const {
      audio,
      audioVolume,
      audioDelay
    } = data;

    const camera = this.parser.camera;
    const object = this.object;
    const action = this.data('action');
    const allowAudio = (this.featureName === 'button' && action === 'audio') || this.featureName !== 'button';

    events.on('play', () => {
      if (audio && allowAudio) { // TODO: test() audio
        let delay = 0;
        // var source = window._source = context.createBufferSource();

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add(listener);

        if (typeof audioVolume === 'number')
          listener.setMasterVolume(audioVolume);

        if (typeof audioDelay === 'number')
          delay = +audioDelay;

        // create the PositionalAudio object (passing in the listener)
        const sound = new THREE.PositionalAudio( listener );

        // load a sound and set it as the PositionalAudio object's buffer
        const audioLoader = new THREE.AudioLoader();
        // audioLoader.load( 'sounds/song.ogg', function( buffer ) {
        // console.log(data.audio.slice());
        context.decodeAudioData(new Uint8Array(data.audio.slice()).buffer, function (audioBuffer) {
          sound.setBuffer(audioBuffer);
          sound.setRefDistance(20);
          setTimeout(() => sound.play(), delay * 1000);
        });

        object.add(sound);
      }
    })

    this.destroy = () => {
      events.off('play');
    };
  }
}
