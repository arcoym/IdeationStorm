var socket = io.connect('http://localhost:8080/');

socket.on('connect', function() {
	console.log('connected');

});