// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
httpServer.listen(8000);

function requestHandler(req, res) {
    // Read index.html
    fs.readFile(__dirname + '/index.html', 
        // Callback function for reading
        function (err, data) {
            // if there is an error
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            // Otherwise, send the data, the contents of the file
            res.writeHead(200);
            res.end(data);
        }
    );
}

    var users = new Array();
// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.on('connection', 
    // We are given a websocket object in our function
    function (socket) {
        var userObject = null;

        console.log("We have a new client: " + socket.id);
        socket.on('join', function(data) {
            socket.nickname = data;

            userObject = {
                sid: socket.id,
                nn: data,
            };

            console.log(userObject);
            users.push(userObject);
            console.log(users);

            io.sockets.emit('announcement', data);
            console.log(data);
        });
    
        // When this user "send" from clientside javascript, we get a "message"
        // client side: socket.send("the message");  or socket.emit('message', "the message");
        socket.on('message', 
            // Run this function when a message is sent
            function (data) {
                console.log("message: " + data);
                
                // Call "broadcast" to send it to all clients (except sender), this is equal to
                // socket.broadcast.emit('message', data);
                //socket.broadcast.send(data);
                
                // To all clients, on io.sockets instead
                io.sockets.emit('message', {
                    nickname: userObject.nn,
                    message: data
                });
        });
        
        // When this user emits, client side: socket.emit('otherevent',some data);
        socket.on('otherevent', function(data) {
            // Data comes in as whatever was sent, including objects
            console.log("Received: 'otherevent' " + data);
        });
        
        
        socket.on('disconnect', function() {
            console.log("Client has disconnected");
        });
});