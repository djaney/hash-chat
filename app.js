var express = require("express");
var app = express();
var PORT = process.env.PORT || 80;
var HISTORY_LIMIT = 20;
// load Jade tamplate engine
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
 
 
function ChatServer(io){
	var users = {};
	var history = {};
	

	
	var run = function (socket) {
		var socketId = socket.id;
		var room = '';
		socket.on('initialize', function (data) {
			room = data.room;
			socket.join(room);
			if(!users.hasOwnProperty(room)){
				users[room] = {};
			}
			if(data.name!='')
			users[room][socketId] = data;
			
			if(!history.hasOwnProperty(room)){
				history[room] = [];
			}
			
			socket.in(room).emit('initializeChatData',{users:users[room],history:history[room]});
			if(data.name!='')
			socket.broadcast.to(room).emit('addChatUser',  {user:data,userId:socketId});
			
			if(data.name=='')
				socket.emit('chatMessage',{name:'System',message:'Welcome! You need to login.',email:'chat@codertalks.com'});
			else
				socket.emit('chatMessage',{name:'System',message:'Welcome '+data.name+'!',email:'chat@codertalks.com'});
			
		});
		
		socket.on('sendChat', function (data) {
			if(!history.hasOwnProperty(room)){
				history[room] = [];
			}
			history[room].push(data);
			if(history[room].length>HISTORY_LIMIT) history[room].shift();
			
			io.sockets.in(room).emit('chatMessage', data);
		});
		
		
	   socket.on('disconnect', function() {
			if(users.hasOwnProperty(room)){
				delete users[room][socketId];
				if(users[room].length==0) delete users[room];
			}
			io.sockets.in(room).emit('removeChatUser',{userId:socketId});
	   });
	};
	
	try{
		// try websocket
		io.sockets.on('connection', run);
	}catch(err){
		// try long poll
		io.configure(function () { 
			io.set("transports", ["xhr-polling"]); 
			io.set("polling duration", 10); 
		});
		io.sockets.on('connection', run);
	}
	
	
	
};

// routes
// set "/" to renter page.jade template
app.get("/", function(req, res){
    res.render("page");
});

// set public library
app.use(express.static(__dirname + '/public'));

// initiate socet.io
var io = require('socket.io').listen(app.listen(PORT));

// define connection handler
chat = new ChatServer(io);



console.log("Listening on port " + PORT);