var socket = io.connect('http://localhost:8080/');

socket.on('connect', function() {
	console.log('connected');
});

socket.on('myId', function(data){
	myId = data;
});

socket.on('getUsers', function(data){
	allUsers = data;

	//delete the previous list
	//including first user notice
	var firstUser = document.getElementById('firstUser');
	if(firstUser != null) {
		firstUser.parentNode.removeChild(firstUser);
	}

	//and the list
	var lastList = document.getElementsByClassName("user");
	if(lastList.length>0){
		for(var i=0; i<data.length-1; i++){
			var element= document.getElementById(data[i].name);
			element.parentNode.removeChild(element);						
		}
	}

    if(!joined){

		if(data.length == participants){
			var joinForm = document.getElementById('join');
			joinForm.parentNode.removeChild(joinForm);

			var p = document.createElement('p');
			p.innerHTML = "Session is full."
			p.setAttribute('id', "session-full");
			document.getElementById('container').appendChild(p);
		}


		//if there is no user, let them know.    	
		if(data[0] == null){
			 	var userli = document.createElement("li");
			 	userli.id = "firstUser";
			 	userli.className= "firstUser";
			 	userli.innerHTML = "You are the first user to join";
			 	document.getElementById("user-list").appendChild(userli);			
		}
		//add the new list to HTML		
		else{
			for(var i=0; i<data.length; i++){
				if(data[i] != null){
				 	var userli = document.createElement("li");
				 	userli.id = data[i].name;
				 	userli.className= "user";
				 	userli.innerHTML = data[i].name+" joined the Storm.";
				 	document.getElementById("user-list").appendChild(userli);			
				}
			}
		}
    }
});


socket.on('getIdeas', function(data){
	allIdeas = new Array();
	for(var i=0; i<data.length; i++){
		if(data[i] != null){
			allIdeas.push(data[i].idea);
		}
	}

	if(joined){
		displayIdeas();		
	} 

});


socket.on('startVoting', function(data){
	allIdeas = new Array();
	for(var i=0; i<data.length; i++){
		if(data[i] != null){
			allIdeas.push(data[i].idea);
		}
	}

	displayIdeasToVote();

 

	var p = document.createElement('p');
	p.innerHTML = "Vote in your ideas!"
	p.setAttribute('id', "start-voting");
	document.getElementById('container').appendChild(p);


	var b = document.createElement("input"); //input element, Submit button
	b.setAttribute('type',"button");
	b.setAttribute('id',"vote");
	b.setAttribute('class',"btn");
	b.setAttribute('onclick',"voteIdeas();");
	b.setAttribute('value',"Vote");
	p.appendChild(b);	

});




socket.on('voteResults', function(data){
	//remove previous UI
	var wait = document.getElementById('waiting2');
	wait.parentNode.removeChild(wait);

	var oldIdeas = document.getElementById('ideas-list');
	oldIdeas.parentNode.removeChild(oldIdeas);

	var ul = document.createElement("ul");
	ul.setAttribute('id', "top-list");
	document.getElementById('container').appendChild(ul);		

	//displayResults
	document.getElementById('status').innerHTML = "Best voted ideas below. Let's start the thread?";
	//console.log(data);

	for(var i=0; i<data.length; i++){
	 	var topli = document.createElement("li");
	 	topli.id = "top-"+i;
	 	topli.className= "top-ideas";
	 	topli.innerHTML = data[i].idea + ": " + data[i].score;
	 	document.getElementById("top-list").appendChild(topli);		

	 	if(i == 0){
			currentThread = data[i].idea;
		}	
	}

	var p = document.createElement('p');
	p.innerHTML = "Thread will start in a bit..."
	p.setAttribute('id', "start-thread");
	document.getElementById('container').appendChild(p);

	//it waits 5 seconds before it starts
	window.setTimeout(sendImready, 5000);

});

var sendImready = function(){
	socket.emit('imready');
}

socket.on('threadRunning', function(data){
	myTurn = false;
	imNext = false;

	//remove previous UI
	var topIdeas = document.getElementById('top-list');
	if(topIdeas != null){
		topIdeas.parentNode.removeChild(topIdeas);
	}

	var wait = document.getElementById('start-thread');
	if(wait != null){
		wait.parentNode.removeChild(wait);	
	}

	//remove previous UI
	var lastStatus = document.getElementById('status-turn');
	if(lastStatus != null){
	lastStatus.parentNode.removeChild(lastStatus);
	}


    //console.log(data);
    //console.log(myId);

	//letting me know if it is my turn or if I'm next
	for(var i=0; i<data.length; i++){
		if(data[i].id == myId){
			if(data[i].index == 0) myTurn = true;
			else if(data[i].index == 1) imNext = true;
			else{
				myTurn = false;
				imNext = false;
				//console.log("it is not my turn");
			}
		}
	}

	//update status
	document.getElementById('status').innerHTML = "Thread running";


	if(myTurn){
		itsMyTurn();
	}
	else if(imNext){
		myTurnIsNext();
	}
	else{
		itsNotMyTurn();
		window.clearInterval(keepSending);
	}

});


