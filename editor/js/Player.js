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

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	window.addEventListener( 'mousemove', function ( event ) {

		var rect = player.dom.getBoundingClientRect();

		mouse.x = ( (event.clientX - rect.left) / player.dom.clientWidth ) * 2 - 1;
		mouse.y = - ( (event.clientY - rect.top) / player.dom.clientHeight ) * 2 + 1;

	}, false );

	var listeners = [];

	signals.startPlayer.add( function () {

		listeners = [];

		container.setDisplay( '' );

		player.load( editor.toJSON() );
		player.setSize( container.dom.clientWidth, container.dom.clientHeight );
		player.play();

		const scene = player.scene;
		const camera = player.camera;
		// console.log('player', player);

		var mixer = new THREE.AnimationMixer();

    // @WORK AUTO
		scene.traverse(object => {
			if (
				object.userData
				&& object.userData.__editor
				&& object.userData.__editor.animations
			) {

				// console.log('test', object);

				Object.entries(object.userData.__editor.animations).forEach(data => {
					const name = data[1].alias || data[0];

					let clipObject = (
						object
						&& object.animations
						&& object.animations.find(clip => clip.name === name)
					) || (
						object
						&& object.geometry
						&& object.geometry.animations
						&& object.geometry.animations.find(clip => clip.name === name)
					) || (
						scene
						&& scene.animations
						&& scene.animations.find(clip => clip.name === name)
					);

					const FPS = +data[1].fps || 30;

					if (data[1].alias) {
						clipObject = THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(clipObject));

						if (data[1].startTrim || data[1].endTrim) {
							const startTime = (data[1].startTrim || 0) / FPS;

							clipObject.tracks.forEach(track => {
								track.trim(
									startTime,
									data[1].endTrim ? data[1].endTrim / FPS : Infinity
								);

								track.shift(-startTime);
							});

							clipObject.trim(); //.resetDuration();

							if (data[1].endTrim)
								clipObject.duration = data[1].endTrim / FPS;

							if (data[1].startTrim)
								clipObject.duration -= data[1].startTrim / FPS;
						}
					}

					const action = clipObject && mixer.clipAction(clipObject, object);

					// Duration
					if (data[1].duration)
						action.setDuration(data[1].duration);

					// Loop
					if (typeof data[1].loop === 'boolean')
						action.setLoop(data[1].loop ? THREE.LoopRepeat : THREE.LoopOnce);

					action.clampWhenFinished = true;

					// Triggerer
					switch (data[1].trigger) {
						case 'autostart':
							if (object.material) {

								object.material.morphTargets = true;
								object.material.skinning = true;

							}

							action.play();
							break;
						case 'click':

							if (object.material) {

								object.material.morphTargets = true;
								object.material.skinning = true;

							}

							function handleClickTouch() {

								raycaster.setFromCamera( mouse, camera );

								var objects = [];

								object.traverse( function (obj) {

									objects.push(obj);

								} )

								var intersects = raycaster.intersectObjects( objects );
								console.log('intersects', intersects);
								// console.log('mx', mouse.x, 'my', mouse.y);

								if (intersects[0]) {

									action.play().reset();

								}

							}

							window.addEventListener( 'click', handleClickTouch );

							listeners.push( [ handleClickTouch, "click" ] );

							break;

						case 'none':
							// action.play();
							break;
						default:
							if (object.material) {

								object.material.morphTargets = true;
								object.material.skinning = true;

							}

							action.play();
					}
				});

			} else {

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

				// console.log('scene', scene);
				// console.log('clipObject', clipObject);

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

					// console.log('test', object);
					// console.log('action', action);

					action.play();

				}

			}
		});

		function upd() {
			requestAnimationFrame(upd);
			mixer.update(1/60);

			for (let i = 0; i < mixer._actions.length; i++) {
				const action = mixer._actions[i];
			}
		}

		upd();

	} );

	signals.stopPlayer.add( function () {

		container.setDisplay( 'none' );

		player.stop();
		player.dispose();

		listeners.forEach( function ( listener ) {

			window.removeEventListener( listener[1], listener[0] );

		} )

	} );

	return container;

};
