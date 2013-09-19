var express = require("express");
var app = express();
var port = 80;
// load Jade tamplate engine
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
 
 
function ChatServer(io){
	var users = {};
	io.sockets.on('connection', function (socket) {
		var socketId = socket.id;
		var room = '';
		socket.on('initialize', function (data) {
			room = data.room;
			socket.join(room);
			if(!users.hasOwnProperty(room)){
				users[room] = {};
			}
			users[room][socketId] = data;
			
			socket.in(room).emit('allChatRoomUsers',{users:users[room]});
			socket.broadcast.to(room).emit('addChatUser',  {user:data,userId:socketId});
		});
		
		socket.on('sendChat', function (data) {
			io.sockets.in(room).emit('chatMessage', data);
		});
		
		
	   socket.on('disconnect', function() {
			if(users.hasOwnProperty(room)){
				delete users[room][socketId];
				if(users[room].length==0) delete users[room];
			}
			io.sockets.in(room).emit('removeChatUser',{userId:socketId});
	   });
	});
};

// routes
// set "/" to renter page.jade template
app.get("/", function(req, res){
    res.render("page");
});

// set public library
app.use(express.static(__dirname + '/public'));

// initiate socet.io
var io = require('socket.io').listen(app.listen(port));

// define connection handler
chat = new ChatServer(io);



console.log("Listening on port " + port);