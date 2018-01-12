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

	function scaleWithAnimation(object, geometry, scale, clipObject) {
	  // 1. Scale geometry
	  geometry.scale(scale, scale, scale);

	  // 2. Scale bones
	  geometry.bones.forEach((bone) => {
	    bone.pos[0] *= scale;
	    bone.pos[1] *= scale;
	    bone.pos[2] *= scale;
	  });

	  // 3. Scale animation values
	  clipObject.tracks
      .filter(track => track.name.indexOf('.position') > 0)
      .forEach(track => {
        for (let i = 0; i < track.values.length; i++)
          track.values[i] *= scale;
      });

		const bones = object.initBones();
		const skeleton = new THREE.Skeleton(bones);
		object.bind(skeleton);

	  return geometry;
	}

	signals.startPlayer.add( function () {

		container.setDisplay( '' );

		player.load( editor.toJSON() );
		player.setSize( container.dom.clientWidth, container.dom.clientHeight );
		player.play();

		const scene = player.scene;

		var mixer = new THREE.AnimationMixer();

    // @WORK AUTO
		scene.traverse(object => {
			const clipObject = (
				object
				&& object.animations
				&& object.animations[0]
			) || (
				object
				&& object.geometry
				&& object.geometry.animations
				&& object.geometry.animations[0]
			) || (() => {
				const name = (
					object.uuid in editor.animations
					&& editor.animations[object.uuid][0].name
			  ) || (
					object.geometry
					&& (object.geometry.uuid in editor.animations)
					&& editor.animations[object.geometry.uuid][0].name
				);

				return scene.animations
					? scene.animations.find(clip => clip.name === name)
					: false;
			})();

			console.log('scene', scene);
			console.log('clipObject', clipObject);

			if (
				object.userData
				&& 'animationScale' in object.userData
				&& object.geometry
				&& clipObject
			) {
				object.geometry = scaleWithAnimation(
					object,
					object.geometry,
					object.userData.animationScale,
					clipObject
				);
			}

			const action = clipObject && mixer.clipAction(clipObject, object);

			if (object && object.geometry && object.geometry.skeleton)
				object.skeleton = object.geometry.skeleton;

			if (action && object !== scene) {
				if (object.material) {
					object.material.morphTargets = true;
					object.material.skinning = true;
				}

				console.log('test', object);
				console.log('action', action);

				action.play();
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
