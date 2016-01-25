angular
	.module('solempApp',['ngMessages', 'angular-loading-bar','ui.router', 'ui.bootstrap.showErrors','LocalStorageModule'])
	.config(function($stateProvider, $urlRouterProvider) {
	    $urlRouterProvider.otherwise('/solempmobile');
    	$stateProvider
        // HOME STATES AND NESTED VIEWS ========================================
        .state('solempmobile', {
            url: '/solempmobile',
            templateUrl: 'login.html'
        }) 
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('menuhotels', {
           url: '/menuhotels',
            templateUrl: 'menuhotels.html'
        })
        .state('logout', {
           url: '/logout',
            templateUrl: 'logout.html'
        });   
	})
	.config(['showErrorsConfigProvider', function(showErrorsConfigProvider) {
	  showErrorsConfigProvider.showSuccess(true);
	}])
	.config(function (localStorageServiceProvider) {
  		localStorageServiceProvider
  		.setPrefix('SolempApp')
  		.setStorageType('sessionStorage')
  		.setNotify(true, true);
	})
	.controller('mainController', ['loginFactory','$scope','$rootScope',function(loginFactory,$scope,$rootScope){
		var mc = this;
		mc.isloggedIn = loginFactory.isLogged();
		$rootScope.isloggedIn = loginFactory.isLogged();
	}])
	.controller('loginController', ['$http','$scope','$location','$state','localStorageService','loginFactory','$rootScope', function ($http,$scope,$location,$state,localStorageService,loginFactory,$rootScope){
		var scope = this;
		scope.userName = "";
		scope.password = "";
		scope.respuesta = "";
		scope.error = false;

		if (loginFactory.isLogged()) {
			$state.go('menuhotels');
		};

		$scope.startSubmit = function() {
			$scope.$broadcast('show-errors-check-validity');
			if ($scope.logInfrm.$invalid) { return; }
			  // code to add the user
			};

		scope.checkLogIn = function(){
			console.log(scope.userName.toString());
			console.log(scope.password.toString());


			return $http({
	            method: "POST",
	            url: "http://192.168.0.203/solempmobileWA/api/Users/getUser",
	            headers: { 'Content-Type': 'application/json' },
	            dataType: "json",
	           	data: {
	           			"userName" : scope.userName,
	           			"Password" : scope.password
	           		}
	        }).success(function (data) {
	            scope.respuesta = data;
	            console.log(data);

	            if (data.Result === "ERROR") {
	            	if (data.Error.ErrorMsg === "Usuario o Password incorrecto!") {
		            	scope.error = true;
		            	scope.userName = "";
						scope.password = "";
						//Reiniciar valores de validacion
						$scope.logInfrm.$setPristine();
	            	}
	            } else {
   					localStorageService.set('userName', scope.userName);
   					localStorageService.set('loggedIn', 'yes');
	            	$rootScope.isloggedIn = true;
	            	$state.go('menuhotels');
	            };
	        }).error(function (data) {
	            console.log(data);
	            if (data.error === "invalid_grant" ) {
					scope.error = true;
					scope.userName = "";
					scope.password = "";
					//Reiniciar valores de validacion
					$scope.logInfrm.$setPristine();
	            };
	            
	        });
		};
	}])
	.controller('logoutController', ['$scope','$rootScope','$state','localStorageService','loginFactory', function ($scope,$rootScope,$state,localStorageService,loginFactory){
		console.log("Cerrando Session");
		localStorageService.remove('loggedIn', 'userName');
		$rootScope.isloggedIn = false;
		$state.go('solempmobile');
	}])
	.controller('hmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory', function ($scope,$rootScope,$state,localStorageService,loginFactory){
		
	}])
	.directive('showErrors', function() {
	  return {
	      restrict: 'A',
	      require:  '^form',
	      link: function (scope,element,attrs,formCtrl) {
                 // find the text box element, which has the 'name' attribute
			        var inputElement   = element[0].querySelector("[name]");
			        console.log("inputElement = " + inputElement);
			        // convert the native text box element to an angular element
			        var inputNgElement = angular.element(inputElement);
			        console.log("inputNgElement = " + inputNgElement);
			        // get the name on the text box so we know the property to check
			        // on the form controller
			        var inputName = inputNgElement.attr('name');
			        console.log("inputName = " + inputName);		
			        // only apply the has-error class after the user leaves the text box
			        inputNgElement.bind('blur', function() {
			          element.toggleClass('has-error', formCtrl[inputName].$invalid);
			        });
			        scope.$on('show-errors-check-validity', function() {
					  element.toggleClass('has-error', formCtrl[inputName].$invalid);
					});
			    }
        	}
	  })
	.factory("loginFactory", ['localStorageService', function(localStorageService){
    	var isloggedIn = false;
	    var interfaz = {
	        isLogged : function(){
		        if (localStorageService.get('loggedIn') === 'yes') {
					return true;
				} else {
					return false;
				}
			} 
	    }
	    return interfaz;
	}])