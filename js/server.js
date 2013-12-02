var app = require('http').createServer(handler)
 , io = require('socket.io').listen(app)
 , fs = require('fs');

 app.listen(8080);

function handler (req, res) {
	 var file = req.url === '/' ? '/index.html' : req.url;	 
	 fs.readFile(__dirname + '/..'+ file,
	 
	 function (err, data) {
		 if (err) {
			 res.writeHead(500);
			 return res.end('Error loading index.html');
		 }
		 res.writeHead(200);
		 res.end(data);
	});
}


var users = new Array();


io.sockets.on('connection', function (socket) {

		console.log("We have a new client: " + socket.id);

		users[users.length] = socket.id;

		console.log("We have "+ users.length + " clients.");



		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);


			for(var i = 0; i < users.length; i++){
				if (socket.id == users[i]){
					users.splice(i,1);
				}
			}

			console.log("Client has disconnected, we now have "+ users.length + " clients.");

		});


	});

