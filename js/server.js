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

//all clients connected to the website
var clients = new Array();

//the participants who joined with a user name.
//a user object has a socket.id, a name and an index.
var users = new Array();

//list of icebreaker Ideas
var initialIdeas = new Array();

//the best 5 ideas
var topIdeas = new Array();

//current thread text
var entireThreadText = "";
var currentTurnText = "";

//controling users state
var submittedIdeas = 0;
var submittedVotes = 0;
var submittedReady = 0;
var submittedThread = 0;

var socketTurn;
var socketNext;

var participants = 3;


function compare(a,b) {
	  if (a.points < b.points) return 1;
	  if (a.points > b.points) return -1;
	  return 0;
}

function random(a,b){
	var prob = Math.random();
	if(prob >= 0.5) return 1;
	else return -1;
}

function rearrange(a,b) {
	  if (a.index < b.index) return -1;
	  if (a.index > b.index) return 1;
	  return 0;
}


io.sockets.on('connection', function (socket) {
		
		//console.log("We have a new client: " + socket.id);
		clients[clients.length] = socket.id;
		//console.log("We have "+ clients.length + " clients.");

		socket.emit('getUsers', users);	
		socket.emit('myId', socket.id);		
		
		socket.on('join', function(data){
			console.log("Client has joined with user name: "+ data);
			users.push({id: socket.id, name: data, index: users.length});  
			io.sockets.emit('getUsers', users);

		});

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
			//console.log(submittedIdeas);
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
			if(submittedVotes >= participants){
				// calculates top words.
				initialIdeas.sort(compare);

				if(initialIdeas.length > 5){
					for(var j = 0; j < 5; j++){
						topIdeas.push({idea: initialIdeas[j].idea, score: initialIdeas[j].points });
					}					
				}
				else{
					for(var j = 0; j < initialIdeas.length; j++){
						topIdeas.push({idea: initialIdeas[j].idea, score: initialIdeas[j].points });
					}							
				}
				io.sockets.emit('voteResults', topIdeas);
			}
		});

		socket.on('imready', function(){
			var allSockets = io.sockets.clients();

			submittedReady++;

			//only sorts and sends when all participants are ready
			if(submittedReady >= participants){				
				users.sort(random);
				users.sort(rearrange);

				console.log(users);

				for(var j = 0; j < users.length; j++){
					users[j].index = j;
				}

				for(var i = 0; i < allSockets.length; i++){
					if(users[0].id == allSockets[i].id){
						socketTurn = allSockets[i];
						console.log("socketTurn defined:" +socketTurn.id);					
					}
					else if(users[1].id == allSockets[i].id){
						socketNext = allSockets[i];
					    console.log("socketNext defined:"+ socketNext.id);
					}
				}
				io.sockets.emit('threadRunning', users);
				socketTurn.emit('sendLiveCoding');
			}
		});

		socket.on('liveCodingText', function(data){
		socketNext.emit('receiveLiveCoding', data);

		});

		socket.on('nextTurn', function(data){
			var allSockets = io.sockets.clients();

			currentTurnText = data;

			entireThreadText = entireThreadText + data;

			for(var j = 0; j < users.length; j++){
				users[j].index = users[j].index-1;

				if(users[j].index < 0){
					console.log("error not here");
					users[j].index = users.length-1;
				}
			}
			users.sort(rearrange);
			console.log(users);

			for(var i = 0; i < allSockets.length; i++){
				if(users[0].id == allSockets[i].id){
					socketTurn = allSockets[i];
					console.log("socketTurn defined:" +socketTurn.id);					
				}
				else if(users[1].id == allSockets[i].id){
					socketNext = allSockets[i];
				    console.log("socketNext defined:"+ socketNext.id);
				}
			}

			submittedThread++;

			if(submittedThread >= participants){	
				io.sockets.emit('threadEnd', entireThreadText);
				console.log("Thread Ended");					
	
			}
			else{
				io.sockets.emit('threadRunning', users);
				//send the next user the text

				socketTurn.emit("previousText", currentTurnText);						
				socketTurn.emit('sendLiveCoding');
				console.log(submittedThread);					
					
			}			

		});



		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			for(var i = 0; i < clients.length; i++){
				if (socket.id == clients[i]){
					//users.splice(i,1);
					clients.splice(i,1);
				}
			}
			console.log("Client has disconnected, we now have "+ clients.length + " clients.");

		});


	});

