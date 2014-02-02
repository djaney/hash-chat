function ChatCtrl($scope){
	$scope.users = {};
	$scope.room = '#';
	$scope.email = '';
	$scope.name = '';
	$scope.fbid = '';
	$scope.messages = [];
    var socket = io.connect('/');
	
	
	if(window.location.hash!='' && window.location.hash!='#'){
		$scope.room = window.location.hash;
	}

	
	$scope.getUserCount = function(){
		return Object.keys($scope.users).length;
	};
	
	
	$scope.loginFacebook = function(){
		FB.login(function(data){
			if(data.status=='connected'){
				FB.api('/me', 'get',{},function(data){
					$scope.name = data.name;
					$scope.fbid = data.id;
					if(!$scope.$$phase) $scope.$apply();
				});
			}
		}, {scope: 'publish_actions'});
		if(!$scope.$$phase) $scope.$apply();
	}
	
	
	
	socket.emit('initialize', { name:$scope.name,room:$scope.room,email:$scope.email,fbid:$scope.fbid});
	
	
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
		if(typeof $scope.users[data.userId]!='undefined'){
			if(!pushMessage({name:$scope.users[data.userId].name},'left')) {
				console.log("There is a problem:", data);
			}
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
		
		console.log(data);
		
		if(!data) return false;
	
		action = action || 'message';
		if(action=='message' && data.hasOwnProperty('message') && data.hasOwnProperty('name') && data.hasOwnProperty('email')) {
			var msgData = {
				
				name:data.name,
				message:data.message,
			};
			
			if(data.hasOwnProperty('email') && data.email!=''){
				msgData.img = '//www.gravatar.com/avatar/'+MD5(data.email)+'?s=32';
			}else if(data.hasOwnProperty('fbid') && data.fbid!=''){
				msgData.img = '//graph.facebook.com/'+data.fbid+'/picture?height=32&width=32';
			}
			
			
            $scope.messages.push(msgData);
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


// jquery
$(function(){
	$('#field').keyup(function(e){
		var key = e.charCode || e.keyCode;
		
			if(key==13){
			if($.trim($('#field').val())!=''){
				socket.emit('sendChat', { message: $('#field').val(),name:$scope.name,email:$scope.email,fbid:$scope.fbid });
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
	$(window).on('hashchange', function() {
		window.location.reload();
	});
});
	
}


// facebook
window.fbAsyncInit = function() {
	FB.init({
	appId      : '190328391176175',
	status     : true,
	xfbml      : true
	});
	
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));