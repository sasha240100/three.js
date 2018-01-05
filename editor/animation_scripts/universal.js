// flamingo.json

var mesh = this.getObjectByName('flamingo.js');
// mesh.material.morphTargets = true;

var mixer = new THREE.AnimationMixer();

this.traverse(mesh => {
	mesh.material.morphTargets = true;

	const clip = (
        mesh
        && mesh.animations
        && mesh.animations[0]
      ) || (
        mesh
        && mesh.geometry
        && mesh.geometry.animations
        && mesh.geometry.animations[0]
      ) || (
        this.animations
        this.animations[0]
			);

	mixer.clipAction(clip, mesh);
});


console.log('animat', mesh.geometry.animations);
var action = mixer.clipAction(mesh.geometry.animations[0]);

action.setDuration(1).play();

function update( event ) {
	console.log(mixer)
	mixer.update(1 / 60);
}
