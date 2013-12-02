var socket = io.connect('http://localhost:8080/');

socket.on('connect', function() {
	console.log('connected');

});


socket.on('getUsers', function(data){
	allUsers = data;

	var lastList = document.getElementsByClassName("user");
	if(lastList.length>0){

		for(var i=0; i<data.length-1; i++){
			var element= document.getElementById(data[i].name);
			element.parentNode.removeChild(element);				
		
		}
	}


	for(var i=0; i<data.length; i++){
		if(data[i] != null){
		 	var userli = document.createElement("li");
		 	userli.id = data[i].name;
		 	userli.className= "user";
		 	userli.innerHTML = data[i].name;
		 	document.getElementById("user-list").appendChild(userli);			
		}
	}

});


var allUsers = new Array();

var init = function() {
	console.log("init");



};


var joinStorm = function(){
	var username = document.getElementById('username').value;
	if(username != ""){
		console.log("username is " + username);
		socket.emit('join',username);
		hideJoinBtn();
	}
	else{
		console.log("username is null");
	}
};

var hideJoinBtn = function(){
	document.getElementById('username').style.display = "none";
	document.getElementById('joinbtn').style.display = "none";

};

window.addEventListener('load', init, false);
