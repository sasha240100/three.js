class ActionDataParser extends DataParser {
  test(featureName) {
    return featureName === 'animations';
  }

  parse() {
    const {
      duration,
      loop
    } = this.data();

    // Duration
    if (duration)
      this.action.setDuration(duration);

    // Set default looping mode.
    this.action.setLoop(THREE.LoopOnce);

    // Loop
    if (typeof loop === 'boolean')
      this.action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);

    this.action.clampWhenFinished = true;
  }
}
