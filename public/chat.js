var users = {};
var room = '#';
var email = '';
if(window.location.hash!='' && window.location.hash!='#'){
	room = window.location.hash;
}

$(function(){
	

	while($.trim($('#name').val())==''){
		$('#name').val(prompt('What is your name?'));
	}
	while($.trim(email)==''){
		email = prompt('What is your email? (for gravatar only)');
	}
	var messages = [];
    var socket = io.connect('/');
	
	socket.emit('initialize', { name:$('#name').val(),room:room,email:email});
	
	
    socket.on('addChatUser', function (data) {
		users[data.userId] = data.user;
		if(!pushMessage({name:data.user.name},'join'))  console.log("There is a problem:", data);
		renderUsers();
    });
	
    socket.on('initializeChatData', function (data) {
		users = data.users;
		for(var i in data.history){
			if(!pushMessage(data.history[i]))  console.log("There is a problem:", data.history[i]);
		}
		renderUsers();
    });
	
    socket.on('removeChatUser', function (data) {
        if(!pushMessage({name:users[data.userId].name},'left')) {
            console.log("There is a problem:", data);
        }
		delete users[data.userId];
		renderUsers();
    });
	
    socket.on('chatMessage', function (data) {
        if(!pushMessage(data)) {
            console.log("There is a problem:", data);
        }
    });
	$('#send').click(function(){
		
		if($.trim($('#name').val())==''){
			$('#name').focus();
			alert('Enter Name!!!');
		}else if($.trim($('#field').val()!='')){
			socket.emit('sendChat', { message: $('#field').val(),name:$('#name').val(),email:email });
			$('#field').val('');
			$('#field').focus();
		}
	});
	
	$('#field').keyup(function(e){
		var key = e.charCode || e.keyCode;
		
		if(key==13){
			$('#send').click();
		}
	});
	
	
	function pushMessage(data,action){
	
		if(!data) return false;
	
		action = action || 'message';
		console.log('action:',action);
		if(action=='message' && data.hasOwnProperty('message') && data.hasOwnProperty('name')&& data.hasOwnProperty('email')) {
			var str = '<img style="float:left;margin: 0;padding: 5px;border-radius: 32px;-moz-border-radius: 43px;" src="http://www.gravatar.com/avatar/'+MD5(data.email)+'?s=32" />'+'<p style="float:left;margin:0;padding: 0;padding-left: 5px;margin-top: 9px;"><strong>'+data.name+'</strong>: '+data.message+'</p>';
            messages.push(str);
		}else if(action=='left' && data.hasOwnProperty('name')){
			var str = '<strong>'+data.name+'</strong> left the room';
            messages.push(str);
		}else if(action=='join' && data.hasOwnProperty('name')){
			var str = '<strong>'+data.name+'</strong> joined the room';
            messages.push(str);
		}else{
			return false;
		}

		var html = '';
		for(var i=0; i<messages.length; i++) {
			html += messages[i];
			html+='<div style="clear:both;"></div>';
		}
		$('#content').html(html);
		$('#content').scrollTop(messages.length*25);
		return true;
	}
	
	function renderUsers(){
		var str = '';
		
		for(i in users){
			str += '<li>'+users[i].name+'</li>';
		}
		
		$('#userList').html(str);
	}
	
});