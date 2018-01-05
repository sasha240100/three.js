/**
 * @author mrdoob / http://mrdoob.com/
 */

var Player = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'player' );
	container.setPosition( 'absolute' );
	container.setDisplay( 'none' );

	//

	var player = new APP.Player();
	container.dom.appendChild( player.dom );

	window.addEventListener( 'resize', function () {

		player.setSize( container.dom.clientWidth, container.dom.clientHeight );

	} );

	signals.startPlayer.add( function () {

		container.setDisplay( '' );

		player.load( editor.toJSON() );
		player.setSize( container.dom.clientWidth, container.dom.clientHeight );
		player.play();

		const scene = player.scene;

		var mixer = new THREE.AnimationMixer();

		scene.traverse(object => {
			if (object.geometry && object.geometry.animations) {
				object.material.morphTargets = true;
				var action = mixer.clipAction(object.geometry.animations[0], object);
				action.setDuration(1).play();
			}
		})

		function upd() {
			requestAnimationFrame(upd);
			mixer.update(1/60);
		}

		upd();

	} );

	signals.stopPlayer.add( function () {

		container.setDisplay( 'none' );

		player.stop();
		player.dispose();

	} );

	return container;

};
