function ChatCtrl($scope){
	$scope.users = {};
	$scope.room = '#';
	$scope.email = '';
	$scope.name = '';
	$scope.messages = [];
    var socket = io.connect('/');
	
	
	if(window.location.hash!='' && window.location.hash!='#'){
		$scope.room = window.location.hash;
	}

	
	socket.emit('initialize', { name:$scope.name,room:$scope.room,email:$scope.email});
	
	
    socket.on('addChatUser', function (data) {
		$scope.users[data.userId] = data.user;
		if(!pushMessage({name:data.user.name},'join'))  console.log("There is a problem:", data);
		renderUsers();
    });
	
    socket.on('initializeChatData', function (data) {
		$scope.users = data.users;
		for(var i in data.history){
			if(!pushMessage(data.history[i]))  console.log("There is a problem:", data.history[i]);
		}
		renderUsers();
    });
	
    socket.on('removeChatUser', function (data) {
        if(!pushMessage({name:$scope.users[data.userId].name},'left')) {
            console.log("There is a problem:", data);
        }
		delete $scope.users[data.userId];
		renderUsers();
    });
	
    socket.on('chatMessage', function (data) {
        if(!pushMessage(data)) {
            console.log("There is a problem:", data);
        }
    });
	
	function pushMessage(data,action){
	
		if(!data) return false;
	
		action = action || 'message';
		if(action=='message' && data.hasOwnProperty('message') && data.hasOwnProperty('name')&& data.hasOwnProperty('email')) {
            $scope.messages.push({
				img:'http://www.gravatar.com/avatar/'+MD5(data.email)+'?s=32',
				name:data.name,
				message:data.message,
			});
		}else if(action=='left' && data.hasOwnProperty('name')){
            $scope.messages.push({
				img:'',
				name:data.name,
				message:'left the room',
			});
		}else if(action=='join' && data.hasOwnProperty('name')){
            $scope.messages.push({
				img:'',
				name:data.name,
				message:'joined the room',
			});
		}else{
			return false;
		}
		if(!$scope.$$phase) $scope.$apply();
		$('#content').scrollTop($('#content')[0].scrollHeight);
		return true;
	}
	
	function renderUsers(){
		if(!$scope.$$phase) $scope.$apply();
	}
	$(function(){
		$('#field').keyup(function(e){
			var key = e.charCode || e.keyCode;
			
				if(key==13){
				if($.trim($('#field').val())!=''){
					socket.emit('sendChat', { message: $('#field').val(),name:$scope.name,email:$scope.email });
					$('#field').val('');
					$('#field').focus();
				}
			}
		});
		$('#name,#email').keyup(function(e){
			var key = e.charCode || e.keyCode;
			
			if(key==13){
				if($.trim($('#name').val())!='' && $.trim($('#email').val())!=''){
					$('#field').val('');
					$('#field').focus();
					$scope.name = $.trim($('#name').val());
					$scope.email = $.trim($('#email').val());
					socket.emit('initialize', { name:$scope.name,room:$scope.room,email:$scope.email});
					if(!$scope.$$phase) $scope.$apply();
				}
			}
		});
	});

}