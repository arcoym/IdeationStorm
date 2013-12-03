var socket = io.connect('http://localhost:8080/');

socket.on('connect', function() {
	console.log('connected');

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
			allIdeas.push(data[i]);
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
			allIdeas.push(data[i]);
		}
	}

	displayIdeasToVote();

	var p = document.createElement('p');
	p.innerHTML = "Start voting."
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


var allUsers = new Array();
var myIdeas = new Array();
var myVotes = new Array();
var allIdeas = new Array();
var joined = false;
var participants = 3;

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
		 	var ideali = document.createElement("li");
		 	ideali.id = "idea-"+i;
		 	ideali.className= "ideas";
		 	ideali.innerHTML = allIdeas[i];
		 	document.getElementById("ideas-list").appendChild(ideali);			
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
	//gather allVotes and send to server


	socket.emit('myVotes',myVotes);

}






window.addEventListener('load', init, false);
