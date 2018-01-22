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

	// clipDurationRow

	var loopRow = new UI.Row();
	loopRow.setDisplay( 'none' );
	var loop = new UI.Checkbox().setValue(true).onChange(
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

	var aliasRow = new UI.Row();
	aliasRow.setDisplay( 'none' );

	var aliasName = new UI.Input().setWidth( '102px' ).setFontSize( '12px' ).setValue( '' );

	var alias = new UI.Button( 'Make alias' ).setMarginLeft( '7px' ).onClick(
		function () {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[aliasName.getValue()]: {
							alias: activeClip.name
						}
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
		clipDurationRow.setDisplay( 'none' );
		loopRow.setDisplay( 'none' );
		aliasRow.setDisplay( 'none' );
		aliasRemoveRow.setDisplay( 'none' );

		if (!clip) return;

		activeClip = clip.aliasName ? clip.clip : clip;
		activeClipName = clip.aliasName || clip.name;

		triggererRow.setDisplay( '' );
		clipDuration.setValue( clip.duration );
		clipDurationRow.setDisplay( '' );
		loopRow.setDisplay( '' );
		aliasRow.setDisplay( '' );

		if (clip.aliasName)
			aliasRemoveRow.setDisplay( '' );

		if (
			activeObject
			&& activeObject.userData
			&& activeObject.userData.__editor
			&& activeObject.userData.__editor.animations
			&& activeObject.userData.__editor.animations[activeClipName]
		) {
			const data = activeObject.userData.__editor.animations[activeClipName];

			if (data.trigger)
				triggerer.setValue(data.trigger);

			if (data.duration)
				clipDuration.setValue(data.duration);

			if (typeof data.loop === 'boolean')
				loop.setValue(data.loop);
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
	container.add( triggererRow );
	container.add( clipDurationRow );
	container.add( loopRow );
	container.add( aliasRow );
	container.add( aliasRemoveRow );

	return container;

};
