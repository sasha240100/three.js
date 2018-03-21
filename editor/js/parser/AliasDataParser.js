class AliasDataParser extends DataParser {
  test(featureName) {
    return featureName === 'animations' && this.data('alias');
  }

  parseBeforeAction() {
    this.clip = THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(this.clip));

    // console.log('clip_parsed');

    const data = this.data();

    if (data.startTrim || data.endTrim) {
      const FPS = +this.data('fps') || 30;

      const startTime = (data.startTrim || 0) / FPS;
      const endTime = data.endTrim ? data.endTrim / FPS : Infinity;

      this.clip.tracks.forEach(track => {
        const l = track.times.length;

        let closestToStart = 0, closestToStartIndex = 0;
        let closestToEnd = Infinity, closestToEndIndex = l - 1;

        track.times.forEach((v, i) => {
          //  5 - 4  < 5 -
          if (Math.abs(v - startTime) < Math.abs(closestToStart - startTime) && v < startTime) {
            closestToStart = v;
            closestToStartIndex = i;
            track.hasStart = true;
          }

          if (Math.abs(v - endTime) < Math.abs(closestToEnd - endTime) && v > endTime) {
            closestToEnd = v;
            closestToEndIndex = i;
            track.hasEnd = true;
          }
        });

        track.trim(
          closestToStart,
          closestToEnd
        );

        const startTimeStep = THREE.Math.smoothstep(startTime, track.times[0], track.times[1]);
        const endTimeStep = THREE.Math.smoothstep(endTime, track.times[l - 2], track.times[l - 1]);

        switch (track.ValueTypeName) {
          case 'vector': {
            track.values[0] = THREE.Math.lerp(track.values[0], track.values[3], startTimeStep);
            track.values[1] = THREE.Math.lerp(track.values[1], track.values[4], startTimeStep);
            track.values[2] = THREE.Math.lerp(track.values[2], track.values[5], startTimeStep);

            const lIndex = (l - 1) * 3;

            track.values[lIndex + 0] = THREE.Math.lerp(track.values[lIndex - 3], track.values[lIndex + 0], endTimeStep);
            track.values[lIndex + 1] = THREE.Math.lerp(track.values[lIndex - 2], track.values[lIndex + 1], endTimeStep);
            track.values[lIndex + 2] = THREE.Math.lerp(track.values[lIndex - 1], track.values[lIndex + 2], endTimeStep);

            break;
          } case 'quaternion': {
            track.values[0] = THREE.Math.lerp(track.values[0], track.values[4], startTimeStep);
            track.values[1] = THREE.Math.lerp(track.values[1], track.values[5], startTimeStep);
            track.values[2] = THREE.Math.lerp(track.values[2], track.values[6], startTimeStep);
            track.values[3] = THREE.Math.lerp(track.values[3], track.values[7], startTimeStep);

            const lIndex = (l - 1) * 4;

            track.values[lIndex + 0] = THREE.Math.lerp(track.values[lIndex - 4], track.values[lIndex + 0], endTimeStep);
            track.values[lIndex + 1] = THREE.Math.lerp(track.values[lIndex - 3], track.values[lIndex + 1], endTimeStep);
            track.values[lIndex + 2] = THREE.Math.lerp(track.values[lIndex - 2], track.values[lIndex + 2], endTimeStep);
            track.values[lIndex + 3] = THREE.Math.lerp(track.values[lIndex - 1], track.values[lIndex + 3], endTimeStep);

            break;
          }
          default:

        }
      });

      this.clip.trim(); //.resetDuration();

      this.clip.tracks.forEach(track => {
        if (track.hasStart) track.times[0] = startTime;
        if (track.hasEnd) track.times[track.times.length - 1] = endTime;

        track.shift(-startTime);

        if (track.times.length < 2)
          this.clip.tracks = this.clip.tracks.filter(t => t != track);
      });

      console.log(data, this.clip.tracks);

      if (data.endTrim)
        this.clip.duration = data.endTrim / FPS;

      if (data.startTrim)
        this.clip.duration -= data.startTrim / FPS;
    }
  }
}
