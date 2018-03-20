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

	var parser = new ARParser(player.dom);

	var listeners = [];

	signals.startPlayer.add( function () {

		listeners = [];

		container.setDisplay( '' );

		player.load( editor.toJSON() );
		player.setSize( container.dom.clientWidth, container.dom.clientHeight );
		player.play();

		parser.initialize(player.scene, player.camera, player.dom);

		const scene = player.scene;
		const camera = player.camera;
	} );

	signals.stopPlayer.add( function () {

		parser.destroy();

		container.setDisplay( 'none' );

		player.stop();
		player.dispose();

	} );

	return container;

};
