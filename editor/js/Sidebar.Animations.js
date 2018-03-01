/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animations = function ( editor ) {

	var signals = editor.signals;
	var activeObject, activeClip, activeClipName;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setDisplay( 'none' );

	// outliner

	function buildOption( clip, aliasName, aliasData ) {

		var option = document.createElement( 'div' );
		option.draggable = false;
		option.innerHTML = buildHTML( clip, aliasName );
		option.value = aliasName ? {
			clip,
			aliasName,
			aliasData
		} : clip;

		return option;

	}

	function buildHTML( clip, aliasName ) {

		var html = '<span class="type clip"></span> ' + (aliasName || clip.name);

		if (aliasName)
			html += ' <span class="type alias"></span> ' + clip.name;

		return html;

	}

	var outliner = new UI.Outliner( editor );
	outliner.setId( 'outliner-animation' );

	// options.push( buildOption( camera, false ) );
	// console.log(editor.selected);

	outliner.onChange( function () {

		updateUI( outliner.getValue() );

	} );

	function updateOutliner( object ) {
		var animations = object.animations
			|| (
				object.geometry
				&& object.geometry.animations
			) || (
				editor.animations
				&& editor.animations[ object.uuid ]
			) || (
				editor.animations
				&& object.geometry
				&& editor.animations[ object.geometry.uuid ]
			);

		var options = [];

		outliner.setOptions([]);
		container.setDisplay( 'none' );
		if (!animations) return;

		container.setDisplay( '' );

		animations.forEach(clip => {
			options.push( buildOption( clip ) );

			if (
				object.userData
				&& object.userData.__editor
				&& object.userData.__editor.animations
			) {
				Object.entries(object.userData.__editor.animations).forEach(([name, data]) => {
					if (data.alias && data.alias === clip.name) {
						options.push( buildOption( clip, name, data ) );
					}
				})
			}
		});
		// console.log(animations);

		outliner.setOptions( options );
	}

	// triggererRow

	var triggererRow = new UI.Row();
	triggererRow.setDisplay( 'none' );
	var triggerer = new UI.Select().setOptions( {

		'none': 'None',
		'autostart': 'Autostart',
		'click': 'Click / Touch',
		'button': 'Button'

	} ).setWidth( '150px' ).setFontSize( '12px' ).setValue( 'autostart' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			const triggerName = e.target.value.toLowerCase();

			if (triggerName == 'click')
				targetObjectRow.setDisplay( '' );
			else
				targetObjectRow.setDisplay( 'none' );

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							trigger: e.target.value.toLowerCase()
						}
					}
				}
			});
		}
	);

	triggererRow.add( new UI.Text( 'Triggerer' ).setWidth( '90px' ) );
	triggererRow.add( triggerer );

	// target object Row
	var targetObjectRow = new UI.Row();
	targetObjectRow.setDisplay( 'none' );

	var targetObject = new UI.Input().setWidth( '102px' ).setFontSize( '12px' ).setValue( '' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							target: e.target.value
						}
					}
				}
			});
		}
	);

	targetObjectRow.add( new UI.Text( 'Target' ).setWidth( '90px' ) );
	targetObjectRow.add( targetObject );

	// clipDurationRow

	var clipDurationRow = new UI.Row();
	clipDurationRow.setDisplay( 'none' );
	var clipDuration = new UI.Number().setWidth( '50px' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							duration: +e.target.value.toLowerCase()
						}
					}
				}
			});
		}
	);

	clipDurationRow.add( new UI.Text( 'Duration' ).setWidth( '90px' ) );
	clipDurationRow.add( clipDuration );

	// loopRow

	var loopRow = new UI.Row();
	loopRow.setDisplay( 'none' );
	var loop = new UI.Checkbox().setValue(false).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							loop: e.target.checked
						}
					}
				}
			});
		}
	);

	loopRow.add( new UI.Text( 'Loop' ).setWidth( '90px' ) );
	loopRow.add( loop );

	// clipTrimRow

	var clipTrimRow = new UI.Row();
	clipTrimRow.setDisplay( 'none' );
	var clipStartTrim = new UI.Number().setPrecision(0).setValue(0).setWidth( '50px' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							startTrim: +Number(e.target.value).toFixed()
						}
					}
				}
			});
		}
	);

	var clipEndTrim = new UI.Number().setPrecision(0).setWidth( '50px' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							endTrim: +Number(e.target.value).toFixed()
						}
					}
				}
			});
		}
	);

	var clipFPS = new UI.Number().setPrecision(1).setValue(30).setWidth( '50px' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							fps: +Number(e.target.value).toFixed()
						}
					}
				}
			});
		}
	);

	clipTrimRow.add( new UI.Text( 'Trim:' ).setWidth( '60px' ) );
	clipTrimRow.add( new UI.Text( 'start' ).setWidth( '30px' ) );
	clipTrimRow.add( clipStartTrim );
	clipTrimRow.add( new UI.Text( 'end' ).setWidth( '30px' ) );
	clipTrimRow.add( clipEndTrim );
	clipTrimRow.add( new UI.Text( 'fps' ).setWidth( '30px' ) );
	clipTrimRow.add( clipFPS );

	// target object Row
	var urlRow = new UI.Row();
	urlRow.setDisplay( 'none' );

	var url = new UI.Input().setWidth( '182px' ).setFontSize( '12px' ).setValue( '' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							url: e.target.value
						}
					}
				}
			});
		}
	);

	urlRow.add( new UI.Text( 'URL:' ).setWidth( '90px' ) );
	urlRow.add( url );

	// target object Row
	var clipSelectRow = new UI.Row();
	clipSelectRow.setDisplay( 'none' );

	var clipSelect = new UI.Select().setWidth( '182px' ).setFontSize( '12px' ).setValue( '' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							clipSelect: e.target.value
						}
					}
				}
			});
		}
	);

	function updateClipSelect() {
		if (!activeObject || !activeClip) return;

		const options = outliner.options.map(tag => tag.innerText.split(' ')[1]);

		clipSelect.setOptions(
			options.reduce(
				(obj, option) => (obj[option] = option, obj),
				{}
			)
		);
	}

	clipSelectRow.add( new UI.Text( 'Select clip:' ).setWidth( '90px' ) );
	clipSelectRow.add( clipSelect );

	// Animation end row

	var animEndRow = new UI.Row();
	animEndRow.setDisplay( 'none' );
	var animEnd = new UI.Select().setOptions( {

		'none': 'none',
		'url': 'URL',
		'clip_select': 'Clip select',
		'load_scene': 'Load scene'

	} ).setWidth( '150px' ).setFontSize( '12px' ).setValue( 'none' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			const actionName = e.target.value.toLowerCase();

			urlRow.setDisplay( 'none' );
			clipSelectRow.setDisplay( 'none' );

			switch (actionName) {
				case 'url':
					urlRow.setDisplay( '' );
					break;
				case 'clip_select':
					clipSelectRow.setDisplay( '' );
					break;

				default:

			}

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							action: actionName === 'none' ? false : actionName
						}
					}
				}
			});
		}
	);

	animEndRow.add( new UI.Text( 'Animation ends with:' ).setWidth( '90px' ) );
	animEndRow.add( animEnd );

	var aliasRow = new UI.Row();
	aliasRow.setDisplay( 'none' );

	var aliasName = new UI.Input().setWidth( '102px' ).setFontSize( '12px' ).setValue( '' );

	var alias = new UI.Button( 'Make alias' ).setMarginLeft( '7px' ).onClick(
		function () {
			if (!activeObject || !activeClip) return;

			if (aliasName.getValue() === "") {
				alert("Alias name can't be empty.");
				return;
			}

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[aliasName.getValue()]: Object.assign({
							alias: activeClip.name,
							duration: activeClip.duration
						}, (
							activeObject.userData
							&& activeObject.userData.__editor
							&& activeObject.userData.__editor.animations
							&& activeObject.userData.__editor.animations[activeClip.name]
						))
					}
				}
			});

			updateOutliner(activeObject);
		}
  );

	aliasRow.add( aliasName );
	aliasRow.add( alias );

	var aliasRemoveRow = new UI.Row();
	aliasRemoveRow.setDisplay( 'none' );

	var aliasRemove = new UI.Button( 'Remove' ).onClick(
		function () {
			if (!activeObject || !activeClip || !activeClipName) return;

			delete activeObject.userData.__editor.animations[ activeClipName ];

			activeClipName = activeClip.name;
			updateOutliner(activeObject);
			updateUI(activeClip);
		}
  );

	aliasRemoveRow.add( aliasRemove );

	var audioRow = new UI.Row();

	audioRow.add( new UI.Break() );
	audioRow.add( new UI.Text( 'Audio' ).setWidth( '7px' ) );

	var form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';

	// var context = new ( window.AudioContext || window.webkitAudioContext )();

	var audioName = new UI.Text( '' ).setWidth( '90px');

	fileInput.addEventListener( 'change', function ( event ) {

		var reader = new FileReader();

		var file = fileInput.files[ 0 ];

		reader.readAsArrayBuffer(file)

		reader.onload = (evt) => {

			// editor.audio[file.name] = evt.target.result;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							audio: evt.target.result,
							audioName: file.name
						}
					}
				}
			});

			audioName.setValue( file.name.slice(0, 30) + '...' );

		};

		form.reset();

	} );

	var audio = new UI.Button( 'Upload mp3' ).setMarginLeft( '60px' ).onClick( function () {

		fileInput.click();

	} );

	var audioReset = new UI.Button( 'X' ).setMarginLeft( '10px' ).onClick( function () {

		form.reset();

		audioName.setValue( '' );

		_.merge(activeObject.userData, {
			__editor: {
				animations: {
					[activeClipName]: {
						audio: false
					}
				}
			}
		});

	} );

	var audioVolume = new UI.Number().setPrecision(2).setValue(1).setRange(0, 1).setWidth( '50px' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							audioVolume: Number(e.target.value)
						}
					}
				}
			});
		}
	);

	var audioDelay = new UI.Number().setPrecision(2).setValue(0).setWidth( '50px' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClipName]: {
							audioDelay: Number(e.target.value)
						}
					}
				}
			});
		}
	);

	audioRow.add(audio);
	audioRow.add(audioReset);
	audioRow.add( new UI.Text( 'volume' ).setWidth( '30px' ).setMarginLeft( '30px' ) );
	audioRow.add(audioVolume.setMarginLeft( '20px' ));
	audioRow.add(new UI.Break());
	audioRow.add(new UI.Break());
	audioRow.add( new UI.Text( 'Sound delay' ).setWidth( '90px' ).setMarginLeft( '0px' ) );
	audioRow.add(audioDelay.setMarginLeft( '5px' ));

	var audioNameRow = new UI.Row();

	audioNameRow.add( audioName );

	// var clipTrimRow = new UI.Row();
	// clipTrimRow.setDisplay( 'none' );
	// var clipTrimStart = new UI.Number().setWidth( '50px' ).setValue(0).onChange(
	// 	function (e) {
	// 		if (!activeObject || !activeClip) return;
  //
	// 		_.merge(activeObject.userData, {
	// 			__editor: {
	// 				animations: {
	// 					[activeClipName]: {
	// 						trimStart: +e.target.value.toLowerCase()
	// 					}
	// 				}
	// 			}
	// 		});
	// 	}
	// );

	function updateUI(clip = null) {
		triggererRow.setDisplay( 'none' );
		targetObjectRow.setDisplay( 'none' );
		clipDurationRow.setDisplay( 'none' );
		loopRow.setDisplay( 'none' );
		clipTrimRow.setDisplay( 'none' );
		aliasRow.setDisplay( 'none' );
		aliasRemoveRow.setDisplay( 'none' );
		audioRow.setDisplay( 'none' );
		audioNameRow.setDisplay( 'none' );
		animEndRow.setDisplay( 'none' );

		if (!clip) return;

		activeClip = clip.aliasName ? clip.clip : clip;
		activeClipName = clip.aliasName || clip.name;

		triggererRow.setDisplay( '' );
		// targetObjectRow.setDisplay( '' );
		clipDuration.setValue( clip.duration );
		clipEndTrim.setValue( 0 );
		clipDurationRow.setDisplay( '' );
		loopRow.setDisplay( '' );
		aliasRow.setDisplay( '' );
		audioRow.setDisplay( '' );
		audioNameRow.setDisplay( '' );
		audioName.setValue( '' );
		animEndRow.setDisplay( '' );

		updateClipSelect();

		if (clip.aliasName) {
			aliasRemoveRow.setDisplay( '' );
			clipTrimRow.setDisplay( '' );
			// clipStartTrim.
		}

		if (
			activeObject
			&& activeObject.userData
			&& activeObject.userData.__editor
			&& activeObject.userData.__editor.animations
			&& activeObject.userData.__editor.animations[activeClipName]
		) {
			const data = activeObject.userData.__editor.animations[activeClipName];

			console.log('activeClipName', activeClipName);
			console.log('data.endTrim', data.endTrim);

			if (data.trigger)
				triggerer.setValue( data.trigger );
			else
				triggerer.setValue( 'autostart' );

			if (data.trigger && data.trigger === 'click')
				targetObjectRow.setDisplay( '' );
			else
				targetObjectRow.setDisplay( 'none' );

			if (data.target)
				targetObject.setValue( data.target );
			else
				targetObject.setValue( '' );

			if (data.duration)
				clipDuration.setValue( data.duration );
			else
				clipDuration.setValue( activeClip.duration );

			if (data.startTrim)
				clipStartTrim.setValue( data.startTrim );
			else
				clipStartTrim.setValue( 0 );

			if (data.endTrim)
				clipEndTrim.setValue( data.endTrim );
			else
				clipEndTrim.setValue( 0 );

			if (data.fps)
				clipFPS.setValue( data.fps );
			else
				clipFPS.setValue( 30 );

			if (data.audioName)
				audioName.setValue( data.audioName.slice(0, 30) + '...' );
			else
				audioName.setValue( '' );

			if (data.audioVolume)
				audioVolume.setValue( +data.audioVolume );
			else
				audioVolume.setValue( 1 );

			if (data.audioDelay)
				audioDelay.setValue( +data.audioDelay );
			else
				audioDelay.setValue( 0 );

			if (typeof data.loop === 'boolean')
				loop.setValue(data.loop);

			if (data.action) {
				animEnd.setValue( data.action );

				switch (data.action) {
					case 'url':
						urlRow.setDisplay( '' );
						break;
					default:

				}
			} else
				animEnd.setValue( 'none' );

			if (data.url)
				url.setValue( data.url );
			else
				url.setValue( '' );
		}
	}

	// objectSelected event

	signals.objectSelected.add( function ( object ) {

		activeObject = object;

		if ( object !== null ) {

			container.setDisplay( 'block' );

			console.log('objectSelected', object);

			updateUI();
			updateOutliner( object );

		} else {

			activeClip = null;
			activeClipName = null;
			container.setDisplay( 'none' );

		}

	} );

	container.add( outliner );
	container.add( new UI.Break() );
	container.add( aliasRow );
	container.add( aliasRemoveRow );
	container.add( triggererRow );
	container.add( targetObjectRow );
	container.add( clipDurationRow );
	container.add( loopRow );
	container.add( clipTrimRow );
	container.add( animEndRow );
	container.add( urlRow );
	container.add( clipSelectRow );
	container.add( audioRow );
	container.add( audioNameRow );

	return container;

};
