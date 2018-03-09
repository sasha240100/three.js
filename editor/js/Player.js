/**
 * @author mrdoob / http://mrdoob.com/
 */

var context = THREE.AudioContext.getContext();

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

    // @WORK AUTO
		scene.traverse(object => {
			var mixer = new THREE.AnimationMixer(), mixerHasAnimation = false;

			if (
				object.userData
				&& object.userData.__editor
				&& object.userData.__editor.animations
			) {

				// console.log('test', object);

				Object.entries(object.userData.__editor.animations).forEach(data => {
					(function animationByData(data, playTriggerer = false) {
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
								const endTime = data[1].endTrim ? data[1].endTrim / FPS : Infinity;

								clipObject.tracks.forEach(track => {
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

									console.log(track.name + ' closestToStart', closestToStart);
									console.log(track.name + ' closestToEnd', closestToEnd);

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

								clipObject.trim(); //.resetDuration();

								clipObject.tracks.forEach(track => {
									if (track.hasStart) track.times[0] = startTime;
									if (track.hasEnd) track.times[track.times.length - 1] = endTime;

									track.shift(-startTime);

									if (track.times.length < 2)
										clipObject.tracks = clipObject.tracks.filter(t => t != track);
								});

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

						// Set default looping mode.
						action.setLoop(THREE.LoopOnce);

						// Loop
						if (typeof data[1].loop === 'boolean')
							action.setLoop(data[1].loop ? THREE.LoopRepeat : THREE.LoopOnce);

						action.clampWhenFinished = true;

						// End
						function onEnd() {
							if (data[1].action) {
								switch (data[1].action) {
									case 'url':
										const url = data[1].url;
										if (!url) return;

										const win = window.open(url, '_blank');
										win.focus();

										break;
									case 'clip_select':
										const clipSelect = data[1].clipSelect;
										if (!clipSelect) return;

										// Prevent from looping
										const endData = clone(object.userData.__editor.animations[clipSelect]);
										endData.action = 'none';

										animationByData(
											[clipSelect, endData],
											// 'autostart'
										);

									default:

								}
							}
						}

						function onPlay() {
							if (data[1].audio) {
								let delay = 0;
								// var source = window._source = context.createBufferSource();

								// create an AudioListener and add it to the camera
								const listener = new THREE.AudioListener();
								camera.add(listener);

								if (typeof data[1].audioVolume === 'number')
									listener.setMasterVolume(data[1].audioVolume);

								if (typeof data[1].audioDelay === 'number')
									delay = +data[1].audioDelay;

								// create the PositionalAudio object (passing in the listener)
								const sound = new THREE.PositionalAudio( listener );
								window._sound = sound;

								// load a sound and set it as the PositionalAudio object's buffer
								const audioLoader = new THREE.AudioLoader();
								// audioLoader.load( 'sounds/song.ogg', function( buffer ) {
								context.decodeAudioData(data[1].audio.slice(), function (audioBuffer) {
									sound.setBuffer(audioBuffer);
									sound.setRefDistance(20);
									setTimeout(() => sound.play(), delay * 1000);
								});

								object.add(sound);
							}

							action.getMixer().addEventListener('finished', (e) => {
								if (e.action === action)
									onEnd();
							});
						}

						// Triggerer
						switch (playTriggerer || data[1].trigger) {
							case 'autostart':
								if (object.material) {

									object.material.morphTargets = true;
									object.material.skinning = true;

								}

								mixerHasAnimation = true;

								mixer.stopAllAction();
								action.play();
								onPlay();
								break;
							case 'click':

								mixerHasAnimation = true;

								if (object.material) {

									object.material.morphTargets = true;
									object.material.skinning = true;

								}

								function handleClickTouch() {

									raycaster.setFromCamera( mouse, camera );

									var objects = [];

									(data[1].target ? scene.getObjectByName(data[1].target) : object)
										.traverse( function (obj) {

											objects.push(obj);

										} )

									var intersects = raycaster.intersectObjects( objects );
									console.log('intersects', intersects);
									// console.log('mx', mouse.x, 'my', mouse.y);

									if (intersects[0]) {

										mixer.stopAllAction();
										action.play().reset();
										onPlay();

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

								mixerHasAnimation = true;

								mixer.stopAllAction();
								action.play();
								onPlay();
						}
					})(data);
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

			function upd() {
				requestAnimationFrame(upd);
				mixer.update(1/60);

				for (let i = 0; i < mixer._actions.length; i++) {
					const action = mixer._actions[i];
				}
			}

			if (mixerHasAnimation) upd();
		});

	} );

	signals.stopPlayer.add( function () {

		if (window._sound) window._sound.stop();

		container.setDisplay( 'none' );

		player.stop();
		player.dispose();

		listeners.forEach( function ( listener ) {

			window.removeEventListener( listener[1], listener[0] );

		} )

	} );

	return container;

};