socket.on('receiveLiveCoding', function(data){
	var text =document.getElementById("live-coding");
	if(imNext){
		text.innerHTML = data;
	}

});


socket.on('sendLiveCoding', function(){
	if(myTurn){
	//console.log("I still think it is my turn");
	keepSending = window.setInterval(function(){
	var threadText = document.getElementById('threadText').value;
	socket.emit('liveCodingText', threadText);}, 1000);
	}
});


socket.on('previousText', function(data){
	console.log(data);
	previousText = data;
	document.getElementById('previous').innerHTML = previousText;

});

socket.on('threadEnd', function(data){
	myTurn = false;
	imNext = false;
	console.log(myTurn);
	
	//remove previous UI
	var status = document.getElementById('status-turn');
	if(status != null){
		status.parentNode.removeChild(status);
	}

	document.getElementById('status').innerHTML = "Thread is over!"

	finalText = data;


    var div = document.createElement('div');
 	div.setAttribute('id', "status-turn");
  	document.getElementById('container').appendChild(div);

	var p = document.createElement('p');
	p.innerHTML = "Here is complete text: <br/>" +finalText;	
	p.setAttribute('id', "status-turn");
	div.appendChild(p);	

	var f = document.createElement("form");
	f.setAttribute('id',"want-more-form");

		//insert button to start next thread
	var b = document.createElement("input"); 
	b.setAttribute('type',"button");
	b.setAttribute('id',"want-more");
	b.setAttribute('class',"btn");
	b.setAttribute('onclick',"startAllOverAgain();");
	b.setAttribute('value',"Go to Next Thread");
	f.appendChild(b);	
	div.appendChild(f);

});



var myId;
var myTurn = false;
var imNext = false;
var currentThread = "";
var previousText = "You're the first!";
var finalText = "";
var allUsers = new Array();
var allIdeas = new Array();
var joined = false;
var participants = 3;
var keepSending;

var init = function() {
	console.log("init");
};



var joinStorm = function(){
	var username = document.getElementById('username').value;
	if(username != ""){
		console.log("username is " + username);
		socket.emit('join',username);
		joined = true;
		startSession();


	}
	else{
		console.log("username is null");
	}
};

var startSession = function(){
	//change status
	document.getElementById('status').innerHTML = "Let's get started! Ice breaker explanation";

	//remove previous UI
	var joinForm = document.getElementById('join');
	joinForm.parentNode.removeChild(joinForm);
	// var userList = document.getElementById('user-list');
	// userList.parentNode.removeChild(userList);

	//add ice breaker form
	var f = document.createElement("form");
	f.setAttribute('id',"ideas-form");
	for(var i = 1; i < 6; i++){
	var input = document.createElement("input");
		input.setAttribute('type',"text");
		input.setAttribute('maxlength',"100");
		input.setAttribute('placeholder',"Idea "+ i);
		input.setAttribute('name',"idea"+i);
		input.setAttribute('id',"idea"+i);
		input.setAttribute('class',"idea_field");
		f.appendChild(input);
	}


	var s = document.createElement("input"); 
	s.setAttribute('type',"button");
	s.setAttribute('id',"icebreakerbtn");
	s.setAttribute('class',"btn");
	s.setAttribute('onclick',"startIdeas();");
	s.setAttribute('value',"Add Ideas");
	f.appendChild(s);	

	document.getElementById('container').appendChild(f);

};


var startIdeas = function(){
	var myIdeas = new Array();

	for(var i = 1; i < 6; i++){
		var single_idea = document.getElementById('idea'+i).value;
		if(single_idea != ""){
			myIdeas.push(single_idea);			
		}
	}
	//send my ideas to the server
	socket.emit('myIdeas',myIdeas);

	//change status
	document.getElementById('status').innerHTML = "Display all ideas";

	//remove previous UI
	var ideasForm = document.getElementById('ideas-form');
	ideasForm.parentNode.removeChild(ideasForm);	

	var ul = document.createElement("ul");
	ul.setAttribute('id', "ideas-list");
	document.getElementById('container').appendChild(ul);

	var p = document.createElement('p');
	p.innerHTML = "Waiting all users to add ideas."
	p.setAttribute('id', "waiting1");
	document.getElementById('container').appendChild(p);

	//display ideas
	displayIdeas();

};


