// pump.json

var anims = this.animations;
var test = this.getObjectByName('Test');

var mixer = new THREE.AnimationMixer(test);
var action = mixer.clipAction(anims[0], test);

action.play();

function update( event ) {
	mixer.update(1 / 60);
}
