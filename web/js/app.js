(function(angular){
"use strict";

angular.module('', ['ui.router','duScroll','ui.bootstrap'])

.provider('$lpState', function($stateProvider){
	this.$get = function() {
	    return { 
			addState: function(name, state) { 
				$stateProvider.state(name, state);
			}
		};
	};
})
.service('AppDetails', function(){
	var appDetails  = {
		title: undefined
	};
	return appDetails;
})
.config(function($stateProvider, $urlRouterProvider, $qProvider) {

	$qProvider.errorOnUnhandledRejections(false);//temporary to silence $q	
	
	var homeState = {
		name: 'home',
	    url: '/',
	    views: {
	    	"" : {
			    controller: function($stateRegistry, AppDetails){
					this.categories = [{
						name: "My",
						tiles: []
					}];
					
					this.currentApp = AppDetails;
					this.currentApp.title = undefined;//Navigating to Home will hide app title in navigation
					
			    	var appStateNames = Object.keys($stateRegistry.states);
			    	for(var i=0; i< appStateNames.length; i++){
			    		var appState = $stateRegistry.states[appStateNames[i]];
			    		if(['', 'home'].indexOf(appState.name)<0 && (appState.hpTile!==false || appState.hpTile=== undefined)){
			    			if(!appState.categories || !appState.categories.length){
			    				this.categories[0].tiles.push(appState);
			    			} else {
			    				appState.categories.forEach(function(catName){
			    					var category = this.categories.find(function(c){
							    						return c.name === catName;
							    					});
							    	if(!category){
							    		this.categories.push({
							    			name: catName,
							    			tiles: [appState]
							    		});
							    	} else {
							    		category.tiles.push(appState);
							    	}							    	
			    				}.bind(this));
			    			}
		    			}
			    	}
			    },
			    controllerAs: "homeVm",
			    templateUrl: "views/home.html"	
	    	},
			"nav": {
				templateUrl: 'views/nav.html',
			    controller: function($state, $stateRegistry, AppDetails){
			    	this.currentApp = AppDetails;
			    	this.appOptions = {
						options: Object.values($stateRegistry.states)
		    					.map(function(state){
		    						if(state.self.appUrl){
			    						return {
			    							appUrl: state.self.appUrl,
			    							label: state.self.label,
			    							name: state.name
		    							};
		    						}
		    					})
		    					.filter(function(app){
		    						return app!==undefined;
		    					})
					};
					this.onSearchChange = function(app){
						$state.go(app.name);
						this.appOptions.selected = undefined;
					};
			    },
			    controllerAs: 'navVm'
			}
	    }
	};
	$stateProvider.state(homeState);

	//Defer routing until states remote deifnitions are loaded
	$urlRouterProvider.deferIntercept();
  	$urlRouterProvider.otherwise('/');
})	
.run(function($http, $lpState, $urlRouter, $transitions, $window){

	$http({ method:'GET', url: 'states.json'})
	.then(function(response){
		if(response.data){
			response.data.forEach(function(state){
				if(!state.name)
    				state.name = 'home.'+Math.random().toString(36).slice(2);
    			if(!state.views)
    				state.views = {};
    			if(!state.views['@'])
    				state.views['@'] = {};
    			if(!state.views['@'].templateUrl)
    				state.views['@'].templateUrl = "views/app.html";
    			
    			state.views['@']['controller'] = function($state, $sce, AppDetails){
    			    var appPath = $state.router.locationService.hash();
    				this.url = $sce.trustAsResourceUrl($state.$current.self.appUrl + appPath);
    				if(['_blank, _top'].indexOf($state.$current.self.targetWindow)<0)
    					AppDetails.title = $state.$current.self.label;
    				else
    					AppDetails.title = undefined;
    			};
    			
    			state.views['@']['controllerAs'] = "appVm";
    			
				$lpState.addState(state.name, state);
			});
		}
	})
	.finally(function(){
		$urlRouter.sync();
        $urlRouter.listen();
	});

	$transitions.onStart({ to: 'home.**' }, function(trans) {
		var targetState = trans.to();
		var $state = trans.router.stateService;
		if(targetState.targetWindow){
		  	$window.open(targetState.appUrl, targetState.targetWindow);
		  	return $state.target("home");
		}
	    return true;
	});
});

})(angular);	