var displayIdeas = function(){
	var lastIdeaList = document.getElementsByClassName("ideas");
	var length = lastIdeaList.length;
	if(length>0){
		for(var i=0; i<length; i++){
			var id = "idea-"+i;
			var element= document.getElementById(id);
			element.parentNode.removeChild(element);
		}
	}

	for(var i=0; i<allIdeas.length; i++){
		if(allIdeas != null){
		 	var ideali = document.createElement("li");
		 	ideali.id = "idea-"+i;
		 	ideali.className= "ideas";
		 	ideali.innerHTML = allIdeas[i];
		 	document.getElementById("ideas-list").appendChild(ideali);
		 }			
	}
}


var displayIdeasToVote = function(){

	//remove waiting message
	var wait = document.getElementById('waiting1');
	wait.parentNode.removeChild(wait);	


	//remove last list
	var lastIdeaList = document.getElementsByClassName("ideas");
	var length = lastIdeaList.length;
	if(length>0){
		for(var i=0; i<length; i++){
			var id = "idea-"+i;
			var element= document.getElementById(id);
			element.parentNode.removeChild(element);
		}
	}

	//add list with checkboxes
	for(var i=0; i<allIdeas.length; i++){
	 	var ideali = document.createElement("li");
	 	ideali.id = "idea-"+i;
	 	ideali.className= "ideas";
	 	ideali.innerHTML = allIdeas[i];
	 	document.getElementById("ideas-list").appendChild(ideali);
	 	var f = document.createElement("form");
	 	f.setAttribute('id', "voteIdea"+i);
	 	for(var j = 0; j < 5; j++){
	 		var inp = document.createElement("input");
	 		inp.setAttribute('type', "checkbox");
	 		inp.setAttribute('id', "idea"+i+"vote"+j);	
	 		f.appendChild(inp);
	 	}
		ideali.appendChild(f);
	}
}


var voteIdeas = function(){
	//gather myVotes and send to server
 	var myVotes = new Array();

	//remove previous UI
	var voteBtn = document.getElementById('start-voting');
	voteBtn.parentNode.removeChild(voteBtn);

	var p = document.createElement('p');
	p.innerHTML = "Waiting all users to vote."
	p.setAttribute('id', "waiting2");
	document.getElementById('container').appendChild(p);


	for(var i=0; i<allIdeas.length; i++){	
	var points = 0
	 for(var j = 0; j < 5; j++){
	 	var inputElement = document.getElementById("idea"+i+"vote"+j);
	 	if(inputElement.checked){
	 		points++;
	 	}	 	
	 }
	 myVotes.push({idea: allIdeas[i], points: points});
	}
	socket.emit('myVotes',myVotes);
}



var itsMyTurn = function(){

    var div = document.createElement('div');
 	div.setAttribute('id', "status-turn");
  	document.getElementById('container').appendChild(div);


	var p = document.createElement('p');
	p.innerHTML = "It is your turn! Here is what the first user wrote about <br/>"+currentThread; 
	div.appendChild(p);
	

	var q = document.createElement('p');
	q.innerHTML = previousText;
	q.setAttribute('id', "previous");
	div.appendChild(q);

	var f = document.createElement("form");
	f.setAttribute('id',"threadForm");

	var input = document.createElement("input");
	input.setAttribute('type',"textarea");
	input.setAttribute('maxlength',"500");
	input.setAttribute('width',"500");
	input.setAttribute('height',"200");
	input.setAttribute('placeholder',"Write your idea here");
	input.setAttribute('name',"threadText");
	input.setAttribute('id',"threadText");
	input.setAttribute('class',"threadText");
	f.appendChild(input);


 	var message = "Write more pleeease"

	var s = document.createElement("input"); 
	s.setAttribute('type',"button");
	s.setAttribute('id',"submitThreadText");
	s.setAttribute('class',"btn");
	s.setAttribute('onclick',"Imdone();");
	s.setAttribute('value',message);
	f.appendChild(s);	

	div.appendChild(f);
}

var itsNotMyTurn = function(){
    var div = document.createElement('div');
 	div.setAttribute('id', "status-turn");
  	document.getElementById('container').appendChild(div);

	var p = document.createElement('p');
	p.innerHTML = "Sorry, it is not your time yet!<br/> Right now, you can go to the chat to talk about: <br/>" +currentThread;	
	p.setAttribute('id', "status-turn");
	div.appendChild(p);			
}

var myTurnIsNext = function(){	
    var div = document.createElement('div');
 	div.setAttribute('id', "status-turn");
  	document.getElementById('container').appendChild(div);

  	var p = document.createElement('p');
	p.innerHTML = "You're next! <br/> Below you can see what the current user is writing about: <br/>" +currentThread;
	p.setAttribute('id', "status-turn");
	div.appendChild(p);

	var n = document.createElement('p');
	n.innerHTML = "";
	n.setAttribute('id', "live-coding");
	div.appendChild(n);

}


var Imdone = function(){
	myTurn = false;
	console.log("acabeeeeeei");
	var myText = document.getElementById('threadText').value;
	socket.emit('nextTurn', myText);

}

window.addEventListener('load', init, false);
