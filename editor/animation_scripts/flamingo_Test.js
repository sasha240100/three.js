// flamingo.json

var mesh = this.getObjectByName('Test');
mesh.material.morphTargets = true;

var mixer = new THREE.AnimationMixer(mesh);
var action = mixer.clipAction(mesh.geometry.animations[0]);

action.setDuration(1).play();

function update( event ) {
	mixer.update(1 / 60);
}
