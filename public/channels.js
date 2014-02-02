function ChannelsCtrl($scope){
	$scope.areas = [];
	
	$scope.areas.push({
		name:'Global',
		hash:'#',
		channels:[]
	});
	
	$scope.areas.push({
		name:'Philippines',
		hash:'#PH',
		channels:[
			{name:'Cagayan de Oro',hash:'#cdoPH'},
			{name:'Cebu',hash:'#cebuPH'},
			{name:'Manila',hash:'#manilaPH'},
			{name:'Davao',hash:'#davaoPH'}
		]
	});
	
	
	for(i in $scope.areas){
		if(channels.hasOwnProperty($scope.areas[i].hash)){
			$scope.areas[i].count = channels[$scope.areas[i].hash];
		}
		for(j in $scope.areas[i].channels){
			if(channels.hasOwnProperty($scope.areas[i].channels[j].hash)){
				$scope.areas[i].channels[j].count = channels[$scope.areas[i].channels[j].hash];
			}
		}
	}
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