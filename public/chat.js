var users = {};
var room = 'global';

if(window.location.hash!='' && window.location.hash!='#'){
	room = window.location.hash;
}

$(function(){
	

	while($.trim($('#name').val())==''){
		$('#name').val(prompt('What is your name?'));
	}
	var messages = [];
    var socket = io.connect('http://station01:1337');
	
	socket.emit('initialize', { name:$('#name').val(),room:room});
	
	
    socket.on('addChatUser', function (data) {
		users[data.userId] = data.user;
		pushMessage('<strong>'+data.user.name+'</strong> joined the room');
		renderUsers();
    });
	
    socket.on('allChatRoomUsers', function (data) {
		users = data.users;
		renderUsers();
    });
	
    socket.on('removeChatUser', function (data) {
		pushMessage('<strong>'+users[data.userId].name+'</strong> left the room');
		delete users[data.userId];
		renderUsers();
    });
	
    socket.on('chatMessage', function (data) {
        if(data.message && data.name) {
			pushMessage('<strong>'+data.name+'</strong>: '+data.message);
        } else {
            console.log("There is a problem:", data);
        }
    });
	$('#send').click(function(){
		
		if($.trim($('#name').val())==''){
			$('#name').focus();
			alert('Enter Name!!!');
		}else if($.trim($('#field').val()!='')){
			socket.emit('sendChat', { message: $('#field').val(),name:$('#name').val() });
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
	
	
	function pushMessage(str){
            messages.push(str);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            $('#content').html(html);
			$('#content').scrollTop(messages.length*25);
	}
	
	function renderUsers(){
		var str = '';
		
		for(i in users){
			str += '<li>'+users[i].name+'</li>';
		}
		
		$('#userList').html(str);
	}
	
});