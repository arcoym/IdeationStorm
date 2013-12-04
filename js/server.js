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


var clients = new Array();
var users = new Array();
var initialIdeas = new Array();
var submittedIdeas = 0;
var submittedVotes = 0;
var participants = 3;


function compare(a,b) {
	  if (a.points < b.points) return 1;
	  if (a.points > b.points) return -1;
	  return 0;
}


io.sockets.on('connection', function (socket) {

		//console.log("We have a new client: " + socket.id);
		clients[clients.length] = socket.id;
		//console.log("We have "+ clients.length + " clients.");

		socket.emit('getUsers', users);			
		
		socket.on('myIdeas', function(data){
			for(var i = 0; i < data.length; i++){
				initialIdeas.push({idea: data[i], points: 0});
			}
				
			submittedIdeas++;
			if(submittedIdeas >= participants){
				io.sockets.emit('startVoting', initialIdeas);
			}	
			else{
				io.sockets.emit('getIdeas', initialIdeas);
			}		
			console.log(submittedIdeas);
		});


		socket.on('myVotes', function(data){
			//receive votes 
			var myVotes = new Array();

			for(var i = 0; i < data.length; i++){
				myVotes.push(data[i].points);
			}

			for(var j = 0; j < myVotes.length; j++){
				initialIdeas[j].points += myVotes[j];
			}


			submittedVotes++;
			if(submittedVotes > participants-1){
				// calculates top words.
				initialIdeas.sort(compare);
				console.log(initialIdeas);

				//io.sockets.emit('voteResults', data);
			}
			else{
				//socket.emit('waitVotes');				
			}



		});


		socket.on('join', function(data){
			console.log("Client has joined with user name: "+ data);
			users.push({id: socket.id, name: data, index: -1, turn: false });  
			io.sockets.emit('getUsers', users);

		});


		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			for(var i = 0; i < clients.length; i++){
				if (socket.id == clients[i]){
					users.splice(i,1);
					clients.splice(i,1);
				}
			}
			console.log("Client has disconnected, we now have "+ clients.length + " clients.");

		});


	});

