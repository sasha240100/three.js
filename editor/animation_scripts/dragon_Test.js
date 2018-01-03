var anims = this.animations;

function scaleWithAnimation(geometry, scale) {
  // 1. Scale geometry
  geometry.scale(scale, scale, scale);

  // 2. Scale bones
  geometry.bones.forEach((bone) => {
    bone.pos[0] *= scale;
    bone.pos[1] *= scale;
    bone.pos[2] *= scale;
  });

  // 3. Scale animation values
  anims.forEach(anim => {
    anim.tracks
      .filter(track => track.name.indexOf('.position') > 0)
      .forEach(track => {
        for (let i = 0; i < track.values.length; i++)
          track.values[i] *= scale;
      });
  });

  return geometry;
}


// dragon.js

var test = this.getObjectByName('Test');
test.material.skinning = true; // Important!
test.geometry = scaleWithAnimation(test.geometry, 0.01);
test.geometry.skeleton = test.skeleton;

console.log('test', test);

var mixer = new THREE.AnimationMixer(test);
var action = mixer.clipAction(anims[0]);

action.play();

function update( event ) {
	mixer.update(1 / 60);
}
