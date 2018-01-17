/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animations = function ( editor ) {

	var signals = editor.signals;
	var activeObject, activeClip;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setDisplay( 'none' );

	// outliner

	function buildOption( clip, draggable ) {

		var option = document.createElement( 'div' );
		option.draggable = draggable;
		option.innerHTML = buildHTML( clip );
		option.value = clip;

		return option;

	}

	function buildHTML( clip ) {

		var html = '<span class="type clip"></span> ' + clip.name;

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
		var animations = object.animations || (object.geometry && object.geometry.animations);
		var options = [];

		outliner.setOptions([]);
		container.setDisplay( 'none' );
		if (!animations) return;

		container.setDisplay( '' );

		animations.forEach(clip => {
			options.push( buildOption( clip, false ) );
		});
		// console.log(animations);

		outliner.setOptions( options );
	}

	// triggererRow

	var triggererRow = new UI.Row();
	triggererRow.setDisplay( 'none' );
	var triggerer = new UI.Select().setOptions( {

		'None': 'None',
		'Autostart': 'Autostart',
		'Click': 'Click / Touch',
		'Button': 'Button'

	} ).setWidth( '150px' ).setFontSize( '12px' ).setValue( 'Autostart' ).onChange(
		function (e) {
			if (!activeObject || !activeClip) return;

			_.merge(activeObject.userData, {
				__editor: {
					animations: {
						[activeClip.name]: {
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
	var clipDuration = new UI.Number().setWidth( '50px' ).setDisabled(true); //.onChange( update );

	clipDurationRow.add( new UI.Text( 'Duration' ).setWidth( '90px' ) );
	clipDurationRow.add( clipDuration );

	// clipDurationRow

	var loopRow = new UI.Row();
	loopRow.setDisplay( 'none' );
	var loop = new UI.Checkbox().setValue(false).setDisabled(true); //.onChange( update );

	loopRow.add( new UI.Text( 'Loop' ).setWidth( '90px' ) );
	loopRow.add( loop );

	function updateUI(clip = null) {
		triggererRow.setDisplay( 'none' );
		clipDurationRow.setDisplay( 'none' );
		loopRow.setDisplay( 'none' );

		activeClip = clip;

		if (!clip) return;

		triggererRow.setDisplay( '' );
		clipDuration.setValue( clip.duration );
		clipDurationRow.setDisplay( '' );
		loopRow.setDisplay( '' );
	}

	// objectSelected event

	signals.objectSelected.add( function ( object ) {

		activeObject = object;

		if ( object !== null ) {

			container.setDisplay( 'block' );

			updateUI();
			updateOutliner( object );

		} else {

			activeClip = null;
			container.setDisplay( 'none' );

		}

	} );

	container.add( outliner );
	container.add( new UI.Break() );
	container.add( triggererRow );
	container.add( clipDurationRow );
	container.add( loopRow );

	return container;

};
